/* Selected output reel — horizontal walk through the project.
   Vertical wheel is translated to horizontal travel, drag works with a
   pointer, and the video card only plays while it is actually on screen. */
(function () {
  'use strict';
  var reel = document.getElementById('reel');
  if (!reel) return;

  var track = document.getElementById('reelTrack');
  var bar = document.getElementById('reelBar');
  var idxEl = document.getElementById('reelIdx');
  var panel = reel.closest('.sd-panel');
  var cells = Array.prototype.slice.call(track.children);
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  var raf = null;
  function sync() {
    raf = null;
    var max = reel.scrollWidth - reel.clientWidth;
    var p = max > 0 ? reel.scrollLeft / max : 0;
    if (bar) bar.style.transform = 'translateX(' + (p * (100 / 0.18 - 100)) + '%)';

    // the cell nearest the left reading edge is the one being looked at
    var edge = reel.getBoundingClientRect().left + reel.clientWidth * 0.28;
    var best = 0, bestD = Infinity;
    cells.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var d = Math.abs(r.left + r.width / 2 - edge);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (idxEl) idxEl.textContent = pad(best + 1);
  }
  function queue() { if (!raf) raf = requestAnimationFrame(sync); }
  reel.addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);

  /* wheel: a vertical gesture should move the reel, but only while there is
     reel left to travel, so the page can still scroll past the panel */
  reel.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    var dy = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    var max = reel.scrollWidth - reel.clientWidth;
    var next = reel.scrollLeft + dy;
    if (next > 0 && next < max) {
      e.preventDefault();
      reel.scrollLeft = next;
    }
  }, { passive: false });

  /* drag */
  var down = false, sx = 0, sl = 0, moved = 0;
  reel.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch') return;          // native touch scroll is better
    down = true; moved = 0; sx = e.clientX; sl = reel.scrollLeft;
    reel.classList.add('is-drag');
    reel.setPointerCapture(e.pointerId);
  });
  reel.addEventListener('pointermove', function (e) {
    if (!down) return;
    var d = e.clientX - sx;
    moved = Math.max(moved, Math.abs(d));
    reel.scrollLeft = sl - d;
  });
  function release(e) {
    if (!down) return;
    down = false;
    reel.classList.remove('is-drag');
    try { reel.releasePointerCapture(e.pointerId); } catch (err) {}
  }
  reel.addEventListener('pointerup', release);
  reel.addEventListener('pointercancel', release);
  reel.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); }, true);

  /* keyboard: step by cell rather than by pixel */
  reel.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    var dir = e.key === 'ArrowRight' ? 1 : -1;
    var edge = reel.getBoundingClientRect().left;
    var target = null;
    for (var i = 0; i < cells.length; i++) {
      var off = cells[i].getBoundingClientRect().left - edge;
      if (dir > 0 && off > 8) { target = cells[i]; break; }
      if (dir < 0 && off < -8) target = cells[i];
    }
    if (target) {
      reel.scrollTo({
        left: reel.scrollLeft + (target.getBoundingClientRect().left - edge) - 2,
        behavior: reduced ? 'auto' : 'smooth'
      });
    }
  });

  /* the video card carries weight, so it only runs while it is visible */
  var vid = track.querySelector('video');
  if (vid && window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) {
          if (!vid.getAttribute('src')) return;
          vid.play().catch(function () {});
        } else { vid.pause(); }
      });
    }, { root: reel, threshold: 0.35 }).observe(vid);
  }

  /* cells stagger in when the panel arrives */
  if (panel && window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) { panel.classList.toggle('in', en.isIntersecting); });
    }, { threshold: 0.25 }).observe(panel);
  } else if (panel) { panel.classList.add('in'); }

  sync();
})();
