/* ══ Disney+ pitch diagrams. Every drawing here is generated geometry, in the
      language of the 2022 proposal boards: cellular (hex) plans, hairline
      technical annotation, HUD chrome. ══ */
(() => {
const SVG = 'http://www.w3.org/2000/svg';
const el = (n, a = {}) => { const e = document.createElementNS(SVG, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
const HAIR = 'rgba(238,241,251,.30)', HAIR2 = 'rgba(238,241,251,.14)', INK = 'rgba(238,241,251,.62)';
const FILLS = ['#0E1A57', '#123A78', '#14515F', '#0B2E63', '#17414F'];

/* pointy-top hex */
function hexPts(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 6; i++) { const a = Math.PI / 180 * (60 * i - 30); p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  return p;
}
const hexStr = (cx, cy, r) => hexPts(cx, cy, r).map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
const axial = (q, r, R) => [R * Math.sqrt(3) * (q + r / 2), R * 1.5 * r];

function svgIn(host, vb) {
  host.innerHTML = '';
  const s = el('svg', { viewBox: vb, preserveAspectRatio: 'xMidYMid meet' });
  host.appendChild(s);
  return s;
}
function label(s, x, y, t, anchor = 'start', size = 11, fill = INK) {
  const e = el('text', { x, y, 'text-anchor': anchor, fill, 'font-family': 'Outfit, system-ui, sans-serif', 'font-size': size, 'letter-spacing': '1.2' });
  e.textContent = t; s.appendChild(e); return e;
}

/* ── 1 · typology boards ─────────────────────────────────────────
   Six typologies from the proposal, each in the board's HUD frame with a
   drop slot for its render. Specs are the proposal's own scoring. */
const TYPO = [
  ['Modular', 1, 1], ['Angular', 1, 1], ['Alien', 0, 1],
  ['Pure Form', 0, 0], ['Swirl', 0, 0], ['Capsules', 1, 1]
];
const grid = document.getElementById('typoGrid');
if (grid) {
  grid.innerHTML = TYPO.map(([name, sc, ad], i) => `<button type="button" class="typo${i === 0 ? ' is-sel' : ''}">
    <div class="typo-slot">
      <image-slot id="disney-typo-${i + 1}" src="../assets/img/slots/disney-typo-${i + 1}.webp" shape="rect" placeholder="${name} render"></image-slot>
      <svg class="typo-hud" viewBox="0 0 271 347" aria-hidden="true">
        <path d="M8 30 V14 A6 6 0 0 1 14 8 H30" /><path d="M241 8 H257 A6 6 0 0 1 263 14 V30" />
        <path d="M263 317 V333 A6 6 0 0 1 257 339 H241" /><path d="M30 339 H14 A6 6 0 0 1 8 333 V317" />
        <path d="M52 8 H104" /><path d="M167 8 H219" /><path d="M52 339 H104" /><path d="M167 339 H219" />
        <path d="M8 132 V174" /><path d="M263 132 V174" />
      </svg>
    </div>
    <div class="t-name">${name}</div>
    <div class="t-spec">
      <div class="t-row${sc ? '' : ' no'}">Scalability<b>${sc ? 'Yes' : 'No'}</b></div>
      <div class="t-row${ad ? '' : ' no'}">Adaptibility<b>${ad ? 'Yes' : 'No'}</b></div>
      <div class="t-row">Brand Integration<b>Yes</b></div>
    </div></button>`).join('');
  grid.querySelectorAll('.typo').forEach(card => card.addEventListener('click', () => {
    grid.querySelectorAll('.typo').forEach(c => c.classList.remove('is-sel'));
    card.classList.add('is-sel');
  }));
}

/* ── 2 · generation map (3D MAP board) ───────────────────────────
   Growth follows the proposal's cluster: one cell, then the four-cell
   diamond, then outward. Cells are drawn as the plan drawing draws them:
   navy field, punched void, hairline edges with tick ends. */
const GENS = [
  { n: 1,   t: 'First Generation' },
  { n: 4,   t: 'Second Generation' },
  { n: 12,  t: 'Third Generation' },
  { n: 24,  t: 'Fourth Generation' },
  { n: 48,  t: 'Fifth Generation' },
  { n: 96,  t: 'Sixth Generation' }
];
const SEED = [[0, 0], [0, -1], [-1, 0], [-1, 1]];          /* the four-cell diamond */
/* live parameters: spacing and how tightly growth is allowed to pack */
const MAP_P = { gap: 1.26, maxDeg: 2, gen: 3 };
/* Organic growth: each new cell attaches to the cluster but is refused when it
   would pack a hole shut, so the field branches instead of filling in. */
function buildOrder(maxDeg) {
  const key = (q, r) => q + ':' + r;
  const NB = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const set = new Set(SEED.map(c => key(c[0], c[1])));
  const out = SEED.slice();
  const hash = (q, r) => { const v = Math.sin(q * 12.9898 + r * 78.233) * 43758.5453; return v - Math.floor(v); };
  const LIMIT = GENS[GENS.length - 1].n;
  while (out.length < LIMIT) {
    const cand = [];
    out.forEach(c => NB.forEach(n => {
      const q = c[0] + n[0], r = c[1] + n[1];
      if (set.has(key(q, r))) return;
      const deg = NB.reduce((a, m) => a + (set.has(key(q + m[0], r + m[1])) ? 1 : 0), 0);
      if (deg > maxDeg) return;
      const p = axial(q, r, 1);
      cand.push([q, r, Math.hypot(p[0], p[1]) * 0.55 + hash(q, r) * 1.6 + deg * 0.35]);
    }));
    if (!cand.length) break;
    cand.sort((a, b) => a[2] - b[2] || a[0] - b[0] || a[1] - b[1]);
    set.add(key(cand[0][0], cand[0][1]));
    out.push([cand[0][0], cand[0][1]]);
  }
  return out;
}
let ORDER = buildOrder(MAP_P.maxDeg);
const mapHost = document.getElementById('mapCanvas');
function drawMap(genIdx) {
  if (!mapHost) return;
  MAP_P.gen = genIdx;
  const GAP = MAP_P.gap;
  const VW = 1000, VH = 600, PAD = 62;
  const cells = ORDER.slice(0, GENS[genIdx].n);
  const showTicks = cells.length <= 48;
  /* one fixed cell size, sized so the largest generation fits: growth reads as growth */
  const big = ORDER.slice(0, GENS[GENS.length - 1].n).map(c2 => axial(c2[0], c2[1], GAP));
  const bx = Math.max.apply(null, big.map(p => p[0])) - Math.min.apply(null, big.map(p => p[0])) + 2;
  const by = Math.max.apply(null, big.map(p => p[1])) - Math.min.apply(null, big.map(p => p[1])) + 2;
  let R = Math.min((VW - PAD * 2) / bx, (VH - PAD * 2) / by);
  /* early generations get a gentle zoom so a single cell is not lost in the frame,
     capped so later generations still read as real growth */
  const own = cells.map(c2 => axial(c2[0], c2[1], GAP));
  const ox = Math.max.apply(null, own.map(p => p[0])) - Math.min.apply(null, own.map(p => p[0])) + 2;
  const oy = Math.max.apply(null, own.map(p => p[1])) - Math.min.apply(null, own.map(p => p[1])) + 2;
  R = Math.min(Math.min((VW - PAD * 2) / ox, (VH - PAD * 2) / oy), R * 2.6);
  const pts = cells.map(c2 => axial(c2[0], c2[1], R * GAP));
  const cxx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const cyy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const s = svgIn(mapHost, '0 0 ' + VW + ' ' + VH);
  const g0 = el('g', {});
  for (let x = 0; x <= VW; x += 50) g0.appendChild(el('line', { x1: x, y1: 0, x2: x, y2: VH, stroke: 'rgba(238,241,251,.05)', 'stroke-width': 1 }));
  for (let y = 0; y <= VH; y += 50) g0.appendChild(el('line', { x1: 0, y1: y, x2: VW, y2: y, stroke: 'rgba(238,241,251,.05)', 'stroke-width': 1 }));
  s.appendChild(g0);
  pts.forEach((p, i) => {
    const cx = VW / 2 + p[0] - cxx, cy = VH / 2 + p[1] - cyy;
    const g = el('g', {});
    g.style.opacity = 0; g.style.transition = 'opacity .55s ease';
    setTimeout(() => { g.style.opacity = 1; }, Math.min(1400, (cells.length > 24 ? 14 : 40) * i));
    g.appendChild(el('polygon', { points: hexStr(cx, cy, R), fill: '#14335E', stroke: 'rgba(74,132,196,.55)', 'stroke-width': 1 }));
    g.appendChild(el('circle', { cx: cx, cy: cy, r: R * 0.31, fill: 'rgba(233,236,242,.88)' }));
    /* tick ends on every edge, the plan drawing's signature */
    const v = hexPts(cx, cy, R), f = 0.22;
    for (let k = 0; showTicks && k < 6; k++) {
      const a = v[k], b = v[(k + 1) % 6];
      g.appendChild(el('line', { x1: a[0] + (b[0] - a[0]) * f, y1: a[1] + (b[1] - a[1]) * f, x2: a[0], y2: a[1], stroke: '#EEF1FB', 'stroke-width': 2.4 }));
      g.appendChild(el('line', { x1: b[0] - (b[0] - a[0]) * f, y1: b[1] - (b[1] - a[1]) * f, x2: b[0], y2: b[1], stroke: '#EEF1FB', 'stroke-width': 2.4 }));
    }
    if (i === 0) g.appendChild(el('circle', { cx: cx - R * 0.16, cy: cy - R * 0.05, r: Math.max(3, R * 0.11), fill: '#2BE3E8' }));
    s.appendChild(g);
  });
  /* board annotation */
  const b1 = 44, b2 = 40, x2 = VW - 44, y2 = VH - 40;
  s.appendChild(el('rect', { x: b1, y: b2, width: x2 - b1, height: y2 - b2, fill: 'none', stroke: HAIR2, 'stroke-width': 1, 'stroke-dasharray': '2 6' }));
  label(s, b1, b2 - 14, 'T Y P E   4 3 G', 'start', 15, 'rgba(238,241,251,.62)');
  label(s, x2, b2 - 14, 'S E C T O R   1 4 / 3 4 B', 'end', 15, 'rgba(238,241,251,.62)');
  label(s, b1, y2 + 24, '4 2 4 7 5 9 / 4 N', 'start', 15, 'rgba(238,241,251,.5)');
  label(s, x2, y2 + 24, GENS[genIdx].t.toUpperCase() + '   ·   ' + String(GENS[genIdx].n).padStart(2, '0') + ' CELLS', 'end', 15, 'rgba(238,241,251,.62)');
}
if (mapHost) {
  drawMap(3);
  document.querySelectorAll('.gen-btn').forEach((b, i) => b.addEventListener('click', () => {
    document.querySelectorAll('.gen-btn').forEach(x => x.classList.remove('is-on'));
    b.classList.add('is-on'); drawMap(i);
  }));
  document.querySelectorAll('.map-param').forEach(row => {
    row.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      row.querySelectorAll('button').forEach(x => x.classList.remove('is-on'));
      b.classList.add('is-on');
      if (b.dataset.gap) MAP_P.gap = +b.dataset.gap;
      if (b.dataset.deg) { MAP_P.maxDeg = +b.dataset.deg; ORDER = buildOrder(MAP_P.maxDeg); }
      drawMap(MAP_P.gen);
    }));
  });
}

/* ── 4 · spatial plan · the proposal's own plan drawing ─────────────
   The artwork carries its own leader lines; these fractions are the measured
   end-tick positions, so each name sits at the end of its own leader. */
const PLAN = [
  ['Lounge',               0.1931, 0.1426, 'l'],
  ['Gallery',              0.1063, 0.2993, 'l'],
  ['Spawn Point',          0.1299, 0.4024, 'l'],
  ['Auditorium 01',        0.1299, 0.4966, 'l'],
  ['Seating',              0.0591, 0.6440, 'l'],
  ['Auditorium 03',        0.1102, 0.8706, 'l'],
  ['Screen 1',             0.8691, 0.0428, 'r'],
  ['Product Display Unit', 0.7775, 0.1730, 'r'],
  ['Auditorium 02',        0.9983, 0.4725, 'r'],
  ['Info Booth',           0.8778, 0.7411, 'r']
];
const planHost = document.getElementById('planCanvas');
if (planHost) {
  const VW = 1560, VH = 1000, IW = 700, IH = 694, IX = 430, IY = 150;
  const s = svgIn(planHost, `0 0 ${VW} ${VH}`);
  const img = el('image', { x: IX, y: IY, width: IW, height: IH, preserveAspectRatio: 'xMidYMid meet' });
  img.setAttribute('href', '../assets/projects/v5/disney-spatial-plan.png');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '../assets/projects/v5/disney-spatial-plan.png');
  s.appendChild(img);
  const nodes = {};
  PLAN.forEach(([name, fx, fy, side]) => {
    const ax = IX + fx * IW, ay = IY + fy * IH;
    const t = label(s, side === 'l' ? ax - 18 : ax + 18, ay + 6, name.toUpperCase(), side === 'l' ? 'end' : 'start', 19, 'rgba(238,241,251,.7)');
    const focus = (on) => t.setAttribute('fill', on ? '#1FA0E5' : 'rgba(238,241,251,.7)');
    t.addEventListener('pointerenter', () => focus(true));
    t.addEventListener('pointerleave', () => focus(false));
    nodes[name] = focus;
  });
  document.querySelectorAll('.plan-legend [data-room]').forEach(btn => {
    const f = nodes[btn.dataset.room];
    if (!f) { btn.remove(); return; }
    btn.addEventListener('pointerenter', () => f(true));
    btn.addEventListener('pointerleave', () => f(false));
    btn.addEventListener('focus', () => f(true));
    btn.addEventListener('blur', () => f(false));
  });
}

