/* ═══════════════════════════════════════════════════════════════════════
   COLLECTIVE — three interactive pieces
     1. swirl map        · member territories as ink whorls flowing to Abu Dhabi
     2. constellation    · the nine disciplines as a hoverable node field
     3. commissions board· open roles, fed from the data block below

   ── EDIT YOUR DATA HERE ──────────────────────────────────────────────
   TERRITORIES: `n` is member count, `disc` is which disciplines sit there.
   The discipline splits below are a first pass — correct them and the map,
   the filter and the totals all follow automatically.
   ═══════════════════════════════════════════════════════════════════════ */

const HUB = { name: 'Abu Dhabi', lon: 54.37, lat: 24.45 };

const TERRITORIES = [
  { key: 'tr', name: 'Türkiye',     n: 10, lon: 35.2,   lat: 39.0,  ids: ['792'],
    disc: ['3D artists', 'Character artists', 'Game developers', 'Technical artists', 'Motion designers'] },
  { key: 'ae', name: 'UAE',          n: 8,  lon: 54.0,   lat: 23.6,  ids: ['784'], home: true,
    disc: ['3D artists', 'Environment artists', 'Motion designers', 'Web developers', 'Producers'] },
  { key: 'eu', name: 'Europe',       n: 3,  lon: 9.5,    lat: 49.5,
    ids: ['276', '250', '380', '724', '528', '616', '826', '203', '752'],
    disc: ['Game developers', 'Technical artists', 'AI content creators'] },
  { key: 'id', name: 'Indonesia',    n: 3,  lon: 112.0,  lat: -2.0,  ids: ['360'],
    disc: ['3D artists', 'Environment artists', 'Character artists'] },
  { key: 'ca', name: 'Canada',       n: 1,  lon: -104.0, lat: 56.0,  ids: ['124'],
    disc: ['AI content creators'] },
  { key: 'us', name: 'United States', n: 1, lon: -98.0,  lat: 38.5,  ids: ['840'],
    disc: ['Web developers'] },
  { key: 'ph', name: 'Philippines',  n: 1,  lon: 122.0,  lat: 12.5,  ids: ['608'],
    disc: ['Motion designers'] },
  { key: 'eg', name: 'Egypt',        n: 1,  lon: 30.5,   lat: 26.5,  ids: ['818'],
    disc: ['3D artists'] }
];

const DISCIPLINES = [
  { name: '3D artists',          tools: 'Blender · Houdini · AI',           note: 'Asset build, look development and the shading that has to survive engine import.' },
  { name: 'Environment artists', tools: 'Unreal · Houdini · Megascans',     note: 'Worlds at scale, built procedurally so a set can be re-dressed rather than remade.' },
  { name: 'Character artists',   tools: 'ZBrush · Marvelous · Blender',     note: 'Anatomy, garment simulation and the rigs that let a character be reused across a run.' },
  { name: 'Game developers',     tools: 'Unreal · Unity · C++',             note: 'Playable builds, gameplay systems and the performance budget that keeps them shipping.' },
  { name: 'AI content creators', tools: 'ComfyUI · Runway · custom LoRAs',  note: 'Directed generation inside a pipeline, held to a brand look rather than left to chance.' },
  { name: 'Motion designers',    tools: 'After Effects · Cinema 4D',        note: 'Cutdowns, campaign motion and the edit cadence each platform actually rewards.' },
  { name: 'Technical artists',   tools: 'Python · Houdini · Blueprints',    note: 'The bridge discipline: tools, shaders and the automation that removes repeat labour.' },
  { name: 'Web developers',      tools: 'Three.js · WebGL · React',         note: 'Real-time work in the browser, where the constraint is bandwidth as much as craft.' },
  { name: 'Producers',           tools: 'Scoping · scheduling · QC',        note: 'Briefs turned into scopes, and scopes held to a date without burning the team.' }
];

/* commissions board — status: 'open' | 'filling' | 'closed' */
const COMMISSIONS = [
  { role: 'Environment artist',   disc: 'Environment artists', sector: 'Real estate',   basis: 'Per project', status: 'open',    note: 'Two interior sets, procedural re-dress across four unit types.' },
  { role: 'Character artist',     disc: 'Character artists',   sector: 'Gaming',        basis: 'Per project', status: 'open',    note: 'Hero character, groom and garment sim, engine-ready.' },
  { role: 'Motion designer',      disc: 'Motion designers',    sector: 'Beauty',        basis: 'Monthly run', status: 'open',    note: 'Ongoing social cadence, cutdowns from a monthly campaign shoot.' },
  { role: 'Technical artist',     disc: 'Technical artists',   sector: 'Studio tooling',basis: 'Retainer',    status: 'filling', note: 'Houdini asset pipeline, batch export and validation tooling.' },
  { role: 'AI content creator',   disc: 'AI content creators', sector: 'Fashion',       basis: 'Per project', status: 'filling', note: 'Directed generation against a fixed lookbook reference set.' },
  { role: '3D generalist',        disc: '3D artists',          sector: 'F&B',           basis: 'Monthly run', status: 'open',    note: 'Product renders on a monthly release calendar.' },
  { role: 'Real-time web build',  disc: 'Web developers',      sector: 'Culture',       basis: 'Per project', status: 'closed',  note: 'Browser configurator, WebGL. Filled from the database in March.' },
  { role: 'Sound designer',       disc: 'AI content creators', sector: 'Gaming',        basis: 'Per project', status: 'open',    note: 'Ambience beds and interaction sound. Generative tools welcome, the mix is still yours.' },
  { role: 'Production artist',    disc: 'Producers',           sector: 'Beauty',        basis: 'Monthly run', status: 'open',    note: 'Master files resized, versioned and delivered clean across every placement.' },
  { role: 'AI content creator',   disc: 'AI content creators', sector: 'Real estate',   basis: 'Monthly run', status: 'open',    note: 'Directed generation for listing and campaign imagery, held to one house look.' },
  { role: 'AI producer',          disc: 'Producers',           sector: 'Studio tooling',basis: 'Retainer',    status: 'open',    note: 'Owns the generative pipeline end to end: model choice, cost, review and sign-off.' },
  { role: 'Editor',               disc: 'Motion designers',    sector: 'Culture',       basis: 'Per project', status: 'open',    note: 'Long-form cut plus the cutdown ladder each platform actually rewards.' },
  { role: 'Creative technologist',disc: 'Technical artists',   sector: 'Business',      basis: 'Per project', status: 'filling', note: 'Prototypes that prove an idea before the full build is scoped.' },
  { role: 'AI web designer',      disc: 'Web developers',      sector: 'Fashion',       basis: 'Per project', status: 'open',    note: 'Site design produced with generative tooling, shipped as real front-end.' },
  { role: '3D artist',            disc: '3D artists',          sector: 'Gaming',        basis: 'Monthly run', status: 'open',    note: 'Props and hard-surface assets, engine-ready on a rolling delivery.' }
];

