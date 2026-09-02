/* ILLUSORR — home page behaviours */
(function(){
/* ── Scroll scheduling ───────────────────────────────────────────────
   Four handlers on this page each read layout (getBoundingClientRect) and
   then write transforms and opacity, straight out of a scroll event. Scroll
   fires many times per frame, so every extra call forced a synchronous
   layout and the writes landed out of step with the compositor's scroll
   position. That is what made the sections appear to bleed into each other
   on a fast scroll.

   onScroll() queues a handler to run at most once per frame, and all queued
   handlers run together in one batch, so reads and writes stop interleaving. */
var __scrollQueue = [], __scrollRaf = 0;
function __flushScroll(){
  __scrollRaf = 0;
  var q = __scrollQueue; __scrollQueue = [];
  for (var i = 0; i < q.length; i++) { try { q[i](); } catch (e) {} }
}
function onScroll(fn){
  return function(){
    if (__scrollQueue.indexOf(fn) === -1) __scrollQueue.push(fn);
    if (!__scrollRaf) __scrollRaf = requestAnimationFrame(__flushScroll);
  };
}

// SELECTED WORK — conveyor snap
  const convProjects=[
    {title:"PixelPaint", cover:"assets/img/projects/pixelpaint/illusorr-pixelpaint-painted-car-hero.webp", href:"projects/pixelpaint.html", client:"ABB Robotics", sector:"Technology", tag:"Procedural art · Robotics", desc:"A robotic arm printing generative art onto a car surface. Computational design meeting industrial automation.", g:"140deg,#b9c4ec,#e7eaf6"},
    {title:"Optiverse", cover:"assets/img/projects/optiverse/illusorr-optiverse-connected-virtual-worlds-hub-cover.webp", href:"projects/optiverse.html", client:"Optima", sector:"Entertainment", tag:"Worlds · Metaverse", desc:"A monumental virtual hub of connected worlds, navigated through portals, interactive maps, and layered pathways.", g:"140deg,#bcccef,#e7eaf6"},
    {title:"PYLON", cover:"assets/img/projects/pylon/illusorr-pylon-owned-launch-world-cover.webp", href:"projects/pylon.html", client:"ILLUSORR", sector:"IP", tag:"Worlds · Launch", desc:"The studio's own launch world, produced and live in Sansar. An owned immersive environment held as ILLUSORR IP.", g:"140deg,#c7c0ee,#e7eaf6"},
    {title:"Metagenus", cover:"assets/img/projects/metagenus/cover.webp", href:"projects/metagenus.html", client:"ILLUSORR", sector:"Gaming", tag:"IP · Characters", desc:"One thousand original 3D characters, built to license and own. A complete cast ready for a brand, a game, or a world.", g:"140deg,#ccc0ec,#e7eaf6"},
    {title:"Hind Al Oud", cover:"assets/img/projects/hind-al-oud/illusorr-hind-al-oud-fragrance-social-content-cover.webp", href:"projects/hind-al-oud.html", client:"", sector:"Beauty", tag:"Social media · Ecom", desc:"Monthly social and ecommerce content for a fragrance house. Moodboards, editorial, and a full lifestyle feed.", g:"140deg,#bfc7ef,#e7eaf6"},
    {title:"Khaltat", cover:"assets/img/projects/khaltat/illusorr-khaltat-fragrance-ecommerce-content-cover.webp", href:"projects/khaltat.html", client:"", sector:"Beauty", tag:"Social media · Ecom", desc:"Generated social and ecommerce content for a fragrance brand, produced to a monthly cadence and brand standard.", g:"140deg,#c3caee,#e7eaf6"},
    {title:"Koton", cover:"assets/img/projects/koton-lookbook-russia/illusorr-koton-lookbook-russia-campaign-cover.webp", href:"projects/koton-lookbook-russia.html", client:"", sector:"Fashion", tag:"Social media · Ecom", desc:"Campaign and editorial content for a major fashion retailer, produced through custom generative pipelines.", g:"140deg,#cbc2ec,#e7eaf6"},
    {title:"Aquatic Architects", cover:"assets/img/projects/aquatic-architects/illusorr-aquatic-architects-floating-villa-render-cover.webp", href:"projects/aquatic-architects.html", client:"", sector:"Real Estate", tag:"Web · Social", desc:"Web presence and ongoing social content for an architecture and marine developments studio.", g:"140deg,#bcc8ea,#e7eaf6"},
    {title:"Riyadhverse", cover:"assets/img/projects/riyadhverse/illusorr-riyadhverse-riyadh-digital-twin-aerial-cover.webp", href:"projects/riyadhverse.html", client:"Bawtaqah", sector:"Real Estate", tag:"Digital twin", desc:"A digital twin of Riyadh, built in real time for exploration, planning, and immersive presentation.", g:"140deg,#c0c8ee,#e7eaf6"},
  ];
  const convEl=document.getElementById('conv');
  if(convEl){
    const dotsWrap=document.getElementById('dots');
    const cnEl=document.getElementById('cn');
    convEl.innerHTML=convProjects.map((p,i)=>`
      <a class="ccard" data-i="${i}" data-proj="${(p.href||'').split('/').pop().replace(/\.html$/,'')}" href="${p.href}">
        <div class="cmedia" data-full="${p.cover||(p.img?`assets/img/projects/${p.img}/cover.webp`:'')}" style="background-image:${p.cover?`url(${p.cover.replace(/\.webp$/,'-480.webp')}),`:p.img?`url(assets/img/projects/${p.img}/cover-480.webp),`:``}linear-gradient(${p.g});background-size:cover;background-position:center"></div>
        <span class="cvnum mono">${String(i+1).padStart(2,'0')}</span>
        <span class="cvlabel">${p.title}</span>
        <span class="csector mono">${p.sector}</span>
        <div class="cci">
          <h3 class="disp">${p.title}</h3>
          ${p.client?`<div class="cclient">${p.client}</div>`:''}
          <div class="cdesc">${p.desc}</div>
          <div class="ctag mono"><span>${p.tag}</span></div>
        </div>
      </a>`).join('');
    dotsWrap.innerHTML=convProjects.map((_,i)=>`<i data-i="${i}"><span class="fill"></span></i>`).join('');
    const ccards=convEl.querySelectorAll('.ccard');
    const cdots=dotsWrap.querySelectorAll('i');
    let cci=0,ctimer;
    function cset(i){
      cci=i;
      ccards.forEach((c,x)=>{
        c.classList.toggle('active',x===i);
        /* The rail shows a 480px rung; only the expanded card is wide enough
           to need the full cover, so it is fetched on expand and then kept. */
        if(x===i){
          const m=c.querySelector('.cmedia');
          if(m && m.dataset.full && !m.dataset.loaded){
            const img=new Image();
            img.onload=()=>{ m.style.backgroundImage=`url(${m.dataset.full})`; m.dataset.loaded='1'; };
            img.src=m.dataset.full;
          }
        }
      });
      cdots.forEach((d,x)=>{
        d.classList.toggle('on',x===i);d.classList.toggle('done',x<i);
        if(x===i){const f=d.querySelector('.fill');f.style.animation='none';void f.offsetWidth;f.style.animation=''}
      });
      cnEl.textContent=String(i+1).padStart(2,'0');
    }
    function cauto(){ctimer=setInterval(()=>cset((cci+1)%convProjects.length),3000)}
    cset(0);cauto();
    convEl.addEventListener('mouseover',e=>{const c=e.target.closest('.ccard');if(!c)return;clearInterval(ctimer);cset(+c.dataset.i)});
    convEl.addEventListener('mouseleave',()=>{clearInterval(ctimer);cauto()});
    dotsWrap.addEventListener('click',e=>{const d=e.target.closest('i');if(d){clearInterval(ctimer);cset(+d.dataset.i);cauto()}});
  }
  // SPACES BAND — the live environment mounts only while the band is on screen.
  // It is a WebGL scene: leaving it running off screen taxes the whole page.
  const sband=document.getElementById('spacesBand');
  if(sband){
    const holder=document.getElementById('sbFrame');
    const frame=holder.querySelector('iframe');
    const W=1440,H=900;                       // the design size the scene is scaled from
    function fitSpaces(){
      if(!frame.getAttribute('src')) return;
      const s=Math.max(holder.clientWidth/W, holder.clientHeight/H);
      frame.style.width=W+'px';
      frame.style.height=H+'px';
      frame.style.transform='translate('+((holder.clientWidth-W*s)/2)+'px,'+((holder.clientHeight-H*s)/2)+'px) scale('+s+')';
    }
    /* IO is the fast path, but a plain rect check on scroll is the one that
       always fires — some embedding contexts never deliver IO callbacks. */
    let mounted=false;
    function syncSpaces(){
      const r=sband.getBoundingClientRect();
      const near = r.top < innerHeight+300 && r.bottom > -300;
      sband.classList.toggle('in', r.top < innerHeight*0.8 && r.bottom > 0);
      if(near && !mounted){
        mounted=true;
        frame.src=frame.dataset.src;
        frame.addEventListener('load',fitSpaces);
        fitSpaces();
      } else if(!near && mounted){
        mounted=false;
        frame.removeAttribute('src');           // release the GL context
      }
    }
    if(window.IntersectionObserver){
      new IntersectionObserver(syncSpaces,{threshold:[0,.2,.6],rootMargin:'300px 0px'}).observe(sband);
    }
    addEventListener('scroll',onScroll(syncSpaces),{passive:true});
    addEventListener('resize',()=>{syncSpaces();fitSpaces()});
    syncSpaces();
  }

  // COLLECTIVE BAND — reveal steps on entry
  const cband=document.querySelector('.collective-band');
  if(cband){
    const cbObs=new IntersectionObserver((es)=>{es.forEach(en=>cband.classList.toggle('in',en.isIntersecting))},{threshold:.35});
    cbObs.observe(cband);
  }

  // CLOSE — cursor-reactive fluid field
  const closeCv=document.getElementById('closeCanvas');
  if(closeCv){
    const cctx=closeCv.getContext('2d');
    function csize(){closeCv.width=closeCv.offsetWidth;closeCv.height=closeCv.offsetHeight}
    csize();window.addEventListener('resize',csize);
    let cmx=-999,cmy=-999,ctmx=-999,ctmy=-999;
    const closeSec=closeCv.closest('.close-sec');
    closeSec.addEventListener('mousemove',e=>{const r=closeCv.getBoundingClientRect();ctmx=e.clientX-r.left;ctmy=e.clientY-r.top});
    closeSec.addEventListener('mouseleave',()=>{ctmx=-999;ctmy=-999});
    const cblobs=[];
    for(let i=0;i<9;i++){cblobs.push({sp:0.1+Math.random()*0.25,rad:0.2+Math.random()*0.34,size:150+Math.random()*170,ph:Math.random()*10})}
    let ct=0;
    function cdraw(){
      ct+=0.006;
      cmx+=(ctmx-cmx)*0.06;cmy+=(ctmy-cmy)*0.06;
      cctx.clearRect(0,0,closeCv.width,closeCv.height);
      cctx.globalCompositeOperation='lighter';
      cblobs.forEach((b,i)=>{
        let cx=closeCv.width*(0.5+Math.cos(ct*b.sp+b.ph)*b.rad);
        let cy=closeCv.height*(0.46+Math.sin(ct*b.sp*1.2+b.ph)*b.rad*0.9);
        if(cmx>-500){const dx=cx-cmx,dy=cy-cmy,d=Math.hypot(dx,dy);if(d<300){const f=(300-d)/300;cx+=dx/d*f*70;cy+=dy/d*f*70}}
        const r=Math.max(1,b.size*(0.8+0.3*Math.sin(ct*2+i)));
        const g=cctx.createRadialGradient(cx,cy,0,cx,cy,r);
        const hue=i%3===0?'120,140,255':(i%3===1?'76,99,255':'150,120,255');
        g.addColorStop(0,`rgba(${hue},0.13)`);g.addColorStop(1,`rgba(${hue},0)`);
        cctx.fillStyle=g;cctx.beginPath();cctx.arc(cx,cy,r,0,Math.PI*2);cctx.fill();
      });
      cctx.globalCompositeOperation='source-over';
      requestAnimationFrame(cdraw);
    }
    cdraw();
  }

  // BREATH — fluid field buffer
  const bc=document.getElementById('breathCanvas');
  if(bc){
    const bctx=bc.getContext('2d');
    function bsize(){bc.width=bc.offsetWidth;bc.height=bc.offsetHeight}
    bsize();window.addEventListener('resize',bsize);
    let bt=0;
    function bdraw(){
      bt+=0.004;
      bctx.clearRect(0,0,bc.width,bc.height);
      for(let i=0;i<7;i++){
        const cx=bc.width*(0.3+0.42*Math.sin(bt+i*0.9));
        const cy=bc.height*(0.5+0.32*Math.cos(bt*1.15+i));
        const r=140+90*Math.sin(bt*2+i);
        const g=bctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(1,r));
        g.addColorStop(0,'rgba(76,99,255,0.10)');g.addColorStop(1,'rgba(76,99,255,0)');
        bctx.fillStyle=g;bctx.beginPath();bctx.arc(cx,cy,Math.max(1,r),0,Math.PI*2);bctx.fill();
      }
      requestAnimationFrame(bdraw);
    }
    bdraw();
  }

  // WHO WE DO IT FOR — sticky scroll-through, 3D stage + viewpoint parallax
  const whoforScroll=document.getElementById('whoforScroll');
  if(whoforScroll){
    const wfImgs=[...whoforScroll.querySelectorAll('.wf-img')];
    const wfRows=[...whoforScroll.querySelectorAll('.srow')];
    const wfTag=document.getElementById('imgtag');
    const wfCn=document.getElementById('wfcn');
    const wfVis=whoforScroll.querySelector('.wf-visual');
    const wfStage=whoforScroll.querySelector('.wf-stage');
    const wfSheen=whoforScroll.querySelector('.wf-sheen');
    const clampw=(v,a,b)=>Math.min(b,Math.max(a,v));
    let wfCur=-1;
    function updateWhofor(){
      const r=whoforScroll.getBoundingClientRect();
      const total=whoforScroll.offsetHeight-window.innerHeight;
      if(total<=0) return;
      const p=clampw((-r.top)/total,0,0.9999);
      const idx=Math.min(wfImgs.length-1,Math.floor(p*wfImgs.length));
      if(idx===wfCur) return;
      wfCur=idx;
      wfImgs.forEach((im,x)=>im.classList.toggle('on',x===idx));
      wfRows.forEach((s,x)=>s.classList.toggle('on',x===idx));
      wfTag.innerHTML=wfRows[idx].querySelector('.sr-name').innerHTML;
      wfCn.textContent=String(idx+1).padStart(2,'0');
    }
    window.addEventListener('scroll',onScroll(updateWhofor),{passive:true});
    updateWhofor();

    wfRows.forEach((row,i)=>row.addEventListener('click',()=>{
      const total=whoforScroll.offsetHeight-window.innerHeight;
      window.scrollTo({top:whoforScroll.offsetTop+total*(i/wfImgs.length)+10,behavior:'smooth'});
    }));

    const wfReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tx=0,ty=0,cx=0,cy=0,wfRaf=null;
    function wfLoop(){
      cx+=(tx-cx)*0.08; cy+=(ty-cy)*0.08;
      wfStage.style.transform='rotateX('+(-cy*4.5).toFixed(2)+'deg) rotateY('+(cx*6.5).toFixed(2)+'deg) '+
                              'translate3d('+(cx*24).toFixed(1)+'px,'+(cy*16).toFixed(1)+'px,0)';
      wfVis.style.perspectiveOrigin=(50-cx*20).toFixed(1)+'% '+(50-cy*16).toFixed(1)+'%';
      if(Math.abs(tx-cx)>0.001||Math.abs(ty-cy)>0.001) wfRaf=requestAnimationFrame(wfLoop); else wfRaf=null;
    }
    function wfKick(){ if(!wfRaf) wfRaf=requestAnimationFrame(wfLoop); }
    if(!wfReduced && matchMedia('(hover:hover)').matches){
      wfVis.addEventListener('pointermove',e=>{
        const b=wfVis.getBoundingClientRect();
        tx=((e.clientX-b.left)/b.width-.5)*2;
        ty=((e.clientY-b.top)/b.height-.5)*2;
        wfSheen.style.setProperty('--mx',(((e.clientX-b.left)/b.width)*100).toFixed(1)+'%');
        wfSheen.style.setProperty('--my',(((e.clientY-b.top)/b.height)*100).toFixed(1)+'%');
        wfKick();
      });
      wfVis.addEventListener('pointerleave',()=>{ tx=0;ty=0;
        wfSheen.style.setProperty('--mx','60%'); wfSheen.style.setProperty('--my','30%'); wfKick(); });
    }
  }

  const wwa=document.getElementById('wwaScroll');
  const lines=wwa?wwa.querySelectorAll('.wwa-line'):[];
  function updateWWA(){
    const r=wwa.getBoundingClientRect();
    const total=wwa.offsetHeight-window.innerHeight;
    const prog=Math.min(1,Math.max(0,(-r.top)/total));
    const shown=Math.max(1,Math.ceil(prog*lines.length));
    lines.forEach((l,i)=>l.classList.toggle('on',i<shown));
  }
  if(wwa){window.addEventListener('scroll',onScroll(updateWWA),{passive:true});updateWWA();}

  // REEL → WHAT WE DO — recede & emerge + sequential slide reveal
  const reelwwd=document.getElementById('reelwwd');
  const rwReel=document.getElementById('rwReel');
  const rwWwd=document.getElementById('rwWwd');
  const slides=rwWwd?rwWwd.querySelectorAll('.wwd-slide'):[];
  const dots=rwWwd?rwWwd.querySelectorAll('.wwd-progress i'):[];
  const clampv=(v,a,b)=>Math.min(b,Math.max(a,v));
  function updateReelWwd(){
    const r=reelwwd.getBoundingClientRect();
    const total=reelwwd.offsetHeight-window.innerHeight;
    const p=clampv((-r.top)/total,0,1);
    // phase 1 (0 – .28): reel recedes and dims
    const rp=clampv(p/0.28,0,1);
    const s=1-rp*0.72;
    rwReel.style.transform=`scale(${s})`;
    rwReel.style.opacity=(1-clampv(rp*1.6,0,1)).toFixed(3);
    // phase 2 (.24 – 1): what we do emerges + cycles 4 slides
    const wp=clampv((p-0.24)/0.76,0,1);
    rwWwd.style.opacity=clampv(wp*2.2,0,1).toFixed(3);
    let idx=Math.min(slides.length-1,Math.floor(wp*slides.length));
    slides.forEach((sl,i)=>sl.classList.toggle('on',i===idx));
    dots.forEach((d,i)=>d.classList.toggle('on',i<=idx));
  }
  if(reelwwd){window.addEventListener('scroll',onScroll(updateReelWwd),{passive:true});updateReelWwd();}

  setTimeout(()=>{const h=document.getElementById('hint');if(h){h.style.transition='opacity 1s';h.style.opacity='0'}},6500);


})();
