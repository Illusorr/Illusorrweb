"""Convert the PNG/JPG still shipping in site/ to WebP, and move out what
nothing references.

Two groups, handled differently:

  referenced   converted to WebP and every reference repointed, including the
               runtime-concatenated ones (trt-orb.js builds paths as
               '.../thumb/' + file + '.jpg', so the extension lives in JS)
  unreferenced moved to uploads/_masters, outside the deployable folder

Skips assets/img/og: social cards must stay JPG or PNG because several
platforms do not accept WebP for og:image.
"""
import json
import re
import shutil
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
SITE = ROOT / "site"
DEST = ROOT / "uploads" / "_masters"
LEGACY = {".png", ".jpg", ".jpeg"}
KEEP_DIRS = {"assets/img/og"}          # og:image must stay jpg/png

text_files = [f for ext in ("*.html", "*.css", "*.js")
              for f in SITE.rglob(ext)
              if not f.name.startswith((".", "_")) and f.suffix != ".bak"]
blob = "\n".join(f.read_text(encoding="utf-8", errors="ignore") for f in text_files)

converted, moved, skipped = [], [], []
for f in sorted(SITE.rglob("*")):
    if not f.is_file() or f.suffix.lower() not in LEGACY:
        continue
    rel = f.relative_to(SITE).as_posix()
    if any(rel.startswith(k) for k in KEEP_DIRS):
        skipped.append(rel)
        continue

    # referenced by full filename, or by bare stem (runtime concatenation)
    stem_hit = re.search(r"[\"'/>\s(]" + re.escape(f.stem) + r"[\"'<\s.,)]", blob) is not None
    referenced = f.name in blob or stem_hit

    if not referenced:
        dst = DEST / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            dst = dst.with_name(dst.stem + "__dup" + dst.suffix)
        moved.append((rel, f.stat().st_size))
        shutil.move(str(f), str(dst))
        continue

    out = f.with_suffix(".webp")
    if out.is_file():
        skipped.append(rel)
        continue
    try:
        with Image.open(f) as im:
            im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
            if im.width > 1600:
                im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
            im.save(out, "WEBP", quality=82, method=6)
        converted.append((rel, f.stat().st_size, out.stat().st_size))
    except Exception as e:
        skipped.append(f"{rel} ({type(e).__name__})")

# repoint references: full filename, and the bare-extension form used in JS
pairs = {Path(r).name: Path(r).with_suffix(".webp").name for r, _, _ in converted}
touched = 0
for f in text_files:
    t = f.read_text(encoding="utf-8", errors="ignore")
    o = t
    for old, new in pairs.items():
        if old in t:
            t = t.replace(old, new)
    # runtime concatenation: '.../thumb/' + file + '.jpg'
    if "trt/thumb/" in t or "projects/trt/" in t:
        t = t.replace("+ '.jpg'", "+ '.webp'").replace('+ ".jpg"', '+ ".webp"')
    if t != o:
        f.write_text(t, encoding="utf-8")
        touched += 1

# the originals of converted files are no longer needed in site/
for rel, _, _ in converted:
    p = SITE / rel
    if p.is_file():
        dst = DEST / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.exists():
            dst = dst.with_name(dst.stem + "__dup" + dst.suffix)
        shutil.move(str(p), str(dst))

log = {"converted": [{"file": r, "before": b, "after": a} for r, b, a in converted],
       "moved": [{"file": r, "bytes": b} for r, b in moved],
       "skipped": skipped}
(ROOT / "tools" / "_legacy-raster-log.json").write_text(json.dumps(log, indent=1), encoding="utf-8")

cb = sum(b for _, b, _ in converted)
ca = sum(a for _, _, a in converted)
mb = sum(b for _, b in moved)
print(f"  converted to webp : {len(converted):>3} files  {cb/1024:>8.0f} KB -> {ca/1024:.0f} KB")
print(f"  moved out (unused): {len(moved):>3} files  {mb/1024:>8.0f} KB")
print(f"  skipped           : {len(skipped):>3}  (og cards, already-webp, errors)")
print(f"  text files repointed: {touched}")
