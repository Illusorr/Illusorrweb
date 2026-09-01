import * as THREE from 'three';

/* Cinderella-castle point cloud. Positions are pre-baked from the GLB into a
   quantised Int16 buffer (assets/v5/disney-castle-points.bin, ~104k points,
   normalised to a unit-ish box centred on origin) so the page never ships the
   15MB model. Scroll drives assemble → orbit → dissolve. */
const canvas = document.getElementById('castleCanvas');
const stage = document.querySelector('.castle-stage');
if (canvas && stage) init();

async function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  const DPR = Math.min(window.devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 1.35);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 40);
  camera.position.set(0, 0.02, 3.95);

  const group = new THREE.Group();
  scene.add(group);

  const res = await fetch('../assets/projects/v5/disney-castle-points.bin');
  const raw = new Int16Array(await res.arrayBuffer());
  const N = raw.length / 3;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) pos[i] = raw[i] / 32000;
  const rand = new Float32Array(N * 3);
  for (let i = 0; i < N * 3; i++) rand[i] = Math.random();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 3));
  geo.computeBoundingSphere();

  const uniforms = {
    uTime: { value: 0 },
    uAssemble: { value: 0 },
    uDissolve: { value: 0 },
    uSize: { value: 22 },
    uDpr: { value: DPR },
    uColA: { value: new THREE.Color('#1668C4') },
    uColB: { value: new THREE.Color('#EAF3FF') },
    uColC: { value: new THREE.Color('#22307F') },
    uOpacity: { value: 1 }
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aRand;
      uniform float uTime, uAssemble, uDissolve, uSize, uDpr;
      uniform vec3 uColA, uColB, uColC;
      varying vec3 vCol; varying float vA;
      void main(){
        vec3 p = position;
        /* pre-assembly cloud: points start scattered on a wide shell */
        vec3 dir = normalize(p + (aRand - 0.5) * 0.9 + 0.0001);
        vec3 scatter = dir * (2.4 + aRand.x * 3.0) + vec3(0.0, aRand.y * 0.6 - 0.3, 0.0);
        float ease = uAssemble * uAssemble * (3.0 - 2.0 * uAssemble);
        float stagger = clamp(ease * 1.35 - aRand.z * 0.35, 0.0, 1.0);
        p = mix(scatter, position, stagger);
        /* breathing shimmer + scroll dissolve outward */
        float tw = 0.6 + 0.4 * sin(uTime * 1.6 + aRand.z * 34.0);
        p += dir * uDissolve * (0.25 + aRand.y * 1.9);
        p.y += sin(uTime * 0.5 + aRand.x * 12.0) * 0.004;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float h = smoothstep(-1.0, 0.85, position.y);
        vec3 c = mix(mix(uColC, uColA, smoothstep(0.0, 0.52, h)), uColB, smoothstep(0.74, 1.0, h));
        vCol = c * (0.34 + 0.34 * tw);
        float base = smoothstep(-0.98, -0.45, position.y);   /* let the plinth fade into the dark */
        vA = (0.15 + 0.42 * stagger) * (0.28 + 0.72 * base) * (1.0 - uDissolve * 0.9);
        gl_PointSize = uSize * uDpr * (0.55 + 0.65 * tw) / max(-mv.z, 0.35);
      }`,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vCol; varying float vA;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.06, d) * vA * uOpacity;
        gl_FragColor = vec4(vCol, a);
      }`
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);

  /* ── sizing ─────────────────────────────────────────────────────── */
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    uniforms.uSize.value = w < 760 ? 20 : 26;
    group.position.x = w > 1100 ? 0.40 : 0;
    group.position.y = -0.10;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── pointer parallax ───────────────────────────────────────────── */
  let px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── scroll progress across the stage ───────────────────────────── */
  let prog = 0;
  function readScroll() {
    const r = stage.getBoundingClientRect();
    const span = Math.max(1, r.height - window.innerHeight);
    prog = Math.min(1, Math.max(0, -r.top / span));
  }
  readScroll();
  window.addEventListener('scroll', () => {
    readScroll();
    const now = performance.now();
    if (visible && now - lastRender > 60) frame(now);
  }, { passive: true });

  /* ── loop, only while the stage is on screen ─────────────────────── */
  let visible = true, raf = 0, t0 = performance.now();
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible && !raf) { t0 = performance.now() - clock * 1000; raf = requestAnimationFrame(frame); }
  }, { threshold: 0 }).observe(stage);

  let clock = 0, assembled = 0;
  let lastRender = -1e9;
  const MIN_DT = 1000 / 40;          /* 40fps ceiling: the cloud shimmers slowly, 60 is waste */
  function frame(now) {
   try {
    if (now - lastRender < MIN_DT && raf) { raf = requestAnimationFrame(frame); return; }
    if (document.documentElement.classList.contains('realm-open')) { raf = visible ? requestAnimationFrame(frame) : 0; return; }
    lastRender = now;
    clock = (now - t0) / 1000;
    uniforms.uTime.value = clock;
    assembled = Math.min(1, clock / 2.6);
    uniforms.uAssemble.value = assembled;

    /* orbit + push-in with scroll, dissolve on the last third */
    const p = prog;
    group.rotation.y = -0.35 + p * 2.1;
    group.rotation.x = 0.02 + p * 0.10;
    camera.position.z = 3.95 - p * 1.7;
    camera.position.y = 0.10 + p * 0.18;
    uniforms.uDissolve.value = Math.max(0, (p - 0.72) / 0.28) * 0.9;
    uniforms.uOpacity.value = 1 - Math.max(0, (p - 0.9) / 0.1) * 0.85;

    px += (tx - px) * 0.05; py += (ty - py) * 0.05;
    group.rotation.y += px * 0.14;
    group.rotation.x += -py * 0.06;
    camera.lookAt(0, 0.02, 0);

    renderer.render(scene, camera);
    if (visible) raf = requestAnimationFrame(frame); else raf = 0;
   } catch (err) { window.__castleErr = String(err && err.stack || err); raf = 0; }
  }
  frame(performance.now());
  raf = requestAnimationFrame(frame);
  /* Some embedded/offscreen contexts never fire rAF. Watchdog keeps the
     cloud alive there without doubling the framerate when rAF works. */
  setInterval(() => {
    const now = performance.now();
    if (visible && now - lastRender > 200) frame(now);
  }, 120);
  document.documentElement.classList.add('castle-ready');
}