const BOARD_UPDATED = 'September 2026';

/* ═══ helpers ═════════════════════════════════════════════════════════ */

/* deterministic jitter, so an ink whorl looks hand-drawn but never
   re-scribbles itself on resize */
function rand(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const TOTAL = TERRITORIES.reduce((a, t) => a + t.n, 0);

/* ═══ 1 · SWIRL MAP ═══════════════════════════════════════════════════ */

function buildMap() {
  const host = document.getElementById('swm');
  if (!host || typeof d3 === 'undefined' || typeof topojson === 'undefined') return;

  const tip = host.parentElement.querySelector('.swm-tip');
  const filterHost = document.querySelector('.swm-filters');
  let land = null, active = null, drawn = false;

  const svg = d3.select(host).append('svg').attr('class', 'swm-svg');
  const gBase = svg.append('g').attr('class', 'swm-base');
  const gTer = svg.append('g').attr('class', 'swm-ter');
  const gArcs = svg.append('g').attr('class', 'swm-arcs');
  const gLbl = svg.append('g').attr('class', 'swm-lbls');

  /* two scratch canvases, reused: the land is rasterised, blurred into a
     smooth field, and iso-lines are pulled out of it. Nested contours of the
     real coastline — the single-line-drawing look, but actual geography. */
  const raster = document.createElement('canvas');
  const blurred = document.createElement('canvas');

  function contourPaths(drawFn, fw, fh, blur, fracs) {
    raster.width = fw; raster.height = fh;
    blurred.width = fw; blurred.height = fh;
    const rc = raster.getContext('2d');
    rc.clearRect(0, 0, fw, fh);
    rc.fillStyle = '#000';
    drawFn(rc);

    const bc = blurred.getContext('2d');
    bc.clearRect(0, 0, fw, fh);
    bc.filter = 'blur(' + blur + 'px)';
    bc.drawImage(raster, 0, 0);
    bc.filter = 'none';

    const data = bc.getImageData(0, 0, fw, fh).data;
    const vals = new Float64Array(fw * fh);
    let max = 0;
    for (let i = 3, j = 0; i < data.length; i += 4, j++) {
      const v = data[i] / 255;
      vals[j] = v;
      if (v > max) max = v;
    }
    if (max <= 0) return [];
    const cs = d3.contours().size([fw, fh]).smooth(true);
    return fracs.map(f => cs.contour(vals, f * max)).filter(g => g && g.coordinates.length);
  }

  function draw() {
    if (!land) return;
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    svg.attr('viewBox', `0 0 ${w} ${h}`);

    const shown = { type: 'FeatureCollection',
      features: land.features.filter(f => f.id !== '010') };

    /* field resolution tracks the frame so one uniform scale maps back */
    const fw = Math.max(320, Math.min(860, Math.round(w)));
    const fh = Math.max(120, Math.round(fw * h / w));
    /* the key is measured first, and the projection is then fitted into what
       is LEFT: previously the map took ~90% of the frame and the labels had
       nowhere to go but on top of the line work. Below 700px there is no
       gutter worth having, so the key moves under the map instead. */
    const probe = gLbl.append('text').attr('class', 'swm-lbl');
    const label = t => {
      probe.selectAll('*').remove();
      probe.append('tspan').attr('class', 'swm-lbl-n').text(t.name.toUpperCase());
      probe.append('tspan').attr('class', 'swm-lbl-c').attr('dx', 6).text(t.n);
      return probe.node().getComputedTextLength() || (t.name.length + 3) * 8;
    };
    const tws = new Map(TERRITORIES.map(t => [t.key, label(t)]));
    probe.remove();
    const maxTw = Math.max(...tws.values());
    const narrow = w < 700;
    const gut = narrow ? fw * 0.04 : Math.min(fw * 0.26, (maxTw + 16) * fw / w);
    const proj = d3.geoNaturalEarth1()
      .fitExtent(narrow
        ? [[gut, fh * 0.04], [fw - gut, fh * 0.60]]
        : [[gut, fh * 0.10], [fw - gut, fh * 0.90]], shown);
    const back = d3.geoPath(d3.geoIdentity().scale(w / fw));

    /* base: the whole world as seven nested rings */
    /* threshold 0.5 of a blurred edge sits on the true coastline, so the ring
       set straddles it: two just outside, the rest tightening inward */
    const base = contourPaths(rc => {
      const p = d3.geoPath(proj, rc);
      rc.beginPath();
      p({ type: 'FeatureCollection', features: shown.features });
      rc.fill();
    }, fw, fh, Math.max(3, fw * 0.0075), [0.30, 0.40, 0.50, 0.61, 0.72, 0.83, 0.93]);
    gBase.selectAll('path').data(base).join('path')
      .attr('d', back).attr('class', 'swm-ring');

    /* per territory: the same trick locally, but the number of rings IS the
       headcount — ten members reads as ten tightening contours */
    /* blob centres are relaxed in FIELD space before rasterising: the
       Türkiye / Egypt / UAE / Europe anchors sit closer together than their
       radii sum to, so without this the densest part of the data reads as one
       smear. The pin and leader stay on the true coordinate. */
    const blobs = TERRITORIES.map(t => {
      const p = proj([t.lon, t.lat]);
      return {
        t, ax: p[0], ay: p[1], x: p[0], y: p[1],
        /* radius grows with the RING COUNT, not with sqrt(n), so contour
           spacing stays constant instead of packing solid at high counts */
        rad: (fw * 0.006) + (2 + t.n) * fw * 0.0028
      };
    }).sort((a, b) => b.rad - a.rad);
    const pad = fw * 0.016;
    for (let pass = 0; pass < 260; pass++) {
      for (let i = 0; i < blobs.length; i++) {
        for (let j = i + 1; j < blobs.length; j++) {
          const a = blobs[i], b = blobs[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.01;
          const need = a.rad + b.rad + pad;
          if (d < need) {
            /* the bigger whorl holds its ground; the smaller one gives way */
            const push = (need - d) / d;
            const wa = b.rad / (a.rad + b.rad), wb = a.rad / (a.rad + b.rad);
            a.x -= dx * push * wa; a.y -= dy * push * wa;
            b.x += dx * push * wb; b.y += dy * push * wb;
          }
        }
      }
      blobs.forEach(n => { n.x += (n.ax - n.x) * 0.02; n.y += (n.ay - n.y) * 0.02; });
    }
    blobs.forEach(n => {
      n.x = Math.min(Math.max(n.x, n.rad + 2), fw - n.rad - 2);
      n.y = Math.min(Math.max(n.y, n.rad + 2), fh - n.rad - 2);
    });

    const terData = blobs.map(b => {
      const t = b.t;
      const rings = 2 + t.n;
      const fracs = d3.range(rings).map(i => 0.32 + (0.95 - 0.32) * (i / Math.max(rings - 1, 1)));
      const seed = t.key.charCodeAt(0) + t.key.charCodeAt(1);
      const geos = contourPaths(rc => {
        rc.beginPath();
        const N = 72;
        for (let i = 0; i <= N; i++) {
          const a = i / N * Math.PI * 2;
          const wob = 1 + (rand(seed + i * 0.37) - 0.5) * 0.34
            + Math.sin(a * 3 + seed) * 0.13;
          const x = b.x + Math.cos(a) * b.rad * wob;
          const y = b.y + Math.sin(a) * b.rad * wob * 0.84;
          i ? rc.lineTo(x, y) : rc.moveTo(x, y);
        }
        rc.closePath();
        rc.fill();
      }, fw, fh, Math.max(2, b.rad * 0.42), fracs);
      return { t, geos };
    });

    const tg = gTer.selectAll('g.swm-t').data(terData, d => d.t.key)
      .join(en => en.append('g').attr('class', 'swm-t'));
    tg.attr('data-key', d => d.t.key).classed('is-home', d => !!d.t.home);
    tg.each(function (d) {
      d3.select(this).selectAll('path').data(d.geos).join('path')
        .attr('d', back).attr('class', 'swm-tring');
    });

    /* anchors, arcs, labels */
    const S = w / fw;
    const hub = proj([HUB.lon, HUB.lat]).map(v => v * S);
    const byKey = new Map(blobs.map(b => [b.t.key, b]));
    const nodes = TERRITORIES.map(t => {
      const p = proj([t.lon, t.lat]).map(v => v * S);
      const b = byKey.get(t.key);
      return { t, ax: p[0], ay: p[1], bx: b.x * S, by: b.y * S, r: b.rad * S };
    });

    const arcs = nodes.filter(n => !n.t.home).map(n => {
      const mmx = (n.bx + hub[0]) / 2, mmy = (n.by + hub[1]) / 2;
      const dx = hub[0] - n.bx, dy = hub[1] - n.by;
      const len = Math.hypot(dx, dy) || 1;
      const bow = len * 0.20;
      const sx = n.bx + dx / len * (n.r + 3), sy = n.by + dy / len * (n.r + 3);
      return { t: n.t, d: `M${sx},${sy} Q${mmx - dy / len * bow},${mmy + dx / len * bow} ${hub[0]},${hub[1]}` };
    });
    gArcs.selectAll('path').data(arcs, d => d.t.key).join('path')
      .attr('d', d => d.d).attr('class', 'swm-arc').attr('data-key', d => d.t.key)
;

    nodes.forEach(n => { n.tw = tws.get(n.t.key); });
    if (narrow) {
      /* two-column legend under the map, ordered by headcount */
      const cols = 2, rows = Math.ceil(nodes.length / cols);
      const colW = (w - 16) / cols;
      const top = h * 0.66;
      nodes.slice().sort((a, b) => b.t.n - a.t.n).forEach((n, i) => {
        n.lx = 8 + (i % cols) * colW;
        n.ly = top + Math.floor(i / cols) * 19;
        n.anchor = 'start';
      });
    } else {
      let bb;
      try { bb = gBase.node().getBBox(); } catch (err) { bb = { x: 0, y: 0, width: w, height: h }; }
      const midX = bb.x + bb.width / 2;
      const leftX = Math.max(maxTw + 8, bb.x - 14);
      const rightX = Math.min(w - maxTw - 8, bb.x + bb.width + 14);
      ['L', 'R'].forEach(side => {
        const set = nodes.filter(n => (n.bx < midX) === (side === 'L'))
          .sort((a, b) => a.by - b.by);
        const pitch = 22;
        const need = set.length * pitch;
        const top = Math.min(Math.max(set.length ? set[0].by : 0, 18), Math.max(h - need - 6, 18));
        set.forEach((n, i) => {
          n.lx = side === 'L' ? leftX : rightX;
          n.anchor = side === 'L' ? 'end' : 'start';
          n.ly = Math.min(top + i * pitch, h - 8);
        });
      });
    }

    const g = gLbl.selectAll('g.swm-w').data(nodes, d => d.t.key)
      .join(en => {
        const gg = en.append('g').attr('class', 'swm-w');
        gg.append('line').attr('class', 'swm-tie');
        gg.append('line').attr('class', 'swm-lead');
        gg.append('circle').attr('class', 'swm-pin');
        gg.append('text').attr('class', 'swm-lbl');
        gg.append('circle').attr('class', 'swm-hit');
        return gg;
      });
    g.attr('data-key', d => d.t.key).classed('is-home', d => !!d.t.home);
    g.each(function (n) {
      const s = d3.select(this);
      /* leader runs label → whorl, with a tick back to the true coordinate */
      s.select('.swm-lead')
        .attr('x1', n.bx).attr('y1', n.by).attr('x2', n.lx).attr('y2', n.ly - 4)
        .style('display', narrow ? 'none' : null);
      s.select('.swm-tie').attr('x1', n.ax).attr('y1', n.ay).attr('x2', n.bx).attr('y2', n.by);
      s.select('.swm-pin').attr('cx', n.ax).attr('cy', n.ay).attr('r', n.t.home ? 3.4 : 2.2);
      s.select('.swm-hit').attr('cx', n.bx).attr('cy', n.by).attr('r', Math.max(n.r, 20));
      const tx = s.select('.swm-lbl').attr('x', n.lx).attr('y', n.ly).attr('text-anchor', n.anchor);
      tx.selectAll('*').remove();
      tx.append('tspan').attr('class', 'swm-lbl-n').text(n.t.name.toUpperCase());
      tx.append('tspan').attr('class', 'swm-lbl-c').attr('dx', 6).text(n.t.n);
    });
    g.on('pointerenter', function (e, d) { show(d.t, e); })
      .on('pointermove', function (e, d) { show(d.t, e); })
      .on('pointerleave', hide);

    /* draw() rebuilds these groups, so the revealed state has to be
       re-applied every time rather than set once by runIn */
    if (drawn) showAll();
  }

  function hot(key) {
    gLbl.selectAll('g.swm-w').classed('is-hot', p => p.t.key === key);
    gTer.selectAll('g.swm-t').classed('is-hot', p => p.t.key === key);
  }
  function show(d, e) {
    if (!tip) return;
    const box = host.getBoundingClientRect();
    tip.innerHTML = `<b>${d.name}</b><span>${d.n} member${d.n > 1 ? 's' : ''}${d.home ? ' · studio base' : ''}</span>`
      + `<em>${d.disc.join(' · ')}</em>`;
    tip.classList.add('on');
    tip.style.left = Math.min(Math.max(e.clientX - box.left, 90), box.width - 90) + 'px';
    tip.style.top = Math.max(e.clientY - box.top - 18, 12) + 'px';
    hot(d.key);
  }
  function hide() { if (tip) tip.classList.remove('on'); hot(null); }

  function applyFilter() {
    const out = d => active ? !d.t.disc.includes(active) : false;
    gLbl.selectAll('g.swm-w').classed('is-out', out);
    gTer.selectAll('g.swm-t').classed('is-out', out);
    gArcs.selectAll('path').classed('is-out', out);
    if (filterHost) {
      filterHost.querySelectorAll('.swm-f').forEach(b => b.classList.toggle('on', b.dataset.d === active));
      const c = document.querySelector('.swm-count');
      if (c) {
        const n = active
          ? TERRITORIES.filter(t => t.disc.includes(active)).reduce((a, t) => a + t.n, 0)
          : TOTAL;
        c.innerHTML = active
          ? `<b>${n}</b> members in <span>${active.toLowerCase()}</span>`
          : `<b>${TOTAL}</b> members across <span>${TERRITORIES.length} territories</span>`;
      }
    }
  }

  if (filterHost) {
    filterHost.innerHTML = '<span class="swm-f-lbl">Filter by discipline</span>'
      + DISCIPLINES.map(d => `<button class="swm-f" type="button" data-d="${d.name}">${d.name}</button>`).join('');
    filterHost.addEventListener('click', (e) => {
      const b = e.target.closest('.swm-f');
      if (!b) return;
      active = active === b.dataset.d ? null : b.dataset.d;
      applyFilter();
    });
  }

  /* Reveal is SYNCHRONOUS and idempotent. Earlier versions gated it on an
     IntersectionObserver and then on a timer; in this sticky-panel layout
     neither reliably fires, which left the map as bare geography with no data
     on it. The sweep is a CSS transition on the dash offset instead, so it
     costs nothing if it never plays. */
  function showAll() {
    gBase.selectAll('path').each(function () { this.style.strokeDashoffset = 0; });
    gArcs.selectAll('path').each(function () { this.style.strokeDashoffset = 0; });
    gTer.selectAll('g.swm-t').each(function () { this.classList.add('in'); });
    gLbl.selectAll('g.swm-w').each(function () { this.classList.add('in'); });
  }

  d3.json('assets/vendor/data/world-atlas-countries-110m.json')
    .then(topo => {
      land = topojson.feature(topo, topo.objects.countries);
      drawn = true;
      draw();
      applyFilter();
      showAll();
    })
    .catch(() => { host.classList.add('swm-failed'); });

  let rt;
  const redraw = () => { clearTimeout(rt); rt = setTimeout(() => { draw(); applyFilter(); if (drawn) showAll(); }, 180); };
  addEventListener('resize', redraw);
  if (window.ResizeObserver) new ResizeObserver(redraw).observe(host);
}

/* ═══ 2 · DISCIPLINE CONSTELLATION ════════════════════════════════════ */


/* simplex noise 3D, inline — the orb's flow field samples it on the sphere */
const Noise = (() => {
  const G = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  let s = 1337;
  const rr = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  for (let i = 255; i > 0; i--) { const j = (rr() * (i + 1)) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
  const perm = new Uint8Array(512), pmod = new Uint8Array(512);
  for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; pmod[i] = perm[i] % 12; }
  const F3 = 1 / 3, G3 = 1 / 6;
  return function (xin, yin, zin) {
    const t0 = (xin + yin + zin) * F3;
    const i = Math.floor(xin + t0), j = Math.floor(yin + t0), k = Math.floor(zin + t0);
    const t1 = (i + j + k) * G3;
    const x0 = xin - (i - t1), y0 = yin - (j - t1), z0 = zin - (k - t1);
    let i1, j1, k1, i2, j2, k2;
    if (x0 >= y0) {
      if (y0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=1;k2=0; }
      else if (x0 >= z0) { i1=1;j1=0;k1=0;i2=1;j2=0;k2=1; }
      else { i1=0;j1=0;k1=1;i2=1;j2=0;k2=1; }
    } else {
      if (y0 < z0) { i1=0;j1=0;k1=1;i2=0;j2=1;k2=1; }
      else if (x0 < z0) { i1=0;j1=1;k1=0;i2=0;j2=1;k2=1; }
      else { i1=0;j1=1;k1=0;i2=1;j2=1;k2=0; }
    }
    const x1=x0-i1+G3, y1=y0-j1+G3, z1=z0-k1+G3;
    const x2=x0-i2+2*G3, y2=y0-j2+2*G3, z2=z0-k2+2*G3;
    const x3=x0-1+3*G3, y3=y0-1+3*G3, z3=z0-1+3*G3;
    const ii=i&255, jj=j&255, kk=k&255;
    let n = 0, t, g;
    t = 0.6-x0*x0-y0*y0-z0*z0;
    if (t>0){g=G[pmod[ii+perm[jj+perm[kk]]]];t*=t;n+=t*t*(g[0]*x0+g[1]*y0+g[2]*z0);}
    t = 0.6-x1*x1-y1*y1-z1*z1;
    if (t>0){g=G[pmod[ii+i1+perm[jj+j1+perm[kk+k1]]]];t*=t;n+=t*t*(g[0]*x1+g[1]*y1+g[2]*z1);}
    t = 0.6-x2*x2-y2*y2-z2*z2;
    if (t>0){g=G[pmod[ii+i2+perm[jj+j2+perm[kk+k2]]]];t*=t;n+=t*t*(g[0]*x2+g[1]*y2+g[2]*z2);}
    t = 0.6-x3*x3-y3*y3-z3*z3;
    if (t>0){g=G[pmod[ii+1+perm[jj+1+perm[kk+1]]]];t*=t;n+=t*t*(g[0]*x3+g[1]*y3+g[2]*z3);}
    return 32 * n;
  };
})();

function buildConstellation() {
  const host = document.getElementById('cst');
  const read = document.querySelector('.cst-read');
  if (!host) return;

  const nodes = DISCIPLINES.map((d, i) => ({
    d, i,
    n: TERRITORIES.filter(t => t.disc.includes(d.name)).reduce((s, t) => s + t.n, 0)
  }));

  const canvas = document.createElement('canvas');
  canvas.className = 'cst-canvas';
  host.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: false });

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'cst-over');
  host.appendChild(svg);

  /* ink on paper now: front hemisphere runs dark, the far side is drawn pale
     and thin instead of culled — seeing strands wrap round the back is what
     makes it read as a solid body rather than a disc */
  const INK = ['#0b1030', '#12206b', '#2b3fb5', '#4c63ff', '#8ea2ff', '#c3cfff'];
  const PAPER = '#ffffff';
  const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches;

  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0, R = 1;
  let parts = [], zt = 0, ry = 0, spokes = [], hot = -1;

  /* particles live ON the sphere; the field is a noise vector projected into
     the tangent plane, so strands stay on the surface and never fly off */
  function spawn(p) {
    const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    p.x = s * Math.cos(a); p.y = u; p.z = s * Math.sin(a);
    p.px = null;
    p.life = 160 + Math.random() * 520;
    p.w = 0.45 + Math.random() * 0.7;
    p.c = Math.random();
    return p;
  }

  function layout() {
    const w = host.clientWidth, hh = host.clientHeight;
    if (!w || !hh) return;
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = w; H = hh;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H);
    cx = W * 0.5; cy = H * 0.5;
    R = Math.min(W * 0.40, H * 0.27);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    buildSpokes();
    const want = reduced ? 900 : Math.round(Math.min(1700, W * H * 0.0085));
    parts = Array.from({ length: want }, (_, i) => spawn(parts[i] || {}));
    if (reduced) { for (let i = 0; i < 700; i++) step(); paintSpokes(); }
  }

  /* spokes radiate to a dot per discipline, dot weight = members */
  function buildSpokes() {
    svg.innerHTML = '';
    const rim = document.createElementNS(NS, 'circle');
    rim.setAttribute('cx', cx); rim.setAttribute('cy', cy); rim.setAttribute('r', R);
    rim.setAttribute('class', 'cst-rim');
    svg.appendChild(rim);

    /* measure every name before any ray length is decided */
    const probe = document.createElementNS(NS, 'g');
    svg.appendChild(probe);
    nodes.forEach(n => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'cst-t');
      t.textContent = n.d.name;
      probe.appendChild(t);
      n.tw = t.getComputedTextLength() || n.d.name.length * 6.6;
    });
    probe.remove();

    /* the sphere gives way to the labels, not the other way round: at phone
       width the widest name needs more than half the plate, so R shrinks
       rather than letting the ray-length floor push text off the edge */
    const maxReserve = Math.max(...nodes.map(n => n.tw)) + 18;
    R = Math.min(R, Math.max(52, (W / 2 - maxReserve) * 0.92));

    spokes = nodes.map((n, i) => {
      const a = -Math.PI / 2 + (i / nodes.length) * Math.PI * 2 + 0.22;
      const ca = Math.cos(a), sa = Math.sin(a);
      const anchor = ca < -0.25 ? 'end' : ca > 0.25 ? 'start' : 'middle';
      const reserve = (anchor === 'middle' ? n.tw / 2 : n.tw) + 16;
      const mx = (W / 2 - reserve) / (Math.abs(ca) || 1e-4);
      const my = (H / 2 - 48) / (Math.abs(sa) || 1e-4);
      const room = Math.min(mx, my) - R;
      const len = Math.max(14, room * (0.72 + rand(i + 3) * 0.24));
      const lead = anchor === 'end' ? n.tw + 14 : anchor === 'start' ? n.tw + 14 : n.tw / 2 + 8;
      const x2 = anchor === 'end'
        ? Math.max(cx + ca * (R + len), lead + 6)
        : anchor === 'start'
          ? Math.min(cx + ca * (R + len), W - lead - 6)
          : Math.min(Math.max(cx + ca * (R + len), lead + 6), W - lead - 6);
      return { n, a, anchor,
        x1: cx + ca * R * 1.05, y1: cy + sa * R * 1.05,
        x2, y2: cy + sa * (R + len),
        r: 2 + Math.sqrt(n.n) * 0.85 };
    });
    /* nudge label baselines apart where two rays leave at similar angles */
    spokes.forEach(s => { s.ly = s.y2 + (s.anchor === 'middle' ? (Math.sin(s.a) < 0 ? -27 : 21) : 4); });
    const order = spokes.slice().sort((a, b) => a.ly - b.ly);
    for (let pass = 0; pass < 60; pass++) {
      for (let i = 1; i < order.length; i++) {
        const a = order[i - 1], b = order[i];
        const gap = b.ly - a.ly;
        if (gap < 16 && Math.abs(b.x2 - a.x2) < 120) { const d = (16 - gap) / 2; a.ly -= d; b.ly += d; }
      }
    }
    spokes.forEach(s => { s.ly = Math.min(Math.max(s.ly, 14), H - 22); });
    spokes.forEach((s, i) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'cst-spoke');
      g.dataset.i = i;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', s.x1); l.setAttribute('y1', s.y1);
      l.setAttribute('x2', s.x2); l.setAttribute('y2', s.y2);
      l.setAttribute('class', 'cst-ray');
      g.appendChild(l);
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', s.x2); c.setAttribute('cy', s.y2); c.setAttribute('r', s.r);
      c.setAttribute('class', 'cst-node-d');
      g.appendChild(c);
      for (let k = 1; k <= 2; k++) {
        const f = 0.34 + k * 0.22 + rand(i * 3 + k) * 0.12;
        const t = document.createElementNS(NS, 'circle');
        t.setAttribute('cx', s.x1 + (s.x2 - s.x1) * f);
        t.setAttribute('cy', s.y1 + (s.y2 - s.y1) * f);
        t.setAttribute('r', 0.9 + rand(i + k * 7) * 0.8);
        t.setAttribute('class', 'cst-tick');
        g.appendChild(t);
      }
      const lx = s.anchor === 'end' ? s.x2 - s.r - 7
        : s.anchor === 'start' ? s.x2 + s.r + 7 : s.x2;
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('class', 'cst-t');
      t.setAttribute('x', lx);
      t.setAttribute('y', s.ly);
      t.setAttribute('text-anchor', s.anchor);
      t.textContent = s.n.d.name;
      g.appendChild(t);
      const num = document.createElementNS(NS, 'text');
      num.setAttribute('class', 'cst-num');
      num.setAttribute('x', lx);
      num.setAttribute('y', s.ly + 13);
      num.setAttribute('text-anchor', s.anchor);
      num.textContent = s.n.n + ' members';
      g.appendChild(num);

      const hit = document.createElementNS(NS, 'rect');
      const pad = 10;
      const bx = s.anchor === 'end' ? lx - s.n.tw - pad : s.anchor === 'start' ? lx - pad : lx - s.n.tw / 2 - pad;
      hit.setAttribute('x', bx);
      hit.setAttribute('y', Math.min(s.ly - 15, s.y2 - 12));
      hit.setAttribute('width', s.n.tw + pad * 2);
      hit.setAttribute('height', Math.abs(s.ly - s.y2) + 34);
      hit.setAttribute('class', 'cst-hit');
      g.appendChild(hit);
      g.addEventListener('pointerenter', () => pick(i));
      g.addEventListener('click', () => pick(i));
      svg.appendChild(g);
    });
    const dust = document.createElementNS(NS, 'g');
    dust.setAttribute('class', 'cst-dust');
    for (let k = 0; k < 54; k++) {
      const a = rand(k * 1.7) * Math.PI * 2;
      const rr = R * (1.06 + rand(k + 61) * 1.5);
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.92;
      if (x < 8 || x > W - 8 || y < 8 || y > H - 8) continue;
      if (spokes.some(s => Math.abs(y - s.ly) < 20
        && x > (s.anchor === 'end' ? s.x2 - s.n.tw - 26 : s.anchor === 'start' ? s.x2 - 12 : s.x2 - s.n.tw / 2 - 14)
        && x < (s.anchor === 'end' ? s.x2 + 12 : s.anchor === 'start' ? s.x2 + s.n.tw + 26 : s.x2 + s.n.tw / 2 + 14))) continue;
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y);
      c.setAttribute('r', 0.6 + rand(k + 13) * 1.1);
      dust.appendChild(c);
    }
    svg.appendChild(dust);
    paintSpokes();
  }
  function paintSpokes() {
    svg.querySelectorAll('.cst-spoke').forEach(g => {
      g.classList.toggle('on', +g.dataset.i === hot);
    });
  }
  function pick(i) {
    hot = i;
    paintSpokes();
    const n = nodes[i];
    if (read) {
      read.innerHTML = `<span class="cst-r-n">${n.d.name}</span>`
        + `<span class="cst-r-c">${n.n} member${n.n === 1 ? '' : 's'}</span>`
        + `<p>${n.d.note}</p><span class="cst-r-t">${n.d.tools}</span>`;
      read.classList.add('on');
    }
  }

  const v = [0, 0, 0];

  /* two-octave scalar potential; the flow is its curl taken against the
     surface normal (v = p × ∇f), which is divergence-free and tangential by
     construction — that is what makes the strands close into whorls instead
     of piling into a band */
  function pot(x, y, z) {
    const s = 0.76;
    return Noise(x * s, y * s, z * s + zt)
      + 0.34 * Noise(x * s * 2.6 + 13, y * s * 2.6, z * s * 2.6 + zt * 1.3);
  }
  function field(p) {
    const e = 0.04;
    const gx = (pot(p.x + e, p.y, p.z) - pot(p.x - e, p.y, p.z)) / (2 * e);
    const gy = (pot(p.x, p.y + e, p.z) - pot(p.x, p.y - e, p.z)) / (2 * e);
    const gz = (pot(p.x, p.y, p.z + e) - pot(p.x, p.y, p.z - e)) / (2 * e);
    v[0] = p.y * gz - p.z * gy;
    v[1] = p.z * gx - p.x * gz;
    v[2] = p.x * gy - p.y * gx;
  }

  function step() {
    const ct = Math.cos(0.34), st = Math.sin(0.34);
    const cyy = Math.cos(ry), syy = Math.sin(ry);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      field(p);
      const m = Math.hypot(v[0], v[1], v[2]) || 1;
      const sp = 0.0055;
      p.x += v[0] / m * sp; p.y += v[1] / m * sp; p.z += v[2] / m * sp;
      const L = Math.hypot(p.x, p.y, p.z) || 1;
      p.x /= L; p.y /= L; p.z /= L;

      /* view transform: spin about the pole, then a fixed tilt */
      const rx = p.x * cyy + p.z * syy;
      const rz0 = -p.x * syy + p.z * cyy;
      const ryy = p.y * ct - rz0 * st;
      const rz = p.y * st + rz0 * ct;

      const sx = cx + rx * R, sy = cy - ryy * R;
      if (p.px !== null) {
        const front = rz > 0;
        const depth = Math.abs(rz);
        /* front: dark and weighted. back: pale, thin, barely there. */
        const idx = front
          ? Math.min(5, ((1 - depth) * 2.4 + p.c * 2.2) | 0)
          : Math.min(5, (3.6 + p.c * 1.6) | 0);
        ctx.strokeStyle = INK[idx];
        ctx.globalAlpha = front ? 0.18 * (0.44 + depth * 0.76) : 0.06 * (0.5 + depth * 0.5);
        ctx.lineWidth = p.w * (front ? 0.7 + depth * 0.85 : 0.45);
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
      p.px = sx; p.py = sy;
      if (--p.life < 0) spawn(p);
    }
    ctx.globalAlpha = 1;
    zt += 0.00035;
    ry += 0.00040;
  }

  let ticks = 0, gate = () => true, last = 0;

  /* the sim advances on ELAPSED TIME, not on frame cadence: a throttled or
     slow rAF would otherwise draw one segment per particle and the strands
     would never grow into strands at all */
  function paint(sub) {
    if (!gate()) { last = performance.now(); return; }
    const now = performance.now();
    const dt = last ? now - last : 16;
    last = now;
    const n = sub || Math.max(1, Math.min(14, Math.round(dt / 16)));
    ticks++;
    ctx.globalAlpha = Math.min(0.10, 0.010 * n);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) step();
  }
  function frame() { paint(); requestAnimationFrame(frame); }

  layout();
  pick(0);
  for (let i = 0; i < 380; i++) step();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 180); });
  if (window.ResizeObserver) new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(layout, 180); }).observe(host);

  host.classList.add('in');
  if (!reduced) {
    /* paint from load; the observer only idles the sim when the panel is
       off-screen. Gating the START on intersection meant the sticky-panel
       layout could leave it never running at all. */
    let live = true;
    new IntersectionObserver(es => es.forEach(en => { live = en.isIntersecting; }),
      { threshold: 0 }).observe(host);
    gate = () => live;
    requestAnimationFrame(frame);
    setTimeout(() => { if (ticks === 0) setInterval(paint, 16); }, 700);
  }
}

