  /* Scroll effects: (1) fade-up reveal as blocks enter the viewport,
     (2) center-focus on the reel rail — the card nearest the rail's
     centre grows while the others recede as you swipe. */
  (function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* (1) Reveal on enter */
    const revealSel = '.module-head, .body-grid > div, .process .step, .stats .stat, .credits, .lg-grid .ph, .post-grid .ph, .bleed .ph, figure.ph, .quote, .next-inner, .meta-cell';
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    document.querySelectorAll(revealSel).forEach(el => {
      if (el.closest('.reel-rail')) return;
      el.classList.add('reveal');
      io.observe(el);
    });

    /* (2) Reel rail center-focus */
    const rail = document.querySelector('.reel-rail');
    if (rail) {
      const cards = [...rail.querySelectorAll('.ph')];
      let raf = 0;
      function update() {
        const mid = rail.scrollLeft + rail.clientWidth / 2;
        const span = rail.clientWidth / 1.5;
        for (const c of cards) {
          const cc = c.offsetLeft + c.offsetWidth / 2;
          const d = Math.min(Math.abs(cc - mid) / span, 1);
          c.style.transform = 'scale(' + (1 - 0.16 * d).toFixed(3) + ')';
          c.style.opacity = (1 - 0.5 * d).toFixed(3);
        }
        raf = 0;
      }
      const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
      rail.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      new IntersectionObserver(() => onScroll(), { threshold: 0.05 }).observe(rail);
      window.addEventListener('load', onScroll);
      setTimeout(onScroll, 400);
      requestAnimationFrame(update);
    }
  })();
