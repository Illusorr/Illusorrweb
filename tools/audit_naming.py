"""Static audit of media naming and placement against the project conventions.

Conventions taken from CLAUDE.md and site/README.md:

  slugs      lowercase kebab-case, identical across projects/<slug>.html,
             the work-grid data-slug, and assets/img/projects/<slug>/
  images     assets/img/projects/<slug>/<name>.webp, max 1600px wide
             covers are always cover.webp, max 1200px
  video      assets/video/<slug>/<name>.webm (VP9) plus <name>-poster.webp
  fonts      self-hosted; no remote font requests from site/

Reports only what is checkable from the filesystem and markup. Writes
tools/_naming-audit.json.
"""
import json
import re
from collections import defaultdict
from pathlib import Path

SITE = Path("site")
KEBAB = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
RASTER = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif"}
VIDEO = {".webm", ".mp4", ".mov", ".m4v"}

findings = defaultdict(list)


def add(kind, path, detail):
    findings[kind].append({"path": path, "detail": detail})


# ── 1. project slugs line up across page, grid and asset folder ──────────
pages = {p.stem for p in (SITE / "projects").glob("*.html") if not p.name.startswith((".", "_"))}
img_dirs = {d.name for d in (SITE / "assets/img/projects").glob("*") if d.is_dir()}
vid_dirs = {d.name for d in (SITE / "assets/video").glob("*") if d.is_dir()}

work = (SITE / "work.html").read_text(encoding="utf-8", errors="ignore")
grid = set(re.findall(r'data-slug="([^"]+)"', work))

for s in sorted(pages):
    if not KEBAB.match(s):
        add("slug-not-kebab", f"projects/{s}.html", f"'{s}' is not lowercase kebab-case")
for s in sorted(grid - pages):
    add("grid-slug-has-no-page", "work.html", f"data-slug='{s}' but projects/{s}.html does not exist")
for s in sorted(img_dirs - pages):
    add("asset-folder-has-no-page", f"assets/img/projects/{s}/", f"no projects/{s}.html")
for s in sorted(vid_dirs - pages):
    add("video-folder-has-no-page", f"assets/video/{s}/", f"no projects/{s}.html")

# ── 2. file naming ───────────────────────────────────────────────────────
LADDER = {"360", "480", "640", "768", "960", "1200", "1440", "1600", "1920"}
for f in sorted(SITE.rglob("*")):
    if not f.is_file():
        continue
    ext = f.suffix.lower()
    if ext not in RASTER | VIDEO:
        continue
    rel = f.relative_to(SITE).as_posix()
    stem = f.stem
    # a generated width rung is fine
    tail = stem.rsplit("-", 1)[-1]
    is_rung = tail in LADDER and "-" in stem
    base = stem.rsplit("-", 1)[0] if is_rung else stem

    if " " in f.name:
        add("filename-has-spaces", rel, f.name)
    elif not KEBAB.match(base.lower().replace("_", "-")) and not is_rung:
        if re.search(r"[A-Z]", base) or "_" in base:
            add("filename-not-kebab", rel, f.name)

# ── 3. format conventions ────────────────────────────────────────────────
for f in sorted(SITE.rglob("*")):
    if not f.is_file():
        continue
    rel = f.relative_to(SITE).as_posix()
    ext = f.suffix.lower()
    if ext in {".png", ".jpg", ".jpeg"}:
        add("legacy-raster-shipping", rel, f"{ext} in site/ ({f.stat().st_size // 1024} KB)")
    if ext == ".mp4":
        add("mp4-shipping", rel, f"{f.stat().st_size // 1024} KB")

# ── 4. video companions: poster next to each clip ────────────────────────
for f in sorted(SITE.rglob("*.webm")):
    rel = f.relative_to(SITE).as_posix()
    poster = f.with_name(f.stem + "-poster.webp")
    if not poster.is_file():
        add("video-missing-poster", rel, f"expected {poster.name}")

# ── 5. covers ────────────────────────────────────────────────────────────
for d in sorted((SITE / "assets/img/projects").glob("*")):
    if not d.is_dir():
        continue
    covers = [p for p in d.glob("*") if "cover" in p.stem.lower()]
    if not covers:
        add("project-has-no-cover", f"assets/img/projects/{d.name}/", "no file with 'cover' in its name")

out = {k: v for k, v in findings.items()}
Path("tools/_naming-audit.json").write_text(json.dumps(out, indent=1), encoding="utf-8")

print(f"{'finding':<28}{'count':>7}")
print("-" * 40)
for k in sorted(out, key=lambda k: -len(out[k])):
    print(f"{k:<28}{len(out[k]):>7}")
print("-" * 40)
print(f"{'TOTAL':<28}{sum(len(v) for v in out.values()):>7}")
print("\nexamples:")
for k in sorted(out, key=lambda k: -len(out[k])):
    for item in out[k][:2]:
        print(f"  {k:<26} {item['path'][:60]}")