/* ═══ 3 · COMMISSIONS BOARD ═══════════════════════════════════════════ */

function buildBoard() {
  const host = document.getElementById('opb');
  if (!host) return;
  const LBL = { open: 'Open', filling: 'Filling', closed: 'Filled' };
  const openN = COMMISSIONS.filter(c => c.status === 'open').length;

  host.innerHTML = `
    <div class="opb-head">
      <span class="opb-h-n">Role</span>
      <span class="opb-h-n">Sector</span>
      <span class="opb-h-n">Engagement</span>
      <span class="opb-h-n opb-r">Status</span>
    </div>
    ${COMMISSIONS.map((c, i) => `
      <div class="opb-row is-${c.status}" data-disc="${c.disc}" style="transition-delay:${i * 45}ms">
        <span class="opb-role">${c.role}<em>${c.note}</em></span>
        <span class="opb-cell">${c.sector}</span>
        <span class="opb-cell">${c.basis}</span>
        <span class="opb-r"><i class="opb-pill p-${c.status}">${LBL[c.status]}</i></span>
      </div>`).join('')}
    <div class="opb-foot">
      <span><b>${openN}</b> briefs open now · matched from the talent database</span>
      <span>Updated ${BOARD_UPDATED}</span>
    </div>`;

  new IntersectionObserver((es, o) => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      host.classList.add('in');
      o.disconnect();
    });
  }, { threshold: 0.2 }).observe(host);
}

