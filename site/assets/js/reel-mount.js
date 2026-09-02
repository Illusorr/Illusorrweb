/* ─────────────────────────────────────────────────────────────────────
   ILLUSORR — reel facade.

   The homepage reel is a YouTube embed. Left with a live src it pulled the
   whole player on page load: 932KB desktop, 1432KB phone. A self-hosted still
   stands in and the real iframe mounts only when the reel is near the
   viewport, so the autoplay-on-arrival behaviour is unchanged but a visitor
   who never reaches it pays nothing.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';
  var frames = document.querySelectorAll('iframe.reel-embed[data-src]');
  if (!frames.length) return;

  function mount(f) {
    if (f.getAttribute('src')) return;
    f.setAttribute('src', f.dataset.src);
    var media = f.closest('.reel-media');
    if (media) f.addEventListener('load', function () { media.classList.add('is-live'); });
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(frames, mount);
    return;
  }
  /* Observe the SECTION, not the iframe. The reel lives inside a
     transform-positioned stage with overflow:hidden, so the frame itself
     never registers as intersecting the viewport: the stage moves, the page
     does not scroll it into view. The section does scroll normally. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var list = e.target.querySelectorAll('iframe.reel-embed[data-src]');
      Array.prototype.forEach.call(list, mount);
    });
  }, { rootMargin: '400px 0px' });   /* mount just before the section arrives */

  var seen = [];
  Array.prototype.forEach.call(frames, function (f) {
    var host = f.closest('section') || f.closest('.reelwwd') || f.parentElement;
    if (seen.indexOf(host) !== -1) return;
    seen.push(host);
    io.observe(host);
  });
})();
