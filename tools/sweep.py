"""Measure every image and video slot on every page at every breakpoint.

Headless Chromium via Playwright, driven from Python so nothing about it depends
on an interactive session staying alive. Writes tools/_slots.json after each page
and records progress in tools/_slots-done.json, so it resumes where it stopped.

Widths come from the CSS: the phone gate is 640/641 and containers cap at 980
and 1280. Pages are loaded with ?mobile=1 at 640 and below so the
html[data-touch] layer is genuinely active rather than desktop CSS in a narrow
window.
"""
import json, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT   = Path(__file__).resolve().parent.parent
SLOTS  = ROOT/"tools"/"_slots.json"
DONE   = ROOT/"tools"/"_slots-done.json"
BASE   = "http://localhost:8099"
DESKTOP= [1920, 1440, 1024, 768]
PHONE  = [640, 390]

JS_SETTLE = """async () => {
  document.querySelectorAll('img[loading="lazy"]').forEach(i => i.loading = 'eager');
  document.querySelectorAll('img[data-src]').forEach(i => { if(!i.getAttribute('src')) i.src = i.dataset.src; });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const H = document.documentElement.scrollHeight;
  for (let y = 0; y < H; y += 700) { window.scrollTo(0, y); window.dispatchEvent(new Event('scroll')); await sleep(20); }
  window.scrollTo(0, 0);
  await sleep(300);
  await Promise.all([...document.querySelectorAll('img')].map(i => i.decode ? i.decode().catch(()=>{}) : null));
}"""

JS_GRAB = """() => {
  const real = el => {
    const d = el.dataset || {};
    for (const v of [d.src, d.mSrc, d.full, el.getAttribute('src')])
      if (v && !v.startsWith('blob:')) return v;
    const s = el.querySelector && el.querySelector('source');
    if (s) for (const v of [s.dataset && s.dataset.src, s.getAttribute('src')])
      if (v && !v.startsWith('blob:')) return v;
    const c = el.currentSrc || '';
    return c.startsWith('blob:') ? '' : c;
  };
  const abs = u => { try { return new URL(u, location.href).pathname; } catch(e) { return ''; } };
  const out = [];
  for (const i of document.querySelectorAll('img')) {
    const r = i.getBoundingClientRect(), s = abs(real(i) || i.src);
    if (i.naturalWidth > 0 && r.width > 0 && s)
      out.push({k:'img', src:s, cssW:Math.round(r.width), cssH:Math.round(r.height),
                natW:i.naturalWidth, natH:i.naturalHeight});
  }
  for (const v of document.querySelectorAll('video')) {
    const r = v.getBoundingClientRect(), s = abs(real(v));
    if (r.width > 0 && s)
      out.push({k:'video', src:s, cssW:Math.round(r.width), cssH:Math.round(r.height),
                natW:v.videoWidth||0, natH:v.videoHeight||0});
  }
  return out;
}"""

def load(p, d):
    try: return json.loads(p.read_text(encoding="utf-8"))
    except Exception: return d

def merge(store, rows, page, vw):
    for r in rows:
        k = f'{r["k"]}|{r["src"]}'
        a = store.setdefault(k, {"kind":r["k"], "src":r["src"], "natW":0, "natH":0,
                                 "byWidth":{}, "pages":[]})
        if r["natW"] > a["natW"]: a["natW"], a["natH"] = r["natW"], r["natH"]
        prev = a["byWidth"].get(str(vw), [0,0])
        a["byWidth"][str(vw)] = [max(prev[0], r["cssW"]), max(prev[1], r["cssH"])]
        if page not in a["pages"]: a["pages"].append(page)

pages = json.loads((ROOT/"site"/"_pages-list.json").read_text(encoding="utf-8"))
done  = set(load(DONE, []))
store = {f'{a["kind"]}|{a["src"]}': a for a in load(SLOTS, [])}
todo  = [p for p in pages if p not in done]
print(f"{len(done)} pages already measured, {len(todo)} to go", flush=True)

t0 = time.time()
with sync_playwright() as pw:
    browser = pw.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
    for n, page_path in enumerate(todo, 1):
        for widths, mobile in ((DESKTOP, False), (PHONE, True)):
            url = BASE + page_path + ("?mobile=1" if mobile else "")
            ctx = browser.new_context(viewport={"width":widths[0], "height":900},
                                      device_scale_factor=1)
            pg = ctx.new_page()
            try:
                pg.goto(url, wait_until="load", timeout=25000)
            except Exception:
                pass
            for w in widths:
                try:
                    pg.set_viewport_size({"width":w, "height":900})
                    pg.wait_for_timeout(220)
                    pg.evaluate(JS_SETTLE)
                    merge(store, pg.evaluate(JS_GRAB), page_path, w)
                except Exception as e:
                    print(f"   ! {page_path} @ {w}: {type(e).__name__}", flush=True)
            ctx.close()
        done.add(page_path)
        SLOTS.write_text(json.dumps(list(store.values()), indent=1), encoding="utf-8")
        DONE.write_text(json.dumps(sorted(done)), encoding="utf-8")
        print(f"[{n}/{len(todo)}] {page_path}  (assets so far {len(store)}, "
              f"{(time.time()-t0)/60:.1f} min)", flush=True)
    browser.close()
print(f"\nDONE. {len(store)} unique assets across {len(done)} pages in {(time.time()-t0)/60:.1f} min")
