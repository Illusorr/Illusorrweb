/* Page ambience. Loops quietly under the whole Disney+ story, ducks to
   silence whenever a realm is open (each realm carries its own track) and
   whenever the tab is hidden. Autoplay policy needs a gesture, so the first
   pointer/scroll/key starts it; the corner pill toggles it after that. */
(() => {
  const SRC = '../assets/projects/v5/disney-ambience.mp3';
  const LEVEL = 0.34;
  const a = new Audio();
  a.loop = true; a.preload = 'none'; a.volume = 0;
  const arm = () => { if (!a.src) { a.preload = 'auto'; a.src = SRC; } };
  let wanted = true, fade = 0, started = false;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'amb-toggle';
  btn.setAttribute('aria-label', 'Toggle ambient sound');
  btn.innerHTML = '<span class="amb-eq"><i></i><i></i><i></i><i></i></span><span class="amb-l">Sound</span>';
  document.body.appendChild(btn);
  btn.addEventListener('click', () => {
    wanted = !wanted;
    started = true;
    btn.classList.toggle('is-off', !wanted);
    if (wanted) { arm(); a.play().catch(() => {}); }
  });

  const kick = () => { if (!started) { started = true; arm(); a.play().catch(() => {}); } };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(e =>
    addEventListener(e, kick, { once: true, passive: true }));

  setInterval(() => {
    const realm = document.documentElement.classList.contains('realm-open');
    const on = started && wanted && !realm && !document.hidden;
    fade += ((on ? LEVEL : 0) - fade) * (on ? 0.05 : 0.16);
    a.volume = Math.max(0, Math.min(1, fade));
    if (on && a.paused) { arm(); a.play().catch(() => {}); }
    if (!on && !a.paused && fade < 0.015) a.pause();
    btn.classList.toggle('is-quiet', !on);
  }, 80);

  document.addEventListener('visibilitychange', () => { if (document.hidden) { a.pause(); fade = 0; a.volume = 0; } });
})();
