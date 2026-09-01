(() => {
  const root = document.getElementById('filmCarousel');
  if (!root) return;
  const track = document.getElementById('filmTrack');
  const slides = Array.from(track.children);
  const N = slides.length;
  const dotsWrap = document.getElementById('filmDots');
  let i = 0, t = null;
  const dots = slides.map((_, k) => { const b = document.createElement('button'); b.className = 'film-dot'; b.setAttribute('aria-label', 'Film ' + (k + 1)); b.addEventListener('click', () => go(k, true)); dotsWrap.appendChild(b); return b; });
  function render() { track.style.transform = `translateX(${-i * 100}%)`; dots.forEach((d, k) => d.classList.toggle('is-active', k === i)); }
  function go(n, u) { i = (n + N) % N; render(); if (u) restart(); }
  function restart() { clearTimeout(t); t = setTimeout(() => go(i + 1), 6000); }
  document.getElementById('filmNext').addEventListener('click', () => go(i + 1, true));
  document.getElementById('filmPrev').addEventListener('click', () => go(i - 1, true));
  let down = false, sx = 0, dx = 0;
  track.addEventListener('pointerdown', e => { down = true; sx = e.clientX; dx = 0; track.classList.add('no-anim'); track.setPointerCapture?.(e.pointerId); });
  track.addEventListener('pointermove', e => { if (!down) return; dx = e.clientX - sx; track.style.transform = `translateX(calc(${-i * 100}% + ${dx}px))`; });
  function end() { if (!down) return; down = false; track.classList.remove('no-anim'); const th = root.clientWidth * 0.14; if (dx < -th) go(i + 1, true); else if (dx > th) go(i - 1, true); else render(); }
  track.addEventListener('pointerup', end); track.addEventListener('pointercancel', end);
  root.addEventListener('pointerenter', () => clearTimeout(t));
  root.addEventListener('pointerleave', restart);
  render(); restart();
})();
