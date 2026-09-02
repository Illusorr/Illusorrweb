"""Page-by-page audit across the dimensions that can be measured honestly.

Framerate is deliberately NOT scored: this runs on SwiftShader software
rendering, where WebGL and canvas pages read far slower than on real hardware,
so any score would be misleading. Everything else is measured in a real
browser at desktop and phone widths.

  weight      bytes actually transferred
  layout      overflow, elements escaping containers, overlapping text
  media       formats, oversizing against measured slots, preload hygiene
  a11y        contrast failures, tap targets under 44px, missing alt
  privacy     third-party hosts, ad/tracking domains
  console     errors and failed requests
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"
WIDTHS = [1440, 390]

PROBE = r"""() => {
  const cs = e => getComputedStyle(e);
  const vis = e => {
    const s = cs(e);
    if (s.display === 'none' || s.visibility === 'hidden') return false;
    const r = e.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const nm = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '');
  const de = document.documentElement;
  const all = [...document.querySelectorAll('body *')].filter(vis).slice(0, 2200);

  const esc = [];
  for (const el of all) {
    const p = el.parentElement;
    if (!p || p === document.body) continue;
    const ps = cs(p);
    if (ps.overflow !== 'visible' || ps.overflowX !== 'visible') continue;
    const a = el.getBoundingClientRect(), b = p.getBoundingClientRect();
    if (b.width < 2) continue;
    const over = Math.round(Math.max(a.right - b.right, b.left - a.left));
    if (over > 8) esc.push({ el: nm(el), by: over });
  }

  const txt = [...document.querySelectorAll('p,h1,h2,h3,h4,li,figcaption')].filter(vis).slice(0, 170);
  let ovl = 0;
  for (let i = 0; i < txt.length; i++) {
    for (let j = i + 1; j < txt.length; j++) {
      if (txt[i].contains(txt[j]) || txt[j].contains(txt[i])) continue;
      const A = txt[i].getBoundingClientRect(), B = txt[j].getBoundingClientRect();
      if (Math.min(A.right, B.right) - Math.max(A.left, B.left) > 12 &&
          Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top) > 12) ovl++;
    }
  }

  let tiny = 0;
  for (const el of document.querySelectorAll('a,button,input,select')) {
    if (!vis(el) || !el.textContent.trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 44 && r.width < 200) tiny++;
  }

  const lum = c => {
    const m = c.match(/[\d.]+/g) || [0, 0, 0];
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(+m[0]) + 0.7152 * f(+m[1]) + 0.0722 * f(+m[2]);
  };
  let lowContrast = 0, checkedC = 0;
  for (const el of document.querySelectorAll('p,li,h1,h2,h3,h4,a,figcaption')) {
    if (!vis(el) || !el.textContent.trim()) continue;
    let e = el, bg = 'rgba(0, 0, 0, 0)';
    while (e && bg === 'rgba(0, 0, 0, 0)') { bg = cs(e).backgroundColor; e = e.parentElement; }
    if (bg === 'rgba(0, 0, 0, 0)') continue;
    const s = cs(el), a = lum(s.color), b = lum(bg);
    const cr = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const need = parseFloat(s.fontSize) >= 24 ? 3 : 4.5;
    checkedC++;
    if (cr < need) lowContrast++;
  }

  let orphans = 0;
  for (const el of document.querySelectorAll('p,h1,h2,h3')) {
    if (!vis(el) || el.children.length) continue;
    const t = el.textContent, node = el.firstChild;
    if (!node || node.nodeType !== 3) continue;
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const rects = [...rg.getClientRects()].filter(x => x.width > 0);
    if (rects.length < 2) continue;
    const top = Math.round(rects[rects.length - 1].top);
    let start = 0;
    for (let i = t.length - 1; i > 0; i--) {
      rg.setStart(node, i); rg.setEnd(node, t.length);
      const rr = [...rg.getClientRects()].filter(x => x.width > 0);
      if (rr.length && Math.round(rr[0].top) === top) start = i; else break;
    }
    const lastTxt = t.slice(start).trim();
    if (lastTxt && lastTxt.split(/\s+/).filter(Boolean).length === 1) orphans++;
  }

  const imgs = [...document.querySelectorAll('img')].filter(vis);
  let oversized = 0, noSrcset = 0, legacyFmt = 0;
  for (const i of imgs) {
    const cssW = i.getBoundingClientRect().width;
    if (i.naturalWidth && cssW && i.naturalWidth > cssW * 2 * 1.3) oversized++;
    if (!i.getAttribute('srcset')) noSrcset++;
    if (/\.(png|jpe?g)(\?|$)/i.test(i.currentSrc || i.src || '')) legacyFmt++;
  }
  const vids = [...document.querySelectorAll('video')];

  return {
    height: de.scrollHeight,
    screens: +(de.scrollHeight / innerHeight).toFixed(1),
    nodes: document.querySelectorAll('*').length,
    overflowX: Math.max(0, de.scrollWidth - de.clientWidth),
    escapes: esc.length,
    escapeWorst: esc.sort((a, b) => b.by - a.by).slice(0, 3),
    overlaps: ovl,
    tinyTaps: tiny,
    lowContrast: lowContrast,
    checkedContrast: checkedC,
    orphans: orphans,
    imgs: imgs.length,
    oversized: oversized,
    noSrcset: noSrcset,
    legacyFmt: legacyFmt,
    missingAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
    videos: vids.length,
    vidNoPreloadNone: vids.filter(v => v.getAttribute('preload') !== 'none').length,
    vidNoPoster: vids.filter(v => !v.getAttribute('poster')).length,
    iframes: document.querySelectorAll('iframe').length,
    touch: de.hasAttribute('data-touch'),
    backdrop: all.filter(e => cs(e).backdropFilter !== 'none').length,
    willChange: all.filter(e => cs(e).willChange !== 'auto').length
  };
}"""

SCROLL = r"""async () => {
  const s = ms => new Promise(r => setTimeout(r, ms));
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y < H; y += 800) {
    window.scrollTo(0, y);
    window.dispatchEvent(new Event('scroll'));
    await s(28);
  }
  window.scrollTo(0, 0);
  await s(500);
}"""


def audit(pages):
    out = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for n, path in enumerate(pages, 1):
            rec = {}
            for w in WIDTHS:
                q = "?mobile=1" if w <= 1024 else ""
                ctx = b.new_context(viewport={"width": w, "height": 900})
                pg = ctx.new_page()
                total = [0]
                ext = set()
                errs = []
                fails = []

                def on_resp(r):
                    try:
                        ln = r.headers.get("content-length")
                        total[0] += int(ln) if ln else 0
                        if "localhost" not in r.url and not r.url.startswith("data:"):
                            ext.add(r.url.split("/")[2])
                        if r.status >= 400:
                            fails.append(r.url.split("/")[-1][:40])
                    except Exception:
                        pass

                pg.on("response", on_resp)
                pg.on("console", lambda m: errs.append(m.text[:80]) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errs.append("PE:" + str(e)[:80]))
                try:
                    pg.goto(BASE + path + q, wait_until="load", timeout=35000)
                    pg.evaluate(SCROLL)
                    d = pg.evaluate(PROBE)
                except Exception as e:
                    d = {"error": type(e).__name__}
                d["bytes"] = total[0]
                d["external"] = sorted(ext)
                d["errors"] = [e for e in errs if "image-slots.state" not in e][:5]
                d["failed"] = fails[:5]
                rec[w] = d
                ctx.close()
            out[path] = rec
            print(f"  [{n}/{len(pages)}] {path}", flush=True)
        b.close()
    return out


if __name__ == "__main__":
    pages = sys.argv[1:]
    if not pages:
        pages = ["/index.html", "/work.html", "/about.html", "/sectors.html",
                 "/lab.html", "/collective.html", "/contact.html", "/brief.html"]
    res = audit(pages)
    p = Path("tools/_page-audit.json")
    prev = json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
    prev.update(res)
    p.write_text(json.dumps(prev, indent=1), encoding="utf-8")
    print(f"\nwritten to {p} ({len(prev)} pages total)")
