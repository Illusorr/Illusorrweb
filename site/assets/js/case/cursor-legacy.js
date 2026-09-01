(function() {
  if (true) return; // cursor disabled
  const cursor = document.getElementById('kCursor');
  if (!cursor) return;
  const pt = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const lp = { x: pt.x, y: pt.y };
  let visible = false;
  function tick() { lp.x += (pt.x - lp.x) * 0.22; lp.y += (pt.y - lp.y) * 0.22; cursor.style.transform = `translate3d(${lp.x}px,${lp.y}px,0)`; requestAnimationFrame(tick); }
  tick();
  window.addEventListener('pointermove', (e) => { pt.x = e.clientX; pt.y = e.clientY; if (!visible) { cursor.classList.add('is-visible'); visible = true; } }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
  let lastTone = null;
  function updateTone() { const el = document.elementFromPoint(pt.x, pt.y); if (!el) return; const sec = el.closest('[data-tone]'); const tone = sec ? sec.getAttribute('data-tone') : 'light'; if (tone === lastTone) return; lastTone = tone; cursor.classList.toggle('on-dark', tone === 'dark'); }
  window.addEventListener('pointermove', updateTone, { passive: true });
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  const linkSel = 'a, button, [role="button"], .next, label, .topnav .logo-lockup';
  document.querySelectorAll(linkSel).forEach(el => {
    el.addEventListener('pointerenter', () => { cursor.classList.add('is-link'); const label = cursor.querySelector('.label-link'); if (label) { let verb = 'Click'; if (el.closest('.topnav')) verb = 'Open'; else if (el.matches('[href^="http"]')) verb = 'Visit'; label.setAttribute('data-verb', verb); } });
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-link'));
  });
  const topnav = document.querySelector('.topnav');
  const rail = document.querySelector('.rail');
  const sections = Array.from(document.querySelectorAll('section[data-tone]'));
  function sectionAt(y) { for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom >= y) return s; } return null; }
  function updateChromeTone() {
    const topSec = sectionAt(40); const midSec = sectionAt(window.innerHeight / 2);
    if (topnav) topnav.classList.toggle('on-dark', !!topSec && topSec.dataset.tone === 'dark');
    if (rail) rail.classList.toggle('on-dark', !!midSec && midSec.dataset.tone === 'dark');
  }
  updateChromeTone();
  window.addEventListener('scroll', () => requestAnimationFrame(updateChromeTone), { passive: true });
  window.addEventListener('resize', updateChromeTone);
})();

(function() {
  const sections = Array.from(document.querySelectorAll('[data-rail]'));
  const dots = Array.from(document.querySelectorAll('.rail-dot'));
  function tick() { const mid = window.innerHeight / 2; let best = 0, bestDist = Infinity; for (const s of sections) { const r = s.getBoundingClientRect(); const c = (r.top + r.bottom) / 2; const d = Math.abs(c - mid); if (d < bestDist) { bestDist = d; best = +s.dataset.rail; } } dots.forEach(d => d.classList.toggle('is-active', +d.dataset.i === best)); }
  tick();
  window.addEventListener('scroll', () => requestAnimationFrame(tick), { passive: true });
  window.addEventListener('resize', tick);
})();
