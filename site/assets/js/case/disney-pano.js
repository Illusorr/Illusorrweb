/* Equirectangular 360° viewer for realm media.
   Any [data-pano] element whose <image-slot> holds a dropped image gets a
   three.js inside-out sphere: drag to look, wheel to zoom, slow auto-drift
   when idle. Boots lazily the first time its realm panel goes live, so the
   page cost is zero until someone enters the realm. */
import * as THREE from 'three';

const mounts = new Map();

function slotURL(slot, sidecar) {
  if (!slot) return null;
  const img = slot.shadowRoot && slot.shadowRoot.querySelector('img');
  if (img && /^data:image\//i.test(img.src)) return img.src;
  const v = sidecar && slot.id ? sidecar[slot.id] : null;
  const u = typeof v === 'string' ? v : v && v.u;
  return u && /^data:image\//i.test(u) ? u : null;
}

const sidecar = () => fetch('.image-slots.state.json').then(r => (r.ok ? r.json() : null)).catch(() => null);

function build(host, url, video) {
  const canvas = document.createElement('canvas');
  canvas.className = 'pano-canvas';
  host.appendChild(canvas);
  const hint = document.createElement('div');
  hint.className = 'pano-hint';
  hint.textContent = 'Drag to look around';
  host.appendChild(hint);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(74, 1, 0.1, 1100);

  let tex;
  if (video) {
    tex = new THREE.VideoTexture(video);
    video.play().catch(() => {});
    video.addEventListener('loadeddata', () => host.classList.add('is-pano-live'), { once: true });
    if (video.readyState >= 2) host.classList.add('is-pano-live');
  } else {
    tex = new THREE.TextureLoader().load(url, () => {
      host.classList.add('is-pano-live');
      renderer.render(scene, camera);
    });
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  // Seam control: repeat-wrap on U so bilinear taps at the 0/1 edge read
  // across the join instead of clamping (that hard edge is the visible
  // vertical seam); clamp on V so the poles don't bleed. Mipmaps + max
  // anisotropy kill the shimmer that reads as "a flat image on a ball".
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.magFilter = THREE.LinearFilter;
  if (video) {
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  } else {
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
  }
  const geo = new THREE.SphereGeometry(500, 160, 96);
  geo.scale(-1, 1, 1);
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex })));

  // Equirect u=0 (the wrap seam) sits at lon 0, so start 180° round: the
  // centre of the source image — where every one of these panoramas puts
  // its portal sphere — is dead ahead on entry.
  const start = Number(host.dataset.panoLon ?? 180);
  let lon = start, lat = 0, tLon = start, tLat = 0, fov = 74, tFov = 74;
  let dragging = false, px = 0, py = 0, idle = 0;

  const down = (e) => { dragging = true; idle = 0; px = e.clientX; py = e.clientY; canvas.setPointerCapture(e.pointerId); };
  const move = (e) => {
    if (!dragging) return;
    idle = 0;
    tLon -= (e.clientX - px) * 0.13;
    tLat = Math.max(-72, Math.min(72, tLat + (e.clientY - py) * 0.13));
    px = e.clientX; py = e.clientY;
  };
  const up = () => { dragging = false; };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    idle = 0;
    tFov = Math.max(32, Math.min(92, tFov + e.deltaY * 0.05));
  }, { passive: false });

  function size() {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(host);
  size();
  const panel = host.closest('.realm');
  if (panel) new MutationObserver(() => requestAnimationFrame(size)).observe(panel, { attributes: true, attributeFilter: ['class'] });
  if (video) {
    // Don't keep decoding a 3200-wide stream behind a closed realm.
    const gate = () => {
      const on = (!panel || panel.classList.contains('is-open')) && !document.hidden;
      if (on) video.play().catch(() => {}); else video.pause();
    };
    if (panel) new MutationObserver(gate).observe(panel, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', gate);
    gate();
  }

  let last = 0;
  (function loop(t) {
    requestAnimationFrame(loop);
    if (t - last < 24 || !host.isConnected || !host.offsetParent) return;
    last = t;
    idle += 1;
    if (!dragging && idle > 90) { tLon += 0.035; hint.classList.add('is-faded'); } else if (idle < 90) hint.classList.remove('is-faded');
    lon += (tLon - lon) * 0.08;
    lat += (tLat - lat) * 0.08;
    fov += (tFov - fov) * 0.1;
    camera.fov = fov;
    camera.updateProjectionMatrix();
    const phi = THREE.MathUtils.degToRad(90 - lat), th = THREE.MathUtils.degToRad(lon);
    camera.lookAt(500 * Math.sin(phi) * Math.cos(th), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(th));
    renderer.render(scene, camera);
  })(0);
}

async function tryMount(host) {
  if (mounts.get(host)) return;
  // A 360 video source wins over the still: equirect mp4, muted + looped so
  // it can autoplay, decoded straight into a VideoTexture.
  const src = host.dataset.panoVideo;
  if (src) {
    mounts.set(host, true);
    const v = document.createElement('video');
    Object.assign(v, { src, loop: true, muted: true, autoplay: true, playsInline: true, crossOrigin: 'anonymous' });
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    build(host, null, v);
    host._panoVideo = v;
    // Some browsers refuse the first play() until a gesture; retry on one.
    const kick = () => v.play().catch(() => {});
    document.addEventListener('pointerdown', kick, { once: true });
    return;
  }
  const url = host.dataset.panoImage || slotURL(host.querySelector('image-slot'), await sidecar());
  if (!url) return;              // no image yet — leave the drop slot usable
  mounts.set(host, true);
  build(host, url);
}

/* Ambience: starts on entering the realm (the pod click is the gesture that
   satisfies autoplay policy), fades out and pauses on exit. */
function ambience(host) {
  const src = host.dataset.panoAudio;
  const panel = host.closest('.realm');
  if (!src || !panel) return;
  const a = new Audio();
  host._panoAudio = a;
  a.loop = true; a.preload = 'none'; a.volume = 0;
  // Only fetch the track once the realm is actually entered.
  const arm = () => { if (!a.src) { a.preload = 'auto'; a.src = src; } };
  let muted = false, fade = 0;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pano-sound';
  btn.setAttribute('aria-label', 'Toggle realm sound');
  btn.innerHTML = '<span class="pano-eq"><i></i><i></i><i></i><i></i></span>Sound';
  host.appendChild(btn);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    muted = !muted;
    btn.classList.toggle('is-off', muted);
    if (!muted && panel.classList.contains('is-open')) { arm(); a.play().catch(() => {}); }
  });

  setInterval(() => {
    const on = panel.classList.contains('is-open') && !muted && !document.hidden;
    fade += ((on ? 0.55 : 0) - fade) * (on ? 0.08 : 0.22);
    a.volume = Math.max(0, Math.min(1, fade));
    if (on && a.paused) { arm(); a.play().catch(() => {}); }
    if (!on && !a.paused && fade < 0.02) { a.pause(); a.currentTime = 0; }
  }, 60);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { a.pause(); fade = 0; a.volume = 0; } });
}

function watch() {
  document.querySelectorAll('[data-pano]').forEach((host) => {
    ambience(host);
    const slot = host.querySelector('image-slot');
    // Nothing heavy loads until the realm is entered: the media is multi-MB
    // and most visitors never open a realm. Once entered, the slot observer
    // + short poll keep authoring live (drop a new panorama, see it swap).
    const panel = host.closest('.realm');
    const entered = () => !panel || panel.classList.contains('is-live');
    const check = () => { if (entered()) tryMount(host); };
    if (panel) new MutationObserver(() => {
      if (!entered() || mounts.get(host)) return check();
      check();
      let n = 0;
      const poll = setInterval(() => { check(); if (mounts.get(host) || ++n > 12) clearInterval(poll); }, 500);
    }).observe(panel, { attributes: true, attributeFilter: ['class'] });
    if (slot) new MutationObserver(check).observe(slot, { attributes: true, attributeFilter: ['data-filled', 'src'] });
    check();
  });
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', watch, { once: true });
else watch();