/* ── 5 · spawn point · the proposal's own drawing ───────────────── */
const spawnHost = document.getElementById('spawnCanvas');
if (spawnHost) {
  const s = svgIn(spawnHost, '0 0 1668 1316');
  const img = el('image', { x: 0, y: 0, width: 1668, height: 1316, preserveAspectRatio: 'xMidYMid meet' });
  img.setAttribute('href', '../assets/projects/v5/disney-spawn-point.png');
  img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '../assets/projects/v5/disney-spawn-point.png');
  s.appendChild(img);
}

/* ── 6 · proposed spaces · the proposal's axonometric drawings ───── */
const SPACES = {
  theatre: { title: 'Theatre', cap: 'Large gatherings', access: 'Public · login required', img: 'space-office.png', ar: '1490/1238' },
  lounge:  { title: 'Lounge',  cap: 'Up to 50 people',  access: 'Public · members',        img: 'space-lounge.png',  ar: '1347/909' },
  meeting: { title: 'Meeting Room', cap: 'Up to 10 people', access: 'Private · lockable',  img: 'space-meeting.png', ar: '1316/947' },
  office:  { title: 'Office',  cap: 'Up to 20 people',  access: 'Private · lockable',      img: 'space-theatre.png', ar: '1514/816' }
};
function drawSpace(key) {
  const spec = SPACES[key], host = document.getElementById('spaceStage');
  if (!spec || !host) return;
  host.style.aspectRatio = 'auto';
  host.innerHTML = `<img src="../assets/projects/v5/${spec.img}" alt="${spec.title} axonometric" decoding="async">`;
  const cap = document.getElementById('spaceCap');
  if (cap) cap.innerHTML = `<span>${spec.title}</span><span>${spec.cap}</span><span>${spec.access}</span>`;
}
const spTabs = document.querySelectorAll('.sp-tabs button');
if (spTabs.length) {
  drawSpace('theatre');
  spTabs.forEach(b => b.addEventListener('click', () => {
    spTabs.forEach(x => x.classList.remove('is-on')); b.classList.add('is-on'); drawSpace(b.dataset.space);
  }));
}

