"""Check every declared section tone against what that section actually paints.

CLAUDE.md makes the declaration authoritative: "sections carry light or dark
plus data-bg-theme, which nav.js reads to invert the header. Set it, do not
rely on measurement." That only holds while the declaration is TRUE. A section
marked light that renders dark makes the header paint a white scrim with a
dark logo over a dark page - which is exactly the report.

For each section carrying a tone, this scrolls it under the header, hides the
header, samples the strip the probe reads, and compares. Writes
tools/_tone-audit.json.
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageStat
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"


def lin(v):
    v /= 255
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4


def lum(c):
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])


def main(paths):
    out = {}
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for n, path in enumerate(paths, 1):
            rows = []
            ctx = br.new_context(viewport={"width": 900, "height": 900})
            pg = ctx.new_page()
            try:
                pg.goto(BASE + path, wait_until="load", timeout=30000)
                pg.wait_for_timeout(1400)
                secs = pg.evaluate("""() => [...document.querySelectorAll('[data-tone],[data-bg-theme]')]
                    .map((e,i) => ({ i, tone: e.getAttribute('data-tone') || e.getAttribute('data-bg-theme'),
                                     cls: (e.tagName + '.' + String(e.className)).slice(0,34),
                                     y: Math.round(e.getBoundingClientRect().top + scrollY),
                                     h: Math.round(e.getBoundingClientRect().height) }))
                    .filter(s => s.h > 40)""")
                for s in secs:
                    # put the section's middle under the bar
                    target = max(0, s["y"] + min(s["h"] // 2, 300) - 70)
                    pg.evaluate(f"window.scrollTo(0,{target})")
                    pg.wait_for_timeout(260)
                    pg.evaluate("()=>{const t=document.querySelector('#ilTopbar'); if(t) t.style.visibility='hidden';}")
                    pg.wait_for_timeout(70)
                    try:
                        shot = pg.screenshot(clip={"x": 0, "y": 52, "width": 900, "height": 36})
                    except Exception:
                        pg.evaluate("()=>{const t=document.querySelector('#ilTopbar'); if(t) t.style.visibility='';}")
                        continue
                    pg.evaluate("()=>{const t=document.querySelector('#ilTopbar'); if(t) t.style.visibility='';}")
                    im = Image.open(io.BytesIO(shot)).convert("RGB")
                    avg = tuple(int(x) for x in ImageStat.Stat(im).mean)
                    L = lum(avg)
                    real = "light" if L > 0.25 else "dark"
                    # only report a section still under the bar after scrolling
                    if real != s["tone"]:
                        rows.append({"cls": s["cls"], "declared": s["tone"], "renders": real,
                                     "rgb": list(avg), "lum": round(L, 4), "y": s["y"]})
            except Exception as e:
                rows.append({"error": type(e).__name__})
            ctx.close()
            out[path] = rows
            flag = f"  {len(rows)} mismatch(es)" if rows else ""
            print(f"  [{n}/{len(paths)}] {path:<42}{flag}", flush=True)
        br.close()
    Path("tools/_tone-audit.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    tot = sum(len(v) for v in out.values())
    print(f"\n  {tot} sections whose declared tone does not match what they paint")
    for p, rows in out.items():
        for r in rows:
            if "error" in r:
                continue
            print(f"    {p:<40} {r['cls']:<34} says {r['declared']:<5} renders {r['renders']:<5} rgb={r['rgb']}")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a or sorted("/" + p.relative_to(Path("site")).as_posix()
                     for p in Path("site").rglob("*.html") if not p.name.startswith(("_", "."))))
