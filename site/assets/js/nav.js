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

  /* ── tone sampling ─────────────────────────────────────────────── */
  var LIGHT_SECTIONS='.light,.conv-section,.wwa-scroll,.whofor,.whofor-scroll';
  function lum(c){
    var m=/rgba?\(([^)]+)\)/.exec(c); if(!m) return null;
    var p=m[1].split(',').map(parseFloat);
    if(p.length>3&&p[3]===0) return null;
    return (0.2126*p[0]+0.7152*p[1]+0.0722*p[2])/255;
  }
  /* [r,g,b,a] with alpha kept. lum() above throws alpha away, which is what
     made a 97%-transparent white pill read as pure white. */
  function rgba(c){
    var m=/rgba?\(([^)]+)\)/.exec(c); if(!m) return null;
    var p=m[1].split(',').map(parseFloat);
    if(p.length<3||isNaN(p[0])) return null;
    return [p[0],p[1],p[2],p.length>3?(isNaN(p[3])?1:p[3]):1];
  }
  /* average luminance of an image, computed once per src */
  var toneCache={};
  /* Sample the STRIP OF THE IMAGE THAT IS ACTUALLY UNDER THE BAR, not the whole
     picture. Averaging the entire image called a photo dark because most of it
     is dark, while the band beneath the header was bright sky - the logo then
     painted white on white. The result is cached per src and per tenth of the
     image's height, so scrolling past one picture costs a handful of 8x8 reads
     rather than one per frame. */
  /* share of the header band this element actually covers */
  function coversBand(el){
    try{
      var br=tb.getBoundingClientRect(), r=el.getBoundingClientRect();
      var w=Math.min(br.right,r.right)-Math.max(br.left,r.left);
      var h=Math.min(br.bottom,r.bottom)-Math.max(br.top,r.top);
      if(w<=0||h<=0) return false;
      return (w*h)/(br.width*br.height) >= 0.3;
    }catch(e){ return false; }
  }
  function imgTone(img){
    var key=img.currentSrc||img.src; if(!key) return null;
    if(!img.complete||!img.naturalWidth) return null;
    var r=img.getBoundingClientRect();
    if(!r.height) return null;
    /* the bar occupies roughly 0..88px of the viewport */
    var top=Math.max(0,(0-r.top)/r.height), bot=Math.min(1,(88-r.top)/r.height);
    if(bot<=top){ top=0; bot=1; }
    var band=Math.round(top*10)/10;
    var ck=key+'@'+band;
    if(ck in toneCache) return toneCache[ck];
    try{
      var sh=Math.max(1,Math.round((bot-top)*img.naturalHeight));
      var sy=Math.min(img.naturalHeight-sh,Math.round(top*img.naturalHeight));
      var c=document.createElement('canvas'); c.width=8; c.height=8;
      var g=c.getContext('2d',{willReadFrequently:true});
      g.drawImage(img,0,Math.max(0,sy),img.naturalWidth,sh,0,0,8,8);
      var d=g.getImageData(0,0,8,8).data, t=0, n=0;
      for(var i=0;i<d.length;i+=4){ if(d[i+3]<8) continue;
        t+=0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2]; n++; }
      toneCache[ck] = n ? (t/n)/255 > 0.55 : null;
    }catch(e){ toneCache[ck]=null; }   /* tainted canvas: give up quietly */
    return toneCache[ck];
  }
  function sample(){
    if(ov&&ov.classList.contains('open')) return;
    function probe(x){
      var stack=document.elementsFromPoint(x,70);
      var acc=[0,0,0,0];                  /* premultiplied composite, front to back */
      for(var i=0;i<stack.length;i++){
        var n=stack[i];
        if(tb.contains(n)||(ov&&ov.contains(n))||(n.closest&&n.closest('.il-overlay'))) continue;
        if(n.closest){
          /* Most specific hint wins. data-media-tone marks a light image or
             video sitting inside an otherwise dark section, which is exactly
             the case the section-level hint gets wrong. */
          var mh=n.closest('[data-media-tone]');
          if(mh) return mh.getAttribute('data-media-tone')==='light';
        }
        /* A MEASURED image outranks a section-level declaration.
           data-tone describes a section's design theme, but the bar passes
           over a section at every scroll position, and a media band can be
           dark at its top edge and bright in its middle. Trusting the section
           label over a readable image is how the header ended up painting a
           white scrim with a dark logo over a dark band on optiverse. If the
           image cannot be read (cross-origin, not yet decoded) this falls
           through to the declaration, which is still the right default. */
        /* An image may speak for the band only if it actually fills enough of
           it. A 90x60 client signature covering 2.7% of the bar was flipping
           the whole header to its light-mode logo over a dark hero. */
        if(n.tagName==='IMG'&&coversBand(n)){ var iv0=imgTone(n); if(iv0!==null) return iv0; }
        if(n.closest){
          var toned=n.closest('[data-tone],[data-bg-theme]');
          if(toned) return (toned.getAttribute('data-tone')||toned.getAttribute('data-bg-theme'))==='light';
          if(n.closest(LIGHT_SECTIONS)) return true;
        }
        /* Media used to be assumed dark, which hid the logo whenever a light
           image sat under the bar (a white site screenshot, a pale hero).
           A media element, or any ancestor, can now declare its own tone.
           The blanket assumption stays as the fallback. */
        /* Media used to be assumed dark, which hid the logo under any light
           image. An <img> is now sampled once and cached: same-origin, drawn
           to an 8x8 canvas, averaged. Video and canvas keep the old
           assumption since they cannot be read cheaply or safely. */
        if(n.tagName==='IMG') { var iv=imgTone(n); if(iv!==null) return iv; return false; }
        if(n.tagName==='VIDEO'||n.tagName==='CANVAS') return false;
        /* Alpha decides nothing on its own. The first element with ANY
           background used to win outright, so .bf-opt's
           background:rgba(255,255,255,.03) - 97% transparent over a near
           black page - was read as pure white and turned the whole bar into
           a white scrim with a dark logo. Composite front to back instead:
           each layer contributes only the transparency the layers above it
           left behind, and the tone is judged on the result. */
        var c=rgba(getComputedStyle(n).backgroundColor);
        if(!c||c[3]<=0) continue;
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
