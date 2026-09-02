/* ILLUSORR — about page */

/* ===== EMBEDDED ABOUT logic ===== */
(function(){
  const root=document.getElementById('aboutRoot');
  if(!root) return;
  // run the About's own scripts

  const hwrap=document.getElementById('hwrap'),htrack=document.getElementById('htrack');
  const lP=document.getElementById('lPhysical'),lD=document.getElementById('lDigital'),lV=document.getElementById('lVirtual');
  const bars=['b0','b1','b2','b4','b3'].map(id=>document.getElementById(id));
  const N=5;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const nf=document.getElementById('nf');
  function onScroll(){
    /* The horizontal crossing is a desktop-only idea: on touch/narrow the CSS
       unpins .hwrap and stacks the panels vertically. This driver used to run
       regardless and wrote an INLINE transform, which outranks that CSS, so a
       phone still got the track shoved sideways. Bail out and clear anything
       left over from a previous width. */
    if (document.documentElement.hasAttribute('data-touch')) {
      if (htrack.style.transform) htrack.style.transform='';
      return;
    }
    const r=hwrap.getBoundingClientRect();const total=hwrap.offsetHeight-window.innerHeight;
    const raw=clamp((-r.top)/total,0,1);
    // panels finish arriving at 88% of scroll; last 12% holds the brands panel so it dwells, then hands straight to team
    const p=clamp(raw/0.88,0,1);
    htrack.style.transform=`translateX(${-p*(N-1)*100}vw)`;
    // env crossfade: intro(digital)->physical->digital->virtual as we pass panels
    const seg=p*(N-1); // 0..3
    // digital present at intro and team; physical at statement; virtual at clients
    lD.style.opacity = (1-clamp(Math.abs(seg-0),0,1))*0.8 + (1-clamp(Math.abs(seg-2),0,1))*1;
    lP.style.opacity = (1-clamp(Math.abs(seg-1),0,1));
    lV.style.opacity = (1-clamp(Math.abs(seg-3),0,1))+(1-clamp(Math.abs(seg-4),0,1));
    lD.style.opacity=Math.min(1,lD.style.opacity);
    // per-seg bar fill
    /* the rail is indexed by BEAT ARRIVAL, not by crossing: there are five
       beats but only four crossings, so a crossing-indexed rail always leaves
       one segment that can never own a crossing. Intro is arrived at by
       definition; every later segment fills as its own panel comes in. */
    bars.forEach((b,i)=>{
      const f=i===0?1:clamp(seg-(i-1),0,1);
      b.style.width=(f*100)+'%';
    });
    /* the fluid field travels the first three panels and leaves at Virtual:
       it holds through Intro/Physical/Digital, then fades across the last
       crossing so "Brands we build with" lands on clean ground. Hue rotates
       blue → purple over the same run. */
    if(nf){
      const out=clamp(seg-3,0,1);
      nf.style.opacity=(1-out).toFixed(3);
      /* the shift comes out of the field itself: its accent is driven from
         blue to purple, so the noise changes colour rather than a filter
         being laid over it */
      const F=window.__noiseField;
      if(F&&F.setPalette){
        const t=clamp(seg/3,0,1); // purple peaks on Virtual
        F.setPalette(
          [0.45+(0.68-0.45)*t, 0.65+(0.26-0.65)*t, 1],
          [0.020+(0.055-0.020)*t, 0.030+(0.014-0.030)*t, 0.110+(0.150-0.110)*t]
        );
      }
    }
  }
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  const cv=document.getElementById('fieldCanvas');const ctx=cv.getContext('2d');
  function sz(){cv.width=cv.offsetWidth;cv.height=cv.offsetHeight}sz();addEventListener('resize',sz);
  const bl=[];for(let i=0;i<8;i++)bl.push({sp:.1+Math.random()*.25,rad:.2+Math.random()*.34,size:160+Math.random()*160,ph:Math.random()*10});
  /* This ran forever, every frame, on screen or not. It now idles when the
     canvas is scrolled away, when the tab is hidden, and when the visitor
     asks for reduced motion — the same gating components.js already uses. */
  const fieldReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let fieldRaf=0, fieldVisible=false;
  function fieldKick(){ if(fieldVisible && !document.hidden && !fieldRaf && !fieldReduced) fieldRaf=requestAnimationFrame(d); }
  let t=0;(function init(){ if(fieldReduced){ d(); return; }
    new IntersectionObserver(function(es){ fieldVisible=es[0].isIntersecting; fieldKick(); },{threshold:0}).observe(cv);
    document.addEventListener('visibilitychange',fieldKick,{passive:true});
  })();
  function d(){fieldRaf=0;t+=.006;ctx.clearRect(0,0,cv.width,cv.height);ctx.globalCompositeOperation='lighter';
    bl.forEach((b,i)=>{const cx=cv.width*(.5+Math.cos(t*b.sp+b.ph)*b.rad),cy=cv.height*(.46+Math.sin(t*b.sp*1.2+b.ph)*b.rad*.9),r=Math.max(1,b.size*(.8+.3*Math.sin(t*2+i)));
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);const h=i%3===0?'120,140,255':(i%3===1?'76,99,255':'150,120,255');g.addColorStop(0,`rgba(${h},.07)`);g.addColorStop(1,`rgba(${h},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();});
    ctx.globalCompositeOperation='source-over';if(fieldVisible&&!document.hidden&&!fieldReduced)fieldRaf=requestAnimationFrame(d);}
  const io=new IntersectionObserver((es)=>{es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}})},{threshold:.18});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));


  // ===== CINEMATIC TEAM =====
  (function(){
    const BLUE="assets/img/about/team-blue.webp",RED="assets/img/about/team-red.webp",PURPLE="assets/img/about/team-purple.webp",PINK="assets/img/about/team-pink.webp",BLUEPURPLE="assets/img/about/team-bluepurple.webp",
  YELLOW="assets/img/about/team-yellow.webp",
  VIOLET="assets/img/about/team-violet.webp";
    const members=[
      {n:"Sara El Jamal",r:"Managing Partner & Creative Director",init:"SE",img:BLUE,desc:"Leads creative direction and studio vision across every discipline.",tags:["Creative Direction","Art Direction","Strategy","3D"]},
      {n:"Begüm Aydınlıoğlu",r:"Managing Partner · Strategy & Partnerships",init:"BA",img:BLUEPURPLE,desc:"Leads strategy and partnerships, shaping how the studio grows.",tags:["Strategy","Partnerships","Direction"]},
      {n:"Ilayda Güneş",r:"Creative Designer & AI Automation",init:"IG",img:RED,desc:"Designs across the studio and builds AI automation into the workflow.",tags:["Design","AI Automation","Content"]},
      {n:"Salma El Shendy",r:"AI Content Creator & Junior Designer",init:"SS",img:PINK,desc:"Creates AI-driven content and supports design across projects.",tags:["AI Content","Design","Social"]},
      {n:"Mohamed Karaouane",r:"Finance & Admin",init:"MK",img:PURPLE,desc:"Runs finance and operations, keeping the studio building.",tags:["Finance","Operations","Admin"]},
      {n:"Rawan Abdelrazik",r:"Digital Producer & Product Designer",init:"RA",img:YELLOW,ph:"linear-gradient(140deg,#0e3b52,#081018)",desc:"Produces digital work and designs product experiences.",tags:["Production","Product Design","Digital"]},
      {n:"Zeynep Topal",r:"Lead Computational Designer",init:"ZT",img:VIOLET,ph:"linear-gradient(140deg,#3a2a52,#0a0e20)",desc:"Part of the ILLUSORR core team.",tags:["Studio","Craft"]},
      {n:"Lara El Jamal",r:"Production Director",init:"LE",img:null,ph:"linear-gradient(140deg,#0e3b52,#081018)",desc:"Directs production across the studio, concept to delivery.",tags:["Production","Direction","Delivery"]}
    ];
    const timgs=document.getElementById('timgs'),tcompose=document.getElementById('tcompose');
    const tcName=document.getElementById('tcName'),tcRole=document.getElementById('tcRole'),tcInit=document.getElementById('tcInit'),tcDesc=document.getElementById('tcDesc'),tcTags=document.getElementById('tcTags'),tcCount=document.getElementById('tcCount');
    members.forEach((m,i)=>{const d=document.createElement('div');d.className='pimg'+(m.img?'':' ph')+(i===0?' first':'');
      /* the phone shows all eight portraits at once instead of crossfading
         through them, so each one has to carry its own caption */
      d.dataset.name=m.n; d.dataset.role=m.r; d.dataset.idx=String(i+1).padStart(2,'0');
      if(m.img)d.style.backgroundImage=`url('${m.img}')`;else{d.style.background=m.ph;d.textContent=m.n.split(' ')[0];}timgs.appendChild(d);});
    const imgEls=timgs.querySelectorAll('.pimg');
    const tdots=document.getElementById('tdots');tdots.innerHTML=members.map(()=>'<i></i>').join('');
    const dots=tdots.querySelectorAll('i');
    let cur=-1;
    function show(i){if(i===cur)return;const old=cur;cur=i;const m=members[i];
      imgEls.forEach((f,x)=>{f.classList.remove('prev');if(x!==0)f.classList.remove('first');if(x===i)f.classList.add('on');else f.classList.remove('on');});
      if(old>=0&&imgEls[old]){imgEls[old].classList.add('prev');imgEls[old].classList.remove('first');}
      dots.forEach((d,x)=>d.classList.toggle('on',x===i));
      tcompose.classList.remove('on');
      tcName.textContent=m.n;tcRole.textContent=m.r;tcInit.textContent=m.init;tcCount.textContent=String(i+1).padStart(2,'0')+' / '+String(members.length).padStart(2,'0');
      tcDesc.textContent=m.desc;tcTags.innerHTML=m.tags.map(t=>`<span>${t}</span>`).join('');
      requestAnimationFrame(()=>requestAnimationFrame(()=>tcompose.classList.add('on')));
    }
    const sec=document.getElementById('teamSec');
    function onS(){const r=sec.getBoundingClientRect();const total=sec.offsetHeight-window.innerHeight;const p=Math.min(1,Math.max(0,(-r.top)/total));let i=Math.min(members.length-1,Math.floor(p*members.length));if(r.top<window.innerHeight&&r.bottom>0)show(i);}
    window.addEventListener('scroll',onS,{passive:true});show(0);setTimeout(()=>tcompose.classList.add('on'),300);
  })();

  // ===== STACK -> COVERFLOW =====
  (function(){
    const stage=document.getElementById('expStage');
    const flow=document.getElementById('flow'); if(!flow)return;
    const cards=[...flow.querySelectorAll('.fcard')];
    const dotsWrap=document.getElementById('flowDots');
    const hint=document.getElementById('expHint');
    const prevBtn=document.getElementById('flowPrev'), nextBtn=document.getElementById('flowNext');
    const N=cards.length; let active=0, fanned=false;

    dotsWrap.innerHTML=cards.map(()=>'<i></i>').join('');
    const dots=[...dotsWrap.querySelectorAll('i')];

    // initial stacked look
    function stack(){
      cards.forEach((c,i)=>{
        const d=Math.min(i,3);
        c.style.zIndex=String(N-i);
        c.style.transform=`translate(-50%,-50%) translateY(${d*10}px) scale(${1-d*0.04}) rotate(${i%2?d*1.2:-d*1.2}deg)`;
        c.style.opacity=String(Math.max(0,1-d*0.16));
        c.style.filter='none';
        c.classList.toggle('active',i===0);
      });
    }
    // 3D coverflow relative to active
    function coverflow(){
      cards.forEach((c,i)=>{
        let off=i-active;
        // wrap to nearest (so it flows both ways)
        if(off> N/2) off-=N;
        if(off<-N/2) off+=N;
        const abs=Math.abs(off);
        const x=off*220;                 // horizontal spread
        const rot=off*-38;               // angle back
        const z=-abs*260;                // depth
        const scale=abs===0?1:0.86-abs*0.05;
        const op=abs>2?0:1-abs*0.28;
        c.style.zIndex=String(100-abs);
        c.style.transform=`translate(-50%,-50%) translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${scale})`;
        c.style.opacity=String(Math.max(0,op));
        c.style.filter=abs===0?'none':`brightness(${1-abs*0.18})`;
        c.classList.toggle('active',i===active);
      });
      dots.forEach((d,i)=>d.classList.toggle('on',i===active));
    }
    function render(){ fanned?coverflow():stack(); }

    function fanOut(){ if(fanned)return; fanned=true; flow.classList.add('fanned'); stage.classList.add('open'); render(); }
    function unflipAll(){ cards.forEach(c=>c.classList.remove('flipped')); }
    function go(i){ unflipAll(); active=(i+N)%N; render(); }

    // click: before fanning, open. after, clicking active card flips it; clicking a side card navigates to it.
    cards.forEach((card,i)=>{
      card.addEventListener('click',e=>{
        if(!fanned){fanOut();return;}
        if(i===active){
          // don't flip when the CTA link itself was clicked
          if(e.target.closest('.fb-cta'))return;
          card.classList.toggle('flipped');
        }else{
          go(i);
        }
        e.stopPropagation();
      });
    });
    // clicking empty stage area (not a card) navigates by side when fanned
    flow.addEventListener('click',e=>{
      if(!fanned){fanOut();return;}
      if(e.target.closest('.fcard'))return; // handled above
      const r=flow.getBoundingClientRect();
      (e.clientX-r.left < r.width/2) ? go(active-1) : go(active+1);
    });
    prevBtn.addEventListener('click',e=>{e.stopPropagation();go(active-1);});
    nextBtn.addEventListener('click',e=>{e.stopPropagation();go(active+1);});
    dots.forEach((d,i)=>d.addEventListener('click',e=>{e.stopPropagation();go(i);}));
    window.addEventListener('keydown',e=>{if(!fanned)return;if(e.key==='ArrowLeft')go(active-1);if(e.key==='ArrowRight')go(active+1);});

    stack();
  })();

  (function(){
    const people=[
      {n:"Aman Sasan",d:""},
      {n:"Begüm Aydınoğlu Yurdakul",d:""},
      {n:"Can Yurdakul",d:""},
      {n:"Danica Tomic",d:""},
      {n:"Denisa Durica",d:""},
      {n:"Faisal U-K",d:""},
      {n:"Furkan Sahin",d:""},
      {n:"Kivilcim Yavuz",d:""},
      {n:"Kristine Abalos",d:""},
      {n:"Lara Al Jamal",d:""},
      {n:"Mohammed Al Kiyumi",d:""},
      {n:"Natalija Boljšakov",d:""},
      {n:"Oleg Soroko",d:""},
      {n:"Olya Valensia",d:""},
      {n:"Pedro Amador Venegas Rodríguez",d:""},
      {n:"Rowan Elselmy",d:""},
      {n:"Sara El Jamal",d:""},
      {n:"Tansu Dilaver",d:""},
      {n:"Williams Agi",d:""},
      {n:"Zeynep Topal",d:""},
      {n:"Hamid Hassanzadeh",d:""},
      {n:"Yasmin Meziad",d:""}
    ];
    const sec=document.getElementById('collSec'),stick=document.getElementById('collSticky'),cv=document.getElementById('collnet'),ctx=cv.getContext('2d');
    let W=0,H=0,DPR=1;
    function sz(){DPR=Math.min(2,devicePixelRatio||1);W=stick.clientWidth;H=stick.clientHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(DPR,0,0,DPR,0,0);}
    sz();addEventListener('resize',sz);setTimeout(sz,200);if(window.ResizeObserver){new ResizeObserver(sz).observe(stick);}
    const nodes=people.map((p,i)=>{const ring=1+Math.floor(i/7),per=7,idx=i%per;const ang=(idx/per)*Math.PI*2+ring*0.7+i*0.03;const rad=0.26+(ring-1)*0.19;
      return {name:p.n,disc:p.d,ang,rad,drift:0.00007+Math.random()*0.00006,wob:Math.random()*10,wobAmp:0.002+Math.random()*0.002,shown:false,appear:0,hot:false,curveDir:(i%2?1:-1)};});
    let mouse={x:-999,y:-999};
    sec.addEventListener('mousemove',e=>{const r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top});
    sec.addEventListener('mouseleave',()=>{mouse.x=-999;mouse.y=-999});
    let shown=0,started=false;const cnt=document.getElementById('collcnt');
    function startReveal(){if(started)return;started=true;const tm=setInterval(()=>{if(shown>=nodes.length){clearInterval(tm);return}nodes[shown].shown=true;shown++;cnt.textContent=shown;},320);}
    // start revealing when section enters view
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)startReveal()}),{threshold:.2});io.observe(sec);
    let t=0;
    function frame(){t+=1;const pad=W>=1180?540:(W>=980?470:0);const availW=Math.max(240,W-pad);const cx=pad+availW/2,cy=H/2,R=Math.min(availW,H)*0.88;ctx.clearRect(0,0,W,H);
      const pos=nodes.map(n=>{if(n.shown&&n.appear<1)n.appear=Math.min(1,n.appear+0.04);const a=n.ang+t*n.drift;const wob=Math.sin(t*0.01+n.wob)*n.wobAmp;const rr=(n.rad+wob)*R*0.60*(0.55+n.appear*0.45);return {x:cx+Math.cos(a)*rr*1.35,y:cy+Math.sin(a)*rr,n};});
      pos.forEach(p=>{p.n.hot=p.n.shown&&Math.hypot(p.x-mouse.x,p.y-mouse.y)<64;});
      pos.forEach(p=>p.lv=p.n.shown);const mX=90,mY=34;
      for(let a=0;a<pos.length;a++){if(!pos[a].lv)continue;for(let b=a+1;b<pos.length;b++){if(!pos[b].lv)continue;if(Math.abs(pos[a].x-pos[b].x)<mX&&Math.abs(pos[a].y-pos[b].y)<mY){if(pos[b].n.hot&&!pos[a].n.hot)pos[a].lv=false;else pos[b].lv=false;}}}
      pos.forEach((p,i)=>{if(!p.n.shown)return;const al=p.n.appear,hot=p.n.hot;
        // curved dendrite from core to node: control point offset perpendicular to the line, stable per node, gently breathing
        const mx=(cx+p.x)/2, my=(cy+p.y)/2, dx=p.x-cx, dy=p.y-cy, len=Math.hypot(dx,dy)||1;
        const nx=-dy/len, ny=dx/len;
        const bow=(28+ (i%5)*10) * (0.6+0.4*Math.sin(t*0.012+i))* (p.n.curveDir||1);
        const c1x=mx+nx*bow, c1y=my+ny*bow;
        ctx.lineCap='round';
        // soft outer glow of the fiber
        ctx.strokeStyle=hot?'rgba(150,175,255,0.30)':`rgba(110,135,255,${0.10*al})`;ctx.lineWidth=hot?6:4;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(c1x,c1y,p.x,p.y);ctx.stroke();
        // bright core of the fiber
        ctx.strokeStyle=hot?'rgba(180,200,255,0.75)':`rgba(130,150,255,${0.24*al})`;ctx.lineWidth=hot?1.7:1.1;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.quadraticCurveTo(c1x,c1y,p.x,p.y);ctx.stroke();
        // signal pulse travelling ALONG the curve (quadratic bezier interpolation)
        const tp=(t*0.006+i*0.3)%1, it=1-tp;
        const bx=it*it*p.x+2*it*tp*c1x+tp*tp*cx;   // from node -> core
        const by=it*it*p.y+2*it*tp*c1y+tp*tp*cy;
        ctx.fillStyle=`rgba(200,215,255,${(1-tp)*0.7*al})`;ctx.beginPath();ctx.arc(bx,by,2,0,7);ctx.fill();
        ctx.fillStyle=`rgba(200,215,255,${(1-tp)*0.25*al})`;ctx.beginPath();ctx.arc(bx,by,5,0,7);ctx.fill();
      });
      const sp=pos.filter(p=>p.n.shown);sp.forEach(p=>{const near=sp.filter(q=>q!==p).map(q=>({q,d:Math.hypot(p.x-q.x,p.y-q.y)})).sort((a,b)=>a.d-b.d).slice(0,2);
        near.forEach(o=>{const q=o.q;const mx=(p.x+q.x)/2,my=(p.y+q.y)/2,dx=q.x-p.x,dy=q.y-p.y,len=Math.hypot(dx,dy)||1;const nx=-dy/len,ny=dx/len;
          const bow=14*Math.sin(t*0.01+p.x*0.01);const c1x=mx+nx*bow,c1y=my+ny*bow;
          ctx.lineCap='round';ctx.strokeStyle=`rgba(110,135,255,${0.09*p.n.appear})`;ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo(c1x,c1y,q.x,q.y);ctx.stroke();});});
      const cp=0.5+0.5*Math.sin(t*0.03);ctx.fillStyle=`rgba(76,99,255,${0.25+cp*0.2})`;ctx.beginPath();ctx.arc(cx,cy,40,0,7);ctx.fill();
      const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,26);cg.addColorStop(0,'#dbe2ff');cg.addColorStop(.5,'#4c63ff');cg.addColorStop(1,'#0a1030');ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,26,0,7);ctx.fill();
      ctx.fillStyle='#fff';ctx.font='700 11px JetBrains Mono, monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.save();ctx.globalAlpha=0.9;ctx.fillText('ILLUSORR',cx,cy+52);ctx.restore();
      pos.forEach(p=>{if(!p.n.shown)return;const al=p.n.appear,hot=p.n.hot;
        const pulse=0.5+0.5*Math.sin(t*0.05+p.x*0.02);
        ctx.fillStyle=`rgba(76,99,255,${(hot?0.28:0.10+pulse*0.06)*al})`;ctx.beginPath();ctx.arc(p.x,p.y,hot?22:14,0,7);ctx.fill();
        ctx.fillStyle=`rgba(120,150,255,${(hot?0.4:0.2)*al})`;ctx.beginPath();ctx.arc(p.x,p.y,hot?11:7,0,7);ctx.fill();
        ctx.fillStyle=`rgba(210,222,255,${0.95*al})`;ctx.beginPath();ctx.arc(p.x,p.y,hot?5:3.2,0,7);ctx.fill();
        if(p.lv||hot){ctx.textAlign='center';ctx.textBaseline='top';ctx.fillStyle=`rgba(238,241,248,${(hot?1:0.92)*al})`;ctx.font='600 12.5px Outfit, sans-serif';ctx.fillText(p.n.name,p.x,p.y+7);if(p.n.disc){ctx.fillStyle=`rgba(142,162,255,${(hot?1:0.8)*al})`;ctx.font='500 9px JetBrains Mono, monospace';ctx.fillText(p.n.disc.toUpperCase(),p.x,p.y+22);}}});
      if(netVisible && !document.hidden && !netReduced) netRaf=requestAnimationFrame(frame);}
    /* Same gating as the field above: idle when off screen, hidden or when
       reduced motion is requested. */
    var netReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var netRaf=0, netVisible=false;
    function netKick(){ if(netVisible && !document.hidden && !netRaf && !netReduced) netRaf=requestAnimationFrame(frame); }
    if(netReduced){ frame(); }
    else {
      var netCv=document.getElementById('collnet');
      if(netCv){ new IntersectionObserver(function(es){ netVisible=es[0].isIntersecting; netKick(); },{threshold:0}).observe(netCv); }
      document.addEventListener('visibilitychange',netKick,{passive:true});
    }
  })();


})();
