/* TRT Metaverse — channel-space portal + video facade.
   Click a channel pod → its space opens fullscreen through a circular wipe
   originating at the click point. Escape, the scrim, or the exit button
   closes it. Same interaction grammar as the Disney+ realm portal. */
(() => {
  const pods = Array.from(document.querySelectorAll('.pod'));
  if (pods.length) {
    const scrim = document.createElement('div');
    scrim.className = 'space-scrim';
    document.body.appendChild(scrim);
    let open = null;

    function openSpace(pod, x, y) {
      const panel = pod.querySelector('.space');
      if (!panel || open) return;
      open = panel;
      panel.style.setProperty('--ox', x + 'px');
      panel.style.setProperty('--oy', y + 'px');
      document.body.appendChild(panel);
      panel.classList.add('is-live');
      void panel.offsetWidth;
      panel.classList.add('is-open');
      scrim.classList.add('is-on');
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.classList.add('space-open');
    }
    function closeSpace() {
      if (!open) return;
      const panel = open; open = null;
      panel.classList.remove('is-open');
      scrim.classList.remove('is-on');
      document.documentElement.style.overflow = '';
      document.documentElement.classList.remove('space-open');
      setTimeout(() => {
        panel.classList.remove('is-live');
        const host = document.querySelector(`.pod[data-space="${panel.dataset.space}"]`);
        if (host) host.appendChild(panel);
      }, 900);
    }

    pods.forEach((pod) => {
      pod.addEventListener('click', (e) => {
        if (e.target.closest('.space')) return;
        openSpace(pod, e.clientX, e.clientY);
      });
      pod.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const r = pod.getBoundingClientRect();
          openSpace(pod, r.left + r.width / 2, r.top + r.height / 2);
        }
      });
    });
    document.addEventListener('click', (e) => { if (e.target.closest('.space-exit')) closeSpace(); });
    scrim.addEventListener('click', closeSpace);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSpace(); });
  }

  /* ── YouTube facade: poster until clicked, then the real player ──── */
  document.addEventListener('click', (e) => {
    const y = e.target.closest('.yt[data-yt]');
    if (!y) return;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + y.dataset.yt + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    f.title = y.dataset.title || 'Video';
    y.replaceChildren(f);
    y.removeAttribute('data-yt');
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('yt')) {
      e.preventDefault(); e.target.click();
    }
  });
})();
