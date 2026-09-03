"""Full per-page audit: layout, responsiveness, media hygiene, type, behaviour.

Detectors are the corrected ones. Two earlier versions of this produced
false positives that mattered, so the fixes are noted where they apply:

  overflow    walks ALL ancestors for a clipping container, and ignores
              deliberate bleeds (absolutely positioned with a negative inset).
              Checking only the immediate parent reported 17 phantom faults on
              index alone.
  contrast    reads the element's OWN background before walking up. Walking
              from the section reported a white-on-white CTA that is actually
              dark-on-white at 19:1.
  overlap     skips anything clipped by an ancestor, and only compares
              elements in normal flow.

Writes tools/_full-audit.json.
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"
WIDTHS = [1920, 1440, 1024, 768, 390]

PROBE = r"""() => {
  const cs = e => getComputedStyle(e);
  const nm = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
    (typeof e.className === 'string' && e.className.trim()
      ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const vis = e => {
    const s = cs(e);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = e.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const clipped = el => {
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const s = cs(p);
      if (s.overflow !== 'visible' || s.overflowX !== 'visible' || s.overflowY !== 'visible') return true;
      if (s.clipPath && s.clipPath !== 'none') return true;
      p = p.parentElement;
    }
    return false;
  };
  const bleeds = el => {
    const s = cs(el);
    if (s.position !== 'absolute' && s.position !== 'fixed') return false;
    return ['top', 'left', 'right', 'bottom'].some(k => parseFloat(s[k]) < -0.5);
  };
  const lum = c => {
    const m = (c || '').match(/[\d.]+/g); if (!m) return null;
    if (m.length > 3 && parseFloat(m[3]) === 0) return null;
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(+m[0]) + 0.7152 * f(+m[1]) + 0.0722 * f(+m[2]);
  };

  const all = [...document.querySelectorAll('body *')].filter(vis);
  const de = document.documentElement;

  /* overflow past the viewport, ancestor-aware */
  const overflow = [];
  for (const el of all) {
    if (clipped(el) || bleeds(el)) continue;
    const r = el.getBoundingClientRect();
    const out = Math.max(Math.round(r.right - de.clientWidth), Math.round(-r.left));
    if (out > 4) overflow.push({ el: nm(el), by: out });
  }

  /* Overlapping text. This USED to require normal flow and only looked at
     seven tag names, so it could not see a positioned button sitting on a
     label - which is exactly how the brief.html exit pill overlapped the
     intake heading at every short viewport, unreported. Positioned elements
     are now included; the pairs that legitimately stack (an element and its
     own backdrop, a deliberate overlay) are excluded by requiring both to
     carry their own text and neither to contain the other. */
  const txt = [...document.querySelectorAll(
      'p,h1,h2,h3,h4,h5,h6,li,figcaption,a,button,label,dt,dd,summary,blockquote')]
    .filter(el => {
      if (!vis(el) || !el.textContent.trim() || clipped(el)) return false;
      const s = cs(el);
      if (s.position === 'fixed') return false;   /* fixed chrome is meant to float */
      if (parseFloat(s.opacity) < 0.9) return false;
      return true;
    }).slice(0, 220);
  const overlaps = [];
  for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
    const a = txt[i], b = txt[j];
    if (a.contains(b) || b.contains(a)) continue;
    const A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    const ox = Math.min(A.right, B.right) - Math.max(A.left, B.left);
    const oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
    if (ox <= 12 || oy <= 12) continue;
    /* an ancestor that scrolls can legitimately bring two children together */
    overlaps.push({ a: nm(a), b: nm(b), by: Math.round(ox) + 'x' + Math.round(oy) });
  }

  /* contrast: element's own background first */
  const contrast = [];
  for (const el of document.querySelectorAll('p,li,h1,h2,h3,h4,a,span,figcaption')) {
    if (!vis(el) || !el.textContent.trim()) continue;
    if (el.children.length && !el.textContent.replace(el.children[0].textContent || '', '').trim()) continue;
    let bg = cs(el).backgroundColor, e = el;
    while (e && (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')) { e = e.parentElement; if (e) bg = cs(e).backgroundColor; }
    const a = lum(cs(el).color), b = lum(bg);
    if (a === null || b === null) continue;
    const cr = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const need = parseFloat(cs(el).fontSize) >= 24 ? 3 : 4.5;
    if (cr < need) contrast.push({ el: nm(el), ratio: +cr.toFixed(2), size: cs(el).fontSize,
                                   text: el.textContent.trim().slice(0, 26) });
  }

  /* media hygiene */
  const imgs = [...document.querySelectorAll('img')];
  const media = {
    imgs: imgs.length,
    noAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
    noLazy: imgs.filter(i => i.getAttribute('loading') !== 'lazy' && i.getBoundingClientRect().top > innerHeight).length,
    noDecoding: imgs.filter(i => !i.getAttribute('decoding')).length,
    noDims: imgs.filter(i => !i.getAttribute('width') && !i.getAttribute('height')
                          && !/aspect-ratio/.test(cs(i).aspectRatio || '')).length,
    noSrcset: imgs.filter(i => vis(i) && !i.getAttribute('srcset')).length,
    oversized: imgs.filter(i => { const w = i.getBoundingClientRect().width;
                                  return i.naturalWidth && w && i.naturalWidth > w * 2 * 1.3; }).length,
  };
  const vids = [...document.querySelectorAll('video')];
  const video = {
    count: vids.length,
    noPreloadNone: vids.filter(v => v.getAttribute('preload') !== 'none').length,
    noPoster: vids.filter(v => !v.getAttribute('poster')).length,
    autoplay: vids.filter(v => v.hasAttribute('autoplay')).length,
    noPlaysinline: vids.filter(v => !v.hasAttribute('playsinline')).length,
  };

  /* tap targets and type */
  let tinyTap = 0;
  for (const el of document.querySelectorAll('a,button,input,select,[role=button]')) {
    if (!vis(el) || !el.textContent.trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.height < 44 && r.width < 200) tinyTap++;
  }
  let tinyType = 0;
  for (const el of document.querySelectorAll('p,li,span,a,div')) {
    if (!vis(el) || !el.textContent.trim() || el.children.length) continue;
    if (parseFloat(cs(el).fontSize) < 12) tinyType++;
  }

  /* compositing cost, the thing that made index jitter */
  const compositing = {
    blend: all.filter(e => cs(e).mixBlendMode !== 'normal').length,
    willChange: all.filter(e => cs(e).willChange !== 'auto').length,
    backdrop: all.filter(e => cs(e).backdropFilter !== 'none').length,
    filters: all.filter(e => cs(e).filter !== 'none').length,
  };

  return {
    height: de.scrollHeight, screens: +(de.scrollHeight / innerHeight).toFixed(1),
    nodes: document.querySelectorAll('*').length,
    docOverflow: Math.max(0, de.scrollWidth - de.clientWidth),
    overflow: overflow.sort((a, b) => b.by - a.by).slice(0, 6), overflowN: overflow.length,
    overlaps: overlaps.slice(0, 5), overlapsN: overlaps.length,
    contrast: contrast.slice(0, 6), contrastN: contrast.length,
    media, video, tinyTap, tinyType, compositing,
    touch: de.hasAttribute('data-touch'),
  };
}"""

SCROLL = r"""async () => {
  const s = ms => new Promise(r => setTimeout(r, ms));
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y < H; y += 800) { window.scrollTo(0, y); window.dispatchEvent(new Event('scroll')); await s(26); }
  window.scrollTo(0, 0); await s(450);
}"""


def main(pages):
    out = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for n, path in enumerate(pages, 1):
            rec = {}
            for w in WIDTHS:
                q = "?mobile=1" if w <= 1024 else ""
                ctx = b.new_context(viewport={"width": w, "height": 900})
                pg = ctx.new_page()
                total = [0]; errs = []; fails = []; ext = set()

                def on_resp(r):
                    try:
                        total[0] += int(r.headers.get("content-length") or 0)
                        if r.status >= 400: fails.append(r.url.split("/")[-1][:36])
                        if "localhost" not in r.url and not r.url.startswith("data:"):
                            ext.add(r.url.split("/")[2])
                    except Exception:
                        pass

                pg.on("response", on_resp)
                pg.on("console", lambda m: errs.append(m.text[:70]) if m.type == "error" else None)
                pg.on("pageerror", lambda e: errs.append("PE:" + str(e)[:70]))
                try:
                    pg.goto(BASE + path + q, wait_until="load", timeout=30000)
                    pg.evaluate(SCROLL)
                    d = pg.evaluate(PROBE)
                    d["firstPaint"] = pg.evaluate(
                        "()=>{const p=performance.getEntriesByType('paint')[0];return p?Math.round(p.startTime):null}")
                except Exception as e:
                    d = {"error": type(e).__name__}
                d["bytes"] = total[0]
                d["errors"] = [e for e in errs if "image-slots.state" not in e][:4]
                d["failed"] = fails[:4]
                d["external"] = sorted(ext)
                rec[w] = d
                ctx.close()
            out[path] = rec
            print(f"  [{n}/{len(pages)}] {path}", flush=True)
        b.close()
    p = Path("tools/_full-audit.json")
    prev = json.loads(p.read_text(encoding="utf-8")) if p.is_file() else {}
    prev.update(out)
    p.write_text(json.dumps(prev, indent=1), encoding="utf-8")
    print(f"\nwritten: {len(prev)} pages total")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args:
        pages = args
    else:
        pages = sorted("/" + p.relative_to(Path("site")).as_posix()
                       for p in Path("site").rglob("*.html")
                       if not p.name.startswith(("_", ".")))
    main(pages)
