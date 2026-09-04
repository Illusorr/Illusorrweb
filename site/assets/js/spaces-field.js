/* ILLUSORR Spaces — inhabitable fragment.
   Three.js r128. You stand inside one of the five destinations: a cyclorama
   carries the world render, a contour floor grounds it, and the HUD from the
   product drives real changes in the scene — placing inventory, casting to
   the share surface, voice rings, chat bubbles anchored to guests. */
(() => {
'use strict';

const A = 'spaces-ui/assets/';

/* Destinations, in the left-to-right order of frame 23's selector.
   The source reuses two renders across the five cards; kept as authored.
   All five are ILLUSORR's own — the client names in the source file were
   placeholders, not commissions. */
const WORLDS = [
  { n:'DOWNTOWN', o:'ILLUSORR', img:A+'downtown.webp'      ,  key:0x2b3f66, fog:0x070d18 },
  { n:'WEST YAS', o:'ILLUSORR', img:A+'westyas.webp'       ,  key:0x2f5a52, fog:0x061012 },
  { n:'SCIFI',    o:'ILLUSORR', img:A+'illusorr-spaces-ui-scifi.webp', key:0x2a4a86, fog:0x050b16 },
  { n:'PINKISH',  o:'ILLUSORR', img:A+'westyas.webp'       ,  key:0x6b3358, fog:0x120814 },
  { n:'SCIFI II', o:'ILLUSORR', img:A+'illusorr-spaces-ui-scifi.webp', key:0x1f3a6b, fog:0x040910 },
];

const GUESTS = [
  { n:'Begum', role:'Host', a: 0.7, r: 9, s: 0.00021,
    greet: ['You made it. This is the arena — the flat part.',
            'Welcome in. Ask me anything about the space.'],
    talk: ['I set the podium down over there. Try Inventory if you want to move it.',
           'Every world runs the same bar, so nothing you learn here is wasted.',
           'World code gets people in. Guest permission decides what they can touch.',
           'Try the Surface panel — it retunes the whole contour field.'],
    bye: 'Wander off, I will be here.' },
  { n:'Zeynep', role:'Presenting', a: 2.9, r: 13, s:-0.00015,
    greet: ['One second, I am casting the deck.',
            'Good, you are here. Look at the screen.'],
    talk: ['Screen share drops a surface in front of you if there is not one already.',
           'Spatial audio means you drift out of my voice as you walk away.',
           'I usually present from the podium, it gives people something to face.',
           'Cast a webcam instead and the surface retints. Small thing, reads better.'],
    bye: 'I will keep it running.' },
  { n:'Kerem', role:'Visiting', a: 4.7, r: 7, s: 0.00027,
    greet: ['First time in this one. The west side is quieter.',
            'Hey. I came over from one of the sci-fi worlds.'],
    talk: ['Five destinations, and your avatar follows you across all of them.',
           'Every world runs on the same rails — no forks, no special cases.',
           'I keep my mic off until someone speaks to me.',
           'Drag to look, WASD to walk. That is the whole thing.'],
    bye: 'See you in the next one.' },
];

const CYAN = 0x00b2ff;
const YOU = 'Sara';

/* ───────────────────────────── renderer ───────────────────────────── */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x020b11, 1);
renderer.xr.enabled = true;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050b16, 0.021);

const camera = new THREE.PerspectiveCamera(56, innerWidth/innerHeight, 0.1, 600);
camera.position.set(0, 1.7, 0);

/* ───────────────────────────── the world shell ────────────────────── */
function skyTexture(hex) {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 256;
  const g = c.getContext('2d');
  const col = new THREE.Color(hex);
  const grad = g.createLinearGradient(0, 256, 0, 0);
  grad.addColorStop(0.00, '#02070c');
  grad.addColorStop(0.42, 'rgb(' + [col.r * 90, col.g * 90, col.b * 90].map(Math.round).join(',') + ')');
  grad.addColorStop(0.72, 'rgb(' + [col.r * 190, col.g * 190, col.b * 190].map(Math.round).join(',') + ')');
  grad.addColorStop(1.00, '#02060a');
  g.fillStyle = grad;
  g.fillRect(0, 0, 8, 256);
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

const cycMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: true, depthWrite: false });
const cyc = new THREE.Mesh(new THREE.CylinderGeometry(72, 72, 60, 64, 1, true), cycMat);
cyc.position.y = 14;
scene.add(cyc);

const dome = new THREE.Mesh(
  new THREE.SphereGeometry(72, 40, 20, 0, Math.PI*2, 0, Math.PI/2),
  new THREE.MeshBasicMaterial({ color:0x061420, side:THREE.BackSide, fog:true, depthWrite:false })
);
dome.position.y = 44;
scene.add(dome);

/* ── surface ──────────────────────────────────────────────────────────
   A contour-topography field, after ILLUSORR Drift: the geometry is flat and
   the vertex shader displaces it, while the fragment shader recomputes height
   analytically per pixel so the contour lines stay smooth curves instead of
   faceting along triangle edges. Same heightfield in JS so anything standing
   on the ground sits on the exact surface. */
