"""Convert every shipped TTF/OTF to WOFF2 and repoint the CSS and preloads.

WOFF2 is the same outlines with Brotli compression and is supported by every
browser that matters. Originals are kept so a fallback src can still be offered
where a face is preloaded.
"""
import re, shutil
from pathlib import Path
from fontTools.ttLib import TTFont

SITE=Path("site")
made=[]; before=after=0
for f in sorted(list(SITE.rglob("*.ttf"))+list(SITE.rglob("*.otf"))):
    out=f.with_suffix(".woff2")
    if out.is_file(): continue
    try:
        ft=TTFont(f); ft.flavor="woff2"; ft.save(out); ft.close()
        b,a=f.stat().st_size,out.stat().st_size
        before+=b; after+=a
        made.append((f,out,b,a))
        print(f"  {b/1024:>8.0f} KB -> {a/1024:>7.0f} KB ({100*(1-a/b):4.0f}% off)  {f.name}")
    except Exception as e:
        print(f"  FAILED {f.name}: {type(e).__name__}: {e}")
print(f"\n{len(made)} converted: {before/1048576:.2f} MB -> {after/1048576:.2f} MB "
      f"(saved {(before-after)/1048576:.2f} MB, {100*(1-after/max(before,1)):.0f}%)")

# repoint css @font-face and html preloads to the woff2, keeping the original as fallback
names={f.name: out.name for f,out,_,_ in made}
touched=0
for p in list(SITE.rglob("*.css"))+list(SITE.rglob("*.html")):
    if p.name.startswith(("_",".")) or p.suffix==".bak": continue
    t=p.read_text(encoding="utf-8",errors="ignore"); o=t
    for old,new in names.items():
        if old not in t: continue
        # preload tags: point at woff2 and fix the type
        t=re.sub(r'(<link[^>]*rel="preload"[^>]*href="[^"]*?)'+re.escape(old)+r'(")',
                 lambda m: m.group(1)+new+m.group(2), t)
        t=t.replace('type="font/ttf"','type="font/woff2"').replace('type="font/otf"','type="font/woff2"')
        # @font-face src: offer woff2 first, keep the original as fallback
        t=re.sub(r'url\((["\']?)([^"\')]*?)'+re.escape(old)+r'\1\)(\s*format\((["\']?)[a-z0-9-]+\4\))?',
                 lambda m: (f'url({m.group(1)}{m.group(2)}{new}{m.group(1)}) format("woff2"), '
                            f'url({m.group(1)}{m.group(2)}{old}{m.group(1)}) format("{"opentype" if old.endswith(".otf") else "truetype"}")'),
                 t)
    if t!=o:
        p.write_text(t,encoding="utf-8"); touched+=1
print(f"repointed {touched} css/html files")
