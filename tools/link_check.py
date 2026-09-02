"""Resolve every media reference in site/ to a real path.

Answers two questions:
  1. Are any of the files proposed for removal actually requested by the site?
  2. Are there references that are ALREADY broken (pointing at nothing)?

Covers: src, href, poster, data-src, data-m-src, srcset (all candidates),
inline style url(), stylesheet url(), and any string literal in JS that ends
in a media extension. Read only.
"""
import json, re
from pathlib import Path

ROOT = Path.cwd(); SITE = ROOT/"site"
MEDIA = r"(?:png|jpe?g|webp|avif|gif|svg|mp4|webm|mov|m4v)"

rows = json.loads((ROOT/"tools"/"_media-audit.json").read_text(encoding="utf-8"))
doomed = {r["path"] for r in rows if r["class"] in ("SUPERSEDED","TWIN_UNUSED","ORPHAN")}

attr_re  = re.compile(r'(?:src|href|poster|data-src|data-m-src|data-full|content)\s*=\s*["\']([^"\']+?\.'+MEDIA+r')["\']', re.I)
srcset_re= re.compile(r'srcset\s*=\s*["\']([^"\']+)["\']', re.I)
url_re   = re.compile(r'url\(\s*["\']?([^"\')]+?\.'+MEDIA+r')["\']?\s*\)', re.I)
jsstr_re = re.compile(r'["\']([^"\'\s]*?\.'+MEDIA+r')["\']', re.I)

refs = []   # (referencing_file, raw_target)
for f in list(SITE.rglob("*.html"))+list(SITE.rglob("*.css"))+list(SITE.rglob("*.js")):
    try: txt = f.read_text(encoding="utf-8", errors="ignore")
    except Exception: continue
    for m in attr_re.finditer(txt): refs.append((f, m.group(1)))
    for m in url_re.finditer(txt):  refs.append((f, m.group(1)))
    for m in srcset_re.finditer(txt):
        for cand in m.group(1).split(","):
            u = cand.strip().split()[0] if cand.strip() else ""
            if u: refs.append((f, u))
    if f.suffix == ".js":
        for m in jsstr_re.finditer(txt): refs.append((f, m.group(1)))

resolved, broken, external = set(), [], 0
for src_file, raw in refs:
    t = raw.split("?")[0].split("#")[0].strip()
    if not t or t.startswith(("http://","https://","//","data:")):
        external += 1; continue
    base = SITE if t.startswith("/") else src_file.parent
    p = (base / t.lstrip("/")).resolve()
    try: rel = p.relative_to(ROOT).as_posix()
    except ValueError: continue
    if p.is_file(): resolved.add(rel)
    else: broken.append((src_file.relative_to(ROOT).as_posix(), raw))

hits = sorted(resolved & doomed)
print(f"media references parsed : {len(refs)}")
print(f"external / data URIs    : {external}")
print(f"resolved to a real file : {len(resolved)}")
print(f"ALREADY BROKEN links    : {len(broken)}")
print()
print("="*70)
print(f"files proposed for removal that ARE referenced: {len(hits)}")
print("="*70)
for h in hits[:40]: print("  IN USE:", h)
if not hits: print("  none. Every one of the 358 files is unreferenced.")
print()
if broken:
    print("pre-existing broken references (not caused by this change):")
    seen=set()
    for f,t in broken:
        k=(f,t)
        if k in seen: continue
        seen.add(k); print(f"  {f}  ->  {t}")
        if len(seen)>=25: print(f"  ... and {len(broken)-25} more"); break
