/* ILLUSORR — ambience toggle, injected on the pages that want a bed of
   room tone. Self-contained: markup, styles and behaviour all live here,
   and the asset path is derived from an existing assets/ reference so the
   same file works at the root and one level down.

   Quiet by default in the sense that nothing is fetched until it plays
   (preload="none") and nothing starts without a real gesture — the
   browser's autoplay policy is respected, not worked around. The
   visitor's choice persists per page key. */
(function () {
  if (document.getElementById('ilAmb')) return;

  /* path prefix: match however this page already references assets/ */
  var ref = document.querySelector('link[href*="assets/"], script[src*="assets/"]');
  var attr = ref ? (ref.getAttribute('href') || ref.getAttribute('src')) : 'assets/';
  var PREFIX = attr.slice(0, attr.indexOf('assets/'));
  /* the ogg is the same recording at 0.86MB against the mp3's 3.78MB —
     it is what Spaces itself plays. Safari gets the mp3. */
  var probe = document.createElement('audio');
  var TRACK = PREFIX + 'assets/audio/at-first.' +
    (probe.canPlayType && probe.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3');
  var KEY = 'ambience.' + (location.pathname.split('/').pop() || 'index').replace('.html', '');
  var TARGET = 0.34;

  var css = document.createElement('style');
  css.id = 'il-ambience-css';
  css.textContent =
    '.il-amb{position:fixed;right:18px;bottom:18px;z-index:940;display:flex;align-items:center;gap:9px;' +
    'padding:10px 14px;min-height:44px;cursor:pointer;background:rgba(10,12,20,.62);' +
    'border:1px solid rgba(238,241,251,.22);border-radius:999px;backdrop-filter:blur(8px);' +
    '-webkit-backdrop-filter:blur(8px);font-family:\'Outfit\',system-ui,sans-serif;font-size:10.5px;' +
    'letter-spacing:.18em;text-transform:uppercase;color:rgba(238,241,251,.62);' +
    'transition:border-color .25s,color .25s}' +
    '.il-amb:hover{border-color:rgba(142,162,255,.75);color:#eef1f8}' +
    '.il-amb .eq{display:flex;align-items:flex-end;gap:2px;height:11px}' +
    '.il-amb .eq i{width:2px;height:3px;background:currentColor;display:block;transition:height .25s}' +
    '.il-amb.is-on{border-color:rgba(142,162,255,.85);color:#eef1f8}' +
    '.il-amb.is-on .eq i{animation:ilEq .9s ease-in-out infinite}' +
    '.il-amb.is-on .eq i:nth-child(2){animation-delay:.15s}' +
    '.il-amb.is-on .eq i:nth-child(3){animation-delay:.3s}' +
    '@keyframes ilEq{0%,100%{height:3px}50%{height:11px}}' +
    /* the back-to-top button shares this corner */
    '.ill-totop{right:18px !important;bottom:76px !important}' +
    '@media (max-width:640px){.il-amb{right:12px;bottom:74px;padding:9px 12px}' +
    '.ill-totop{right:12px !important;bottom:130px !important}}' +
    '@media (prefers-reduced-motion:reduce){.il-amb.is-on .eq i{animation:none;height:7px}}';
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.className = 'il-amb';
  btn.id = 'ilAmb';
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', 'Ambience');
  btn.innerHTML = '<span class="eq"><i></i><i></i><i></i></span><span id="ilAmbLabel">Ambience</span>';
  document.body.appendChild(btn);
  var label = btn.querySelector('#ilAmbLabel');

  var el = new Audio(TRACK);
  el.loop = true;
  el.preload = 'none';
  el.volume = 0;
  var on = localStorage.getItem(KEY) !== 'off';
  var fading = null;

  function paint() {
    btn.classList.toggle('is-on', on && !el.paused);
    btn.setAttribute('aria-pressed', String(on));
    label.textContent = on ? (el.paused ? 'Ambience' : 'Ambience on') : 'Ambience off';
  }
  function fade(to, ms) {
    clearInterval(fading);
    var from = el.volume, t0 = performance.now();
    fading = setInterval(function () {
      var k = Math.min(1, (performance.now() - t0) / ms);
      el.volume = from + (to - from) * k;
      if (k === 1) { clearInterval(fading); if (to === 0) el.pause(); paint(); }
    }, 40);
  }
  function start() {
    var go = el.play();
    if (go && go.catch) go.catch(function () {});
    fade(TARGET, 1200);
    paint();
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    on = !on;
    localStorage.setItem(KEY, on ? 'on' : 'off');
    if (on) start(); else fade(0, 500);
  });

  if (on) {
    var arm = function () { start(); document.removeEventListener('pointerdown', arm); };
    document.addEventListener('pointerdown', arm, { once: true });
  }
  paint();
})();
