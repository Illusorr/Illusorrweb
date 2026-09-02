/* TRT hero globe: the whole archive as a browsable sphere that flattens.
   41 renders x 5 crops = 205 tiny tiles on a Fibonacci sphere in CSS 3D.
   Scroll through the hero and the sphere unwraps into a flat media field
   (its own orthographic projection, so the rim stays dense). Drag to turn,
   click a tile to open the full render. No library. */
(() => {
  const stage = document.getElementById('orbStage');
  const hero = stage && stage.closest('.hero');
  if (!stage || !hero) return;

  const SRC = [
    ['x-09', 'TRT World', 'Broadcast floor'],
    ['x-02', 'TRT World', 'Logo plinth'],
    ['x-06', 'TRT World', 'Feed wall'],
    ['x-07', 'TRT World', 'Running order'],
    ['x-03', 'TRT World', 'Bulletin ring'],
    ['x-11', 'TRT', 'Network lobby'],
    ['x-05', 'TRT Arabi', 'Arabic wall'],
    ['x-12', 'Studio', 'Camera floor'],
    ['x-10', 'Archive', 'Timeline'],
    ['x-08', 'TRT 2', 'Exhibition wall'],
    ['x-01', 'TRT 2', 'Heritage models'],
    ['x-04', 'ILLUSORR', 'Title card'],
    ['x-17', 'Store', 'Merch floor'],
    ['x-13', 'Avatar', 'Turnaround, front'],
    ['x-14', 'Avatar', 'Turnaround, side'],
    ['x-15', 'Main space', 'Exterior'],
    ['x-16', 'Main space', 'Exterior, aerial'],
    ['main-01', 'Main space', 'Approach'],
    ['main-02', 'Main space', 'Threshold'],
    ['main-03', 'Main space', 'Arrival'],
    ['main-04', 'Main space', 'Core'],
    ['main-05', 'Main space', 'Atrium'],
    ['top-01', 'Main space', 'Plan'],
    ['top-02', 'Main space', 'Core, from above'],
    ['top-03', 'Main space', 'Arms, from above'],
    ['top-04', 'Main space', 'Roof'],
    ['side-01', 'Main space', 'Elevation, north'],
    ['side-02', 'Main space', 'Elevation, west'],
    ['side-03', 'Main space', 'Elevation, east'],
    ['side-04', 'Main space', 'Elevation, south'],
    ['broadcast-01', 'TRT Haber', 'On air'],
    ['broadcast-02', 'TRT Haber', 'Anchor desk'],
    ['broadcast-03', 'TRT Haber', 'Wire perimeter'],
    ['interior-01', 'Gallery', 'Hall'],
    ['interior-02', 'Foyer', 'Circulation'],
    ['interior-03', 'TRT 1', 'Premiere hall'],
    ['interior-04', 'Gallery', 'Hanging wall'],
    ['store-01', 'Store', 'Counter'],
    ['store-02', 'TRT \u00c7ocuk', 'Play floor'],
    ['avatar-a', 'Avatar', 'In world'],
    ['avatar-b', 'Avatar', 'At the desk'],
  ];
  const CROPS = ['50% 50%', '15% 30%', '85% 32%', '22% 76%', '80% 70%'];
  const TILES = [];
  for (let c = 0; c < CROPS.length; c++) {
    for (let i = 0; i < SRC.length; i++) {
      const k = (i * 11 + c * 4) % SRC.length;   // interleave so neighbours differ
      TILES.push([...SRC[k], CROPS[c]]);
    }
  }

  const drag = document.createElement('div');
  drag.className = 'orb-drag';
  const orb = document.createElement('div');
  orb.className = 'orb-spin';
  drag.appendChild(orb);
  const readout = document.createElement('div');
  readout.className = 'orb-readout';
  readout.innerHTML = '<span class="orb-ch">The archive</span><span class="orb-sp">Drag to turn \u00b7 scroll to unwrap</span>';
  const hint = document.createElement('div');
  hint.className = 'orb-hint';
  hint.textContent = TILES.length + ' views of the world';
  stage.append(hint, drag, readout);

  const chEl = readout.querySelector('.orb-ch');
  const spEl = readout.querySelector('.orb-sp');
  const N = TILES.length;

  const nodes = TILES.map(([file, ch, sp, crop], i) => {
    const y = 1 - ((i + 0.5) / N) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = i * 2.399963229728653;
    const ux = Math.cos(th) * r, uz = Math.sin(th) * r;
    const lon = Math.atan2(ux, uz) * 180 / Math.PI;
    const lat = Math.asin(y) * 180 / Math.PI;

    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'orb-tile';
    el.setAttribute('aria-label', ch + ', ' + sp);
    el.dataset.f = file; el.dataset.c = ch; el.dataset.s = sp;
    const img = document.createElement('img');
    img.src = '../assets/projects/trt/thumb/' + file + '.webp';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.style.objectPosition = crop;
    el.appendChild(img);
    orb.appendChild(el);
    return { el, lon, lat, ux, uy: y, uz };
  });

  /* ── state ───────────────────────────────────────────────────────── */
  let R = 220;                       // sphere radius, from the stage box
  let spin = 0;                      // auto-rotation, degrees
  let rx = -12, ry = 0;              // drag rotation
  let p = 0;                         // 0 sphere, 0.5 scattered, 1 flat plane
  let dragging = false, px = 0, py = 0, moved = false;

  /* stable pseudo-random per tile, so the scatter is the same every reload */
  const rnd = (i, s) => { const x = Math.sin((i + 1) * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  nodes.forEach((n, i) => {
    n.j = [rnd(i, 1) - 0.5, rnd(i, 2) - 0.5, rnd(i, 3) - 0.5];   // scatter jitter
    n.tumble = [(rnd(i, 4) - 0.5) * 220, (rnd(i, 5) - 0.5) * 220];
    n.burst = 0.55 + rnd(i, 6) * 1.15;                            // how far it flies
  });
  /* grid for the flat plane: roughly square cells filling the frame */
  let cols = 17, rows = 13, cw = 46, ch = 30;
  function measure() {
    const w = stage.clientWidth, hh = stage.clientHeight;
    R = Math.min(w, hh) * 0.30;
    const aw = w * 0.94, ah = hh * 0.86;
    cols = Math.max(6, Math.round(Math.sqrt(N * (aw / ah))));
    rows = Math.ceil(N / cols);
    cw = aw / cols; ch = ah / rows;
  }
  measure();
  new ResizeObserver(() => { measure(); render(); }).observe(stage);

  const ease = (t) => t * t * (3 - 2 * t);
  function render() {
    const q = 1 - p;
    drag.style.transform = `rotateX(${(rx * q).toFixed(2)}deg) rotateY(${((ry + spin) * q).toFixed(2)}deg)`;
    /* two legs: 0 -> .5 the sphere bursts apart, .5 -> 1 it settles onto a plane */
    const a = ease(Math.min(1, p / 0.5));            // sphere -> scatter
    const b = ease(Math.max(0, (p - 0.5) / 0.5));    // scatter -> plane
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      /* sphere */
      const sx = R * n.ux, sy = -R * n.uy, sz = R * n.uz;
      /* scatter: pushed out along its own normal, with jitter */
      const s = R * (1 + n.burst);
      const cx = n.ux * s + n.j[0] * R * 1.5;
      const cy = -n.uy * s + n.j[1] * R * 1.5;
      const cz = n.uz * s * 0.7 + n.j[2] * R * 1.1;
      /* plane: an even lattice, softly jittered so it reads as media, not a table */
      const col = i % cols, row = (i - col) / cols;
      const fx = (col - (cols - 1) / 2) * cw + n.j[0] * cw * 0.5;
      const fy = (row - (rows - 1) / 2) * ch + n.j[1] * ch * 0.5;
      /* blend */
      const mx = sx + (cx - sx) * a, my = sy + (cy - sy) * a, mz = sz + (cz - sz) * a;
      const tx = mx + (fx - mx) * b, ty = my + (fy - my) * b, tz = mz * (1 - b);
      const ry2 = (n.lon * (1 - a) + n.tumble[0] * a) * (1 - b);
      const rx2 = (-n.lat * (1 - a) + n.tumble[1] * a) * (1 - b);
      n.el.style.transform =
        `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,${tz.toFixed(1)}px) rotateY(${ry2.toFixed(1)}deg) rotateX(${rx2.toFixed(1)}deg)`;
    }
  }

  /* ── scroll drives the unwrap ────────────────────────────────────── */
  function readScroll() {
    const r = hero.getBoundingClientRect();
    // Finish the unwrap at 58% of the hero's scroll span so the flat field
    // has room to sit still before the stage releases.
    const span = Math.max(1, (r.height - window.innerHeight) * 0.58);
    const np = Math.min(1, Math.max(0, -r.top / span));
    if (Math.abs(np - p) > 0.0015) {
      p = np;
      stage.style.setProperty('--p', p.toFixed(3));
      hero.style.setProperty('--copy-fade', Math.min(1, Math.max(0, (p - 0.10) / 0.28)).toFixed(3));
      return true;
    }
    return false;
  }
  readScroll();
  stage.style.setProperty('--p', '0');
  window.addEventListener('scroll', () => { if (readScroll()) render(); }, { passive: true });

  /* ── drag ────────────────────────────────────────────────────────── */
  stage.addEventListener('pointerdown', (e) => {
    dragging = true; moved = false; px = e.clientX; py = e.clientY;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add('is-drag');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - px, dy = e.clientY - py;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    ry += dx * 0.30;
    rx = Math.max(-62, Math.min(62, rx - dy * 0.22));
    px = e.clientX; py = e.clientY;
    render();
  });
  const up = () => { dragging = false; stage.classList.remove('is-drag'); };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);

  orb.addEventListener('pointerover', (e) => {
    const t = e.target.closest('.orb-tile');
    if (!t) return;
    chEl.textContent = t.dataset.c;
    spEl.textContent = t.dataset.s;
  });

  /* ── slow drift, capped, and paused once flat or offscreen ───────── */
  let last = 0, visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 }).observe(hero);
  (function loop(t) {
    requestAnimationFrame(loop);
    if (t - last < 26) return;
    last = t;
    if (!visible || dragging || p > 0.985) return;
    spin += 0.16 * (1 - p);
    render();
  })(0);
  render();

  /* ── lightbox ────────────────────────────────────────────────────── */
  const box = document.createElement('div');
  box.className = 'orb-box';
  box.innerHTML = '<button class="orb-close" type="button" aria-label="Close">Close</button><figure><img alt=""><figcaption><span class="ob-ch"></span><span class="ob-sp"></span></figcaption></figure>';
  document.body.appendChild(box);
  const bImg = box.querySelector('img');
  orb.addEventListener('click', (e) => {
    const t = e.target.closest('.orb-tile');
    if (!t || moved) return;
    e.stopPropagation();
    bImg.src = '../assets/projects/trt/' + t.dataset.f + '.webp';
    box.querySelector('.ob-ch').textContent = t.dataset.c;
    box.querySelector('.ob-sp').textContent = t.dataset.s;
    box.classList.add('is-on');
    document.documentElement.style.overflow = 'hidden';
  });
  function close() { box.classList.remove('is-on'); document.documentElement.style.overflow = ''; }
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.orb-close')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('is-on')) close(); });
})();
