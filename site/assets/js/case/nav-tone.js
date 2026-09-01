(function() {
  const nav = document.querySelector('.topnav');
  const sections = Array.from(document.querySelectorAll('section[data-tone]'));
  const dots = Array.from(document.querySelectorAll('.rail-dot'));
  let ticking = false;
  function update() {
    ticking = false;
    const mid = window.scrollY + window.innerHeight * 0.45;
    let active = null;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top + window.scrollY <= mid) active = s;
    }
    const isDark = active ? active.getAttribute('data-tone') === 'dark' : false;
    if (nav) nav.classList.toggle('on-dark', isDark);
    dots.forEach(d => {
      const i = parseInt(d.dataset.i);
      const s = sections.find(s => parseInt(s.dataset.rail) === i);
      const dark = s ? s.getAttribute('data-tone') === 'dark' : false;
      d.classList.toggle('on-dark', dark);
      const top = s ? s.getBoundingClientRect().top + window.scrollY : 0;
      const bot = s ? top + s.offsetHeight : 0;
      d.classList.toggle('is-active', window.scrollY + window.innerHeight * 0.5 >= top && window.scrollY + window.innerHeight * 0.5 < bot);
    });
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
})();
