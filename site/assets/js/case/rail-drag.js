(() => {
  const rail = document.querySelector('.reel-rail');
  if (!rail) return;
  let down = false, startX = 0, scrollStart = 0;
  rail.addEventListener('pointerdown', e => { down = true; startX = e.clientX; scrollStart = rail.scrollLeft; rail.setPointerCapture(e.pointerId); });
  rail.addEventListener('pointermove', e => { if (!down) return; rail.scrollLeft = scrollStart - (e.clientX - startX); });
  rail.addEventListener('pointerup', () => { down = false; });
  rail.addEventListener('pointercancel', () => { down = false; });
})();
