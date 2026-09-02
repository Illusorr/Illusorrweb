"""Scan every page at every breakpoint for objective layout faults.

Reports only things that are measurably wrong, not matters of taste:

  overflow-x     the document scrolls sideways
  escapes        an element extends past its container's right edge
  orphan         a text block ends with a single word alone on the last line
  edge-drift     siblings in a section that should share a left edge do not
  overlap        two text elements occupy the same pixels
  tiny-tap       an interactive target under 44px (your own accessibility floor)

Writes tools/_layout-audit.json.
"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

WIDTHS=[1920,1440,1024,768,640,390]
BASE="http://localhost:8099"

PROBE = r"""() => {
  const out={overflowX:0, escapes:[], orphans:[], edgeDrift:[], overlaps:[], tinyTaps:[]};
  const de=document.documentElement;
  out.overflowX = Math.max(0, de.scrollWidth - de.clientWidth);

  const vis = el => {
    const s=getComputedStyle(el);
    if(s.display==='none'||s.visibility==='hidden'||s.opacity==='0') return false;
    const r=el.getBoundingClientRect();
    return r.width>1 && r.height>1;
  };
  const name = el => el.tagName.toLowerCase()
      + (el.id?'#'+el.id:'')
      + (typeof el.className==='string'&&el.className.trim()
          ? '.'+el.className.trim().split(/\s+/).slice(0,2).join('.') : '');

  // 1. elements escaping their container horizontally
  const all=[...document.querySelectorAll('body *')].filter(vis).slice(0,2500);
  for(const el of all){
    const p=el.parentElement; if(!p||p===document.body) continue;
    const ps=getComputedStyle(p);
    if(ps.overflow!=='visible'||ps.overflowX!=='visible') continue;
    const a=el.getBoundingClientRect(), b=p.getBoundingClientRect();
    if(b.width<2) continue;
    const over=Math.round(Math.max(a.right-b.right, b.left-a.left));
    if(over>8) out.escapes.push({el:name(el), parent:name(p), by:over});
  }

  // 2. orphan words: a text block whose last line holds one word
  const textEls=[...document.querySelectorAll('p,h1,h2,h3,h4,li,figcaption,blockquote,.lede,.sub')]
    .filter(vis);
  for(const el of textEls){
    const txt=(el.textContent||'').trim();
    if(!txt || txt.split(/\s+/).length<4) continue;
    if(el.querySelector('*') && el.children.length>2) continue;
    const r=document.createRange(); r.selectNodeContents(el);
    const rects=[...r.getClientRects()].filter(x=>x.width>0);
    if(rects.length<2) continue;
    const last=rects[rects.length-1], prev=rects[rects.length-2];
    // a final fragment much narrower than the line above, holding one word
    const words=txt.split(/\s+/);
    if(last.width < prev.width*0.28 && last.width < 190){
      out.orphans.push({el:name(el), lastWidth:Math.round(last.width),
                        lineWidth:Math.round(prev.width), tail:words.slice(-2).join(' ').slice(0,40)});
    }
  }

  // 3. left-edge drift between siblings that look like a stack
  for(const sec of document.querySelectorAll('section,.module,.wrap')){
    const kids=[...sec.children].filter(vis).filter(e=>{
      const s=getComputedStyle(e); return s.position==='static'||s.position==='relative';
    });
    if(kids.length<2) continue;
    const lefts=kids.map(e=>Math.round(e.getBoundingClientRect().left));
    const min=Math.min(...lefts), max=Math.max(...lefts);
    if(max-min>2 && max-min<64){        // small drift = accident, big = intentional layout
      out.edgeDrift.push({sec:name(sec), spread:max-min, lefts:lefts.slice(0,6)});
    }
  }

  // 4. overlapping text blocks
  const boxes=textEls.slice(0,220).map(e=>({n:name(e), r:e.getBoundingClientRect(), e}));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const A=boxes[i], B=boxes[j];
    if(A.e.contains(B.e)||B.e.contains(A.e)) continue;
    const ox=Math.min(A.r.right,B.r.right)-Math.max(A.r.left,B.r.left);
    const oy=Math.min(A.r.bottom,B.r.bottom)-Math.max(A.r.top,B.r.top);
    if(ox>12&&oy>12) out.overlaps.push({a:A.n,b:B.n,x:Math.round(ox),y:Math.round(oy)});
  }

  // 5. tap targets under the 44px floor
  for(const el of document.querySelectorAll('a,button,[role="button"],input,select')){
    if(!vis(el)) continue;
    const r=el.getBoundingClientRect();
    if(r.height<44 && r.width<200 && el.textContent.trim())
      out.tinyTaps.push({el:name(el), w:Math.round(r.width), h:Math.round(r.height)});
  }
  ['escapes','orphans','edgeDrift','overlaps','tinyTaps'].forEach(k=>out[k]=out[k].slice(0,40));
  return out;
}"""

pages=sorted("/"+p.relative_to(Path("site")).as_posix() for p in Path("site").rglob("*.html")
             if not p.name.startswith(("_",".")))
only=sys.argv[1:] if len(sys.argv)>1 else None
if only: pages=[p for p in pages if any(o in p for o in only)]

results={}
with sync_playwright() as pw:
    b=pw.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader"])
    for n,path in enumerate(pages,1):
        results[path]={}
        for w in WIDTHS:
            q="?mobile=1" if w<=1024 else ""
            ctx=b.new_context(viewport={"width":w,"height":900}); pg=ctx.new_page()
            try:
                pg.goto(BASE+path+q, wait_until="domcontentloaded", timeout=22000)
                pg.wait_for_timeout(1100)
                results[path][w]=pg.evaluate(PROBE)
            except Exception as e:
                results[path][w]={"error":type(e).__name__}
            ctx.close()
        print(f"  [{n}/{len(pages)}] {path}", flush=True)
    b.close()
Path("tools/_layout-audit.json").write_text(json.dumps(results,indent=1),encoding="utf-8")
print("\nwritten to tools/_layout-audit.json")
