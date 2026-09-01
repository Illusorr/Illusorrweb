/* Disney+ virtual cinema lounge.
   1. pointer parallax on the 3D stage
   2. click a content pod → its realm panel opens fullscreen through a
      circular portal wipe originating at the click point
   3. quiet dashboard activity (row focus cycles, no fake numbers) */
(() => {
  const lounge = document.getElementById('lounge');
  if (!lounge) return;
  const scene = lounge.querySelector('.lg-scene');
  const pods = Array.from(lounge.querySelectorAll('.pod'));

  /* ── parallax ─────────────────────────────────────────────── */
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, inView = false;
  function onMove(e) {
    const r = lounge.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
    if (scene) scene.style.transform =
      `perspective(1500px) rotateY(${(-cx * 5.5).toFixed(3)}deg) rotateX(${(cy * 3.2).toFixed(3)}deg) translateZ(0)`;
    pods.forEach((p, i) => {
      const d = (i - (pods.length - 1) / 2) * 0.5;
      p.style.setProperty('--pdx', (-cx * (7 + d * 2)).toFixed(2) + 'px');
      p.style.setProperty('--pdy', (-cy * 5).toFixed(2) + 'px');
    });
    raf = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
  }
  lounge.addEventListener('pointermove', onMove, { passive: true });
  lounge.addEventListener('pointerleave', () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); });

  /* ── pod stagger-in ───────────────────────────────────────── */
  new IntersectionObserver((ents) => {
    ents.forEach(en => {
      if (!en.isIntersecting) return;
      inView = true;
      pods.forEach((p, i) => setTimeout(() => p.classList.add('is-in'), 90 * i));
    });
  }, { threshold: 0.25 }).observe(lounge);
  setTimeout(() => { inView = true; pods.forEach(p => p.classList.add('is-in')); }, 2000);

  /* ── portal: pod → realm ──────────────────────────────────── */
  const scrim = document.createElement('div');
  scrim.className = 'realm-scrim';
  document.body.appendChild(scrim);
  let open = null;

  function openRealm(pod, x, y) {
    const panel = pod.querySelector('.realm');
    if (!panel || open) return;
    open = panel;
    panel.style.setProperty('--ox', x + 'px');
    panel.style.setProperty('--oy', y + 'px');
    document.body.appendChild(panel);
    panel.classList.add('is-live');
    void panel.offsetWidth;   /* force layout so the clip-path transition has a start value */
    panel.classList.add('is-open');
    scrim.classList.add('is-on');
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.classList.add('realm-open');
  }
  function closeRealm() {
    if (!open) return;
    const panel = open; open = null;
    panel.classList.remove('is-open');
    scrim.classList.remove('is-on');
    document.documentElement.style.overflow = '';
    document.documentElement.classList.remove('realm-open');
    setTimeout(() => {
      panel.classList.remove('is-live');
      const host = document.querySelector(`.pod[data-realm="${panel.dataset.realm}"]`);
      if (host) host.appendChild(panel);
    }, 900);
  }

  pods.forEach(pod => {
    pod.addEventListener('click', (e) => {
      if (e.target.closest('.realm')) return;
      openRealm(pod, e.clientX, e.clientY);
    });
    pod.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const r = pod.getBoundingClientRect();
        openRealm(pod, r.left + r.width / 2, r.top + r.height / 2);
      }
    });
  });
  document.addEventListener('click', (e) => { if (e.target.closest('.realm-exit')) closeRealm(); });
  scrim.addEventListener('click', closeRealm);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeRealm(); });

  /* ── dashboard activity ───────────────────────────────────── */
  const rows = Array.from(lounge.querySelectorAll('.dash-row'));
  if (rows.length) {
    let k = 0;
    setInterval(() => {
      if (!inView || document.hidden) return;
      rows.forEach(r => r.classList.remove('is-cur'));
      rows[k % rows.length].classList.add('is-cur');
      k++;
    }, 2200);
  }
})();
