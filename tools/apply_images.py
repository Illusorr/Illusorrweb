"""Right size every referenced image to its measured slot, and build its rungs.

For each image in the plan:
  1. back the current file up to uploads/_pre-resize/ (once), so this is reversible
  2. rewrite the master at target_w  (measured largest slot x 2, never upscaled)
  3. write the srcset rungs the measurements actually call for
  4. delete stale rungs from the earlier fixed-ladder pass that nothing needs

Quality: 80 normally. Images that render under mix-blend-mode: lighten get 92,
because that blend keys on near-black pixels and exposes compression noise
which is invisible in normal composition.

--dry prints what it would do and writes nothing.
"""
import json, shutil, sys
from pathlib import Path
from PIL import Image

DRY = "--dry" in sys.argv
ROOT = Path.cwd()
Q_DEFAULT, Q_BLEND = 80, 92
BLEND_PAGES = {"/projects/morphellum.html"}     # .ph.has-media image-slot { mix-blend-mode: lighten }
BACKUP = ROOT/"uploads"/"_pre-resize"

plan = json.loads((ROOT/"tools"/"_plan.json").read_text(encoding="utf-8"))
imgs = plan["images"]

def backup(p: Path):
    dst = BACKUP / p.relative_to(ROOT/"site")
    if dst.exists(): return
    if not DRY:
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, dst)

resized = rungs_made = rungs_pruned = 0
b_before = b_after = 0
errors = []

for rec in imgs:
    p = ROOT/rec["path"]
    if not p.is_file(): continue
    if p.suffix.lower() in (".svg", ".gif"): continue   # vector / animated: never rasterise
    q = Q_BLEND if any(pg in BLEND_PAGES for pg in rec["pages"]) else Q_DEFAULT
    want = set(rec["rungs"])
    tgt  = rec["target_w"]
    before = p.stat().st_size
    b_before += before

    try:
        # 1. shrink the master itself when the slot never justifies its size
        if tgt < rec["nat_w"] * 0.95:
            backup(p)
            if not DRY:
                with Image.open(p) as im:
                    im = im.convert("RGBA") if im.mode in ("RGBA","LA","P") else im.convert("RGB")
                    h = max(1, round(rec["nat_h"] * tgt / rec["nat_w"]))
                    im.resize((tgt, h), Image.LANCZOS).save(p, "WEBP", quality=q, method=6)
            resized += 1

        # 2. write the rungs the measurements call for
        with Image.open(p) as im:
            mw, mh = im.size
            base = im.convert("RGBA") if im.mode in ("RGBA","LA","P") else im.convert("RGB")
            for w in sorted(want):
                if w >= mw: continue
                out = p.with_name(f"{p.stem}-{w}.webp")
                if out.is_file(): continue
                if not DRY:
                    base.resize((w, max(1, round(mh*w/mw))), Image.LANCZOS)\
                        .save(out, "WEBP", quality=q, method=6)
                rungs_made += 1

        # 3. drop rungs from the old fixed ladder that nothing asks for
        # Only ever prune widths from OUR ladder. A file ending -1 or -2 is a real
        # asset whose name happens to end in a digit, not a width rung.
        LADDER = {360,480,640,768,960,1200,1440,1600,1920}
        for old in p.parent.glob(f"{p.stem}-*.webp"):
            tail = old.stem.rsplit("-",1)[-1]
            if tail.isdigit() and int(tail) in LADDER and int(tail) not in want:
                if not DRY: old.unlink()
                rungs_pruned += 1

        b_after += p.stat().st_size
    except Exception as e:
        errors.append(f"{rec['path']}: {type(e).__name__}: {e}")

print(("DRY RUN — " if DRY else "") + "image right sizing")
print(f"  masters resized   : {resized}")
print(f"  rungs written     : {rungs_made}")
print(f"  stale rungs pruned: {rungs_pruned}")
print(f"  master bytes      : {b_before/1048576:.1f} MB -> {b_after/1048576:.1f} MB")
print(f"  errors            : {len(errors)}")
for e in errors[:8]: print("   ", e)