function hash2(x, y) {
  let px = x * 127.1 + y * 311.7, py = x * 269.5 + y * 183.3;
  px -= Math.floor(px); py -= Math.floor(py);
  const s = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
function smooth(t) { return t * t * (3 - 2 * t); }
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const ux = smooth(x - ix), uy = smooth(y - iy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}
function fbm(x, y) {
  let s = 0, a = 0.5, fx = x, fy = y;
  for (let i = 0; i < 5; i++) {
    s += a * vnoise(fx, fy);
    const nx = fx * 1.6 + fy * 1.2, ny = -fx * 1.2 + fy * 1.6;
    fx = nx; fy = ny; a *= 0.5;
  }
  return s;
}
function sstep(e0, e1, x) { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }
function groundAt(x, z) {
  const big = (fbm(x * 0.014 + 10, z * 0.014 - 5) - 0.5) * 2;
  const small = (fbm(x * 0.05, z * 0.05) - 0.5) * 2;
  const d = Math.hypot(x, z);
  let e = big * 5.2 + small * 2.4;
  e *= sstep(6, 40, d);                              // flat arena where you stand
  return e - Math.exp(-(d * d) / (2 * 22 * 22)) * 1.6;
}

const GLSL_GROUND = `
  float hash2(vec2 p){
    vec2 q = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
    q = fract(q);
    return fract(sin(q.x*12.9898 + q.y*78.233) * 43758.5453);
  }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash2(i), hash2(i+vec2(1.0,0.0)), u.x),
               mix(hash2(i+vec2(0.0,1.0)), hash2(i+vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float s=0.0, a=0.5;
    for(int i=0;i<5;i++){
      s += a*vnoise(p);
      p = vec2(p.x*1.6 + p.y*1.2, -p.x*1.2 + p.y*1.6);
      a *= 0.5;
    }
    return s;
  }
  float groundH(vec2 c){
    float big   = (fbm(c*0.014 + vec2(10.0,-5.0)) - 0.5)*2.0;
    float small = (fbm(c*0.05) - 0.5)*2.0;
    float d = length(c);
    float e = big*5.2 + small*2.4;
    e *= smoothstep(6.0, 40.0, d);
    return e - exp(-(d*d)/(2.0*22.0*22.0))*1.6;
  }
`;

const groundUniforms = Object.assign(
  THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
  {
    uLine:    { value: new THREE.Color(CYAN) },
    uBase:    { value: new THREE.Color(0x071a28) },
    uContour: { value: 1.9 },
    uGlow:    { value: 1.0 },
    uHalo:    { value: 1.0 },
    uPlayer:  { value: new THREE.Vector3() },
  }
);

const groundGeo = new THREE.PlaneGeometry(300, 300, 360, 360);
groundGeo.rotateX(-Math.PI / 2);

const ground = new THREE.Mesh(groundGeo, new THREE.ShaderMaterial({
  uniforms: groundUniforms,
  fog: true,
  extensions: { derivatives: true },
  vertexShader: GLSL_GROUND + `
    varying vec2 vXZ;
    varying float vDist;
    #include <fog_pars_vertex>
    void main(){
      vec3 pos = position;
      pos.y = groundH(pos.xz);
      vec4 wp = modelMatrix * vec4(pos,1.0);
      vXZ = wp.xz;
      vec4 mvPosition = viewMatrix * wp;
      vDist = -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    precision highp float;
  ` + GLSL_GROUND + `
    varying vec2 vXZ;
    varying float vDist;
    uniform float uContour, uGlow, uHalo;
    uniform vec3 uLine, uBase, uPlayer;
    #include <fog_pars_fragment>
    void main(){
      float h = groundH(vXZ);
      float f = h * uContour;
      float w = fwidth(h) * uContour;
      float aa = max(w*1.1, 0.0015);
      float line  = 1.0 - smoothstep(0.0, aa, abs(fract(f-0.5)-0.5));
      float major = 1.0 - smoothstep(0.0, aa*0.2, abs(fract(f*0.2-0.5)-0.5));
      float intensity = line*0.85 + major*0.55;

      float elevT = clamp(h*0.06+0.5, 0.0, 1.0);
      vec3 base = mix(uBase*0.3, uBase, elevT);

      float pd = distance(vXZ, uPlayer.xz);
      float halo = exp(-pd*pd/(2.0*22.0*22.0)) * uHalo;

      vec3 col = base + uLine*intensity*uGlow*(0.7+halo*0.9);
      col += uLine*halo*0.10;

      float far = 1.0 - smoothstep(90.0, 260.0, vDist);
      col *= 0.25 + 0.75*far;

      gl_FragColor = vec4(col, 1.0);
      #include <fog_fragment>
    }`,
}));
scene.add(ground);

/* ── surface play styles (after Drift) ───────────────────────────────
   Each preset retunes the contour field rather than swapping it: line
   colour, contour density, glow, and the halo pool that follows you. */
const SURFACES = [
  { id:'field',   nm:'Field',   ds:'The default read. Cyan lines, open contours.',
    line:0x00B2FF, contour:1.9, glow:1.00, halo:1.0, dust:0.5 },
  { id:'current', nm:'Current', ds:'Denser topography, brighter glow, more air.',
    line:0x57C8FF, contour:2.9, glow:1.28, halo:1.35, dust:0.85 },
  { id:'still',   nm:'Still',   ds:'Violet, tightly banded, almost no drift.',
    line:0x8E7BFF, contour:3.6, glow:0.85, halo:0.7, dust:0.25 },
];

const tweens = [];
function tween(uniform, to) { tweens.push({ u:uniform, from:uniform.value, to, t:0 }); }
function stepTweens(dt) {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    tw.t = Math.min(1, tw.t + dt * 2.2);
    const e = tw.t * tw.t * (3 - 2 * tw.t);
    tw.u.value = tw.from + (tw.to - tw.from) * e;
    if (tw.t >= 1) tweens.splice(i, 1);
  }
}

