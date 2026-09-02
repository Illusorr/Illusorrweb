"""Add srcset/sizes to <img> and repoint <video> at the WebM, in place.

Deliberately surgical, per CLAUDE.md rule 4: it edits only the attributes it
owns inside a single tag and never reflows or restructures surrounding markup.

sizes is written from the MEASURED css width at each breakpoint, so the browser
is told the truth rather than a guess:
    sizes="(max-width:390px) 350px, (max-width:640px) 600px, 520px"

Run with --dry to preview counts without writing.
"""
import json, re, sys, shutil, os
from pathlib import Path
from urllib.parse import quote, unquote

DRY = "--dry" in sys.argv
ROOT = Path.cwd(); SITE = ROOT/"site"
plan = json.loads((ROOT/"tools"/"_plan.json").read_text(encoding="utf-8"))
img_by_src = {r["src"]: r for r in plan["images"]}
vid_by_src = {r["src"]: r for r in plan["video"]}

def resolve(page: Path, raw: str):
    """attribute value -> site-absolute url path, matching what the browser saw"""
    t = unquote(raw.split("?")[0].split("#")[0])
    if not t or t.startswith(("http", "//", "data:")): return None
    p = (SITE if t.startswith("/") else page.parent) / t.lstrip("/")
    try: return "/" + p.resolve().relative_to(SITE.resolve()).as_posix()
    except Exception: return None

def site_url(p) -> str:
    """any path (relative 'site/..' or absolute) -> site-absolute url path"""
    p = Path(p)
    if not p.is_absolute(): p = ROOT / p
    return "/" + p.resolve().relative_to(SITE.resolve()).as_posix()

def rel_from(page: Path, site_abs: str):
    """site-absolute url path -> the relative form this page should use"""
    target = (SITE / site_abs.lstrip("/")).resolve()
    rel = Path(os.path.relpath(target, page.parent)).as_posix()
    return quote(rel, safe="/-_.~()")

import os
def build_sizes(per_bp):
    bps = sorted(((int(k), v) for k, v in per_bp.items()), key=lambda x: x[0])
    parts, seen = [], None
    for vw, css in bps[:-1]:
        if css != seen: parts.append(f"(max-width:{vw}px) {css}px"); seen = css
    parts.append(f"{bps[-1][1]}px")
    return ", ".join(parts)

def build_srcset(page, rec):
    p = ROOT / rec["path"]; out = []
    for w in rec["rungs"]:
        cand = p if w >= rec["target_w"] and w >= rec["nat_w"] else p.with_name(f"{p.stem}-{w}.webp")
        if not cand.is_file(): cand = p
        out.append(f"{rel_from(page, site_url(cand))} {w}w")
    # dedupe by url keeping the largest w
    seen = {}
    for e in out:
        u, w = e.rsplit(" ", 1); seen[u] = max(seen.get(u, 0), int(w[:-1]))
    return ", ".join(f"{u} {w}w" for u, w in sorted(seen.items(), key=lambda kv: kv[1]))

IMG = re.compile(r'<img\b[^>]*?>', re.I)
VID = re.compile(r'<video\b[^>]*?>', re.I)
def attr(tag, name):
    m = re.search(rf'{name}\s*=\s*"([^"]*)"', tag, re.I)
    return m.group(1) if m else None
def setattr_(tag, name, val):
    if re.search(rf'\b{name}\s*=', tag, re.I):
        return re.sub(rf'\b{name}\s*=\s*"[^"]*"', f'{name}="{val}"', tag, count=1, flags=re.I)
    return tag[:-1].rstrip() + f' {name}="{val}"' + ('/>' if tag.rstrip().endswith("/>") else '>')

stats = dict(pages=0, img_srcset=0, img_skipped=0, vid_src=0, vid_preload=0, vid_poster=0)
for page in sorted(SITE.rglob("*.html")):
    if page.name.startswith(("_", ".")): continue
    orig = page.read_text(encoding="utf-8", errors="ignore"); txt = orig

    def do_img(m):
        tag = m.group(0)
        raw = attr(tag, "src") or attr(tag, "data-src")
        s = resolve(page, raw) if raw else None
        rec = img_by_src.get(s) if s else None
        if not rec or len(rec["rungs"]) < 2 or attr(tag, "srcset"):
            stats["img_skipped"] += 1; return tag
        tag = setattr_(tag, "srcset", build_srcset(page, rec))
        tag = setattr_(tag, "sizes", build_sizes(rec["per_bp"]))
        stats["img_srcset"] += 1; return tag
    txt = IMG.sub(do_img, txt)

    def do_vid(m):
        tag = m.group(0)
        for a in ("src", "data-src", "data-m-src"):
            raw = attr(tag, a)
            if not raw: continue
            s = resolve(page, raw)
            rec = vid_by_src.get(s) if s else None
            if not rec: continue
            webm = (ROOT / rec["path"]).with_suffix(".webm")
            if webm.is_file():
                tag = setattr_(tag, a, rel_from(page, site_url(webm)))
                stats["vid_src"] += 1
            poster = (ROOT / rec["path"]).with_name(Path(rec["path"]).stem + "-poster.webp")
            if poster.is_file() and not attr(tag, "poster"):
                tag = setattr_(tag, "poster", rel_from(page, site_url(poster)))
                stats["vid_poster"] += 1
        if not attr(tag, "preload"):
            tag = setattr_(tag, "preload", "none"); stats["vid_preload"] += 1
        return tag
    txt = VID.sub(do_vid, txt)

    if txt != orig:
        stats["pages"] += 1
        if not DRY:
            shutil.copy2(page, page.with_suffix(".html.bak"))
            page.write_text(txt, encoding="utf-8")

print(("DRY RUN — " if DRY else "") + "markup rewrite")
for k, v in stats.items(): print(f"  {k:<14} {v}")