/* ── 7 · theme cards: same skyline, three moods ──────────────────── */
document.querySelectorAll('.theme-sky').forEach(host => {
  const dark = host.dataset.mood !== 'white';
  const stroke = dark ? 'rgba(238,241,251,.5)' : 'rgba(10,14,34,.55)';
  const fill = host.dataset.mood === 'blue' ? 'rgba(31,160,229,.30)' : (dark ? 'rgba(238,241,251,.12)' : 'rgba(10,14,34,.14)');
  const s = svgIn(host, '0 0 320 200');
  [[80, 150, 42], [150, 132, 34], [214, 152, 38], [258, 128, 26], [116, 116, 24]].forEach(([x, y, r]) => {
    s.appendChild(el('polygon', { points: hexStr(x, y, r), fill, stroke, 'stroke-width': 1 }));
  });
  s.appendChild(el('line', { x1: 0, y1: 176, x2: 320, y2: 176, stroke, 'stroke-width': 1 }));
});
document.querySelectorAll('.theme-card').forEach(c => c.addEventListener('click', () => {
  document.querySelectorAll('.theme-card').forEach(x => x.classList.remove('is-on')); c.classList.add('is-on');
}));

/* ── 8 · interaction tiles ───────────────────────────────────────── */
const IX = [
  ['Screen Share', '<rect x="3" y="5" width="26" height="17"/><path d="M11 26h10"/>'],
  ['Spawn Point', '<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="3"/>'],
  ['AR', '<path d="M6 10l10-5 10 5v12l-10 5-10-5z"/><path d="M16 5v22"/>'],
  ['Media Links', '<path d="M13 19l6-6"/><path d="M10 22a5 5 0 010-7l3-3"/><path d="M22 10a5 5 0 010 7l-3 3"/>'],
  ['Teleport', '<ellipse cx="16" cy="24" rx="11" ry="4"/><path d="M16 6v14"/><path d="M11 11l5-5 5 5"/>'],
  ['Animation', '<circle cx="11" cy="16" r="7"/><circle cx="21" cy="16" r="7"/>'],
  ['PDF Share', '<path d="M8 4h12l5 5v19H8z"/><path d="M20 4v5h5"/>'],
  ['Pen Tool', '<path d="M6 26l4-10 12-12 4 4-12 12z"/><path d="M6 26l6-2"/>'],
  ['Object Upload', '<path d="M16 5l10 6v10l-10 6-10-6V11z"/><path d="M16 12v9"/><path d="M12 16l4-4 4 4"/>'],
  ['Product Display', '<rect x="7" y="9" width="18" height="14"/><path d="M4 27h24"/>'],
  ['Customise', '<circle cx="16" cy="16" r="10"/><path d="M16 6v20"/><path d="M6 16h20"/>'],
  ['Audio', '<path d="M12 12v8"/><path d="M16 8v16"/><path d="M20 11v10"/><path d="M24 14v4"/>']
];
const ixGrid = document.getElementById('ixGrid');
if (ixGrid) ixGrid.innerHTML = IX.map(([t, d], i) =>
  `<div class="ix"><span class="ix-n">${String(i + 1).padStart(2, '0')}</span><svg viewBox="0 0 32 32">${d}</svg><span class="ix-t">${t}</span></div>`).join('');

