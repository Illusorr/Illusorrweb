/* Metaculture · single-context 3D stage
   One renderer, one loop, suspended whenever the stage is off screen.
   Models stream in on demand so the 15 MB shell never blocks first paint. */
(function () {
  const host = document.getElementById('mcStage');
  if (!host || typeof THREE === 'undefined') return;

  const canvas = host.querySelector('canvas');
  const statusEl = host.querySelector('.mc-status');
  const barEl = host.querySelector('.mc-bar span');
  const chips = Array.from(document.querySelectorAll('.mc-chip'));
  const readout = document.querySelector('.mc-readout');

  const PIECES = {
    space: { url: '../assets/projects/metaculture/3d/space.glb', kind: 'shell' },
    detail: { url: '../assets/projects/metaculture/3d/space-details.glb', kind: 'shell' },
    panel: { url: '../assets/projects/metaculture/3d/garment-a.glb', kind: 'object' },
    wearables: { url: '../assets/projects/metaculture/3d/garment-b.glb', kind: 'garment' },
    wearablesF: { url: '../assets/projects/metaculture/3d/garment-female.glb', kind: 'garment' },
    mark: { url: '../assets/projects/metaculture/3d/logo.glb', kind: 'object' }
  };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 400);
  const target = new THREE.Vector3();

  let env = null;
  try {
    const pmrem = new THREE.PMREMGenerator(renderer);
    env = pmrem.fromScene(new THREE.RoomEnvironment(), 0.02).texture;
    scene.environment = env;
  } catch (e) { /* fall back to lights only */ }

  scene.add(new THREE.HemisphereLight(0xf3e4cc, 0x241a12, 0.85));
  const key = new THREE.DirectionalLight(0xffe6bd, 1.5);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb8e0, 0.5);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  /* ── orbit, written by hand: two axes, damped, no dependency ───── */
  const orbit = { az: 0.6, el: 0.16, dist: 12, azV: 0, elV: 0, distT: 12 };
  let drag = null;
  const clampEl = (v) => Math.max(-0.35, Math.min(0.62, v));

  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    host.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    orbit.azV -= (e.clientX - drag.x) * 0.0045;
    orbit.elV += (e.clientY - drag.y) * 0.0032;
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = () => { drag = null; host.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    orbit.distT = Math.max(frame.near, Math.min(frame.far, orbit.distT * (1 + Math.sign(e.deltaY) * 0.09)));
  }, { passive: false });

  const frame = { near: 2, far: 40 };

  /* ── model cache + streaming ───────────────────────────────────── */
  const loader = new THREE.GLTFLoader();
  try {
    const draco = new THREE.DRACOLoader();
    draco.setDecoderPath('/assets/js/draco/gltf/');
    loader.setDRACOLoader(draco);
  } catch (e) { /* uncompressed glb */ }

  const cache = {};
  const pending = {};

  function say(msg, pct) {
    if (statusEl) statusEl.textContent = msg || '';
    if (barEl) barEl.style.width = (pct == null ? 0 : pct) + '%';
    host.classList.toggle('is-loading', msg != null);
  }

  function prep(root, kind) {
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m) return;
        if (m.map) m.map.encoding = THREE.sRGBEncoding;
        if (m.emissiveMap) m.emissiveMap.encoding = THREE.sRGBEncoding;
        if (kind === 'shell') { m.side = THREE.DoubleSide; }
        m.needsUpdate = true;
      });
    });
    return root;
  }

  function get(id) {
    if (cache[id]) return Promise.resolve(cache[id]);
    if (pending[id]) return pending[id];
    const spec = PIECES[id];
    pending[id] = new Promise((res, rej) => {
      loader.load(spec.url, (gltf) => {
        const root = prep(gltf.scene, spec.kind);
        const box = new THREE.Box3().setFromObject(root);
        cache[id] = { root, box, size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()), spec };
        res(cache[id]);
      }, (ev) => {
        if (ev.lengthComputable) say('Streaming', Math.round((ev.loaded / ev.total) * 100));
      }, rej);
    });
    return pending[id];
  }

  /* ── views ─────────────────────────────────────────────────────── */
  let shown = null;
  let floorY = 0;
  let shellLoaded = false;
  /* a selection made while a big model is still streaming must win, so every
     await is followed by a token check before anything touches the view */
  let seq = 0;

  const shell = new THREE.Group();
  const podium = new THREE.Group();
  scene.add(shell, podium);

  function fit(size, center, pad) {
    const span = Math.max(size.x, size.y, size.z) || 1;
    const d = (span / 2) / Math.tan((camera.fov * Math.PI / 180) / 2) * (pad || 1.5);
    frame.near = d * 0.28;
    frame.far = d * 2.6;
    orbit.distT = d;
    target.copy(center);
  }

  async function showShell(token) {
    if (!shellLoaded) {
      say('Streaming the gallery', 0);
      const s = await get('space');
      shell.add(s.root);
      floorY = s.box.min.y;
      shellLoaded = true;
      get('detail').then((d) => { shell.add(d.root); }).catch(() => {});
      say(null);
    }
    if (token !== seq) return;
    shell.visible = true;
    podium.visible = false;
    /* the shell encloses the visitor, so frame it from the inside: sit near
       the middle at eye height and orbit within the envelope */
    const s = cache.space;
    const span = Math.max(s.size.x, s.size.z) || 1;
    target.set(s.center.x, s.box.min.y + s.size.y * 0.22, s.center.z);
    orbit.distT = span * 0.30;
    orbit.dist = orbit.distT;
    frame.near = span * 0.06;
    frame.far = span * 0.62;
    orbit.el = 0.06;
    if (readout) readout.textContent = 'Gallery shell · parametric envelope';
  }

  /* wearables reads as a pair: male thob on the left, female on the right,
     each normalised on height so the two stand at the same scale */
  async function showPair(token) {
    say('Streaming', 0);
    const pair = await Promise.all([get('wearables'), get('wearablesF')]);
    if (token !== seq) return;
    say(null);
    podium.clear();
    const H = 2.2;
    const gap = H * 0.42;
    let maxW = 0;
    const holders = pair.map((p) => {
      const holder = new THREE.Group();
      const stand = new THREE.Group();
      /* some pieces are authored Z-up and arrive lying down: stand them up
         before measuring, so height normalisation compares like with like */
      const lying = p.size.y < Math.max(p.size.x, p.size.z) * 0.6;
      if (lying) stand.rotation.x = Math.PI / 2;
      stand.add(p.root);
      p.root.position.set(0, 0, 0);
      const box = new THREE.Box3().setFromObject(stand);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = H / (size.y || 1);
      stand.position.set(-center.x, -box.min.y, -center.z);
      holder.add(stand);
      holder.scale.setScalar(scale);
      maxW = Math.max(maxW, size.x * scale, size.z * scale);
      return holder;
    });
    const step = maxW * 0.5 + gap * 0.5;
    holders[0].position.x = -step;
    holders[1].position.x = step;
    holders.forEach((g) => podium.add(g));
    podium.visible = true;
    shell.visible = false;
    const size = new THREE.Vector3(step * 2 + maxW, H, maxW);
    fit(size, new THREE.Vector3(0, H * 0.5, 0), 1.12);
    orbit.dist = orbit.distT;
    orbit.el = 0.12;
    if (readout) readout.textContent = LABELS.wearables;
  }

  async function showPiece(id, token) {
    say('Streaming', 0);
    const p = await get(id);
    if (token !== seq) return;
    say(null);
    podium.clear();
    const holder = new THREE.Group();
    /* normalise on the largest dimension, so flat panels and standing
       figures both arrive framed instead of one of them filling the view */
    const span = Math.max(p.size.x, p.size.y, p.size.z) || 1;
    const scale = 2.2 / span;
    p.root.position.set(-p.center.x, -p.box.min.y, -p.center.z);
    holder.add(p.root);
    holder.scale.setScalar(scale);
    podium.add(holder);
    podium.visible = true;
    shell.visible = false;
    const size = p.size.clone().multiplyScalar(scale);
    fit(size, new THREE.Vector3(0, size.y * 0.5, 0), 1.45);
    orbit.dist = orbit.distT;
    /* flat layouts read from above, upright pieces from eye level */
    const flat = size.y < Math.max(size.x, size.z) * 0.5;
    orbit.el = flat ? 0.52 : 0.12;
    if (readout) readout.textContent = LABELS[id] || '';
  }

  const LABELS = {
    space: 'Gallery shell · parametric envelope',
    wearables: 'Wearables · male thob left, female thob right',
    panel: 'Exhibit panel · printed within the hall',
    mark: 'Identity mark · dimensional type'
  };

  function select(id) {
    if (shown === id) return;
    shown = id;
    const token = ++seq;
    chips.forEach((c) => c.classList.toggle('is-on', c.dataset.piece === id));
    (id === 'space' ? showShell(token)
      : id === 'wearables' ? showPair(token)
      : showPiece(id, token)).catch(() => {
      if (token !== seq) return;
      say(null);
      shown = null;
      if (readout) readout.textContent = 'That piece could not be loaded.';
    });
  }

  chips.forEach((c) => c.addEventListener('click', () => select(c.dataset.piece)));

  /* ── resize + loop, both gated on visibility ───────────────────── */
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  let running = false, raf = 0, started = false;
  const look = new THREE.Vector3();

  function tick() {
    if (!running) { raf = 0; return; }
    orbit.az += orbit.azV;
    orbit.el = clampEl(orbit.el + orbit.elV);
    orbit.azV *= 0.9;
    orbit.elV *= 0.9;
    if (!drag) orbit.az += 0.0009;
    orbit.dist += (orbit.distT - orbit.dist) * 0.08;
    const r = Math.cos(orbit.el) * orbit.dist;
    camera.position.set(
      target.x + Math.sin(orbit.az) * r,
      target.y + Math.sin(orbit.el) * orbit.dist,
      target.z + Math.cos(orbit.az) * r
    );
    look.lerp(target, 0.12);
    camera.lookAt(look);
    camera.near = Math.max(0.02, orbit.dist * 0.02);
    camera.far = orbit.dist * 8;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  }

  function setRunning(on) {
    running = on;
    if (on) {
      if (!started) { started = true; resize(); select('space'); }
      if (!raf) raf = requestAnimationFrame(tick);
    }
  }

  if (window.__mcVis) window.__mcVis.add(host, setRunning, 120);
  else setRunning(true);
})();