/* ═══ boot ════════════════════════════════════════════════════════════ */
function boot() { buildMap(); buildConstellation(); buildBoard(); }
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();

/* ---------- application form (panel 09) ----------
   The Collective used to end on a link out to the brief intake, so there was
   no way to apply from the page. Delivery, honeypot and the human check all
   come from assets/js/forms.js. */
(function () {
  var f = document.getElementById('clApply'); if (!f) return;
  var err = document.getElementById('clErr'),
      done = document.getElementById('clDone'),
      msg = document.getElementById('clMsg'),
      btn = f.querySelector('button[type=submit]');

  var cap = window.ILForm ? new window.ILForm.Challenge() : null;
  if (cap) f.insertBefore(cap.el(), f.querySelector('.cl-actions'));

  function fail(t) { err.textContent = t; err.hidden = false; }

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(f);
    var name = (d.get('name') || '').trim(),
        mail = (d.get('email') || '').trim(),
        disc = (d.get('discipline') || '').trim(),
        links = (d.get('links') || '').trim();

    if (!name) return fail('Please add your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))
      return fail('That email address does not look right.');
    if (!disc) return fail('Please pick the discipline closest to your work.');
    /* the portfolio is the application - we look at craft, not credentials */
    if (!links) return fail('Please add a link to your work: portfolio, reel or profile.');
    if (cap) { var bad = cap.check(); if (bad) return fail(bad); }
    err.hidden = true;

    btn.disabled = true; btn.textContent = 'Sending…';
    function received() {
      f.hidden = true; done.hidden = false;
      msg.textContent = name.split(' ')[0] + ', that is with the studio. We read every ' +
        'application and reply within two working days. If there is an open commission ' +
        'in ' + disc.toLowerCase() + ', we will say so.';
    }
    if (!window.ILForm) { received(); return; }
    window.ILForm.send('collective', {
      name: name, email: mail, discipline: disc,
      location: (d.get('location') || '').trim(), links: links,
      level: (d.get('level') || '').trim(), msg: (d.get('msg') || '').trim()
    }).then(received).catch(function () {
      btn.disabled = false; btn.textContent = 'Send application ↗';
      fail('That did not go through. Please email hello@illusorr.com directly.');
    });
  });
})();
