/* ILLUSORR boot curtain. ONE SOURCE for every page that opens on a computed
   hero (the landing field, the about page). Included as the first thing in
   <body>, synchronously, so the curtain is painted before anything else:

     <script src="assets/js/boot.js?v=..." data-wait="fonts,field"></script>

   It lifts when the FIRST SCREEN is ready, not when the whole page has
   loaded: DOMContentLoaded, the web fonts, and each key named in data-wait,
   reported by the page with ILBoot.ready('key'). field.js reports 'field'
   the moment its first frame has been drawn. The load event is deliberately
   not a condition: the sector photographs, the conveyor rungs and the
   client logos are all below the fold, and holding the curtain for them
   cost 1.2s on a fast laptop and several seconds on a phone, with the hero
   copy hidden behind it the whole time ("the text takes a while to
   appear"). A minimum of 1.1s keeps the mark readable, a 6s ceiling lifts
   the curtain whatever happens, and the progress rule eases on the clock,
   never per frame, so a slow first second cannot stretch it.

   Every other page carries it too (the user's call: the preloader is part
   of the brand), with data-min="700" and its own words, and waits only for
   the DOM and the fonts, so it costs a page that paints at once well under
   a second. Not on the Spaces page, which has its own gate. */
(function () {
  var me = document.currentScript; if (!me) return;
  /* 'fonts' and 'dom' are built in; the other keys are the page's own reports */
  /* data-min: the floor in ms (1100 by default, the field pages' brand moment;
     700 on pages that paint at once). data-words: the phrases under the rule. */
  var MIN = Math.max(0, parseInt(me.getAttribute('data-min'), 10) || 1100);
  var WAIT = (me.getAttribute('data-wait') || '').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s && s !== 'fonts' && s !== 'dom'; });
  var CSS = '#boot{position:fixed;inset:0;z-index:9999;background:#05060a;display:grid;place-items:center;' +
    'transition:opacity .7s cubic-bezier(.4,0,.2,1),visibility .7s;}' +
    '#boot[data-done]{opacity:0;visibility:hidden;pointer-events:none;}' +
    '#boot .bw{display:flex;flex-direction:column;align-items:center;gap:22px;width:min(560px,74vw);}' +
    "#boot .bmark{position:relative;font-family:'Squaresharps',sans-serif;font-size:clamp(26px,4.4vw,46px);" +
    'letter-spacing:.22em;text-indent:.22em;line-height:1;color:rgba(238,241,248,.16);white-space:nowrap;}' +
    /* clip-path, not width: scaleX would squash the letterforms, and width forced layout every frame */
    '#boot .bmark i{position:absolute;left:0;top:0;white-space:nowrap;font-style:normal;' +
    'color:#eef1f8;width:auto;clip-path:inset(0 100% 0 0);will-change:clip-path;' +
    'background:linear-gradient(100deg,#eef1f8 0%,#7fa6ff 30%,#2e6bff 54%,#9ec2ff 76%,#eef1f8 100%);' +
    'background-size:260% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;' +
    'animation:bshine 3.4s linear infinite;}' +
    '@keyframes bshine{to{background-position:260% 0}}' +
    '#boot .brule{position:relative;width:100%;height:1px;background:rgba(238,241,248,.12);overflow:hidden;}' +
    /* transform, not width: a width written every frame forced a layout on each one */
    '#boot .brule i{position:absolute;left:0;top:0;bottom:0;width:100%;background:#4c63ff;' +
    'transform:scaleX(0);transform-origin:left center;will-change:transform;box-shadow:0 0 14px rgba(76,99,255,.85);}' +
    "#boot .bmeta{display:flex;justify-content:space-between;width:100%;font-family:'Outfit',system-ui,sans-serif;" +
    'font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:rgba(238,241,248,.42);}' +
    '#boot .bmeta b{font-weight:400;color:rgba(238,241,248,.72);font-variant-numeric:tabular-nums;}' +
    '#boot .bword{transition:opacity .3s;}' +
    '@media (prefers-reduced-motion:reduce){#boot .bmark i{animation:none}}';
  var HTML = '<div id="boot" role="status" aria-label="Loading"><div class="bw">' +
    '<div class="bmark">ILLUSORR<i id="bmarkFill">ILLUSORR</i></div>' +
    '<div class="brule"><i id="bfill"></i></div>' +
    '<div class="bmeta"><span class="bword" id="bword">waking the field</span><b id="bpct">0</b></div>' +
    '</div></div>';
  me.insertAdjacentHTML('beforebegin', '<style id="boot-css">' + CSS + '</style>');
  me.insertAdjacentHTML('afterend', HTML);

  var boot = document.getElementById('boot'), fill = document.getElementById('bfill'), mark = document.getElementById('bmarkFill'),
      pct = document.getElementById('bpct'), word = document.getElementById('bword');
  var WORDS = (me.getAttribute('data-words') || 'waking the field,loading worlds,rendering light,almost there').split(',').map(function (w) { return w.trim(); }).filter(Boolean);
  var t0 = performance.now(), last = t0, p = 0, done = false, wi = 0;
  var pending = {}; WAIT.forEach(function (k) { pending[k] = true; });
  var dom = false, fonts = false;
  document.documentElement.style.overflow = 'hidden';

  /* progress is a report of readiness, not a clock: DOM 30, fonts 25, the
     rest shared by the keys the page waits for */
  function target() {
    var keys = Object.keys(pending), left = keys.filter(function (k) { return pending[k]; }).length;
    var t = 6 + (dom ? 30 : 0) + (fonts ? 25 : 0) + (keys.length ? Math.round(39 * (keys.length - left) / keys.length) : 39);
    return (dom && fonts && !left) ? 100 : Math.min(t, 96);
  }
  window.ILBoot = {
    ready: function (key) { if (key in pending) pending[key] = false; },
    lifted: false
  };
  addEventListener('DOMContentLoaded', function () { dom = true; });
  if (document.readyState !== 'loading') dom = true;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fonts = true; }); else fonts = true;
  var ceiling = setTimeout(function () { dom = fonts = true; Object.keys(pending).forEach(function (k) { pending[k] = false; }); }, 6000);

  var wt = setInterval(function () {
    if (done) return; wi = Math.min(WORDS.length - 1, wi + 1);
    word.style.opacity = 0; setTimeout(function () { word.textContent = WORDS[wi]; word.style.opacity = 1; }, 300);
  }, Math.max(500, Math.min(1100, MIN)));
  (function tick() {
    var now = performance.now(), dt = Math.min(250, now - last); last = now;
    var el = now - t0;
    var drift = Math.min(92, 8 + el / 26);            /* creeps forward while things land */
    var to = Math.max(target(), drift);
    /* eased on elapsed time, so it converges in the same wall-clock second at 60fps or at 5 */
    p += (to - p) * (1 - Math.pow(to === 100 ? 0.86 : 0.92, dt / 16.7));
    if (p > 99.4) p = 100;
    fill.style.transform = 'scaleX(' + (p / 100) + ')'; mark.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
    pct.textContent = (p < 100 ? Math.floor(p) : 100);
    if (p >= 100 && el > MIN) { finish(); return; }
    requestAnimationFrame(tick);
  })();
  function finish() {
    if (done) return; done = true; clearInterval(wt); clearTimeout(ceiling);
    word.textContent = 'enter';
    setTimeout(function () {
      boot.setAttribute('data-done', '');
      document.documentElement.style.overflow = '';
      window.ILBoot.lifted = true;
      document.dispatchEvent(new CustomEvent('il:boot-lifted'));
      setTimeout(function () { boot.remove(); }, 800);
    }, 260);
  }
})();
