"""Inventory raster media under site/ and classify it for action.

Reference detection is deliberately conservative. A file counts as referenced if
EITHER its full filename OR its bare stem appears in any html/css/js/json under
site/. The stem test is what catches runtime concatenation such as
    img.src = '../assets/projects/trt/thumb/' + file + '.jpg'
in js/case/trt-orb.js, where the filename never appears literally.

Writes tools/_media-audit.json. Read only, deletes nothing.
"""
import json, re
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"
RASTER = {".png", ".jpg", ".jpeg"}
# stems too generic for a substring test to mean anything
GENERIC = {"1","2","3","4","5","6","7","8","9","0","cover","logo","bg","hero","img","a","b","c"}

blob_parts = []
for ext in ("*.html", "*.css", "*.js", "*.json", "*.xml"):
    for f in SITE.rglob(ext):
        try:
            blob_parts.append(f.read_text(encoding="utf-8", errors="ignore"))
        except Exception:
            pass
blob = "\n".join(blob_parts)

def referenced(name, stem):
    if name in blob:
        return True, "filename"
    if stem.lower() in GENERIC:
        return None, "generic-stem"          # unknown, needs eyes
    if re.search(r"[\"'/>\s(]" + re.escape(stem) + r"[\"'<\s.,)]", blob):
        return True, "stem"
    return False, "absent"

rows = []
for f in sorted(SITE.rglob("*")):
    if not f.is_file() or f.suffix.lower() not in RASTER:
        continue
    try:
        with Image.open(f) as im:
            w, h = im.size
    except Exception:
        w = h = 0
    ref, how = referenced(f.name, f.stem)
    twin = f.with_suffix(".webp")
    twin_ref = twin.name in blob if twin.exists() else False
    rows.append({
        "path": f.relative_to(ROOT).as_posix(),
        "dir": f.parent.relative_to(ROOT).as_posix(),
        "name": f.name, "stem": f.stem, "ext": f.suffix.lower().lstrip("."),
        "bytes": f.stat().st_size, "w": w, "h": h,
        "referenced": ref, "ref_via": how,
        "twin": twin.exists(), "twin_referenced": twin_ref,
    })

def cls(r):
    if r["referenced"] is None:            return "REVIEW"
    if r["referenced"]:                    return "LIVE"
    if r["twin"] and r["twin_referenced"]: return "SUPERSEDED"
    if r["twin"]:                          return "TWIN_UNUSED"
    return "ORPHAN"

for r in rows: r["class"] = cls(r)
(ROOT/"tools"/"_media-audit.json").write_text(json.dumps(rows, indent=1), encoding="utf-8")

order = ["LIVE","REVIEW","SUPERSEDED","TWIN_UNUSED","ORPHAN"]
print(f"{'class':<12} {'files':>6} {'weight':>11}   meaning")
print("-"*74)
meaning = {
 "LIVE":"referenced, must convert and keep",
 "REVIEW":"generic stem, needs manual eyes",
 "SUPERSEDED":"webp twin exists and IS referenced",
 "TWIN_UNUSED":"webp twin exists but neither referenced",
 "ORPHAN":"no twin, no reference found",
}
for c in order:
    g=[r for r in rows if r["class"]==c]
    if g: print(f"{c:<12} {len(g):>6} {sum(r['bytes'] for r in g)/1048576:>8.1f} MB   {meaning[c]}")
print("-"*74)
print(f"{'TOTAL':<12} {len(rows):>6} {sum(r['bytes'] for r in rows)/1048576:>8.1f} MB")
print()
print("LIVE files needing conversion, by directory:")
live=[r for r in rows if r["class"]=="LIVE"]
agg={}
for r in live: agg.setdefault(r["dir"],[0,0]); agg[r["dir"]][0]+=1; agg[r["dir"]][1]+=r["bytes"]
for d,(n,b) in sorted(agg.items(), key=lambda kv:-kv[1][1])[:12]:
    print(f"  {b/1048576:7.1f} MB  {n:>4}  {d}")
print()
print("REVIEW files (generic stems):")
for r in [r for r in rows if r["class"]=="REVIEW"][:10]:
    print(f"  {r['bytes']/1048576:7.2f} MB  {r['path']}")
