/* ─────────────────────────────────────────────────────────────────────
   ILLUSORR — mobile behaviour.

   ADDITIVE ONLY. Everything is behind one capability check, so on a
   desktop this file does nothing at all beyond a single matchMedia call.
   Remove the <script> and the page is exactly as it was.

   It does three things on touch devices:
     1. stops autoplay video downloading; poster + tap to play
     2. stops three.js downloading; still frame + tap to load the scene
     3. kills pointer-follower loops that can never be seen

   Nothing here changes desktop, and nothing here changes markup that
   the page's own scripts depend on — deferred elements keep their id,
   classes and attributes, they are only moved inside a wrapper.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  /* Videos are authored with data-src so the browser's preload scanner
     cannot start an 18MB download before this file runs. On a pointer
     device they hydrate immediately; on touch the defer logic below owns
     them. This runs BEFORE the touch gate on purpose. */
  (function hydrateVideos() {
    var touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (touch) return;

    var hydrate = function (v) {
      if (!v || v.getAttribute('src')) return;
      var src = v.getAttribute('data-src');
      if (!src) return;
      v.setAttribute('src', src);
      if (v.hasAttribute('data-autoplay')) {
        /* restore the real attributes the page's own scripts and the
           browser expect, so desktop behaves exactly as it did before the
           data-src swap that keeps phones from downloading these files */
        v.setAttribute('autoplay', '');
        v.muted = true;
        v.setAttribute('playsinline', '');
        var go = v.play();
        if (go && go.catch) go.catch(function () {});
      }
    };
    var sweep = function () { document.querySelectorAll('video[data-src]').forEach(hydrate); };

    /* hydrate each <video> the moment it is parsed — waiting for
       DOMContentLoaded meant any inline script that set up a hero film at
       parse time found an empty element and fell back to its poster */
    sweep();
    if (window.MutationObserver) {
      var mo = new MutationObserver(sweep);
      mo.observe(document.documentElement, { childList: true, subtree: true });
      document.addEventListener('DOMContentLoaded', function () { sweep(); mo.disconnect(); });
    } else if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', sweep);
    }
  })();

  var FORCED = /[?&]mobile=1\b/.test(location.search);
  /* The flag has to survive a click. Every in-page link (the menu bar
     included) navigates to a bare URL, so without this the next page
     renders its desktop layout inside the preview frame and the two
     disagree. Persisted per tab, and re-stamped onto outgoing links. */
  try {
    if (FORCED) sessionStorage.setItem('il-force-mobile', '1');
    else if (/[?&]mobile=0\b/.test(location.search)) sessionStorage.removeItem('il-force-mobile');
    /* Only honoured inside a frame AND at a phone/tablet viewport. The
       preview pane is an iframe too, so without the width test a flag set
       while reviewing the mobile build kept forcing the mobile layer onto
       the full-width desktop view of the same page — deferred hero films
       showing their poster, gated 3D, "media not working". */
    else if (window.self !== window.top &&
             window.innerWidth <= 1024 &&
             sessionStorage.getItem('il-force-mobile') === '1') FORCED = true;
  } catch (e) {}

  var TOUCH = window.matchMedia('(hover: none), (pointer: coarse)').matches
    /* ?mobile=1 forces this layer on so the mobile build can be reviewed
       from a desktop browser. Nothing else reads it. */
    || FORCED;
  if (!TOUCH) return;

  if (FORCED) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var href = a.getAttribute('href');
      if (!href || /^(#|mailto:|tel:|javascript:)/.test(href)) return;
      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (url.searchParams.get('mobile') === '1') return;
      url.searchParams.set('mobile', '1');
      a.setAttribute('href', url.pathname + url.search + url.hash);
    }, true);
  }

  document.documentElement.setAttribute('data-touch', '');

  /* ── helpers ─────────────────────────────────────────────────────── */
  function defer(el, label, note, kind, onActivate) {
    if (!el || el.closest('.m-defer')) return;
    var box = document.createElement('div');
    box.className = 'm-defer' + (kind ? ' is-' + kind : '');
    var poster = el.getAttribute('poster') || el.getAttribute('data-poster');
    if (poster) box.style.backgroundImage = 'url("' + poster + '")';

    /* Geometry: the placeholder has to occupy exactly what the element did,
       or the frame around it collapses. Two cases.

       Absolutely positioned media (e.g. .filters video {position:absolute;
       inset:0}) contributes no height to its parent — the parent's size
       comes from an aspect-ratio or fixed height. Copy that positioning so
       the box fills the same slot and needs no height of its own.

       Everything else flows, so pin a min-height from the measured box and
       KEEP it after activation: the video is display:none until then, so
       clearing it would drop the frame to the stylesheet's fallback. */
    var absolute = getComputedStyle(el).position === 'absolute';
    if (absolute) {
      box.style.position = 'absolute';
      box.style.inset = '0';
      box.style.minHeight = '0';
    } else {
      var r = el.getBoundingClientRect();
      if (r.height > 40) box.style.minHeight = Math.min(r.height, 460) + 'px';
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'm-defer-btn';
    btn.textContent = label;

    box.appendChild(btn);
    if (note) {
      var n = document.createElement('span');
      n.className = 'm-defer-note';
      n.textContent = note;
      box.appendChild(n);
    }

    el.parentNode.insertBefore(box, el);
    box.appendChild(el);
    el.style.display = 'none';

    btn.addEventListener('click', function () {
      box.classList.add('is-live');
      box.style.backgroundImage = '';
      btn.remove();
      var nn = box.querySelector('.m-defer-note');
      if (nn) nn.remove();
      el.style.display = '';
      try { onActivate(el); } catch (e) {}
    }, { once: true });
  }

  /* ── 1. video: never autoplay, never preload ─────────────────────── */
  function handleVideo() {
    var vids = document.querySelectorAll('video');
    Array.prototype.forEach.call(vids, function (v) {
      /* Opt-out: small looping clips that ARE the interface (a selector's
         preview, a swatch) break if you put a Play button on them. Marked
         data-m-autoplay in the page, they keep autoplaying on touch. */
      if (v.hasAttribute('data-m-autoplay')) {
        v.setAttribute('autoplay', '');
        v.muted = true;
        v.play().catch(function () {});
        return;
      }
      /* strip the download triggers before the browser acts on them */
      v.removeAttribute('autoplay');
      v.autoplay = false;
      v.preload = 'none';

      var live = v.getAttribute('src');
      var lazy = v.getAttribute('data-src');

      /* No source of either kind means the page fills it in on demand
         (metagenus' add-on stage does this, and shows a still alongside).
         Leave it alone: wrapping it would put a Play button on an empty
         element, and the page already gates it behind a tap. */
      if (!live && !lazy) return;

      /* a decorative loop with no controls and no poster is background
         texture — leave it hidden rather than demanding a tap for it */
      if (!v.controls && !v.getAttribute('poster') && !lazy && v.closest('[class*="bg"], [class*="ambient"]')) {
        v.pause();
        return;
      }

      /* An element that already carries src has a request open the moment
         it parses; preload='none' arrives too late. Detach the source and
         call load() to abort it. */
      if (live) {
        try { v.pause(); } catch (e) {}
        v.setAttribute('data-m-src', live);
        v.removeAttribute('src');
        v.removeAttribute('data-src');
        try { v.load(); } catch (e) {}
      } else {
        /* Hide the lazy handle from the page's own observer, or it fetches
           the clip behind the placeholder. Restored on activation. */
        v.setAttribute('data-m-src', lazy);
        v.removeAttribute('data-src');
      }

      /* Label the placeholder — but only when the frame does not already
         label itself. A figcaption plus an identical note renders the same
         words twice, on top of each other. */
      var fig = v.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      var label = (cap && cap.textContent.trim()) ? '' : (v.getAttribute('aria-label') || '');

      defer(v, 'Play', label, 'video', function (el) {
        var src = el.getAttribute('data-m-src');
        if (src && !el.getAttribute('src')) el.setAttribute('src', src);
        el.setAttribute('controls', '');
        el.play().catch(function () {});
      });
    });
  }

  /* ── 2. three.js: do not fetch the library at all ────────────────── */
  function handleThree() {
    var tags = Array.prototype.filter.call(
      document.querySelectorAll('script[src]'),
      function (s) { return /three|GLTFLoader|DRACOLoader|FBXLoader|RoomEnvironment|fflate/i.test(s.src); }
    );
    if (!tags.length) return [];
    return tags.map(function (s) {
      var url = s.src;
      s.type = 'text/m-deferred';   /* stops execution; src is already inert */
      s.removeAttribute('src');
      return url;
    });
  }

  function loadSequential(urls, done) {
    var i = 0;
    (function next() {
      if (i >= urls.length) return done();
      var s = document.createElement('script');
      s.src = urls[i++];
      s.onload = next;
      s.onerror = next;
      document.head.appendChild(s);
    })();
  }

  /* ── 3. pointer followers ────────────────────────────────────────── */
  function killFollowers() {
    ['.k-cursor', '.cursor', '.cursor-dot', '.cur', '.il-cursor'].forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { el.remove(); });
    });
  }

  /* ── run ─────────────────────────────────────────────────────────── */
  var threeUrls = handleThree();   /* must run before the parser reaches them */

  function onReady() {
    handleVideo();
    killFollowers();

    /* 3D scenes: offer them behind a tap.

       Two routes. A page that owns its own gate (a <template> of library
       tags plus a start function, as metagenus does) exposes MG_START_3D
       and we simply call it — the page decides load order, which is safer
       than guessing. Otherwise we fall back to neutralised script tags we
       found ourselves. */
    var pageGate = typeof window.MG_START_3D === 'function' ? window.MG_START_3D : null;

    if (pageGate || threeUrls.length) {
      var host = document.querySelector('canvas[data-3d], .scene-3d canvas, #anamorphCanvas, #scene canvas, canvas#scene') ||
                 document.querySelector('canvas');
      if (host) {
        defer(host, 'Load 3D scene', 'Off by default on mobile', '3d', function () {
          /* tells the stylesheet the scene is genuinely on its way, so the
             page's own loader and viewer hints may show again */
          document.documentElement.setAttribute('data-3d-live', '');
          if (pageGate) { pageGate(); return; }
          loadSequential(threeUrls, function () {
            document.dispatchEvent(new CustomEvent('m:three-ready'));
            if (typeof window.initThree === 'function') window.initThree();
          });
        });
      }
    }
    /* ── background field: quiet the DARK passages only ───────────────
       The field paints the light sections' white itself, so any global
       fade (canvas opacity, a scrim) greys them out. data-bg-dim is the
       field's own per-section knob: it mixes the contour lines back
       toward that section's own ground, leaving the ground colour alone.
       Applied only where the theme is dark and the page has not already
       set a value of its own. */
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-bg-theme]'),
      function (el) {
        if (el.hasAttribute('data-bg-dim')) return;
        var light = el.getAttribute('data-bg-theme') === 'light';
        /* light beats: 0.7 pulls the contours 30% back toward the paper,
           which is where the type sits. dark beats go further. */
        el.setAttribute('data-bg-dim',
          light ? '0.7' : (innerWidth <= 640 ? '0.42' : '0.55'));
      }
    );
    /* the "what we do" band runs its contours straight under four stacked
       text blocks, so it needs 40% more quiet than the rest. There is one
       band per slide — tagging only the first let the field snap back to
       full strength partway down the section. */
    Array.prototype.forEach.call(document.querySelectorAll('.rw-band'), function (b) {
      b.setAttribute('data-bg-dim', innerWidth <= 640 ? '0.25' : '0.33');
    });
    /* ── carousels: preload the off-screen slides ─────────────────────
       Slides are laid out in a horizontally translated track, so every
       one except the first sits outside the visible area and its
       loading="lazy" image never starts downloading. Swiping then lands
       on a blank frame. Once the carousel itself is on screen, all of
       its slides are about to be seen: load them. */
    var carousels = document.querySelectorAll('.hero-carousel, .film-carousel');
    if (carousels.length && window.IntersectionObserver) {
      var carObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
            img.loading = 'eager';
          });
          carObs.unobserve(en.target);
        });
      }, { rootMargin: '200px 0px' });
      Array.prototype.forEach.call(carousels, function (c) { carObs.observe(c); });
    }

    /* live desktop prototypes → the page's own phone screenshots ─────
       Two pages put a live desktop build in an iframe scaled to 0.4. On a
       phone that is a 125px-wide website inside a black frame, and the
       iframe is a separate document the mobile layer cannot reach. Both
       pages already ship real phone screenshots of the same product, so
       the carousel shows those instead: right subject, right scale, no
       nested viewport. data-m-shots holds the list. */
    var swapPrototypeSlides = function () {
      Array.prototype.forEach.call(document.querySelectorAll('.hero-carousel[data-m-shots]:not([data-m-swapped])'), function (car) {
      var shots = (car.getAttribute('data-m-shots') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      var track = car.querySelector('.hc-track');
      if (!shots.length || !track) return;
      var embedSlide = car.querySelector('.hc-slide .hc-embed');
      if (!embedSlide) return;
      /* the embed slide becomes the first screenshot; the rest are added
         after it, so the counter and bars pick them up on their own */
      var host = embedSlide.parentNode;
      embedSlide.remove();
      shots.forEach(function (src, i) {
        var slide = i === 0 ? host : host.cloneNode(false);
        slide.className = 'hc-slide' + (i === 0 ? ' is-active' : '');
        slide.setAttribute('data-look', 'Screen 0' + (i + 1));
        slide.innerHTML = '';
        var im = document.createElement('img');
        im.src = src;
        im.alt = '';
        im.loading = i === 0 ? 'eager' : 'lazy';
        im.decoding = 'async';
        im.style.cssText = 'width:100%;height:100%;object-fit:contain;object-position:center;display:block;background:#0b0b0d';
        slide.appendChild(im);
        if (i > 0) track.insertBefore(slide, host.nextSibling);
      });
      car.setAttribute('data-m-swapped', '');
      });
    };
    /* these two pages render their body through a client-side runtime, so
       the carousel may not exist yet when this file runs — poll briefly
       rather than test for it once */
    swapPrototypeSlides();
    var tries = 0;
    var iv = setInterval(function () {
      swapPrototypeSlides();
      if (++tries > 24) clearInterval(iv);
    }, 250);

    /* keyboard-only hints ─────────────────────────────────────────────
       A phone has no WASD, so a hint promising it is a dead end. Say what
       the visitor actually gets, and where the full thing lives. */
    Array.prototype.forEach.call(document.querySelectorAll('.ph-tip, .play-hint, .stage-note, [class*="hint"]'), function (el) {
      if (el.children.length) return;
      var t = el.textContent || '';
      if (!/wasd|shift to run|space to jump/i.test(t)) return;
      el.textContent = 'Drag to look around · the full walkthrough is on desktop';
    });

    /* hints that name a desktop gesture ─────────────────────────────
       "Shift + Wheel" and friends describe an interaction a phone does
       not have, on viewers that are drag-and-pinch here. */
    Array.prototype.forEach.call(document.querySelectorAll('.ms-hint, [class*="hint"]'), function (el) {
      if (!el.children.length && /wheel|scroll wheel|shift \+/i.test(el.textContent || '')) {
        el.textContent = 'Drag to orbit · Pinch to zoom';
      }
    });

    /* live-site frames → a phone viewport ─────────────────────────────
       The website case studies embed the client's live site in a browser
       frame sized 1440×900 and scale it to fit. At 369px that is a 23%
       zoom of a desktop layout: unreadable, and mostly empty white. The
       sites are responsive, so the frame simply becomes a phone viewport
       (430×932) — the live site then renders its OWN mobile layout at
       nearly 1:1. The page's own fit() re-runs on resize. */
    var deskFrames = document.querySelectorAll('[data-frame][data-w]');
    if (deskFrames.length) {
      var changed = false;
      Array.prototype.forEach.call(deskFrames, function (v) {
        if (+v.dataset.w < 1000) return;           // already a phone frame
        v.dataset.w = '430';
        v.dataset.h = '932';
        var f = v.querySelector('iframe');
        if (f) { f.style.width = '430px'; f.style.height = '932px'; }
        changed = true;
      });

      /* The mobile stylesheet pins every [data-frame] to one card ratio
         (3/4) so the section reads as a series. That ratio rarely matches
         the frame's real w/h, so fitToBox() could only scale to the
         tighter axis and left black bars on the other — the frame never
         actually filled its card. The stylesheet rule is !important, so
         only an equally-important inline rule can beat it: setting the
         frame's own ratio to its real w/h here removes the mismatch at
         the source, for phone-authored frames too. */
      Array.prototype.forEach.call(deskFrames, function (v) {
        v.style.setProperty('aspect-ratio', v.dataset.w + ' / ' + v.dataset.h, 'important');
      });

      /* The page's own fit() scales to WIDTH, which means a 932px-tall phone
         page needs 797px of screen — so the window was capped and the site
         cropped. Fit to the card's box instead: the whole page is visible,
         centred, at whatever scale the card allows. Runs after theirs. */
      var fitToBox = function () {
        Array.prototype.forEach.call(document.querySelectorAll('[data-frame][data-w]'), function (v) {
          var f = v.querySelector('iframe');
          if (!f) return;
          var w = +v.dataset.w || 430, h = +v.dataset.h || 932;
          var box = v.getBoundingClientRect();
          if (!box.width || !box.height) return;
          var s = Math.min(box.width / w, box.height / h);
          f.style.width = w + 'px';
          f.style.height = h + 'px';
          f.style.transformOrigin = 'top left';
          f.style.transform = 'translateX(' + ((box.width - w * s) / 2) + 'px) scale(' + s + ')';
        });
      };
      var scheduleFit = function () {
        /* requestAnimationFrame does not fire while the document is
           hidden (a background tab, or this preview surface's own load
           state), which silently left every frame unfit — not a rare
           edge case, the common one. setTimeout always runs. */
        setTimeout(fitToBox, 0);
      };
      scheduleFit();
      addEventListener('resize', scheduleFit, { passive: true });
      /* the frames mount their iframe lazily on approach */
      if (window.MutationObserver) {
        Array.prototype.forEach.call(deskFrames, function (v) {
          new MutationObserver(scheduleFit).observe(v, { attributes: true, subtree: true, attributeFilter: ['src', 'style'] });
        });
      }
      /* On a phone each of these frames is an entire third-party website —
         five of them mount as you scroll, each pulling its own scripts,
         fonts and images over cellular. They stay dormant behind their own
         hint bar until tapped; the hint already reads "click to use the
         live site", so the affordance is unchanged. */
      Array.prototype.forEach.call(deskFrames, function (v) {
        var f = v.querySelector('iframe[data-src]');
        if (!f || f.getAttribute('src')) return;
        f.setAttribute('data-src-held', f.getAttribute('data-src'));
        f.removeAttribute('data-src');
        var hint = v.querySelector('.stage-hint');
        var arm = function () {
          if (f.getAttribute('src')) return;
          var url = f.getAttribute('data-src-held');
          f.setAttribute('data-src', url);
          f.setAttribute('src', url);
          v.classList.remove('is-locked');
          scheduleFit();
        };
        (hint || v).addEventListener('click', arm, { once: true });
      });

      if (changed) scheduleFit();
    }

    /* display type never breaks mid-word ──────────────────────────────
       "RiyadhVerse" at 30px is 285px wide in a 267px column, so the
       browser hyphen-free-breaks it and leaves a lone "e" on line two.
       Shrink the line until its longest word fits: type gets smaller,
       words stay whole. */
    Array.prototype.forEach.call(
      document.querySelectorAll('.hero-title, .module-title, .ptitle, .next-inner h3, .ch-h, .hc-title'),
      function (el) {
        var box = el.getBoundingClientRect().width;
        if (!box) return;
        /* only the display line itself — a nested tagline (.ln-ital, em)
           renders in a smaller face, and measuring its words in THIS
           font would shrink the title far below what it needs */
        var own = '';
        Array.prototype.forEach.call(el.childNodes, function (n) {
          if (n.nodeType === 3) { own += ' ' + n.textContent; return; }
          if (n.nodeType !== 1) return;
          if (n.matches('.ln-ital, em, small, sub, sup')) return;
          var inner = '';
          Array.prototype.forEach.call(n.childNodes, function (c) {
            if (c.nodeType === 3) inner += ' ' + c.textContent;
          });
          own += ' ' + inner;
        });
        var words = own.trim().split(/\s+/).filter(Boolean);
        if (!words.length) return;
        var probe = document.createElement('span');
        var cs = getComputedStyle(el);
        probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;' +
          'font-family:' + cs.fontFamily + ';font-weight:' + cs.fontWeight +
          ';letter-spacing:' + cs.letterSpacing + ';text-transform:' + cs.textTransform;
        document.body.appendChild(probe);
        var size = parseFloat(cs.fontSize), floor = Math.max(16, size * 0.62), guard = 0;
        var widest = function () {
          var w = 0;
          probe.style.fontSize = size + 'px';
          for (var i = 0; i < words.length; i++) { probe.textContent = words[i];
            w = Math.max(w, probe.getBoundingClientRect().width); }
          return w;
        };
        while (widest() > box && size > floor && guard++ < 40) size -= 1;
        probe.remove();
        if (size < parseFloat(cs.fontSize)) {
          el.style.setProperty('font-size', size + 'px', 'important');
          el.style.setProperty('overflow-wrap', 'normal', 'important');
        }
      }
    );

    /* YouTube embeds carry no YouTube ─────────────────────────────────
       The facades mount a youtube.com/embed URL; unless every chrome
       parameter is set, the player shows its logo, title bar, share and
       end-screen grid. Rewrite any embed URL as it mounts so the video
       plays as plain footage inside the page's own frame. */
    (function stripYouTubeChrome() {
      /* De-brand, but never take away playback control: the host, modest
         branding, no related grid and no annotations are what make it stop
         LOOKING like YouTube. controls/fs/keyboard stay native, or a video
         that autoplays on tap could not be paused, scrubbed or fullscreened. */
      var PARAMS = { modestbranding: '1', rel: '0', playsinline: '1',
                     iv_load_policy: '3', color: 'white' };
      var clean = function (url) {
        try {
          var u = new URL(url, location.href);
          if (!/youtube(-nocookie)?\.com$/.test(u.hostname)) return url;
          Object.keys(PARAMS).forEach(function (k) { u.searchParams.set(k, PARAMS[k]); });
          /* nocookie also drops the tracking cookie banner */
          u.hostname = 'www.youtube-nocookie.com';
          return u.toString();
        } catch (e) { return url; }
      };
      var sweep = function () {
        document.querySelectorAll('iframe[src*="youtube"], iframe[data-src*="youtube"]').forEach(function (f) {
          ['src', 'data-src'].forEach(function (attr) {
            var v = f.getAttribute(attr);
            if (!v || !/youtube/.test(v)) return;
            var next = clean(v);
            if (next !== v) f.setAttribute(attr, next);
          });
        });
      };
      sweep();
      if (window.MutationObserver) {
        new MutationObserver(sweep).observe(document.documentElement, { childList: true, subtree: true });
      }
    })();

    if (window.__noiseField && window.__noiseField.measure) {
      requestAnimationFrame(window.__noiseField.measure);

      /* The field paints the light/dark sections itself, from geometry it
         measures once. Sections here use content-visibility, so their
         heights change as they render in and out while you scroll — the
         cached boundary then sits at the wrong scroll offset and the theme
         edge tears across the screen. Re-measure whenever the document's
         height actually changes, throttled to a frame. */
      if (window.ResizeObserver) {
        var lastH = 0, queued = false;
        new ResizeObserver(function () {
          var h = document.documentElement.scrollHeight;
          if (h === lastH || queued) return;
          lastH = h; queued = true;
          requestAnimationFrame(function () {
            queued = false;
            window.__noiseField.measure();
          });
        }).observe(document.body);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();
