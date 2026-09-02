"""Generate responsive WebP variants for every image the site actually references.

For each referenced raster wider than MIN_SRC, writes <stem>-<w>.webp beside it
at each ladder width narrower than the source. Never upscales, never overwrites,
never touches the original. The ladder matches the CSS: phone breakpoint 640,
containers cap at 980 and 1280.
"""
import json, re, sys
from pathlib import Path
from urllib.parse import unquote
from PIL import Image

ROOT=Path.cwd(); SITE=ROOT/"site"
LADDER=[480,768,1200,1600]
MIN_SRC=560          # below this a variant is pointless
Q=80
MEDIA=r"(?:png|jpe?g|webp)"
attr=re.compile(r'(?:src|poster|data-src|data-m-src|data-full)\s*=\s*["\']([^"\']+?\.'+MEDIA+r')["\']',re.I)
ssre=re.compile(r'srcset\s*=\s*["\']([^"\']+)["\']',re.I)

# collect every image the site references from html/css/js
targets=set()
for f in list(SITE.rglob("*.html"))+list(SITE.rglob("*.css"))+list(SITE.rglob("*.js")):
    if f.name.startswith("."): continue
    txt=f.read_text(encoding="utf-8",errors="ignore")
    cands=[m.group(1) for m in attr.finditer(txt)]
    for m in ssre.finditer(txt):
        cands+=[c.strip().split()[0] for c in m.group(1).split(",") if c.strip()]
    for m in re.finditer(r'url\(\s*["\']?([^"\')]+?\.'+MEDIA+r')["\']?\s*\)',txt,re.I):
        cands.append(m.group(1))
    for raw in cands:
        t=unquote(raw.split("?")[0].split("#")[0])
        if not t or t.startswith(("http","//","data:")): continue
        p=(SITE if t.startswith("/") else f.parent)/t.lstrip("/")
        if p.is_file(): targets.add(p.resolve())

# skip anything that is itself already a generated variant
def is_variant(p): 
    tail=p.stem.rsplit("-",1)
    return len(tail)==2 and tail[1].isdigit() and int(tail[1]) in LADDER

made=0; skipped=0; saved_src=0; made_bytes=0; errors=[]
manifest={}
for p in sorted(targets):
    if is_variant(p): continue
    try:
        with Image.open(p) as im:
            w,h=im.size
            if w<MIN_SRC: continue
            im=im.convert("RGBA") if im.mode in ("RGBA","LA","P") else im.convert("RGB")
            entry=[]
            for tw in LADDER:
                if tw>=w*0.92: continue          # too close to source to be worth it
                out=p.with_name(f"{p.stem}-{tw}.webp")
                if out.exists(): skipped+=1; entry.append((tw,out.stat().st_size)); continue
                th=max(1,round(h*tw/w))
                im.resize((tw,th), Image.LANCZOS).save(out,"WEBP",quality=Q,method=6)
                made+=1; made_bytes+=out.stat().st_size; entry.append((tw,out.stat().st_size))
            if entry:
                manifest[p.relative_to(ROOT).as_posix()]={
                    "src_w":w,"src_h":h,"src_bytes":p.stat().st_size,
                    "variants":{str(tw):{"bytes":b} for tw,b in entry}}
                saved_src+=p.stat().st_size
    except Exception as e:
        errors.append(f"{p.relative_to(ROOT).as_posix()}: {type(e).__name__}: {e}")

(ROOT/"tools"/"_variants.json").write_text(json.dumps(manifest,indent=1),encoding="utf-8")
print(f"referenced images scanned : {len(targets)}")
print(f"sources given variants    : {len(manifest)}")
print(f"variants written          : {made}   ({made_bytes/1048576:.1f} MB)")
print(f"variants already present  : {skipped}")
print(f"errors                    : {len(errors)}")
for e in errors[:8]: print("   ",e)
