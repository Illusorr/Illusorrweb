(() => {
  const root = document.getElementById('heroCarousel');
  if (!root) return;
  const track = document.getElementById('hcTrack');
  const nowEl = document.getElementById('hcNow');
  const totEl = document.getElementById('hcTot');
  const lookEl = document.getElementById('hcLook');
  const titleEl = document.getElementById('hcTitle');
  const subEl = document.getElementById('hcSub');
  const prevBtn = document.getElementById('hcPrev');
  const nextBtn = document.getElementById('hcNext');
  const barsEl = document.getElementById('hcBars');
  const slides = Array.from(track.querySelectorAll('.hc-slide'));
  const N = slides.length;
  const VIS = () => parseInt(getComputedStyle(root).getPropertyValue('--hc-vis')) || 3;
  let cur = 0, timer = null, paused = false;
  const DUR = 4000;

  totEl.textContent = '/ ' + String(N).padStart(2, '0');

  const bars = slides.map((_, i) => {
    const b = document.createElement('div');
    b.className = 'hc-bar';
    barsEl.appendChild(b);
    return b;
  });

  /* Same fix as hero-carousel.js: the track carries overflow:hidden on the
     phone and tablet layers, so translating the track carried its own clip box
     away and the slide scrolled to was clipped out of existence. Move the
     slides instead and the clipper stays where it is. */
  (function () {
    const st = document.createElement('style');
    st.textContent =
      '#hcTrack{transform:none !important;transition:none !important}' +
      '#hcTrack > .hc-slide{transform:translateX(var(--hc-x,0px));' +
      'transition:transform .9s cubic-bezier(.72,0,.18,1)}' +
      '#hcTrack.no-anim > .hc-slide{transition:none}' +
      '@media (prefers-reduced-motion:reduce){#hcTrack > .hc-slide{transition:none}}';
    document.head.appendChild(st);
  })();

  function go(n) {
    cur = ((n % N) + N) % N;
    const vis = VIS();
    const max = Math.max(0, N - vis);
    const shift = Math.min(cur, max);
    /* was translateX(calc(-shift * (100% / vis))) on the track, where 100%
       resolved against the track's own width. The same distance in pixels,
       applied to the slides. */
    track.style.setProperty('--hc-x', (-shift * (track.clientWidth / vis)) + 'px');
    slides.forEach((s, i) => s.classList.toggle('is-active', i === cur));
    nowEl.textContent = String(cur + 1).padStart(2, '0');
    const d = slides[cur].dataset;
    lookEl.textContent = d.look || '';
    titleEl.textContent = d.title || '';
    subEl.textContent = d.sub || '';
    bars.forEach((b, i) => {
      b.classList.toggle('is-done', i < cur);
      b.classList.remove('is-active');
      if (i === cur) { void b.offsetWidth; b.style.setProperty('--hc-dur', DUR + 'ms'); b.classList.add('is-active'); }
    });
    clearTimeout(timer);
    if (!paused) timer = setTimeout(() => go(cur + 1), DUR);
  }

  prevBtn.addEventListener('click', () => go(cur - 1));
  nextBtn.addEventListener('click', () => go(cur + 1));
  root.addEventListener('pointerenter', () => { paused = true; clearTimeout(timer); });
  root.addEventListener('pointerleave', () => { paused = false; timer = setTimeout(() => go(cur + 1), DUR); });

  let dragStartX = null;
  root.addEventListener('pointerdown', e => { dragStartX = e.clientX; });
  root.addEventListener('pointerup', e => {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    dragStartX = null;
  });

  go(0);
  window.addEventListener('resize', () => go(cur));
})();
