"""Per-page transfer audit, desktop and phone.

Two numbers per page, because they answer different questions:

  on load   bytes a visitor pays before doing anything. This is the number
            that decides whether the page feels fast, and the one to hold
            against a budget.
  full      bytes after scrolling the whole page, which is what someone who
            reads to the end pays. Lazy media and on-demand video land here.

Content-length is used rather than encoded body size, so a server that
gzips will report a little higher than the wire truth for text assets.
"""
import json, sys
from collections import defaultdict
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:8099"
BUDGET = 5 * 1048576

def run(pg, path, mobile):
    tot = [0]; items = []
    def on(r):
        try:
            n = int(r.headers.get("content-length") or 0)
            if n: tot[0] += n; items.append((n, r.request.resource_type, r.url))
        except Exception: pass
    pg.on("response", on)
    q = "?mobile=1" if mobile else ""
    pg.goto(BASE + path + q, wait_until="load", timeout=45000)
    try: pg.wait_for_function("()=>!document.getElementById('boot')", timeout=9000)
    except Exception: pass
    pg.wait_for_timeout(2500)
    onload = tot[0]
    pg.evaluate("()=>{const H=document.documentElement.scrollHeight;for(let y=0;y<H;y+=600)window.scrollTo(0,y);}")
    pg.wait_for_timeout(6000)
    return onload, tot[0], items

def main(pages):
    out = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
        for n, path in enumerate(pages, 1):
            rec = {}
            for label, w, mob in (("desktop",1440,False), ("phone",390,True)):
                ctx = b.new_context(viewport={"width":w,"height":900 if not mob else 844},
                                    is_mobile=mob, has_touch=mob,
                                    user_agent=None if not mob else
                                    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15")
                pg = ctx.new_page()
                try:
                    onload, full, items = run(pg, path, mob)
                    by = defaultdict(int)
                    for sz, t, u in items: by[t] += sz
                    rec[label] = {"onload": onload, "full": full,
                                  "by_type": dict(sorted(by.items(), key=lambda x:-x[1])),
                                  "top": [{"bytes":s,"type":t,"file":u.split("/")[-1][:52],
                                           "host":("" if "localhost" in u else u.split("/")[2])}
                                          for s,t,u in sorted(items, reverse=True)[:6]]}
                except Exception as e:
                    rec[label] = {"error": type(e).__name__}
                ctx.close()
            out[path] = rec
            d = rec.get("desktop",{}); m = rec.get("phone",{})
            print(f"  [{n}/{len(pages)}] {path:<40} "
                  f"desk {d.get('onload',0)/1048576:5.1f}/{d.get('full',0)/1048576:5.1f}M   "
                  f"phone {m.get('onload',0)/1048576:5.1f}/{m.get('full',0)/1048576:5.1f}M", flush=True)
        b.close()
    Path("tools/_weight-audit.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
    print("\n  written tools/_weight-audit.json")
    over = [(p, r) for p, r in out.items()
            if max(r.get("desktop",{}).get("onload",0), r.get("phone",{}).get("onload",0)) > BUDGET]
    print(f"  pages over the 5 MB on-load budget: {len(over)}")
    for p, r in over:
        print(f"    {p}  desktop {r['desktop']['onload']/1048576:.1f} MB  phone {r['phone']['onload']/1048576:.1f} MB")

if __name__ == "__main__":
    args = sys.argv[1:]
    pages = args or sorted("/"+p.relative_to(Path("site")).as_posix()
                           for p in Path("site").rglob("*.html") if not p.name.startswith(("_",".")))
    main(pages)