let surfaceIx = 0;
function setSurface(i) {
  const p = SURFACES[i];
  surfaceIx = i;
  groundUniforms.uLine.value.set(p.line);
  tween(groundUniforms.uContour, p.contour);
  tween(groundUniforms.uGlow, p.glow);
  tween(groundUniforms.uHalo, p.halo);
  ring.material.color.set(p.line);
  dust.material.color.set(p.line).lerp(new THREE.Color(0xffffff), 0.55);
  dust.material.opacity = p.dust;
  guests.forEach((g) => { g.mesh.children[1].material.color.set(p.line); });
  if (window.spacesUI && window.spacesUI.onSurface) window.spacesUI.onSurface(i, p);
}

/* the ring you are standing in */
const ring = new THREE.Mesh(
  new THREE.RingGeometry(2.4, 2.52, 72).rotateX(-Math.PI/2),
  new THREE.MeshBasicMaterial({ color:CYAN, transparent:true, opacity:0.5 })
);
ring.position.y = 0.02;
scene.add(ring);

/* ───────────────────────────── light ──────────────────────────────── */
const key = new THREE.PointLight(0xffffff, 1.15, 90);
key.position.set(6, 14, 6);
scene.add(key);
scene.add(new THREE.AmbientLight(0x5f7f99, 0.75));

/* ───────────────────────────── guests ─────────────────────────────── */
const guestGroup = new THREE.Group();
scene.add(guestGroup);

const guests = GUESTS.map((g) => {
  const mesh = new THREE.Group();
  /* placeholder until the guest model loads, then swapped for the GLB */
  const body = new THREE.Group();
  body.position.y = 1.0;
  const base = new THREE.Mesh(
    new THREE.RingGeometry(0.52, 0.62, 36).rotateX(-Math.PI/2),
    new THREE.MeshBasicMaterial({ color:CYAN, transparent:true, opacity:0.55 })
  );
  base.position.y = 0.03;
  mesh.add(body, base);
  guestGroup.add(mesh);

  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerHTML = '<i></i><b>' + g.n + '</b>';
  document.getElementById('tags').appendChild(tag);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  document.getElementById('tags').appendChild(bubble);

  tag.dataset.role = g.role;
  return Object.assign({}, g, { mesh, tag, bubble, bubbleUntil: 0, near: false, turn: 0, said: 0 });
});

/* the guest avatar: one GLB, cloned per guest */
if (THREE.GLTFLoader) {
  const gltfLoader = new THREE.GLTFLoader();
  if (THREE.DRACOLoader) {                     // the guest model ships Draco-compressed
    const draco = new THREE.DRACOLoader();
    draco.setDecoderPath('/assets/js/draco/gltf/');
    gltfLoader.setDRACOLoader(draco);
  }
  gltfLoader.load('../assets/models/spheres.glb', (gltf) => {
    const src = gltf.scene;
    const box = new THREE.Box3().setFromObject(src);
    const size = new THREE.Vector3();
    box.getSize(size);
    const k = 1.55 / Math.max(size.y, 0.0001);      // normalise to guest height
    const mid = new THREE.Vector3();
    box.getCenter(mid);

    guests.forEach((g) => {
      const m = src.clone(true);
      m.scale.setScalar(k);
      m.position.set(-mid.x * k, -(box.min.y * k), -mid.z * k);
      m.traverse((o) => {
        if (!o.isMesh) return;
        o.material = o.material.clone();
        o.material.transparent = true;
        o.material.opacity = 0.96;
      });
      g.mesh.children[0].add(m);
      g.model = m;
    });
  }, undefined, () => {});
}

/* ───────────────────────────── placeable content ──────────────────── */
const placed = new THREE.Group();
scene.add(placed);

/* The surface a screen share casts onto. A real MediaStream (display capture
   or webcam) is played into a detached <video> and used as a VideoTexture, so
   what is on the wall in-world is genuinely what is being shared. */
let shareVideo = null, shareStream = null, shareTexture = null;

function stopStream() {
  if (shareStream) { shareStream.getTracks().forEach((t) => t.stop()); shareStream = null; }
  if (shareTexture) { shareTexture.dispose(); shareTexture = null; }
  if (shareVideo) { shareVideo.pause(); shareVideo.srcObject = null; }
  shareMat.map = null;
  shareMat.color.setHex(0x061722);
  shareMat.needsUpdate = true;
}

