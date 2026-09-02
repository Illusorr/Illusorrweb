"""Measure real frame timings during scroll, rather than guessing at jank.

Records every animation frame delta while the page is scrolled at a fixed rate,
then reports dropped frames (>16.7ms budget) and the worst stalls. Also reports
how long a native smooth-scroll anchor jump actually takes, which is the
"scrolls too fast" complaint.
"""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

PAGES=["/index.html","/work.html","/projects/metagenus.html","/projects/khaltat.html",
       "/projects/hind-al-oud.html","/about.html","/projects/morphellum.html","/collective.html"]

MEASURE = """async () => {
  const frames=[];
  let last=performance.now(), running=true;
  function tick(t){ frames.push(t-last); last=t; if(running) requestAnimationFrame(tick); }
  requestAnimationFrame(tick);
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  // scroll at a steady, human-ish rate through the whole page
  const H=document.documentElement.scrollHeight-innerHeight;
  const steps=60;
  for(let i=0;i<=steps;i++){ window.scrollTo(0, H*i/steps); await sleep(50); }
  await sleep(300);
  running=false;
  const f=frames.filter(x=>x>0&&x<2000);
  f.sort((a,b)=>a-b);
  const pct=p=>f.length?f[Math.floor(f.length*p)]:0;
  return {
    frames:f.length,
    median:+pct(0.5).toFixed(1),
    p95:+pct(0.95).toFixed(1),
    worst:+(f[f.length-1]||0).toFixed(1),
    dropped:f.filter(x=>x>16.7).length,
    dropped_pct:+(100*f.filter(x=>x>16.7).length/Math.max(f.length,1)).toFixed(1),
    bad:f.filter(x=>x>50).length,
    scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,
    height:document.documentElement.scrollHeight
  };
}"""

out=[]
with sync_playwright() as pw:
    b=pw.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
    for path in PAGES:
        for label,q,vp in (("desktop","",{"width":1440,"height":900}),
                           ("phone","?mobile=1",{"width":390,"height":844})):
            ctx=b.new_context(viewport=vp); pg=ctx.new_page()
            try:
                pg.goto("http://localhost:8099"+path+q, wait_until="load", timeout=40000)
                pg.wait_for_timeout(1200)
                r=pg.evaluate(MEASURE)
                r.update(page=path, mode=label)
                out.append(r)
                print(f"{path[:34]:<35}{label:<8} median {r['median']:>5}ms  p95 {r['p95']:>6}ms  "
                      f"worst {r['worst']:>7}ms  dropped {r['dropped_pct']:>5}%  stalls>50ms {r['bad']:>3}",flush=True)
            except Exception as e:
                print(f"{path:<35}{label:<8} FAILED {type(e).__name__}",flush=True)
            ctx.close()
    b.close()
Path("tools/_scroll-perf.json").write_text(json.dumps(out,indent=1),encoding="utf-8")
if out:
    print(f"\nscroll-behavior on html: {out[0]['scrollBehavior']}")
    worst=sorted(out,key=lambda r:-r['dropped_pct'])[:5]
    print("\nworst offenders by dropped frames:")
    for r in worst: print(f"  {r['dropped_pct']:>5}%  {r['mode']:<8} {r['page']}")
