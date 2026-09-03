(() => {
  const root = document.getElementById('heroCarousel');
  if (!root) return;
  const track = document.getElementById('hcTrack');
  const slides = Array.from(track.children);
  const N = slides.length;
  const DUR = 5200;
  const nowEl = document.getElementById('hcNow');
  const totEl = document.getElementById('hcTot');
  const lookEl = document.getElementById('hcLook');
  const titleEl = document.getElementById('hcTitle');
  const subEl = document.getElementById('hcSub');
  const barsWrap = document.getElementById('hcBars');
  root.style.setProperty('--hc-dur', (DUR / 1000) + 's');
  let page = 0, visible = 3, pages = N, timer = null, paused = false, bars = [];

  function buildBars() {
    barsWrap.innerHTML = ''; bars = [];
    for (let p = 0; p < pages; p++) {
      const b = document.createElement('button'); b.className = 'hc-bar'; b.setAttribute('aria-label', 'Go to page ' + (p + 1));
      b.innerHTML = '<span class="fill"></span>';
      b.addEventListener('click', () => go(p, true));
      barsWrap.appendChild(b); bars.push(b);
    }
    totEl.textContent = '/ ' + String(pages).padStart(2, '0');
  }

  function measure() {
    const step = slides.length > 1 ? (slides[1].offsetLeft - slides[0].offsetLeft) : root.clientWidth;
    visible = Math.max(1, Math.round(root.clientWidth / step));
    const np = Math.max(1, Math.ceil(N / visible));
    if (np !== pages || bars.length !== np) { pages = np; buildBars(); }
    page = Math.min(page, pages - 1);
  }

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

  function render() {
    const firstIdx = Math.min(page * visible, N - 1);
    const maxScroll = Math.max(0, track.scrollWidth - root.clientWidth);
    const x = Math.min(slides[firstIdx].offsetLeft, maxScroll);
    track.style.setProperty('--hc-x', (-x) + 'px');
    slides.forEach((s, i) => s.classList.toggle('is-active', i >= firstIdx && i < firstIdx + visible));
    const s = slides[firstIdx];
    nowEl.textContent = String(page + 1).padStart(2, '0');
    lookEl.textContent = s.dataset.look || '';
    titleEl.textContent = s.dataset.title || '';
    subEl.textContent = s.dataset.sub || '';
    bars.forEach((b, p) => { b.classList.toggle('is-done', p < page); b.classList.remove('is-active'); });
    if (bars[page]) { void bars[page].offsetWidth; if (!paused) bars[page].classList.add('is-active'); }
  }

  function go(p, user) { page = (p + pages) % pages; render(); if (user) restart(); }
  function next() { go(page + 1); }
  function prev() { go(page - 1, true); }
  function restart() { clearTimeout(timer); if (paused) return; timer = setTimeout(next, DUR); }

  document.getElementById('hcNext').addEventListener('click', () => { next(); restart(); });
  document.getElementById('hcPrev').addEventListener('click', prev);
  root.addEventListener('pointerenter', () => { paused = true; clearTimeout(timer); if (bars[page]) bars[page].classList.remove('is-active'); });
  root.addEventListener('pointerleave', () => { paused = false; render(); restart(); });

  let down = false, sx = 0, dx = 0, baseX = 0;
  track.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; dx = 0; const firstIdx = Math.min(page * visible, N - 1); baseX = Math.min(slides[firstIdx].offsetLeft, Math.max(0, track.scrollWidth - root.clientWidth)); track.classList.add('no-anim'); track.setPointerCapture?.(e.pointerId); });
  track.addEventListener('pointermove', (e) => { if (!down) return; dx = e.clientX - sx; track.style.setProperty('--hc-x', (-(baseX - dx)) + 'px'); });
  function endDrag() { if (!down) return; down = false; track.classList.remove('no-anim'); const th = root.clientWidth * 0.12; if (dx < -th) go(page + 1, true); else if (dx > th) go(page - 1, true); else render(); }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  function layout() { measure(); render(); }
  layout();
  window.addEventListener('resize', () => { track.classList.add('no-anim'); layout(); requestAnimationFrame(() => track.classList.remove('no-anim')); });
  window.addEventListener('load', layout);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { if (en.isIntersecting && !paused) { render(); restart(); } else { clearTimeout(timer); if (bars[page]) bars[page].classList.remove('is-active'); } }, { threshold: 0.2 }).observe(root);
  } else { restart(); }
})();
