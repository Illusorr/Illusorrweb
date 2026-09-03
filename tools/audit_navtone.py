"""Compare what the header decides against what is actually behind it.

Steps down each page, hides the bar, samples the strip the probe reads, and
compares that measurement with the on-light class the header applied. Reports
positions where the two disagree - a white scrim over dark pixels, or a white
logo over light ones. Writes tools/_navtone-audit.json.
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageStat
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"
STEP = 420


def lin(v):
    v /= 255
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4


def lum(c):
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])


def main(paths, width=1440):
    out = {}
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for n, path in enumerate(paths, 1):
            wrong = []
            checked = 0
            ctx = br.new_context(viewport={"width": width, "height": 900})
            pg = ctx.new_page()
            try:
                pg.goto(BASE + path, wait_until="load", timeout=30000)
                pg.wait_for_timeout(1500)
                H = pg.evaluate("()=>document.documentElement.scrollHeight")
                y = 0
                while y < min(H, 26000):
                    pg.evaluate(f"window.scrollTo(0,{y})")
                    pg.wait_for_timeout(230)
                    says = pg.evaluate("""()=>{const t=document.querySelector('#ilTopbar');
                        return t? t.classList.contains('on-light') : null;}""")
                    if says is None:
                        break
                    pg.evaluate("()=>{document.querySelector('#ilTopbar').style.visibility='hidden'}")
                    pg.wait_for_timeout(60)
                    try:
                        shot = pg.screenshot(clip={"x": 0, "y": 52, "width": width, "height": 34})
                    except Exception:
                        pg.evaluate("()=>{document.querySelector('#ilTopbar').style.visibility=''}")
                        y += STEP
                        continue
                    pg.evaluate("()=>{document.querySelector('#ilTopbar').style.visibility=''}")
                    im = Image.open(io.BytesIO(shot)).convert("RGB")
                    avg = tuple(int(x) for x in ImageStat.Stat(im).mean)
                    L = lum(avg)
                    checked += 1
                    # a clear disagreement only; the 0.18-0.34 band is genuinely ambiguous
                    if says and L < 0.18:
                        wrong.append({"y": y, "says": "light", "rgb": list(avg), "lum": round(L, 3)})
                    elif (not says) and L > 0.34:
                        wrong.append({"y": y, "says": "dark", "rgb": list(avg), "lum": round(L, 3)})
                    y += STEP
            except Exception as e:
                wrong.append({"error": type(e).__name__})
            ctx.close()
            out[path] = {"checked": checked, "wrong": wrong}
            flag = f"  {len(wrong)} of {checked} positions wrong" if wrong else f"  {checked} positions, all correct"
            print(f"  [{n}/{len(paths)}] {path:<40}{flag}", flush=True)
        br.close()
    Path("tools/_navtone-audit.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    tw = sum(len(v["wrong"]) for v in out.values())
    tc = sum(v["checked"] for v in out.values())
    print(f"\n  {tw} disagreements across {tc} sampled positions on {len(out)} pages")


if __name__ == "__main__":
    a = sys.argv[1:]
    main(a or sorted("/" + p.relative_to(Path("site")).as_posix()
                     for p in Path("site").rglob("*.html") if not p.name.startswith(("_", "."))))