async function startStream(mode) {
  if (!navigator.mediaDevices) throw new Error('unsupported');
  const stream = mode === 'cam'
    ? await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
    : await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: false });

  stopStream();
  shareStream = stream;

  if (!shareVideo) {
    shareVideo = document.createElement('video');
    shareVideo.muted = true;
    shareVideo.playsInline = true;
    shareVideo.autoplay = true;
  }
  shareVideo.srcObject = stream;
  await shareVideo.play().catch(() => {});

  shareTexture = new THREE.VideoTexture(shareVideo);
  shareTexture.minFilter = THREE.LinearFilter;
  shareTexture.magFilter = THREE.LinearFilter;
  shareTexture.format = THREE.RGBFormat;
  if (mode === 'cam') { shareTexture.wrapS = THREE.RepeatWrapping; shareTexture.repeat.x = -1; shareTexture.offset.x = 1; }

  shareMat.map = shareTexture;
  shareMat.color.setHex(0xffffff);
  shareMat.opacity = 1;
  shareMat.needsUpdate = true;

  // the visitor can stop sharing from the browser's own bar
  stream.getVideoTracks()[0].addEventListener('ended', () => {
    window.spacesUI && window.spacesUI.onShareEnded && window.spacesUI.onShareEnded();
  });
  return stream;
}
const shareMat = new THREE.MeshBasicMaterial({ color:0x061722, transparent:true, opacity:0.92 });
const shareScreen = new THREE.Mesh(new THREE.PlaneGeometry(7.1, 4), shareMat);
shareScreen.position.set(0, 3.4, -9.5);
const shareFrame = new THREE.Mesh(
  new THREE.PlaneGeometry(7.35, 4.25),
  new THREE.MeshBasicMaterial({ color:CYAN, transparent:true, opacity:0.22 })
);
shareFrame.position.set(0, 3.4, -9.56);
const shareGlow = new THREE.PointLight(CYAN, 0, 22);
shareGlow.position.set(0, 3.4, -8);
scene.add(shareGlow);

const PIECES = {
  screen: () => { const g = new THREE.Group(); g.add(shareScreen, shareFrame); return g; },
  podium: () => {
    const g = new THREE.Group();
    const p = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 1.05, 1.15, 28),
      new THREE.MeshStandardMaterial({ color:0x10222f, emissive:CYAN, emissiveIntensity:0.12, roughness:0.6 })
    );
    p.position.set(-3.4, 0.575, -6);
    const t = new THREE.Mesh(
      new THREE.RingGeometry(0.86, 1.0, 30).rotateX(-Math.PI/2),
      new THREE.MeshBasicMaterial({ color:CYAN, transparent:true, opacity:0.6 })
    );
    t.position.set(-3.4, 1.16, -6);
    g.add(p, t); return g;
  },
  seating: () => {
    const g = new THREE.Group();
    for (let i = 0; i < 7; i++) {
      const a = -0.9 + i * 0.3;
      const s = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.42, 1.05),
        new THREE.MeshStandardMaterial({ color:0x0d1d29, emissive:CYAN, emissiveIntensity:0.06, roughness:0.8 })
      );
      s.position.set(Math.sin(a) * 6.2, 0.21, -Math.cos(a) * 6.2 + 1.5);
      s.rotation.y = -a;
      g.add(s);
    }
    return g;
  },
};
const live = {};

function togglePiece(name, on) {
  if (on && !live[name]) { live[name] = PIECES[name](); placed.add(live[name]); }
  else if (!on && live[name]) { placed.remove(live[name]); delete live[name]; }
}

/* ── guest intelligence: they notice you, and they answer ───────────── */
const cues = [];   // scheduled follow-ups, drained in the loop

function speak(g, text, hold) {
  const dur = hold || 5200;
  g.bubble.textContent = text;
  g.bubbleUntil = t + dur;
  g.holdUntil = t + dur + 900;        // stop drifting while they are talking to you
  g.tag.classList.add('is-talking');
  clearTimeout(g._tagT);
  g._tagT = setTimeout(() => g.tag.classList.remove('is-talking'), dur);
}
/* a talk line is authored as its own sentence, so it needs lowercasing when it
   trails a name — except where the first word is a proper noun or the pronoun I */
function afterName(line) {
  var keep = ['I ', "I'", 'WASD', 'ILLUSORR', 'Nanotern'];
  if (line === 'I' || keep.some(function (w) { return line.indexOf(w) === 0; })) return line;
  return line.charAt(0).toLowerCase() + line.slice(1);
}
function cue(g, text, at, hold) { if (chatter) cues.push({ g, text, at: t + at, hold }); }
function drainCues() {
  for (let i = cues.length - 1; i >= 0; i--) {
    if (t < cues[i].at) continue;
    const c = cues.splice(i, 1)[0];
    if (chatter) speak(c.g, c.text, c.hold);
  }
}

