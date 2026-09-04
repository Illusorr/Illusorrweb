/* ILLUSORR — the site navigation behaviour. One script for every page.
   1. Menu open/close (#ilMenuOpen / #ilMenuClose / #ilOverlay, Escape closes).
   2. Light/dark inversion: samples what sits under the bar at three x positions
      and flips the brand, the controls and the glass band independently.
      Tone hints win over measurement: data-tone="light|dark" (case studies) or
      data-bg-theme="light|dark" (site shell), whichever is found first.
   3. Frosted glass band: the bar frosts only while page text runs beneath it,
      so it stays invisible over open imagery and legible over headlines. */
(function(){
  var tb=document.getElementById('ilTopbar'), ov=document.getElementById('ilOverlay');
  if(!tb) return;
  var mo=document.getElementById('ilMenuOpen'), mc=document.getElementById('ilMenuClose');
  if(mo&&ov)mo.addEventListener('click',function(){ov.classList.add('open')});
  if(mc&&ov)mc.addEventListener('click',function(){ov.classList.remove('open')});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov)ov.classList.remove('open')});

  /* ── ?probe=1 diagnostics ─────────────────────────────────
     Off unless the URL carries ?probe=1, so a normal visit does nothing at
     all. The standalone probe page measures correctly and the real pages do
     not behave the same way on the device, so the reading has to come from
     the page that is actually wrong, at the scroll position where it is
     wrong. Reports what sits at viewport y=1 — the row Safari stretches into
     the status bar — plus the band's state, at up to 12 scroll positions.
     Delete this block, web.nav_probe and nav-probe.html when the header is
     settled. */
  if(/[?&]probe=1/.test(location.search)) (function(){
    var sent=0, last=-1e9, timer=null;
    function topAt(y){
      var st=document.elementsFromPoint(Math.round(window.innerWidth/2),y);
      for(var i=0;i<st.length;i++){
        var n=st[i];
        var cs=getComputedStyle(n);
        return n.tagName+'.'+String(n.className).slice(0,26)
             +'|bg='+cs.backgroundColor+'|op='+cs.opacity;
      }
      return '(none)';
    }
    function report(){
      if(sent>=12) return;
      var y=Math.round(window.scrollY);
      if(Math.abs(y-last)<120) return;
      last=y; sent++;
      var bs=getComputedStyle(tb,'::before');
      fetch('https://mivkvqibkceaayktqtds.supabase.co/rest/v1/nav_probe',{
        method:'POST',
        headers:{'apikey':'sb_publishable_wK8G1NuUGp5DZSdWX26ZkA_h6d6P0jd',
          'Authorization':'Bearer sb_publishable_wK8G1NuUGp5DZSdWX26ZkA_h6d6P0jd',
          'Content-Type':'application/json','Content-Profile':'web','Prefer':'return=minimal'},
        body:JSON.stringify({page:location.pathname+' y'+y,user_agent:navigator.userAgent,payload:{
          scrollY:y, barClasses:tb.className,
          barTop:Math.round(tb.getBoundingClientRect().top),
          barHeight:Math.round(tb.getBoundingClientRect().height),
          bandTop:bs.top, bandOpacity:bs.opacity,
          bandBg:bs.backgroundImage.slice(0,150),
          atY1:topAt(1), atY10:topAt(10), atY40:topAt(40), atY80:topAt(80),
          innerHeight:window.innerHeight, clientHeight:document.documentElement.clientHeight,
          screenHeight:screen.height, dpr:window.devicePixelRatio
        }})
      }).catch(function(){});
    }
    addEventListener('scroll',function(){clearTimeout(timer);timer=setTimeout(report,260);},{passive:true});
    addEventListener('load',function(){setTimeout(report,900);});
    setTimeout(report,1800);
  })();

  /* ── the status strip ───────────────────────────────
     In Safari with browser chrome the layout viewport is inset below the
     status bar, so a position:fixed header cannot paint there — extending the
     band, extending the bar's box and making it opaque all failed for that one
     reason. The DOCUMENT is painted full-bleed under the status bar, though,
     which is why the page's own content shows through up there.

     So the strip gets something that lives in the document rather than in the
     fixed layer: a sticky element pinned so its box occupies the 220px above
     the viewport. It carries no layout (its height is cancelled by an equal
     negative margin) and no pointer events, and where the viewport is not
     inset — every desktop, Android, and a home-screen web app — it simply
     sits off-screen and paints nothing. */
  var strip=document.createElement('div');
  strip.className='il-strip';
  strip.setAttribute('aria-hidden','true');
  if(document.body.firstChild) document.body.insertBefore(strip,document.body.firstChild);
  else document.body.appendChild(strip);

  /* ── tone sampling ─────────────────────────────────────────────────
     THE HEADER FOLLOWS THE SECTION'S GROUND, NOTHING ELSE.

     It used to follow whatever happened to be under the bar. A client
     signature, a card, a 97%-transparent pill, a photograph — each got a
     say, and each was a way for the header to flip on a section whose
     design had not changed. Two rules now:

       1. A declared theme wins outright. data-tone / data-bg-theme on a
          section, or one of the light-section classes.
       2. Otherwise the ground is measured, but only from boxes that
          actually SPAN the bar. A section, a band, a page wrapper does.
          A card, a logo, a badge, a button does not, and no longer votes.

     Media never speaks for the ground at all — not measured, not assumed.
     An image inside a declared section still resolves through that
     section, which is the right answer and the only one it should give.
     Legibility over a bright photo is the scrim's job, not the logo's:
     the band paints its own surface under the mark either way. */
  var LIGHT_SECTIONS='.light,.conv-section,.wwa-scroll,.whofor,.whofor-scroll';
  var MEDIA=/^(IMG|SVG|VIDEO|CANVAS|PICTURE|IFRAME)$/;

  /* [r,g,b,a] with alpha kept. Alpha decides nothing on its own — the
     probe composites front to back and judges the result — but a layer
     that contributes nothing must not be mistaken for one that does. */
  function rgba(c){
    /* No regex on purpose. This file is edited through tooling that has
       silently eaten escaped parens, and a mangled character class turned
       EVERY colour into null: the probe then skipped the opaque ground it
       was standing on and read the panel behind it, which is how a dark
       section ended up wearing a white header. Index arithmetic cannot be
       mangled the same way.
       Accepts both syntaxes a browser may hand back: rgb(a, b, c),
       rgba(a, b, c, d) and the space-separated rgb(a b c / d). Anything
       else, wide-gamut color() included, returns null and the element is
       simply not counted as ground. */
    var i=c.indexOf('('), j=c.lastIndexOf(')');
    if(i<0||j<=i) return null;
    var t=c.slice(i+1,j).split(',').join(' ').split('/').join(' ').split(' ');
    var p=[];
    for(var k=0;k<t.length;k++){
      if(t[k]==='') continue;
      var v=parseFloat(t[k]);
      if(isNaN(v)) return null;
      p.push(v);
    }
    if(p.length<3) return null;
    return [p[0],p[1],p[2],p.length>3?p[3]:1];
  }

  /* Is this box the GROUND under the bar, or something sitting on it?
     Ground runs the width of the header. Anything narrower is furniture. */
  function spansBar(el){
    try{
      var br=tb.getBoundingClientRect(), r=el.getBoundingClientRect();
      var w=Math.min(br.right,r.right)-Math.max(br.left,r.left);
      return br.width>0 && w>=br.width*0.9;
    }catch(e){ return false; }
  }

  function sample(){
    if(ov&&ov.classList.contains('open')) return;
    function probe(x){
      var stack=document.elementsFromPoint(x,70);
      var acc=[0,0,0,0];                  /* premultiplied composite, front to back */
      for(var i=0;i<stack.length;i++){
        var n=stack[i];
        if(tb.contains(n)||(ov&&ov.contains(n))||(n.closest&&n.closest('.il-overlay'))) continue;
        /* a declared section theme is the answer, wherever it is declared */
        if(n.closest){
          var toned=n.closest('[data-tone],[data-bg-theme]');
          if(toned) return (toned.getAttribute('data-tone')||toned.getAttribute('data-bg-theme'))==='light';
          if(n.closest(LIGHT_SECTIONS)) return true;
        }
        if(MEDIA.test(n.tagName)) continue;      /* never evidence */
        var c=rgba(getComputedStyle(n).backgroundColor);
        if(!c||c[3]<=0) continue;
        if(!spansBar(n)) continue;               /* furniture, not ground */
        var rem=1-acc[3];
        acc[0]+=c[0]*c[3]*rem; acc[1]+=c[1]*c[3]*rem; acc[2]+=c[2]*c[3]*rem;
        acc[3]+=c[3]*rem;
        if(acc[3]>=0.98) break;
      }
      if(acc[3]<0.98){
        var bd=rgba(getComputedStyle(document.body).backgroundColor);
        if(bd&&bd[3]>0){
          var r2=1-acc[3];
          acc[0]+=bd[0]*bd[3]*r2; acc[1]+=bd[1]*bd[3]*r2; acc[2]+=bd[2]*bd[3]*r2;
          acc[3]+=bd[3]*r2;
        }
      }
      if(acc[3]<=0.02) return false;      /* nothing opaque found: treat as dark */
      return (0.2126*acc[0]+0.7152*acc[1]+0.0722*acc[2])/255>0.55;
    }
    tb.classList.toggle('brand-on-light',probe(80));
    tb.classList.toggle('ctl-on-light',probe(window.innerWidth-90));
    tb.classList.toggle('on-light',probe(window.innerWidth/2));
    strip.className='il-strip'+(tb.classList.contains('brand-on-light')?' on-light':'');
  }
  /* Scroll fires many times per frame and this queued a fresh rAF for each,
     so sample() ran repeatedly per frame doing three elementsFromPoint walks
     every time. Coalesce to one run per frame. */
  var pending=false, lastY=-1e9, settle=0;
  window.addEventListener('scroll',function(){
    /* Always take a final reading once scrolling stops. Without this the
       delta guard below can skip the last few pixels of a scroll and leave
       the bar showing the previous section's tone, which is exactly how the
       logo ended up light-on-light. */
    clearTimeout(settle);
    settle=setTimeout(function(){ lastY=-1e9; sample(); },90);

    if(pending) return;
    pending=true;
    requestAnimationFrame(function(){
      pending=false;
      /* Each sample costs three elementsFromPoint walks and the tone only
         changes at a section boundary, so skip small intermediate moves. */
      var y=window.pageYOffset||document.documentElement.scrollTop||0;
      if(Math.abs(y-lastY)<20) return;
      lastY=y;
      sample();
    });
  },{passive:true});
  window.addEventListener('resize',sample);
  window.addEventListener('load',sample);
  sample();

  /* ── glass band ────────────────────────────────────────────────── */
  (function(){
    /* Images belong here as much as text does. A client logo or a bright
       still sliding under a transparent header collides with the ILLUSORR
       mark exactly the way a headline does, and the scrim never appeared
       for it because the hit test required textContent. */
    var SEL='h1,h2,h3,h4,h5,p,li,figcaption,blockquote,.disp,.lead,.eyebrow,.mono,'
      +'.sr-name,.sr-desc,.t-meta,.next-k,.conv-eyebrow,'
      +'img,svg,video,canvas,picture';
    var hits=new Set(), io=null, band=0, scan=null;
    function observeAll(){
      var nodes=document.querySelectorAll(SEL);
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        if(tb.contains(n)||(n.closest&&n.closest('.il-overlay,.ill-totop'))) continue;
        /* A fixed backdrop (the home WebGL field, a full-bleed page canvas)
           always intersects the band without ever scrolling under it, so it
           would pin the scrim on permanently. Only scrolling content counts. */
        if(/^(IMG|SVG|VIDEO|CANVAS|PICTURE)$/.test(n.tagName)){
          var ps=getComputedStyle(n).position;
          if(ps==='fixed') continue;
          var fx=n.closest&&n.closest('.hero-field,.brief-field,#nf');
          if(fx) continue;
        }
        io.observe(n);
      }
    }
    function makeIO(){
      band=Math.round(tb.getBoundingClientRect().height)||70;
      if(io) io.disconnect();
      hits.clear();
      io=new IntersectionObserver(function(entries){
        for(var i=0;i<entries.length;i++){
          var e=entries[i];
          var el=e.target, isMedia=/^(IMG|SVG|VIDEO|CANVAS|PICTURE)$/.test(el.tagName);
          /* media has no textContent, so judge it on being visible and big
             enough to read as an object rather than a hairline rule */
          var counts=isMedia
            ? (el.getBoundingClientRect().width>24&&el.getBoundingClientRect().height>14)
            : !!(el.textContent&&el.textContent.trim());
          if(e.isIntersecting&&counts) hits.add(el);
          else hits.delete(e.target);
        }
        tb.classList.toggle('is-glass',hits.size>0);
      },{rootMargin:'0px 0px -'+Math.max(0,(window.innerHeight-band-6))+'px 0px',threshold:0});
      observeAll();
    }
    makeIO();
    addEventListener('resize',function(){clearTimeout(scan);scan=setTimeout(makeIO,180)});
    /* late content (conveyor cards, injected grids) joins the watch list */
    new MutationObserver(function(){clearTimeout(scan);scan=setTimeout(observeAll,220)})
      .observe(document.body,{childList:true,subtree:true});
  })();
})();
