/*
     1. Menu open/close, with a scroll lock, a focus trap and Escape.
     2. Light/dark inversion: samples what sits under the bar and flips the
        brand, the controls and the glass band independently. Tone hints win
        over measurement: data-tone or data-bg-theme, whichever is found
        first walking up from the topmost element at the probe point.
     3. Frosted glass band: frosts only while page text runs beneath the bar,
        so it stays invisible over open imagery and legible over headlines. */
(function () {
  /* -- 0. the markup, mounted here -------------------------------------
     Every page used to carry its own copy of the header and the menu
     overlay: 47 copies of the same markup, drifting apart one attribute at
     a time. There is no build step, so there is no include. This is the
     include: the markup lives here once and is mounted as the first child
     of <body> on every page that loads this script, the way site-footer.js
     mounts the footer. The block is apply-nav/reference/nav-markup.html,
     with the path prefix applied to every href.

     The prefix is read from this page's own assets/ reference, so the one
     file works at the root and one level down (projects/, lab/, sectors/).
     Netlify leaves asset URLs relative and rewrites only page links, so the
     prefix survives the deploy. aria-current is set here with the .html
     suffix off, because Netlify serves about.html as /about.

     A page that still carries the markup is left alone: a second copy would
     duplicate the ids everything below binds to. */
  function mountNav() {
    if (document.getElementById('ilTopbar') || !document.body) return;
    var ref = document.querySelector('script[src*="assets/js/nav.js"], link[href*="assets/css/"], script[src*="assets/js/"]');
    var url = ref ? (ref.getAttribute('src') || ref.getAttribute('href') || '') : '';
    var pre = (url.match(/^((?:\.\.\/)*)assets\//) || ['', ''])[1];
    var here = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '');
    var items = [['Home', 'index.html'], ['About', 'about.html'], ['Sectors', 'sectors.html'],
                 ['Work', 'work.html'], ['Lab', 'lab.html'], ['Collective', 'collective.html'],
                 ['Contact', 'contact.html']];
    var links = items.map(function (l, i) {
      var cur = l[1].replace(/\.html$/, '') === here ? ' aria-current="page"' : '';
      return '    <a href="' + pre + l[1] + '"' + cur + '>' + l[0] + ' <span>0' + (i + 1) + '</span></a>';
    }).join('\n');
    var brand = '<a class="il-brand" href="' + pre + 'index.html" aria-label="ILLUSORR home">' +
                '<span class="il-logo" role="img" aria-label="ILLUSORR"></span></a>';
    var html =
      '<header class="il-topbar" id="ilTopbar">\n' +
      '  ' + brand + '\n' +
      '  <div class="il-right">\n' +
      '    <a class="il-talk" href="' + pre + 'contact.html">Let\'s talk</a>\n' +
      '    <button class="il-burger" id="ilMenuOpen" aria-label="Open menu" aria-expanded="false" aria-controls="ilOverlay"><i></i><i></i></button>\n' +
      '  </div>\n' +
      '</header>\n' +
      '<div class="il-overlay" id="ilOverlay" role="dialog" aria-modal="true" aria-label="Site menu" hidden>\n' +
      '  <div class="il-ohead">\n' +
      '    ' + brand + '\n' +
      '    <button class="il-oclose" id="ilMenuClose">Close \u2715</button>\n' +
      '  </div>\n' +
      '  <nav aria-label="Primary">\n' + links + '\n  </nav>\n' +
      '  <div class="il-ofoot"><span>Abu Dhabi \u00b7 Yas Creative Hub</span><span>hello@illusorr.com</span></div>\n' +
      '</div>';
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    document.body.insertBefore(tpl.content, document.body.firstChild);
  }
  mountNav();

  var tb = document.getElementById('ilTopbar'),
      ov = document.getElementById('ilOverlay');
  if (!tb) return;

  /* Bar height is measured, never assumed. It changes with the safe-area
     inset, the breakpoint and landscape, and both the tone probe and the
     frost band are derived from it. The old code probed a hardcoded y=70,
     which lands inside the bar itself once the inset is reserved, so the
     inversion sampled the header rather than the page. */
  var barH = 70;
  function measureBar() {
    var h = Math.round(tb.getBoundingClientRect().height);
    if (h) barH = h;
    return barH;
  }

  /* ── 1. menu ──────────────────────────────────────────────────────── */
  var mo = document.getElementById('ilMenuOpen'),
      mc = document.getElementById('ilMenuClose'),
      lockY = 0, lastFocus = null;

  function focusables() {
    return ov ? [].slice.call(ov.querySelectorAll('a[href],button:not([disabled])'))
                  .filter(function (n) { return n.offsetParent !== null; }) : [];
  }
  function openMenu() {
    if (!ov || ov.classList.contains('open')) return;
    lastFocus = document.activeElement;
    /* Scroll lock. overflow:hidden alone does not hold on iOS, and pinning
       without recording the offset drops the reader at the top of the page
       when the menu closes. */
    lockY = window.scrollY || window.pageYOffset || 0;
    ov.hidden = false;
    document.documentElement.classList.add('il-locked');
    document.documentElement.style.top = (-lockY) + 'px';
    /* `.open` used to be deferred to requestAnimationFrame, purely to let the
       transition run from the hidden state. rAF is throttled or paused in a
       background tab and in an occluded iframe, so the lock was applied while
       `.open` never arrived: the page sat scroll-locked behind an overlay
       still at opacity 0 and pointer-events none, with the Close button
       unreachable. A forced reflow gives the transition its starting frame
       without handing control to the scheduler, so the lock and the visible
       state cannot desynchronise. */
    void ov.offsetHeight;
    ov.classList.add('open');
    if (mo) mo.setAttribute('aria-expanded', 'true');
    var f = focusables();
    if (f.length) f[0].focus();
  }
  function closeMenu() {
    if (!ov || !ov.classList.contains('open')) return;
    ov.classList.remove('open');
    document.documentElement.classList.remove('il-locked');
    document.documentElement.style.top = '';
    /* main.css sets scroll-behavior:smooth on the shell pages, so a plain
       scrollTo here animated the page from the top back to the reader's
       position every time the menu closed. The restore must be instant:
       it is undoing the lock, not scrolling anywhere. */
    var sb = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, lockY);
    document.documentElement.style.scrollBehavior = sb;
    if (mo) mo.setAttribute('aria-expanded', 'false');
    /* hidden only after the fade, or the transition never runs */
    setTimeout(function () { if (!ov.classList.contains('open')) ov.hidden = true; }, 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    sample();
  }
  if (mo) mo.addEventListener('click', openMenu);
  if (mc) mc.addEventListener('click', closeMenu);
  /* A link inside the overlay must release the lock before it navigates,
     otherwise a same-page hash target lands under a still-fixed <html>. */
  if (ov) ov.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) closeMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (!ov || !ov.classList.contains('open')) return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  /* Mark the current page in the menu. */
  if (ov) {
    var here = location.pathname.split('/').pop() || 'index.html';
    [].forEach.call(ov.querySelectorAll('nav a[href]'), function (a) {
      if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page');
    });
  }

  /* ── 2. tone inversion ────────────────────────────────────────────── */
  var LIGHT_SECTIONS = '.light,.conv-section,.wwa-scroll,.whofor,.whofor-scroll';
  var frostRef = null;

  /* theme-color, kept in step with the tone. The page's authored value is
     read once and used as the dark case, so a case study with its own tint
     (lapillus is #0c0f0f) keeps it. */
  var tcMeta = document.querySelector('meta[name="theme-color"]');
  if (!tcMeta) {
    tcMeta = document.createElement('meta');
    tcMeta.name = 'theme-color';
    tcMeta.content = '#05060a';
    document.head.appendChild(tcMeta);
  }
  var TC_DARK = tcMeta.content || '#05060a', TC_LIGHT = '#f3f1ea', tcNow = TC_DARK;
  /* The authored value, stamped where site-footer.js can read it: that
     script paints the page canvas from theme-color and must not pick up a
     light retune from a page whose top beat is light. */
  tcMeta.setAttribute('data-il-authored', TC_DARK);
  function setThemeColor(isLight) {
    var want = isLight ? TC_LIGHT : TC_DARK;
    if (want === tcNow) return;
    tcNow = want;
    tcMeta.setAttribute('content', want);
  }
  function lum(c) {
    var m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    if (p.length > 3 && p[3] === 0) return null;
    return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
  }
  var lastTone = [false, false, false];
  function probe(x, y) {
    var stack = document.elementsFromPoint(x, y);
    for (var i = 0; i < stack.length; i++) {
      var n = stack[i];
      if (tb.contains(n) || (ov && ov.contains(n))) continue;
      if (n.closest) {
        /* elementsFromPoint returns paint order, topmost first, so the
           nearest declared tone above this point wins. That is the correct
           ordering for "what is visually behind the bar". */
        var toned = n.closest('[data-tone],[data-bg-theme]');
        if (toned) return (toned.getAttribute('data-tone') || toned.getAttribute('data-bg-theme')) === 'light';
        if (n.closest(LIGHT_SECTIONS)) return true;
      }
      if (n.tagName === 'IMG' || n.tagName === 'VIDEO' || n.tagName === 'CANVAS') return false;
      var v = lum(getComputedStyle(n).backgroundColor);
      if (v !== null) return v > 0.55;
    }
    var b = lum(getComputedStyle(document.body).backgroundColor);
    return b !== null && b > 0.55;
  }
  function sample() {
    if (ov && ov.classList.contains('open')) return;
    measureBar();
    /* Probe the bar's own midline, and clamp so a very tall bar in landscape
       still probes inside the viewport. */
    var y = Math.min(Math.max(8, Math.round(barH / 2)), window.innerHeight - 2);
    var w = window.innerWidth;
    var L = probe(Math.min(80, w * 0.12), y),
        C = probe(Math.round(w / 2), y),
        R = probe(Math.max(w - 90, w * 0.88), y);
    lastTone = [L, C, R];
    tb.classList.toggle('brand-on-light', L);
    tb.classList.toggle('on-light', C);
    tb.classList.toggle('ctl-on-light', R);
    /* On a phone the band must be on whenever the page has left the top,
       because everything above the viewport is being painted behind the
       clock. Cheap, and independent of the text test below. */
    tb.classList.toggle('is-scrolled', (window.scrollY || window.pageYOffset || 0) > 4);
    /* Safari tints the status bar from theme-color and picks its glyph
       colour from it. A static dark value leaves white glyphs sitting on a
       cream section, so the clock disappears over every light beat. Keeping
       it in step with the tone under the bar is what the sampler is already
       for. */
    setThemeColor(C);
    /* The frost strip is measured per frame, in the same pass as the tone,
       so it can never drift out of step with the bar's real height. */
    if (frostRef) frostRef.refresh();
  }
  var rafQueued = false;
  function onScroll() {
    if (rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(function () { rafQueued = false; sample(); });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  addEventListener('orientationchange', function () { setTimeout(onScroll, 260); });
  /* iOS changes the viewport height when the URL bar collapses mid-scroll and
     does not reliably fire resize for it. The bar height is remeasured in
     sample(), so one resample is all this needs. */
  if (window.visualViewport) visualViewport.addEventListener('resize', onScroll);
  addEventListener('load', sample);
  sample();

  /* ── 3. frosted band ──────────────────────────────────────────────── */
  var frost = (function () {
    var SEL = 'h1,h2,h3,h4,h5,p,li,figcaption,blockquote,.disp,.lead,.eyebrow,.mono,.sr-name,.sr-desc,.t-meta,.next-k,.conv-eyebrow';
    /* `vis` is a CANDIDATE set, not the answer: every text element currently
       anywhere in the viewport. The observer's only job is to keep that list
       small, so it needs no rootMargin and cannot go stale.

       The previous approach derived a rootMargin band from
       `innerHeight - barH - 6` and clamped it with Math.max(0, ...). When
       build() ran before innerHeight was reliable (deferred script, iframe,
       phone first paint) that expression went negative, the clamp turned the
       band into the FULL viewport, and the bar frosted everywhere for the
       rest of the session. Nothing repaired it, because resize and
       visualViewport never fire on a page that just loads and is scrolled.
       A bad measurement degraded silently into "always frosted".

       The strip test is now done per frame against measured rects, which is
       immune to viewport-height drift. The candidate set is only what is on
       screen, so this is a short loop. */
    var vis = new Set(), io = null, scan = null, pendingSince = 0, count = 0;

    function apply() {
      var n = 0;
      vis.forEach(function (el) {
        /* A node that was removed while intersecting used to stay in the set
           forever, which is its own way of sticking the frost on. */
        if (!el.isConnected) { vis.delete(el); return; }
        var r = el.getBoundingClientRect();
        /* Does it overlap the bar's own strip, [0, barH)? */
        if (r.bottom > 0 && r.top < barH && r.width > 0) n++;
      });
      count = n;
      tb.classList.toggle('is-glass', n > 0);
    }
    function observeAll() {
      if (!io) return;
      var nodes = document.querySelectorAll(SEL);
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (tb.contains(el) || (el.closest && el.closest('.il-overlay,.ill-totop,#dg'))) continue;
        if (!el.textContent || !el.textContent.trim()) continue;
        io.observe(el);
      }
    }
    io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.isIntersecting) vis.add(e.target); else vis.delete(e.target);
      }
      apply();
    }, { threshold: 0 });
    observeAll();
    measureBar();
    apply();

    /* Late content (conveyor cards, injected grids) joins the candidate list.
       The debounce needs a max wait: a page whose DOM mutates continuously
       (a live readout, an animated counter) restarts the timer every frame
       and starves the callback indefinitely. */
    if (document.body) {
      new MutationObserver(function () {
        var now = Date.now();
        if (!pendingSince) pendingSince = now;
        if (now - pendingSince > 800) { pendingSince = 0; clearTimeout(scan); observeAll(); apply(); return; }
        clearTimeout(scan);
        scan = setTimeout(function () { pendingSince = 0; observeAll(); apply(); }, 220);
      }).observe(document.body, { childList: true, subtree: true });
    }
    addEventListener('load', function () { observeAll(); measureBar(); apply(); });
    return { hits: function () { return count; }, refresh: apply, rescan: function () { observeAll(); apply(); } };
  })();
  /* sample() runs once before this point, so it guards on null. Wiring it up
     here lets every later frame refresh the strip in the same pass. */
  frostRef = frost;
  sample();

  /* Exposed for the diagnostics page only. Harmless in production. */
  window.__ilNav = {
    barH: function () { return barH; },
    tone: function () { return lastTone; },
    hits: frost.hits,
    themeColor: function () { return tcNow; },
    strip: function () { return getComputedStyle(tb).getPropertyValue('--il-strip').trim(); },
    open: openMenu, close: closeMenu,
    resample: function () { measureBar(); frost.rescan(); sample(); }
  };
})();
