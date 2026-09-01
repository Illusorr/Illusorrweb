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
  function sample(){
    if(ov&&ov.classList.contains('open')) return;
    function probe(x){
      var stack=document.elementsFromPoint(x,70);
      for(var i=0;i<stack.length;i++){
        var n=stack[i];
        if(tb.contains(n)||(ov&&ov.contains(n))||(n.closest&&n.closest('.il-overlay'))) continue;
        if(n.closest){
          var toned=n.closest('[data-tone],[data-bg-theme]');
          if(toned) return (toned.getAttribute('data-tone')||toned.getAttribute('data-bg-theme'))==='light';
          if(n.closest(LIGHT_SECTIONS)) return true;
        }
        /* an <img>/<video>/<canvas> under this point means dark imagery */
        if(n.tagName==='IMG'||n.tagName==='VIDEO'||n.tagName==='CANVAS') return false;
        var v=lum(getComputedStyle(n).backgroundColor);
        if(v!==null) return v>0.55;
      }
      var b=lum(getComputedStyle(document.body).backgroundColor);
      return b!==null&&b>0.55;
    }
    tb.classList.toggle('brand-on-light',probe(80));
    tb.classList.toggle('ctl-on-light',probe(window.innerWidth-90));
    tb.classList.toggle('on-light',probe(window.innerWidth/2));
  }
  window.addEventListener('scroll',function(){requestAnimationFrame(sample)},{passive:true});
  window.addEventListener('resize',sample);
  window.addEventListener('load',sample);
  sample();

  /* ── glass band ────────────────────────────────────────────────── */
  (function(){
    var SEL='h1,h2,h3,h4,h5,p,li,figcaption,blockquote,.disp,.lead,.eyebrow,.mono,.sr-name,.sr-desc,.t-meta,.next-k,.conv-eyebrow';
    var hits=new Set(), io=null, band=0, scan=null;
    function observeAll(){
      var nodes=document.querySelectorAll(SEL);
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        if(tb.contains(n)||(n.closest&&n.closest('.il-overlay,.ill-totop'))) continue;
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
          if(e.isIntersecting&&e.target.textContent&&e.target.textContent.trim()) hits.add(e.target);
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
