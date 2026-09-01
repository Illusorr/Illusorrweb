/* Pylon artist pavilions. The lineup cards each carry a hidden .pavilion;
   clicking one lifts it to <body> and opens it through a circular wipe
   originating at the pointer. Escape, the scrim, or the exit button closes. */
(() => {
  const cards = Array.from(document.querySelectorAll('.artist'));
  if (!cards.length) return;

  const scrim = document.createElement('div');
  scrim.className = 'pav-scrim';
  document.body.appendChild(scrim);
  let open = null;

  function openPav(card, x, y) {
    const panel = card.querySelector('.pavilion');
    if (!panel || open) return;
    open = panel;
    panel.style.setProperty('--ox', x + 'px');
    panel.style.setProperty('--oy', y + 'px');
    // sources are held on data-src so 26 pavilion renders are never
    // fetched unless someone actually walks into a pavilion
    panel.querySelectorAll('img[data-src]').forEach((im) => {
      im.src = im.dataset.src; im.removeAttribute('data-src');
    });
    document.body.appendChild(panel);
    panel.classList.add('is-live');
    void panel.offsetWidth;
    panel.classList.add('is-open');
    scrim.classList.add('is-on');
    document.documentElement.classList.add('pav-open');
  }
  function closePav() {
    if (!open) return;
    const panel = open; open = null;
    panel.classList.remove('is-open');
    scrim.classList.remove('is-on');
    document.documentElement.classList.remove('pav-open');
    setTimeout(() => {
      panel.classList.remove('is-live');
      const host = document.querySelector(`.artist[data-pav="${panel.dataset.pav}"]`);
      if (host) host.appendChild(panel);
    }, 900);
  }

  cards.forEach((card) => {
    if (!card.querySelector('.pavilion')) return;
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', (e) => {
      if (e.target.closest('.pavilion')) return;
      openPav(card, e.clientX, e.clientY);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const r = card.getBoundingClientRect();
        openPav(card, r.left + r.width / 2, r.top + r.height / 2);
      }
    });
  });
  document.addEventListener('click', (e) => { if (e.target.closest('.pav-exit')) closePav(); });

  /* Recording facades: poster until clicked, then the real player. */
  document.addEventListener('click', (e) => {
    const r = e.target.closest('.rec[data-yt]');
    if (!r) return;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube.com/embed/' + r.dataset.yt + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.referrerPolicy = 'strict-origin-when-cross-origin';
    f.allowFullscreen = true;
    f.title = r.dataset.title || 'Pylon recording';
    r.appendChild(f);
    r.classList.add('is-live');
    r.removeAttribute('data-yt');
  });
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t.classList && t.classList.contains('rec')) { e.preventDefault(); t.click(); }
  });
  scrim.addEventListener('click', closePav);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePav(); });
})();
