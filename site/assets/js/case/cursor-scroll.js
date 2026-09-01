  /* ───────────────────────────────────────────────────────────────────
     KOTON cursor, smooth-lerped pointer follower. Reads pointer
     coords, animates the disc toward them with a fixed friction
     factor (~0.18 per frame). Toggles .is-link when over a clickable
     element and .is-down on press.
     ─────────────────────────────────────────────────────────────────── */
  (function() {
    if (window.matchMedia('(hover: none)').matches) return;
    const cursor = document.getElementById('kCursor');
    if (!cursor) return;

    const pt = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const lp = { x: pt.x, y: pt.y };
    let raf = null;
    let visible = false;

    function tick() {
      lp.x += (pt.x - lp.x) * 0.22;
      lp.y += (pt.y - lp.y) * 0.22;
      cursor.style.transform = `translate3d(${lp.x}px, ${lp.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('pointermove', (e) => {
      pt.x = e.clientX; pt.y = e.clientY;
      if (!visible) { cursor.classList.add('is-visible'); visible = true; }
    }, { passive: true });

    // Fade out when the pointer leaves the document area
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));

    /* Tone detection, sample the section under the cursor and flip
       the disc colours so it always contrasts against the bg. Runs
       once per pointermove, not per frame, to keep it cheap. */
    let lastTone = null;
    function updateTone() {
      const el = document.elementFromPoint(pt.x, pt.y);
      if (!el) return;
      const sec = el.closest('[data-tone]');
      const tone = sec ? sec.getAttribute('data-tone') : 'light';
      if (tone === lastTone) return;
      lastTone = tone;
      cursor.classList.toggle('on-dark', tone === 'dark');
    }
    window.addEventListener('pointermove', updateTone, { passive: true });

    // Press feedback
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup',   () => cursor.classList.remove('is-down'));

    // Detect interactive elements under the cursor and inflate the disc
    const linkSel = 'a, button, [role="button"], .next, label, .topnav .logo-lockup';
    document.querySelectorAll(linkSel).forEach(el => {
      el.addEventListener('pointerenter', () => {
        cursor.classList.add('is-link');
        // Pick the verb that best fits the element
        const label = cursor.querySelector('.label-link');
        if (label) {
          let verb = 'Click';
          if (el.matches('.next') || el.matches('.next-cta')) verb = 'View Case';
          else if (el.closest('.topnav')) verb = 'Open';
          else if (el.matches('[href^="http"]')) verb = 'Visit';
          label.setAttribute('data-verb', verb);
        }
      });
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-link'));
    });

    /* Text-hover detection, over any heading or paragraph block,
       flip .is-text so the emblem starts its slow rotation. */
    const textSel = 'p, h1, h2, h3, h4, blockquote, .lede, .hero-lede, .description, .meta-v, .credit-row .who, .quote, .module-title, .hero-title';
    document.querySelectorAll(textSel).forEach(el => {
      // Skip elements that are themselves inside links/buttons (the
      // link state takes priority and hides the emblem anyway).
      if (el.closest('a, button, [role="button"], .next')) return;
      el.addEventListener('pointerenter', () => cursor.classList.add('is-text'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('is-text'));
    });

    /* Topnav + rail tone, synced to the section currently behind the
       fixed chrome (topnav: section at top of viewport; rail: section
       at viewport middle). Replaces the old mix-blend-mode trick that
       was clashing with the cursor's compositing. */
    const topnav = document.querySelector('.topnav');
    const rail   = document.querySelector('.rail');
    const sections = Array.from(document.querySelectorAll('section[data-tone]'));
    function sectionAt(y) {
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) return s;
      }
      return null;
    }
    function updateChromeTone() {
      const topSec = sectionAt(40);
      const midSec = sectionAt(window.innerHeight / 2);
      if (topnav) topnav.classList.toggle('on-dark', !!topSec && topSec.dataset.tone === 'dark');
      if (rail)   rail.classList.toggle('on-dark', !!midSec && midSec.dataset.tone === 'dark');
    }
    updateChromeTone();
    window.addEventListener('scroll', () => requestAnimationFrame(updateChromeTone), { passive: true });
    window.addEventListener('resize', updateChromeTone);
  })();

  /* ───────────────────────────────────────────────────────────────────
     Side-rail progress indicator. Each section carries data-rail="N"
     pointing at one of the eight dots; the closest-to-viewport-center
     section wins. Pure read of bounding rects, no observer overhead.
     ─────────────────────────────────────────────────────────────────── */
  (function() {
    const sections = Array.from(document.querySelectorAll('[data-rail]'));
    const dots = Array.from(document.querySelectorAll('.rail-dot'));
    function tick() {
      const mid = window.innerHeight / 2;
      let best = 0, bestDist = Infinity;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        const c = (r.top + r.bottom) / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) { bestDist = d; best = +s.dataset.rail; }
      }
      dots.forEach(d => d.classList.toggle('is-active', +d.dataset.i === best));
    }
    tick();
    window.addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
    window.addEventListener('resize', tick);
  })();

  /* Smooth in-page anchor scroll for the topnav links (cosmetic, they
     don't currently point anywhere meaningful, but if you wire them up
     this gives the soft scroll Dogstudio uses). */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