/* someone else nearby picks the thread up, so you are talked *around*, not at */
const ASIDES = {
  Begum:  ['Begum is right — try it from where you are standing.', 'She set most of this up.'],
  Zeynep: ['Zeynep has the deck running if you want to look.', 'Watch the surface, she just retuned it.'],
  Kerem:  ['Kerem only got here a minute ago.', 'He came in through a world code.'],
};
function loopIn(speaker) {
  if (!chatter) return;
  const other = guests.find((x) =>
    x !== speaker &&
    t > (x.holdUntil || 0) &&
    Math.hypot(x.mesh.position.x - state.pos.x, x.mesh.position.z - state.pos.z) < 14
  );
  if (!other) return;
  const lines = ASIDES[speaker.n] || [];
  if (!lines.length) return;
  cue(other, lines[speaker.said % lines.length], 3400, 4200);
}
function pick(list, g) {
  const s = list[g.said % list.length];
  g.said++;
  return s;
}

const NEAR = 8.5;
let chatter = true;   // the canned layer, off while a live conversation is open
function proximity() {
  guests.forEach((g) => {
    const d = Math.hypot(g.mesh.position.x - state.pos.x, g.mesh.position.z - state.pos.z);
    const near = d < NEAR;
    if (near && !g.near) {
      g.near = true;
      if (!chatter) return;
      speak(g, pick(g.greet, g), 4600);
      cue(g, YOU + ', ' + afterName(pick(g.talk, g)), 5200, 5600);
      loopIn(g);
    } else if (!near && g.near && d > NEAR + 2.5) {
      g.near = false;
      if (chatter) speak(g, g.bye, 2400);
    }
    g.turn = near ? 1 : 0;
  });
}

/* click a guest to talk to them */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt = null;
const stageEl = document.getElementById('stage');
stageEl.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY }; });
stageEl.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 6 || (e.target.closest && e.target.closest('.ui'))) return;  // a drag, not a click
  ndc.x = (e.clientX / innerWidth) * 2 - 1;
  ndc.y = -(e.clientY / innerHeight) * 2 + 1;
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(guests.map((g) => g.mesh), true)[0];
  if (!hit) return;
  const g = guests.find((x) => {
    let o = hit.object;
    while (o) { if (o === x.mesh) return true; o = o.parent; }
    return false;
  });
  if (g) {
    if (window.spacesUI && window.spacesUI.openTalk) {
      window.spacesUI.openTalk(g.n);
    } else {
      speak(g, pick(g.talk, g), 6200);
      loopIn(g);
    }
  }
});

/* ───────────────────────────── dust ───────────────────────────────── */
const DUST = 900;
const dpos = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  const r = Math.random() * 46 + 2, a = Math.random() * Math.PI * 2;
  dpos[i*3] = Math.cos(a) * r;
  dpos[i*3+1] = Math.random() * 26;
  dpos[i*3+2] = Math.sin(a) * r;
}
const dgeo = new THREE.BufferGeometry();
dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));

/* The rise is a shader, not a JS loop: it used to rewrite 2,700 floats and
   re-upload the whole buffer every frame. Now the GPU derives each particle's
   height from one time uniform and the buffer never changes. */