/* ── 9 · environment pipeline glyphs ─────────────────────────────── */
document.querySelectorAll('[data-pipe]').forEach((host, i) => {
  const s = svgIn(host, '0 0 200 70');
  const kind = host.dataset.pipe;
  if (kind === 'gen') for (let k = 0; k < 5; k++) s.appendChild(el('polygon', { points: hexStr(28 + k * 36, 40, 15), fill: k < 2 ? FILLS[1] : 'none', stroke: HAIR, 'stroke-width': 1 }));
  if (kind === 'data') for (let k = 0; k < 24; k++) s.appendChild(el('line', { x1: 12 + k * 7.6, y1: 62, x2: 12 + k * 7.6, y2: 62 - (8 + 44 * Math.abs(Math.sin(k * .7))), stroke: k % 3 ? HAIR2 : '#1FA0E5', 'stroke-width': 1 }));
  if (kind === 'tex') { for (let y = 0; y < 4; y++) for (let x = 0; x < 11; x++) s.appendChild(el('rect', { x: 12 + x * 17, y: 8 + y * 14, width: 15, height: 12, fill: (x + y) % 3 ? 'none' : FILLS[2], stroke: HAIR2, 'stroke-width': 1 })); }
  if (kind === 'opt') { s.appendChild(el('polygon', { points: hexStr(60, 36, 26), fill: 'none', stroke: HAIR, 'stroke-width': 1 })); s.appendChild(el('polygon', { points: hexStr(140, 36, 26), fill: FILLS[1], stroke: HAIR, 'stroke-width': 1 })); s.appendChild(el('path', { d: 'M94 36h14', stroke: '#1FA0E5', 'stroke-width': 1 })); s.appendChild(el('path', { d: 'M104 32l6 4-6 4', fill: 'none', stroke: '#1FA0E5', 'stroke-width': 1 })); }
});

/* ── reveal diagram blocks ───────────────────────────────────────── */
const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12 });
document.querySelectorAll('.dg, .frame-rail').forEach(n => io.observe(n));
setTimeout(() => document.querySelectorAll('.dg, .frame-rail').forEach(n => { const r = n.getBoundingClientRect(); if (r.top < innerHeight * 1.3) n.classList.add('is-in'); }), 2400);
})();
