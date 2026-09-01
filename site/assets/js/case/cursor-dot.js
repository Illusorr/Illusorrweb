(() => {
  const cur = document.getElementById('kCursor');
  if (!cur) return;
  let cx = -100, cy = -100, tx = -100, ty = -100;
  document.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
  const linkSel = 'a, button, [role="button"], .hc-nav, label, .topnav .logo-lockup';
  document.querySelectorAll(linkSel).forEach(el => {
    el.addEventListener('pointerenter', () => cur.classList.add('is-link'));
    el.addEventListener('pointerleave', () => cur.classList.remove('is-link'));
  });
  function frame() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cur.style.left = cx + 'px';
    cur.style.top = cy + 'px';
    requestAnimationFrame(frame);
  }
  frame();
})();
