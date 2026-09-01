/* Echoes of Light — live projection stage.
   The supplied model: one cluster of six coloured fin groups plus a floor
   plane, each group carrying its own translucent colour. Those colours are
   kept and lit from within, then a projection is thrown across the whole
   cluster: the pattern is painted into a canvas each frame and sampled in
   object space, so it slides over the fins rather than sticking to them. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const host = document.getElementById('echoStage3d');
if (host) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  // Fill-rate bound: ~7 stacked translucent panels each running procedural noise.
// On integrated GPUs resolution is the dominant cost, so cap at 1.
renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const rig = new THREE.Group();
  scene.add(rig);

  /* ── the beam, repainted each frame into a canvas ─────────────────── */
  const PW = 1024, PH = 512;
  const pc = document.createElement('canvas');
  pc.width = PW; pc.height = PH;
  const px = pc.getContext('2d');
  const projTex = new THREE.CanvasTexture(pc);
  projTex.colorSpace = THREE.SRGBColorSpace;
  projTex.wrapS = projTex.wrapT = THREE.RepeatWrapping;

  const ECHO_KEY = 'echoes.projection.v1';
  const state = { pattern: 'plain', flow: 1.0, glow: 1.0, tint: 0.0, finOpacity: 0.97, veilOpacity: 0.78, lineGlow: 1, lineHue: 0.60, patAmt: 1.0 };
  try {
    const saved = JSON.parse(localStorage.getItem(ECHO_KEY) || 'null');
    if (saved && typeof saved === 'object') Object.assign(state, saved);
  } catch (e) { /* corrupt entry, keep the defaults */ }
  state.save = () => { try { const { save, pat, ...rest } = state; localStorage.setItem(ECHO_KEY, JSON.stringify({ ...rest, pat })); } catch (e) {} };

  const BLOBS = [];
  for (let i = 0; i < 40; i++) {
    BLOBS.push({
      x: Math.random(), y: Math.random(),
      r: 0.018 + Math.random() * 0.060,
      vx: (Math.random() - 0.5) * 0.00045,
      vy: (Math.random() - 0.5) * 0.00032,
      ph: Math.random() * 6.283,
    });
  }

  function base(t) {
    const s = t * 0.00006;
    const g = px.createLinearGradient(0, 0, PW, PH);
    g.addColorStop(0.00, 'hsl(' + (222 + 12 * Math.sin(s)) + ',82%,46%)');
    g.addColorStop(0.38, 'hsl(' + (262 + 14 * Math.sin(s + 1.2)) + ',76%,44%)');
    g.addColorStop(0.72, 'hsl(' + (296 + 12 * Math.sin(s + 2.4)) + ',74%,44%)');
    g.addColorStop(1.00, 'hsl(' + (326 + 10 * Math.sin(s + 3.6)) + ',78%,48%)');
    px.globalCompositeOperation = 'source-over';
    px.fillStyle = g;
    px.fillRect(0, 0, PW, PH);
  }

  const PATTERNS = {
    bokeh(t) {
      px.globalCompositeOperation = 'lighter';
      for (const b of BLOBS) {
        b.x += b.vx * state.flow; b.y += b.vy * state.flow;
        if (b.x < -0.2) b.x = 1.2; if (b.x > 1.2) b.x = -0.2;
        if (b.y < -0.2) b.y = 1.2; if (b.y > 1.2) b.y = -0.2;
        const pulse = 0.78 + 0.22 * Math.sin(t * 0.0009 + b.ph);
        const h = 216 + b.x * 116;
        const cx = b.x * PW, cy = b.y * PH, r = b.r * PH * pulse;
        const rg = px.createRadialGradient(cx, cy, 0, cx, cy, r);
        rg.addColorStop(0, 'hsla(' + h + ',95%,82%,0.85)');
        rg.addColorStop(0.5, 'hsla(' + h + ',92%,74%,0.30)');
        rg.addColorStop(1, 'hsla(' + h + ',90%,70%,0)');
        px.fillStyle = rg;
        px.beginPath(); px.arc(cx, cy, r, 0, 6.2832); px.fill();
      }
    },
    marble(t) {
      px.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 9; i++) {
        const y = PH * (0.5 + 0.5 * Math.sin(t * 0.00013 * state.flow + i * 0.82));
        const gg = px.createLinearGradient(0, y - 130, 0, y + 130);
        gg.addColorStop(0, 'rgba(80,60,220,0)');
        gg.addColorStop(0.5, 'hsla(' + (232 + i * 12) + ',94%,72%,0.26)');
        gg.addColorStop(1, 'rgba(70,100,235,0)');
        px.fillStyle = gg;
        px.fillRect(0, y - 130, PW, 260);
      }
    },
    scan(t) {
      px.globalCompositeOperation = 'lighter';
      const off = (t * 0.05 * state.flow) % 46;
      for (let y = -46 + off; y < PH; y += 46) {
        const gg = px.createLinearGradient(0, y, 0, y + 22);
        gg.addColorStop(0, 'rgba(190,150,255,0)');
        gg.addColorStop(0.5, 'rgba(210,170,255,0.34)');
        gg.addColorStop(1, 'rgba(190,150,255,0)');
        px.fillStyle = gg;
        px.fillRect(0, y, PW, 22);
      }
      px.globalCompositeOperation = 'multiply';
      for (let y = -46 + off; y < PH; y += 46) { px.fillStyle = 'rgba(20,10,50,0.45)'; px.fillRect(0, y + 26, PW, 12); }
    },
    caustic(t) {
      px.globalCompositeOperation = 'lighter';
      const s = t * 0.0004 * state.flow;
      for (let i = 0; i < 5; i++) {
        px.beginPath();
        for (let x = 0; x <= PW; x += 16) {
          const u = x / PW;
          const y = PH * (0.5 + 0.34 * Math.sin(u * 9.0 + s + i * 1.3) * Math.cos(u * 4.0 - s * 0.7 + i));
          x === 0 ? px.moveTo(x, y) : px.lineTo(x, y);
        }
        px.strokeStyle = 'hsla(' + (228 + i * 22) + ',96%,78%,0.34)';
        px.lineWidth = 16 - i * 2;
        px.filter = 'blur(6px)';
        px.stroke();
        px.filter = 'none';
      }
    },
    plain() {},
  };

  function paint(t) {
    base(t);
    (PATTERNS[state.pattern] || PATTERNS.plain)(t);
    px.globalCompositeOperation = 'source-over';
    projTex.needsUpdate = true;
  }
  paint(0);

  /* ── lights: a cool key above, a warm magenta bounce below ────────── */
  scene.add(new THREE.AmbientLight(0x6a5adf, 0.55));
  const key = new THREE.DirectionalLight(0xd9c8ff, 0.9); key.position.set(2.5, 4, 3);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -5; key.shadow.camera.right = key.shadow.camera.top = 5;
  key.shadow.radius = 5; key.shadow.bias = -0.0012; scene.add(key);
  const fill = new THREE.PointLight(0xff4fd8, 1.3, 14, 2); fill.position.set(-2.2, -2.4, 1.6); scene.add(fill);
  const rimL = new THREE.PointLight(0x3d6bff, 3.0, 16, 2); rimL.position.set(2.6, 1.4, -2.4); scene.add(rimL);
  const back = new THREE.PointLight(0x00e0ff, 2.2, 16, 2); back.position.set(-1.4, 2.2, -3.0); scene.add(back);

  /* ── material: keep the model's colour, light it from inside ──────── */
  const shaders = [];
  const mats = { fin: [], veil: [], line: [] };
  const groups = [];            // one entry per material slot, for the panel
  state.pat = state.pat || {};  // slot -> pattern id
  let slot = 0;
  function dress(src) {
    const col = src.color ? src.color.clone() : new THREE.Color(0xffffff);
    const mySlot = slot++;
    const swirl = (src.name || '') === 'Material.009';
    // The white profile lines are outlines, not fabric: fading them just makes
    // them dirty. Let them keep full strength and add light instead.
    const hsl = { h: 0, s: 0, l: 0 }; col.getHSL(hsl);
    const isOutline = hsl.s < 0.16 && hsl.l > 0.7;
    if (isOutline) {
      const om = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(state.lineHue, 1, 0.62), transparent: true, opacity: state.lineGlow,
        blending: THREE.AdditiveBlending, depthWrite: false,
        side: THREE.DoubleSide, toneMapped: false,
      });
      mats.line.push(om);
      return om;
    }
    const m = new THREE.MeshPhysicalMaterial({
      color: col,
      transparent: true,
      // the pale swirl plane keeps some veil; the coloured fins go near-solid
      opacity: swirl ? state.veilOpacity : state.finOpacity,
      roughness: 0.42, metalness: 0.0,
      transmission: swirl ? 0.14 : 0.0, thickness: 0.6,
      side: THREE.DoubleSide, depthWrite: false,
      emissive: col.clone().multiplyScalar(0.34),
      emissiveIntensity: 1.0,
    });
    (swirl ? mats.veil : mats.fin).push(m);
    if (state.pat[mySlot] === undefined) state.pat[mySlot] = swirl ? 4 : (mySlot % 3 === 0 ? 1 : mySlot % 3 === 1 ? 2 : 3);
    groups.push({ slot: mySlot, hex: '#' + col.getHexString(), swirl });
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uProj = { value: projTex };
      sh.uniforms.uGlow = { value: state.glow };
      sh.uniforms.uTint = { value: state.tint };
      sh.uniforms.uTime = { value: 0 };
      sh.uniforms.uSlot = { value: mySlot };
      sh.uniforms.uSwirl = { value: swirl ? 1.0 : 0.0 };
      sh.uniforms.uPat = { value: state.pat[mySlot] };
      sh.uniforms.uPatAmt = { value: 1.0 };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\nvarying vec3 vObjN;\nvarying vec3 vVDir;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\n  vObj = position;\n  vObjN = normalize(normal);\n  vVDir = normalize((modelViewMatrix * vec4(transformed,1.0)).xyz);');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vObj;\nvarying vec3 vObjN;\nvarying vec3 vVDir;\nuniform sampler2D uProj;\nuniform float uGlow;\nuniform float uTint;\nuniform float uTime;\nuniform float uSlot;\nuniform float uSwirl;\nfloat hash21(vec2 p){ p = fract(p * vec2(233.34, 851.73)); p += dot(p, p + 23.45); return fract(p.x * p.y); }\nuniform float uPat;\nuniform float uPatAmt;\nfloat vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f); float a=hash21(i), b=hash21(i+vec2(1.0,0.0)), c=hash21(i+vec2(0.0,1.0)), d=hash21(i+vec2(1.0,1.0)); return mix(mix(a,b,f.x), mix(c,d,f.x), f.y); }\nfloat fbm(vec2 p){ float s=0.0; float a=0.5; for(int i=0;i<5;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }\nvec2 curl(vec2 p){ float e=0.055; float n1=fbm(p+vec2(0.0,e)); float n2=fbm(p-vec2(0.0,e)); float n3=fbm(p+vec2(e,0.0)); float n4=fbm(p-vec2(e,0.0)); return vec2(n1-n2, n4-n3)/(2.0*e); }\nfloat curlFlow(vec2 p, float t){ vec2 q=p; for(int i=0;i<4;i++){ q += curl(q*0.9 + t*0.05) * 0.085; } float band = fbm(q*1.6 + vec2(t*0.03, -t*0.02)); return 0.5 + 0.5*sin(band*7.0 + q.x*1.3 + q.y*0.9); }\nfloat bokeh(vec2 p, float t){ float acc=0.0; for(int i=0;i<3;i++){ float fi=float(i); float sc=2.1+fi*1.9; vec2 q=p*sc+vec2(fi*17.3, -t*(0.04+fi*0.02)); vec2 id=floor(q); vec2 f=fract(q)-0.5; float r=0.24+0.20*hash21(id+fi*3.1); float d=length(f-(vec2(hash21(id+5.2),hash21(id+9.7))-0.5)*0.5); float dot=smoothstep(r, r*0.30, d); acc=max(acc, dot*(0.55+0.45*hash21(id+1.7))); } return clamp(acc,0.0,1.0); }')
        .replace('#include <emissivemap_fragment>', [
          '#include <emissivemap_fragment>',
          // sample the beam in object space so it slides across the cluster
          'vec2 pUv = vec2(vObj.x * 0.30 + 0.5 + uTime * 0.008 + uSlot * 0.11, vObj.y * 0.16 + 0.55 + uSlot * 0.07);',
          'vec3 beam = texture2D(uProj, fract(pUv)).rgb;',
          // a projected pattern per group, so each colour carries its own figure
          'float ph = uSlot * 1.7;',
          'vec3 an = abs(normalize(vObjN));',
          'vec2 op = (an.z >= an.x && an.z >= an.y) ? vObj.xy : ((an.x >= an.y) ? vObj.zy : vObj.xz);',
          'float fig = 0.5;',
          'if (uPat < 0.5) { fig = 0.5; }',
          'else if (uPat < 1.5) { fig = bokeh(op * 0.55 + ph, uTime); }',
          'else if (uPat < 2.5) { vec2 w = op * 1.5 + vec2(fbm(op * 1.2 + uTime * 0.05), fbm(op * 1.2 + 7.3 - uTime * 0.04)) * 2.2; fig = 0.5 + 0.5 * sin(w.x * 2.1 + w.y * 1.4 + ph); }',
          'else if (uPat < 3.5) { fig = 0.5 + 0.5 * sin(op.x * (9.0 + uSlot) + fbm(op * 2.0) * 3.0 + uTime * 0.6 + ph); }',
          'else { fig = curlFlow(op * 1.15, uTime); }',
          'fig = mix(0.5, fig, uPatAmt);',
          'beam *= mix(1.0, 0.80 + 0.45 * fig, step(0.001, uTint));',
          // the figure is a texture on the cloth: it lightens the surface itself
          // and blooms on top, so it reads at the strength of the Blender frame.
          'float f2 = smoothstep(0.30, 0.86, fig);',
          // the figure tints the cloth a pale lilac rather than bleaching it white
          'vec3 tintc = mix(diffuseColor.rgb, vec3(0.80, 0.72, 1.0), 0.52);',
          'diffuseColor.rgb = mix(diffuseColor.rgb, tintc, clamp(f2 * uPatAmt * 0.85, 0.0, 1.0));',
          'totalEmissiveRadiance += (diffuseColor.rgb * 0.42 + vec3(0.13, 0.08, 0.22)) * f2 * 0.65 * uPatAmt;',
          // film grain, so the light reads as projected rather than painted
          'float grain = hash21(gl_FragCoord.xy + fract(uTime) * 137.0);',
          'beam *= 0.90 + grain * 0.20;',
          'float rim = pow(1.0 - abs(dot(normalize(vNormal), -vVDir)), 2.0);',
          'totalEmissiveRadiance = mix(totalEmissiveRadiance, beam, uTint * 0.72) * (0.55 + uGlow * 0.9);',
          'totalEmissiveRadiance += beam * rim * 0.85 * uGlow;',
        ].join('\n'));
      shaders.push(sh);
    };
    return m;
  }

  // Draco-aware: reads both the plain GLB and a Draco-compressed re-export.
  const draco = new DRACOLoader();
  draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  draco.setDecoderConfig({ type: 'js' });
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.load('../assets/projects/echoes/projections.glb?v=4', (gltf) => {
    const model = gltf.scene;
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.material = Array.isArray(o.material) ? o.material.map(dress) : dress(o.material);
      o.castShadow = true; o.receiveShadow = true;
      o.renderOrder = 2;
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    model.scale.setScalar(5.8 / Math.max(size.x, size.y, size.z));
    rig.add(model);
    host.classList.add('is-ready');
    buildPanel(state, groups);
  });

  function fit() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const d = 9.0 * Math.max(1, 1.4 / camera.aspect);
    camHome.set(d * 0.22, 0.5, d);
    camera.position.copy(camHome);
    camera.lookAt(camAim);
    camera.updateProjectionMatrix();
  }
  const camHome = new THREE.Vector3();
  const camAim = new THREE.Vector3(0.25, -0.05, 0);
  fit();
  new ResizeObserver(fit).observe(host);

  /* ── scroll turns the cluster, pointer nudges it ──────────────────── */
  const stageEl = host.closest('.echo-stage') || host;
  let scrollP = 0, mx = 0, my = 0, cx = 0, cy = 0;
  addEventListener('scroll', () => {
    const r = stageEl.getBoundingClientRect();
    const span = Math.max(1, r.height - innerHeight);
    scrollP = Math.min(1, Math.max(0, -r.top / span));
  }, { passive: true });
  addEventListener('pointermove', (e) => {
    mx = (e.clientX / innerWidth - 0.5) * 0.30;
    my = (e.clientY / innerHeight - 0.5) * 0.14;
  }, { passive: true });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Only run while the stage is actually on screen and the tab is visible;
  // the loop was rendering the full scene for the whole length of the page.
  let onScreen = true;
  new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; }, { rootMargin: '120px' }).observe(host);
  let last = 0, tPaint = 0;
  renderer.setAnimationLoop((t) => {
    if (!onScreen || document.hidden) return;
    if (t - last < 32) return;
    last = t;
    if (!reduce && state.tint > 0.001 && t - tPaint > 46) { paint(t); tPaint = t; }
    for (const sh of shaders) {
      sh.uniforms.uTime.value = t * 0.001 * state.flow;
      sh.uniforms.uGlow.value = state.glow;
      sh.uniforms.uTint.value = state.tint;
      sh.uniforms.uPat.value = state.pat[sh.uniforms.uSlot.value] ?? 0;
      sh.uniforms.uPatAmt.value = state.patAmt;
    }
    for (const m of mats.fin) m.opacity = state.finOpacity;
    for (const m of mats.veil) m.opacity = state.veilOpacity;
    for (const m of mats.line) { m.opacity = state.lineGlow; m.color.setHSL(state.lineHue, 1, 0.62); }
    cx += (mx - cx) * 0.05;
    cy += (my - cy) * 0.05;
    // enters from the right, three-quarter on, and swings toward centre
    rig.rotation.y = 2.02 + scrollP * Math.PI + cx + (reduce ? 0 : Math.sin(t * 0.00012) * 0.05);
    rig.rotation.x = 0.02 + cy - scrollP * 0.10;
    rig.position.x = -scrollP * 0.35;
    rig.position.y = -scrollP * 0.4;
    // one breath through the scroll: push in to the middle, pull back out
    const ease = Math.sin(Math.PI * scrollP);
    camera.position.copy(camHome).multiplyScalar(1 - 0.44 * ease);
    camera.position.y += ease * 0.55;
    camera.lookAt(camAim);
    renderer.render(scene, camera);
  });

}

