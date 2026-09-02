/* ─────────────────────────────────────────────────────────────────────
   ILLUSORR — orphan control.

   House rule: no word is left alone on the last line.

   The rule is about WORD COUNT, not line width. "than a one-off." is three
   words and reads fine; a lone "one-off." does not. So the last two words are
   bound with a non-breaking space, which no browser will break, guaranteeing
   the final line always carries at least two words.

   CSS handles what it can: text-wrap:balance evens out short blocks. It is
   capped by the browser (Chrome around six lines) so long paragraphs fall
   through, and text-wrap:pretty measurably does not fix them — on about.html
   it left a 47px last line, identical to normal wrapping.

   Idempotent: the original text is kept in data-orphan-src and restored
   before each re-solve, so this is safe to run on every resize.
   ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var SEL = 'p, li, dd, dt, figcaption, blockquote, h1, h2, h3, h4, ' +
            '.lede, .sub, .module-title, .st, .ct, .meta-v';
  var NBSP = ' ';

  function bind(el) {
    /* plain text blocks only: anything with inline structure is left alone
       rather than risk rewriting markup the page's own scripts depend on */
    if (el.children.length) return;

    var orig = el.getAttribute('data-orphan-src');
    if (orig === null) { orig = el.textContent; el.setAttribute('data-orphan-src', orig); }

    var words = orig.trim().split(/\s+/);
    if (words.length < 3) return;               /* nothing to strand */

    var tail = words[words.length - 2] + NBSP + words[words.length - 1];

    /* If the bound pair is wider than the container it would force an
       overflow, which is worse than the orphan. Leave those alone. */
    var probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
    probe.textContent = tail.replace(/ /g, ' ');
    el.appendChild(probe);
    var tooWide = probe.offsetWidth > el.clientWidth * 0.9;
    el.removeChild(probe);
    if (tooWide) { if (el.textContent !== orig) el.textContent = orig; return; }

    var next = words.slice(0, words.length - 2).join(' ') + ' ' + tail;
    if (el.textContent !== next) el.textContent = next;
  }

  function run() {
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      if (el.offsetWidth < 40) continue;
      try { bind(el); } catch (e) {}
    }
  }

  var t;
  function schedule() { clearTimeout(t); t = setTimeout(run, 140); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule);
})();
