"""Load every page in a real browser and record what it costs and whether it errors.

Measures bytes ACTUALLY transferred, which is the only number that matters to a
visitor, and catches console errors and failed requests introduced by the asset work.
"""
import json, time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path.cwd(); BASE="http://localhost:8099"
pages=json.loads((ROOT/"site"/"_pages-list.json").read_text(encoding="utf-8"))
WIDTHS=[(1440,False),(390,True)]

rows=[]; t0=time.time()
with sync_playwright() as pw:
    b=pw.chromium.launch()
    for i,path in enumerate(pages,1):
        for w,mob in WIDTHS:
            ctx=b.new_context(viewport={"width":w,"height":900})
            pg=ctx.new_page()
            bytes_by={}; errors=[]; failed=[]
            def on_resp(r):
                try:
                    ln=r.headers.get("content-length")
                    n=int(ln) if ln else 0
                    ct=(r.headers.get("content-type") or "").split("/")[0]
                    bytes_by[ct]=bytes_by.get(ct,0)+n
                    if r.status>=400: failed.append(f"{r.status} {r.url.split('/')[-1][:40]}")
                except Exception: pass
            pg.on("response", on_resp)
            pg.on("console", lambda m: errors.append(m.text[:120]) if m.type=="error" else None)
            pg.on("pageerror", lambda e: errors.append(str(e)[:120]))
            url=BASE+path+("?mobile=1" if mob else "")
            try:
                pg.goto(url, wait_until="load", timeout=30000)
                pg.evaluate("""async () => {
                  const s=ms=>new Promise(r=>setTimeout(r,ms));
                  const H=document.documentElement.scrollHeight;
                  for(let y=0;y<H;y+=800){window.scrollTo(0,y);window.dispatchEvent(new Event('scroll'));await s(30);}
                  window.scrollTo(0,0); await s(500);
                }""")
            except Exception as e:
                errors.append(f"NAV: {type(e).__name__}")
            tot=sum(bytes_by.values())
            rows.append({"page":path,"vw":w,"total":tot,"by":bytes_by,
                         "errors":errors[:5],"failed":failed[:5],
                         "n_err":len(errors),"n_failed":len(failed)})
            ctx.close()
        if i%10==0: print(f"  {i}/{len(pages)} pages, {(time.time()-t0)/60:.1f} min",flush=True)
    b.close()
(ROOT/"tools"/"_verify.json").write_text(json.dumps(rows,indent=1),encoding="utf-8")

print(f"\n{'page':<36}{'desktop':>11}{'phone':>10}  err  404")
print("-"*72)
by={}
for r in rows: by.setdefault(r["page"],{})[r["vw"]]=r
worst=sorted(by.items(), key=lambda kv:-(kv[1].get(1440,{}).get("total",0)))
for p,d in worst[:20]:
    dk=d.get(1440,{}); ph=d.get(390,{})
    print(f"{p[:35]:<36}{dk.get('total',0)/1048576:>10.2f}M{ph.get('total',0)/1048576:>9.2f}M"
          f"{dk.get('n_err',0)+ph.get('n_err',0):>5}{dk.get('n_failed',0)+ph.get('n_failed',0):>5}")
print("-"*72)
td=sum(d.get(1440,{}).get("total",0) for _,d in by.items())
tp=sum(d.get(390,{}).get("total",0) for _,d in by.items())
print(f"{'ALL 60 PAGES':<36}{td/1048576:>10.2f}M{tp/1048576:>9.2f}M")
allerr=[(r['page'],r['vw'],e) for r in rows for e in r['errors']]
allfail=[(r['page'],f) for r in rows for f in r['failed']]
print(f"\nconsole errors: {len(allerr)}   failed requests: {len(allfail)}")
for p,v,e in allerr[:12]: print(f"   {p} @{v}: {e}")
for p,f in allfail[:12]: print(f"   404 {p}: {f}")
