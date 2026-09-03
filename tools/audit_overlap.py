"""Overlap sweep across every page, at widths AND short heights.

Written after brief.html shipped an exit pill sitting on top of the intake
heading at every short viewport without a single detector noticing. Three
reasons it was missed, all fixed here:

  positioned elements   the old check required position static/relative, so a
                        button placed over a label was invisible to it
  viewport height       the old check only varied width at a fixed 900px tall,
                        and the fault only appears when the window is short
  silent failures       a bare `except: pass` around navigation once turned a
                        run where every page 404'd into a clean "0 overlaps".
                        Load failures are now counted and printed first, and
                        the exit code is non-zero if any page failed to load.

Reports pairs of text-bearing elements whose painted boxes intersect by more
than 12px on both axes. Writes tools/_overlap-audit.json.
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"
# width, height - deliberately includes short windows, where the brief fault lived
VIEWS = [(1920, 1080), (1440, 900), (1440, 560), (1280, 720),
         (1024, 600), (768, 1024), (390, 844), (390, 560), (360, 640)]

PROBE = r"""() => {
  const cs = e => getComputedStyle(e);
  const nm = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
    (typeof e.className === 'string' && e.className.trim()
      ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  /* Visibility has to be judged up the whole ancestor chain. Checking only the
     element itself passed every link inside the closed nav overlay: the overlay
     carries opacity:0 while each child computes opacity:1, so a hidden menu was
     reported as colliding with the topbar on every page. */
  const vis = e => {
    const r = e.getBoundingClientRect();
    if (r.width <= 1 || r.height <= 1) return false;
    let n = e, o = 1;
    while (n && n !== document.documentElement) {
      const s = cs(n);
      if (s.display === 'none' || s.visibility === 'hidden') return false;
      if (n.hasAttribute('inert')) return false;
      o *= parseFloat(s.opacity);
      if (o < 0.15) return false;
      n = n.parentElement;
    }
    return true;
  };

  /* Clip a rect to every scroll/overflow ancestor instead of DISCARDING the
     element. Discarding is what kept this blind: .brief-sec is overflow:hidden,
     so a "skip anything with a clipping ancestor" rule threw away every element
     on the page and reported a clean zero over a visible collision. What
     matters is the part of the box that actually paints. */
  const painted = el => {
    let r = el.getBoundingClientRect();
    let t = r.top, l = r.left, b = r.bottom, rt = r.right;
    let p = el.parentElement;
    while (p && p !== document.documentElement) {
      const s = cs(p);
      if (s.overflow !== 'visible' || s.overflowX !== 'visible' || s.overflowY !== 'visible') {
        const q = p.getBoundingClientRect();
        t = Math.max(t, q.top); l = Math.max(l, q.left);
        b = Math.min(b, q.bottom); rt = Math.min(rt, q.right);
      }
      p = p.parentElement;
    }
    t = Math.max(t, 0); l = Math.max(l, 0);
    b = Math.min(b, innerHeight); rt = Math.min(rt, innerWidth);
    if (rt - l < 2 || b - t < 2) return null;          /* clipped out of sight */
    const full = r.width * r.height;
    if (full > 0 && ((rt - l) * (b - t)) / full < 0.35) return null;  /* mostly hidden */
    return { top: t, left: l, bottom: b, right: rt };
  };

  const txt = [];
  for (const el of document.querySelectorAll(
      'p,h1,h2,h3,h4,h5,h6,li,figcaption,a,button,label,dt,dd,summary,blockquote,span,div')) {
    if (!vis(el) || !el.textContent.trim()) continue;
    /* Fixed/sticky chrome is MEANT to float over content, so skip it - but the
       test has to walk up: #ilTopbar is fixed while the .il-talk link inside it
       computes static, so an element-only check reported the header colliding
       with the page on every single page. */
    let anc = el, floating = false;
    while (anc && anc !== document.documentElement) {
      const ps = cs(anc).position;
      if (ps === 'fixed' || ps === 'sticky') { floating = true; break; }
      anc = anc.parentElement;
    }
    if (floating) continue;
    const s = cs(el);
    if (parseFloat(s.opacity) < 0.9) continue;
    let own = 0;
    for (const n of el.childNodes) if (n.nodeType === 3) own += n.textContent.trim().length;
    if (own < 2) continue;                     /* wrappers, not painters */
    if (el.closest('[hidden]')) continue;
    /* Content inside a CLOSED <details> is not painted, but Chrome hides it
       through the UA ::details-content pseudo - so the child still computes
       content-visibility:visible AND still returns a layout box. That box sits
       on whatever follows, which reported 18 phantom collisions on lab.html
       alone where the accordion renders perfectly. Only the summary of a
       closed details is really on screen. */
    const cd = el.closest('details:not([open])');
    if (cd && !el.closest('summary')) continue;
    const r = painted(el);
    if (r) txt.push({ el, r });
    if (txt.length >= 260) break;
  }

  const out = [];
  for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
    const a = txt[i], b = txt[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (ox <= 6 || oy <= 6) continue;
    out.push({ a: nm(a.el), b: nm(b.el), by: Math.round(ox) + 'x' + Math.round(oy),
               t: a.el.textContent.trim().slice(0, 18) + ' | ' + b.el.textContent.trim().slice(0, 18) });
  }
  return { overlaps: out.slice(0, 8), probed: txt.length };
}"""


def main(pages):
    res = {}
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader"])
        for n, path in enumerate(pages, 1):
            hits, errs, probed = [], [], 0
            for w, h in VIEWS:
                q = "?mobile=1" if w <= 1024 else ""
                ctx = br.new_context(viewport={"width": w, "height": h})
                pg = ctx.new_page()
                try:
                    r = pg.goto(BASE + path + q, wait_until="load", timeout=28000)
                    if r is None or r.status >= 400:
                        errs.append(f"{w}x{h}: HTTP {r.status if r else 'none'}")
                    else:
                        pg.wait_for_timeout(1100)
                        H = pg.evaluate("document.documentElement.scrollHeight")
                        steps = max(1, min(12, int(H / max(h * 0.85, 1)) + 1))
                        seen_pairs = set()
                        for k in range(steps):
                            pg.evaluate(f"window.scrollTo(0,{int(k * h * 0.85)})")
                            pg.wait_for_timeout(260)
                            d = pg.evaluate(PROBE)
                            probed = max(probed, d["probed"])
                            for o in d["overlaps"]:
                                key = (o["a"], o["b"])
                                if key in seen_pairs:
                                    continue
                                seen_pairs.add(key)
                                o["view"] = f"{w}x{h}"
                                hits.append(o)
                except Exception as e:
                    errs.append(f"{w}x{h}: {type(e).__name__}")
                ctx.close()
            res[path] = {"hits": hits, "errors": errs, "probed": probed}
            flag = f"  {len(hits)} overlap(s)" if hits else ""
            if errs:
                flag += f"  [{len(errs)} LOAD FAILURE(S): {errs[0]}]"
            elif not probed:
                flag += "  [probed 0 elements - suspect]"
            print(f"  [{n}/{len(pages)}] {path:<44}{flag}", flush=True)
        br.close()

    Path("tools/_overlap-audit.json").write_text(json.dumps(res, indent=1), encoding="utf-8")
    tot = sum(len(v["hits"]) for v in res.values())
    bad = [p for p, v in res.items() if v["hits"]]
    broke = [p for p, v in res.items() if v["errors"]]
    if broke:
        print(f"\n  !! {len(broke)} page(s) FAILED TO LOAD - their results mean nothing:")
        for p in broke[:12]:
            print(f"     {p}  {res[p]['errors'][0]}")
    ok = len(res) - len(broke)
    print(f"\n  {tot} overlap report(s) across {len(bad)} of {ok} pages that loaded")
    for p in bad:
        print(f"\n  {p}")
        seen = set()
        for o in res[p]["hits"]:
            k = (o["a"], o["b"])
            if k in seen:
                continue
            seen.add(k)
            print(f"    {o['view']:>9}  {o['by']:>9}  {o['a']}  x  {o['b']}")
            print(f"                            {o['t']}")
    return 1 if broke else 0


if __name__ == "__main__":
    a = sys.argv[1:]
    sys.exit(main(a or sorted("/" + p.relative_to(Path("site")).as_posix()
                              for p in Path("site").rglob("*.html")
                              if not p.name.startswith(("_", ".")))))