/* ── tweak panel ────────────────────────────────────────────────────── */
function buildPanel(state, groups) {
  if (!document.getElementById('echo-tweaks-css')) {
    const st = document.createElement('style');
    st.id = 'echo-tweaks-css';
    st.textContent = "\n.echo-tweaks{ position:fixed; right:clamp(14px,2vw,28px); bottom:clamp(14px,2vw,28px); z-index:4000;\n  font-family:'Outfit',system-ui,sans-serif; color:#EAE6FF; width:250px; display:none }\n.echo-tweaks.is-open{ display:block }\n.et-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:11px 10px 11px 14px;\n  background:rgba(10,8,24,.74); backdrop-filter:blur(10px); border:1px solid rgba(234,230,255,.22); border-bottom:0;\n  font-size:10px; letter-spacing:.24em; text-transform:uppercase }\n.et-x{ background:transparent; border:0; color:rgba(234,230,255,.6); font-size:17px; line-height:1; cursor:pointer; padding:0 4px }\n.et-x:hover{ color:#EAE6FF }\n.et-body{ display:flex; flex-direction:column; gap:10px; padding:14px 14px 18px; max-height:64vh; overflow:auto;\n  background:rgba(10,8,24,.74); backdrop-filter:blur(10px); border:1px solid rgba(234,230,255,.22); border-top:0 }\n.echo-tweaks.is-open .et-body{ display:flex }\n.et-sec{ font-size:9px; letter-spacing:.26em; text-transform:uppercase; color:rgba(234,230,255,.42);\n  padding-bottom:6px; border-bottom:1px solid rgba(234,230,255,.14); margin-top:4px }\n.et-sec:first-child{ margin-top:0 }\n.et-row{ display:grid; grid-template-columns:64px 1fr; align-items:center; gap:10px;\n  font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; color:rgba(234,230,255,.7) }\n.et-row input[type=range]{ -webkit-appearance:none; appearance:none; width:100%; height:2px;\n  background:rgba(234,230,255,.28); outline:none; cursor:pointer }\n.et-row input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:11px; height:11px;\n  border-radius:50%; background:#EAE6FF; cursor:pointer }\n.et-row input[type=range]::-moz-range-thumb{ width:11px; height:11px; border:0; border-radius:50%; background:#EAE6FF; cursor:pointer }\n.et-grp{ display:grid; grid-template-columns:10px 1fr 84px; align-items:center; gap:9px;\n  font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:rgba(234,230,255,.72) }\n.et-acts{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px }\n.et-acts button{ background:transparent; border:1px solid rgba(234,230,255,.28); color:#EAE6FF; font:inherit;\n  font-size:9.5px; letter-spacing:.2em; text-transform:uppercase; padding:9px 6px; cursor:pointer; transition:background .3s ease, border-color .3s ease }\n.et-acts button:hover{ background:rgba(234,230,255,.14); border-color:rgba(234,230,255,.55) }\n.et-grp i{ width:10px; height:10px; border-radius:50%; display:block; box-shadow:0 0 8px currentColor }\n.et-grp select{ background:rgba(234,230,255,.08); border:1px solid rgba(234,230,255,.2); color:#EAE6FF;\n  font:inherit; font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; padding:5px 6px; cursor:pointer; border-radius:0 }\n.et-grp select option{ background:#12102a; color:#EAE6FF }\n@media (max-width:760px){ .echo-tweaks{ display:none } }\n";
    document.head.appendChild(st);
  }
  const p = document.createElement('div');
  p.className = 'echo-tweaks';
  const PATTERNS = ['None', 'Bokeh', 'Marble', 'Streak', 'Swirl'];
  const rows = groups.map((g) => `<label class="et-grp">
      <i style="background:${g.hex}"></i>
      <span>${g.swirl ? 'Veil' : 'Panel ' + (g.slot + 1)}</span>
      <select data-g="${g.slot}">${PATTERNS.map((n, i) => `<option value="${i}"${state.pat[g.slot] === i ? ' selected' : ''}>${n}</option>`).join('')}</select>
    </label>`).join('');
  p.innerHTML = `<div class="et-head"><span>Projection</span><button class="et-x" type="button" aria-label="Close">\u00d7</button></div>
    <div class="et-body">
      <div class="et-sec">Material</div>
      <label class="et-row"><span>Panels</span><input type="range" min="0.15" max="1" step="0.01" value="${state.finOpacity}" data-s="finOpacity"></label>
      <label class="et-row"><span>Veil</span><input type="range" min="0.1" max="1" step="0.01" value="${state.veilOpacity}" data-s="veilOpacity"></label>
      <label class="et-row"><span>Outline</span><input type="range" min="0" max="1.4" step="0.02" value="${state.lineGlow}" data-s="lineGlow"></label>
      <label class="et-row"><span>Line hue</span><input type="range" min="0" max="1" step="0.01" value="${state.lineHue}" data-s="lineHue"></label>
      <div class="et-sec">Light</div>
      <label class="et-row"><span>Glow</span><input type="range" min="0.2" max="2" step="0.05" value="${state.glow}" data-s="glow"></label>
      <label class="et-row"><span>Flow</span><input type="range" min="0" max="3" step="0.05" value="${state.flow}" data-s="flow"></label>
      <label class="et-row"><span>Pattern</span><input type="range" min="0" max="2" step="0.02" value="${state.patAmt}" data-s="patAmt"></label>
      <div class="et-sec">Patterns</div>
      ${rows}
      <div class="et-acts"><button type="button" data-act="save">Save</button><button type="button" data-act="reset">Reset</button></div>
    </div>`;
  document.body.appendChild(p);
  // host protocol: the panel only exists while Tweaks is on
  const dismiss = () => { p.classList.remove('is-open'); window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); };
  p.querySelector('.et-x').addEventListener('click', dismiss);
  window.addEventListener('message', (e) => {
    const t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') p.classList.add('is-open');
    else if (t === '__deactivate_edit_mode') p.classList.remove('is-open');
  });
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  p.querySelectorAll('[data-g]').forEach((s) => s.addEventListener('change', () => {
    state.pat[parseInt(s.dataset.g)] = parseInt(s.value);
  }));
  p.querySelectorAll('[data-s]').forEach((s) => s.addEventListener('input', () => { state[s.dataset.s] = parseFloat(s.value); }));
  const note = (msg) => { const b = p.querySelector('[data-act="save"]'); const old = b.textContent; b.textContent = msg; setTimeout(() => { b.textContent = old; }, 1100); };
  p.querySelector('[data-act="save"]').addEventListener('click', () => { state.save(); note('Saved'); });
  p.querySelector('[data-act="reset"]').addEventListener('click', () => {
    try { localStorage.removeItem('echoes.projection.v1'); } catch (e) {}
    location.reload();
  });
}