const dustUniforms = {
  uTime:    { value: 0 },
  uColor:   { value: new THREE.Color(0x9fd7ff) },
  uOpacity: { value: 0.5 },
  uSize:    { value: 0.075 },
};
const dust = new THREE.Points(dgeo, new THREE.ShaderMaterial({
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, dustUniforms]),
  transparent: true,
  depthWrite: false,
  fog: true,
  vertexShader: `
    uniform float uTime;
    uniform float uSize;
    #include <fog_pars_vertex>
    void main() {
      vec3 p = position;
      p.y = mod(p.y + uTime * 0.45, 26.0);
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = uSize * 300.0 / -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }`,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    #include <fog_pars_fragment>
    void main() {
      vec2 c = gl_PointCoord - 0.5;
      if (dot(c, c) > 0.25) discard;
      gl_FragColor = vec4(uColor, uOpacity);
      #include <fog_fragment>
    }`,
}));
dust.frustumCulled = false;
// the surface presets tint the dust, so give them the same handles as before
Object.defineProperty(dust.material, 'color',   { get: () => dust.material.uniforms.uColor.value });
Object.defineProperty(dust.material, 'opacity', {
  get: () => dust.material.uniforms.uOpacity.value,
  set: (v) => { dust.material.uniforms.uOpacity.value = v; },
});
scene.add(dust);

/* ───────────────────────────── controls ───────────────────────────── */
const state = {
  yaw: 0, pitch: -0.03, dist: 0,
  pos: new THREE.Vector3(0, 1.7, 6),
  vel: new THREE.Vector3(),
  keys: Object.create(null),
  move: { x: 0, y: 0 },
  dragging: false, lx: 0, ly: 0,
  world: 0, mic: true, share: 'off',
};

const stage = document.getElementById('stage');
stage.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.ui')) return;
  state.dragging = true; state.lx = e.clientX; state.ly = e.clientY;
  document.body.classList.add('dragging');
  stage.setPointerCapture(e.pointerId);
});
addEventListener('pointerup', (e) => {
  state.dragging = false; document.body.classList.remove('dragging');
  try { stage.releasePointerCapture(e.pointerId); } catch (_) {}
});
addEventListener('pointermove', (e) => {
  if (!state.dragging) return;
  state.yaw   -= (e.clientX - state.lx) * 0.0032;
  state.pitch -= (e.clientY - state.ly) * 0.0026;
  state.pitch = Math.max(-0.62, Math.min(0.5, state.pitch));
  state.lx = e.clientX; state.ly = e.clientY;
});
addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  state.keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape') window.spacesUI && window.spacesUI.closeAll();
});
addEventListener('keyup', (e) => { state.keys[e.key.toLowerCase()] = false; });
/* Thumbstick: drag the nub, release to spring back. Kept in the field rather
   than the HUD because it writes straight into the traverse state. */
(function stick() {
  const el = document.getElementById('stick');
  if (!el) return;
  const nub = document.getElementById('stickNub');
  const R = 36;
  let id = null;

  function at(e) {
    const r = el.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const d = Math.hypot(dx, dy);
    if (d > R) { dx *= R / d; dy *= R / d; }
    nub.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    state.move.x = dx / R;
    state.move.y = dy / R;
  }
  function release() {
    id = null;
    el.classList.remove('is-live');
    nub.style.transform = '';
    state.move.x = state.move.y = 0;
  }
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    id = e.pointerId;
    el.classList.add('is-live');
    el.setPointerCapture(id);
    at(e);
  });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === id) at(e); });
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
})();

stage.addEventListener('wheel', (e) => {
  e.preventDefault();
  camera.fov = Math.max(34, Math.min(78, camera.fov + Math.sign(e.deltaY) * 2.4));
  camera.updateProjectionMatrix();
}, { passive:false });

/* ───────────────────────────── world swap ─────────────────────────── */
const flash = document.getElementById('flash');

function setWorld(i, warp) {
  state.world = i;
  const w = WORLDS[i];
  const apply = () => {
    if (cycMat.map) cycMat.map.dispose();
    cycMat.map = skyTexture(w.key);
    cycMat.needsUpdate = true;
    scene.fog.color.setHex(w.fog);
    renderer.setClearColor(w.fog, 1);
    dome.material.color.setHex(w.fog);
    groundUniforms.uBase.value.setHex(w.key).multiplyScalar(0.42);
  };
  if (warp) {
    flash.classList.add('on');
    setTimeout(() => { apply(); }, 170);
    setTimeout(() => flash.classList.remove('on'), 300);
  } else { apply(); }
  window.spacesUI && window.spacesUI.onWorld(i, w);
}

/* ───────────────────────────── loop ───────────────────────────────── */
const rd = {
  dest: document.getElementById('r-dest'),
  coord: document.getElementById('r-coord'),
  guests: document.getElementById('r-guests'),
  fps: document.getElementById('r-fps'),
  net: document.getElementById('r-net'),
  perf: document.getElementById('menuPerf'),
};

/* Frame rate, sampled over a second so the number is readable rather than
   twitching every frame. Both gauges write to the DOM at most once a second —
   the coordinate readout used to write 60 times a second for no benefit. */
let fpsFrames = 0, fpsSince = 0, readoutAt = 0;

function grade(el, value, warn, bad) {
  el.classList.toggle('warn', value <= warn && value > bad);
  el.classList.toggle('bad', value <= bad);
}

/* Link speed: the Network Information API where it exists, otherwise derived
   from what the page already downloaded, via Resource Timing — no extra
   request, so measuring the connection never costs the visitor bandwidth. */
function measuredMbps() {
  if (!performance.getEntriesByType) return null;
  const res = performance.getEntriesByType('resource')
    .filter((r) => r.transferSize > 20000 && r.duration > 8);
  if (!res.length) return null;
  const best = res.reduce((a, b) =>
    (b.transferSize / b.duration) > (a.transferSize / a.duration) ? b : a);
  return (best.transferSize * 8) / (best.duration / 1000) / 1e6;
}

function readNet() {
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  let mbps = c && c.downlink ? c.downlink : measuredMbps();
  if (!mbps) { rd.net.textContent = 'unavailable'; return; }
  const rtt = c && c.rtt ? '  ·  ' + Math.round(c.rtt) + ' ms' : '';
  rd.net.textContent = (mbps >= 10 ? Math.round(mbps) : mbps.toFixed(1)) + ' Mbps' + rtt;
  grade(rd.net, mbps, 5, 1.5);
}
setTimeout(readNet, 1200);
setInterval(readNet, 8000);
const conn = navigator.connection;
if (conn && conn.addEventListener) conn.addEventListener('change', readNet);
const clock = document.getElementById('clock');
const tmp = new THREE.Vector3();
let t = 0, lastClock = '';

let prev = 0;

/* The scene kept rendering at full rate while scrolled past and while the tab
   was in the background: measured 98 draw calls a second in view and 91 with
   the canvas nowhere near the viewport. On a laptop that is a fan spinning up
   for pixels nobody can see. The loop keeps ticking so state stays warm, but
   the render call is skipped when there is nothing to look at. */
let onScreen = true;
if ('IntersectionObserver' in window) {
  new IntersectionObserver(
    function (es) { onScreen = es[0].isIntersecting; },
    { rootMargin: '120px' }
  ).observe(renderer.domElement);
}
function visible() { return onScreen && !document.hidden; }

function frame(now) {
  // under an XR session the headset drives the loop, so don't self-schedule
  if (!renderer.xr.isPresenting) requestAnimationFrame(frame);
  t = now || 0;
  const dt = Math.min((t - prev) / 1000, 0.05);
  prev = t;
  stepTweens(dt);

  /* traverse */
  const sp = (state.keys['shift'] ? 0.16 : 0.085);
  let f = (state.keys['w'] || state.keys['arrowup'] ? 1 : 0) - (state.keys['s'] || state.keys['arrowdown'] ? 1 : 0);
  let s = (state.keys['d'] || state.keys['arrowright'] ? 1 : 0) - (state.keys['a'] || state.keys['arrowleft'] ? 1 : 0);
  if (state.move.x || state.move.y) { f = -state.move.y; s = state.move.x; }
  if (f || s) {
    state.vel.x += (Math.sin(state.yaw) * -f + Math.cos(state.yaw) * s) * sp;
    state.vel.z += (Math.cos(state.yaw) * -f - Math.sin(state.yaw) * s) * sp;
  }
  state.vel.multiplyScalar(0.86);
  state.pos.add(state.vel);
  const d = Math.hypot(state.pos.x, state.pos.z);
  if (d > 44) { state.pos.x *= 44 / d; state.pos.z *= 44 / d; }

  if (state.yawTarget !== undefined) {
    state.yaw += (state.yawTarget - state.yaw) * 0.07;
    if (Math.abs(state.yawTarget - state.yaw) < 0.004 || state.dragging) delete state.yawTarget;
  }

  const ground0 = groundAt(state.pos.x, state.pos.z);
  camera.position.set(state.pos.x, ground0 + state.pos.y + Math.sin(t * 0.0012) * 0.045, state.pos.z);
  camera.rotation.set(state.pitch, state.yaw, 0, 'YXZ');

  ring.position.set(state.pos.x, ground0 + 0.03, state.pos.z);
  groundUniforms.uPlayer.value.set(state.pos.x, 0, state.pos.z);
  ring.scale.setScalar(state.mic ? 1 + Math.sin(t * 0.005) * 0.06 : 1);
  ring.material.opacity = state.mic ? 0.42 + Math.sin(t * 0.005) * 0.14 : 0.16;

  drainCues();
  proximity();

  /* guests drift, tags project to screen space */
  guests.forEach((g, i) => {
    if (t > (g.holdUntil || 0)) g.a += g.s * 16;
    const gx = Math.cos(g.a) * g.r, gz = Math.sin(g.a) * g.r;
    g.mesh.position.set(gx, groundAt(gx, gz), gz);
    const faceAway = -g.a + Math.PI / 2;
    const faceYou = Math.atan2(state.pos.x - g.mesh.position.x, state.pos.z - g.mesh.position.z);
    let want = faceAway;
    if (g.turn) {
      let dd = faceYou - faceAway;
      while (dd >  Math.PI) dd -= Math.PI * 2;
      while (dd < -Math.PI) dd += Math.PI * 2;
      want = faceAway + dd;
    }
    let cy = g.mesh.rotation.y;
    while (want - cy >  Math.PI) want -= Math.PI * 2;
    while (want - cy < -Math.PI) want += Math.PI * 2;
    g.mesh.rotation.y = cy + (want - cy) * 0.06;
    g.mesh.children[1].material.opacity = g.turn ? 0.85 : 0.45;
    g.mesh.children[0].position.y = 1.0 + Math.sin(t * 0.0016 + i) * 0.06;
    if (g.model) g.model.rotation.y += 0.0032;

    tmp.set(g.mesh.position.x, g.mesh.position.y + 1.95, g.mesh.position.z).project(camera);
    const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.25 && Math.abs(tmp.y) < 1.25;
    const x = (tmp.x * 0.5 + 0.5) * innerWidth;
    const y = (-tmp.y * 0.5 + 0.5) * innerHeight;
    const showTag = vis ? 1 : 0;
    const showBub = (vis && t < g.bubbleUntil) ? 1 : 0;
    if (showTag !== g._vis) { g.tag.style.opacity = showTag; g._vis = showTag; }
    if (showBub !== g._bvis) { g.bubble.style.opacity = showBub; g._bvis = showBub; }
    if (showTag || showBub) {
      const rx = Math.round(x), ry = Math.round(y);
      if (rx !== g._x || ry !== g._y) {          // sub-pixel moves are invisible
        g.tag.style.transform = 'translate(-50%,-50%) translate(' + rx + 'px,' + ry + 'px)';
        g.bubble.style.transform = 'translate(-50%,-100%) translate(' + rx + 'px,' + (ry - 26) + 'px)';
        g._x = rx; g._y = ry;
      }
    }
  });

  dust.material.uniforms.uTime.value = t * 0.001;

  shareGlow.intensity = state.share === 'off' ? 0 : 0.9 + Math.sin(t * 0.004) * 0.15;

  if (shareVideo && shareVideo.videoWidth && state.share !== 'off') {
    const ar = shareVideo.videoWidth / shareVideo.videoHeight;
    if (Math.abs(ar - shareScreen.scale.x / shareScreen.scale.y) > 0.01) {
      const h = 4, w = Math.min(9.2, h * ar);
      shareScreen.scale.set(w / 7.1, (w / ar) / 4, 1);
      shareFrame.scale.set((w + 0.25) / 7.35, ((w / ar) + 0.25) / 4.25, 1);
    }
  }

  /* readout, once a second rather than once a frame */
  fpsFrames++;
  if (t - readoutAt > 1000) {
    const fps = Math.round(fpsFrames * 1000 / (t - (fpsSince || t - 1000)));
    rd.fps.textContent = fps + ' fps';
    grade(rd.fps, fps, 45, 25);
    if (rd.perf) rd.perf.textContent = fps + ' fps  ·  ' + (rd.net.textContent || '');
    fpsFrames = 0; fpsSince = t; readoutAt = t;

    // a sustained low frame rate drops the render scale before it drops frames
    if (fps > 0 && !renderer.xr.isPresenting) {
      const cap = Math.min(devicePixelRatio, 2);
      const want = fps < 30 ? Math.min(cap, 1) : fps < 45 ? Math.min(cap, 1.25) : cap;
      if (Math.abs(want - renderer.getPixelRatio()) > 0.05) renderer.setPixelRatio(want);
    }

    rd.coord.textContent = state.pos.x.toFixed(1) + ' · ' + state.pos.z.toFixed(1);
    const now2 = new Date();
    const cs = [now2.getHours(), now2.getMinutes(), now2.getSeconds()].map((v) => String(v).padStart(2, '0')).join(':');
    if (cs !== lastClock) { clock.textContent = cs; lastClock = cs; }
  }

  // XR drives its own presentation, so never gate a headset session
  if (visible() || renderer.xr.isPresenting) renderer.render(scene, camera);
}
requestAnimationFrame(frame);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* ───────────────────────────── bridge for the HUD ─────────────────── */
window.spacesField = {
  WORLDS,
  setWorld,
  place: togglePiece,
  isPlaced: (n) => !!live[n],
  async setShare(mode) {
    if (mode === 'off') {
      state.share = 'off';
      stopStream();
      togglePiece('screen', false);
      return true;
    }
    togglePiece('screen', true);
    try {
      await startStream(mode);
      state.share = mode;
      return true;
    } catch (err) {
      // permission denied or picker dismissed: leave the surface, keep it dark
      state.share = 'off';
      stopStream();
      throw err;
    }
  },
  setMic(on) { state.mic = on; },
  async enterVR() {
    if (!navigator.xr) throw new Error('no webxr');
    const session = await navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
    });
    await renderer.xr.setSession(session);
    // the loop is driven by the headset's own clock while a session is live
    renderer.setAnimationLoop((now) => frame(now));
    session.addEventListener('end', () => {
      renderer.setAnimationLoop(null);
      camera.position.set(state.pos.x, state.pos.y, state.pos.z);
      requestAnimationFrame(frame);
    });
    return session;
  },
  speakAs(name, text) {
    const g = guests.find((x) => x.n === name) || guests[0];
    speak(g, text, 5200);
  },
  say(name, text) {
    const g = guests.find((x) => x.n === name) || guests[0];
    g.bubble.textContent = text;
    g.bubbleUntil = t + 5200;
    /* turn toward the speaker, else the bubble fires behind the camera */
    const dx = g.mesh.position.x - state.pos.x;
    const dz = g.mesh.position.z - state.pos.z;
    let want = Math.atan2(-dx, -dz);
    while (want - state.yaw >  Math.PI) want -= Math.PI * 2;
    while (want - state.yaw < -Math.PI) want += Math.PI * 2;
    state.yawTarget = want;
  },
  guestCount: () => guests.length + 1,
  persona(name) {
    const g = guests.find((x) => x.n === name);
    if (!g) return null;
    return { name: g.n, role: g.role, lines: g.talk };
  },
  names: () => guests.map((g) => g.n),
  lookAt(name) {
    const g = guests.find((x) => x.n === name);
    if (!g) return;
    const dx = g.mesh.position.x - state.pos.x, dz = g.mesh.position.z - state.pos.z;
    let want = Math.atan2(-dx, -dz);
    while (want - state.yaw >  Math.PI) want -= Math.PI * 2;
    while (want - state.yaw < -Math.PI) want += Math.PI * 2;
    state.yawTarget = want;
    g.holdUntil = t + 20000;
  },
  hold(name, ms) {
    const g = guests.find((x) => x.n === name);
    if (g) g.holdUntil = t + (ms || 8000);
  },
  worldName: () => WORLDS[state.world].n,
  setChatter(on) {
    chatter = on;
    if (!on) {
      cues.length = 0;
      guests.forEach((g) => { g.bubbleUntil = 0; });
    }
  },
  SURFACES,
  setSurface,
  surfaceIndex: () => surfaceIx,
};

setSurface(0);
setWorld(0, false);
rd.guests.textContent = String(guests.length + 1);

/* boot out once the first render is up */
setTimeout(() => document.getElementById('boot').classList.add('gone'), 700);
})();
