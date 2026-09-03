"""Contrast audit that measures what is actually on screen.

Two earlier methods were wrong and their numbers should be ignored:

  DOM-walk background   climbs the tree for a background colour. Fails for
                        anything transparent over a painted section: it read
                        the nav's "Let's talk" as 1.00:1 (white on body-white)
                        when it renders at 20.93:1 over a dark hero.
  pixel percentiles     took the 10th/90th percentile of the element's box.
                        Fails when text is a small share of those pixels: it
                        read a perfectly legible footer email at 1.04:1.

This takes the text colour from CSS, which is always reliable, and the
background from the MODE of the rendered pixels in the element's box, which is
reliable because glyphs are always a minority of the box. Validated against
known-good and known-bad cases before use.

Writes tools/_contrast-audit.json.
"""
import io
import json
import math
import re
import sys
from collections import Counter
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"
WIDTHS = [1440, 390]
SEL = "p,span,li,h1,h2,h3,h4,h5,a,figcaption,dd,dt,button,label,small,em,strong"


def lin(v):
    v /= 255
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4


def lum(c):
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2])


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def parse(s):
    m = re.findall(r"[\d.]+", s or "")
    return tuple(int(float(x)) for x in m[:3]) if len(m) >= 3 else None


def bg_mode(shot, fg):
    """Background = the most common pixel that is NOT the text or its
    antialiasing. Taking a plain mode fails when glyphs cover much of the box:
    it lands on a glyph pixel and reports text-on-itself, which is how an
    earlier pass called a perfectly legible h1 1.06:1. Returns (colour, share
    of pixels that were background); a low share means the box is mostly text
    and the reading should be discarded."""
    im = Image.open(io.BytesIO(shot)).convert("RGB")
    px = im.tobytes()
    n = len(px) // 3
    if n < 20:
        return None, 0.0
    far = Counter()
    for i in range(0, len(px), 3):
        c = (px[i], px[i + 1], px[i + 2])
        if math.dist(c, fg) > 70:
            far[(c[0] // 8 * 8, c[1] // 8 * 8, c[2] // 8 * 8)] += 1
    if not far:
        return None, 0.0
    return far.most_common(1)[0][0], sum(far.values()) / n


COLLECT = """(sel) => {
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    if (el.children.length) continue;
    const txt = (el.textContent || '').trim();
    if (txt.length < 2) continue;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || parseFloat(s.opacity) < 0.15) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 18 || r.height < 7) continue;
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth) continue;
    out.push({ x: Math.round(r.x), y: Math.round(r.y),
               width: Math.round(r.width), height: Math.round(r.height),
               color: s.color, size: parseFloat(s.fontSize),
               weight: s.fontWeight,
               el: el.tagName.toLowerCase() +
                   (typeof el.className === 'string' && el.className.trim()
                     ? '.' + el.className.trim().split(/\\s+/)[0] : ''),
               text: txt.slice(0, 24) });
  }
  return out.slice(0, 45);
}"""


def audit(pages):
    results = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for n, path in enumerate(pages, 1):
            page_fails = []
            checked = 0
            for w in WIDTHS:
                q = "?mobile=1" if w <= 1024 else ""
                ctx = b.new_context(viewport={"width": w, "height": 900})
                pg = ctx.new_page()
                try:
                    pg.goto(BASE + path + q, wait_until="load", timeout=28000)
                    pg.wait_for_timeout(1400)
                    H = pg.evaluate("document.documentElement.scrollHeight - innerHeight")
                    steps = max(1, min(7, int(H / 900) + 1))
                    seen = set()
                    for i in range(steps):
                        pg.evaluate(f"window.scrollTo(0,{int(H * i / max(steps - 1, 1))})")
                        pg.wait_for_timeout(500)
                        for item in pg.evaluate(COLLECT, SEL):
                            key = (item["el"], item["text"], w)
                            if key in seen:
                                continue
                            seen.add(key)
                            fg = parse(item["color"])
                            if not fg:
                                continue
                            try:
                                bg, share = bg_mode(pg.screenshot(clip={k: item[k] for k in
                                                                        ("x", "y", "width", "height")}), fg)
                            except Exception:
                                continue
                            if not bg or share < 0.25:
                                continue   # too little background to judge
                            checked += 1
                            cr = ratio(fg, bg)
                            big = item["size"] >= 24 or (item["size"] >= 18.66 and
                                                         int(item["weight"] or 400) >= 700)
                            need = 3.0 if big else 4.5
                            if cr < need:
                                page_fails.append({"el": item["el"], "w": w,
                                                   "ratio": round(cr, 2), "need": need,
                                                   "size": item["size"],
                                                   "text": item["text"]})
                except Exception as e:
                    page_fails.append({"error": type(e).__name__})
                ctx.close()
            results[path] = {"checked": checked, "fails": page_fails}
            print(f"  [{n}/{len(pages)}] {path:<42} {len(page_fails)} of {checked}", flush=True)
        b.close()
    p = Path("tools/_contrast-audit.json")
    prev = json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
    prev.update(results)
    p.write_text(json.dumps(prev, indent=1), encoding="utf-8")
    tf = sum(len(v["fails"]) for v in results.values())
    tc = sum(v["checked"] for v in results.values())
    print(f"\n  {tf} failures out of {tc} measured, across {len(results)} pages")


if __name__ == "__main__":
    args = sys.argv[1:]
    pages = args or sorted("/" + p.relative_to(Path("site")).as_posix()
                           for p in Path("site").rglob("*.html")
                           if not p.name.startswith(("_", ".")))
    audit(pages)
