(() => {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCap');
  if (!lb || !img) return;
  let open = false;

  function show(src, alt) {
    img.src = src;
    img.alt = alt || '';
    cap.textContent = alt || 'Click anywhere to close';
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    open = true;
  }
  function hide() {
    if (!open) return;
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    open = false;
  }

  // Bind every filled post / lookbook thumbnail.
  document.querySelectorAll('.post-grid .ph.is-filled, .lg-grid .ph.is-filled').forEach(cell => {
    const thumb = cell.querySelector('img');
    if (!thumb) return;
    cell.addEventListener('click', () => {
      const full = thumb.getAttribute('data-full') || thumb.getAttribute('src');
      show(full, thumb.alt);
    });
  });

  // Click anywhere (image or backdrop) reverts to the grid; Esc also closes.
  lb.addEventListener('click', hide);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
})();
