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
  var MIN_TAIL = 0.34;   /* last line must reach this share of the line above */
  var MAX_JOIN = 6;      /* never drag more than this many words down */

  function lines(el) {
    var r = document.createRange();
    r.selectNodeContents(el);
    var rects = Array.prototype.filter.call(r.getClientRects(), function (x) { return x.width > 1; });
    if (rects.length < 2) return null;
    return { last: rects[rects.length - 1].width, prev: rects[rects.length - 2].width, n: rects.length };
  }

  function bind(el) {
    /* plain text blocks only: anything with inline structure is left alone
       rather than risk rewriting markup the page's own scripts depend on */
    if (el.children.length) return;

    var orig = el.getAttribute('data-orphan-src');
    if (orig === null) { orig = el.textContent; el.setAttribute('data-orphan-src', orig); }
    if (el.textContent !== orig) el.textContent = orig;      /* re-solve from clean text */

    var words = orig.trim().split(/\s+/);
    if (words.length < 3) return;

    var m = lines(el);
    if (!m) return;                                          /* single line: nothing to strand */
    if (m.last >= m.prev * MIN_TAIL) return;                 /* already substantial */

    /* Bind progressively. Two words satisfies the letter of the rule but a
       short tail still reads as stranded, so keep pulling words down until the
       last line looks deliberate, or until doing so would cost a whole extra
       line. */
    var best = null;
    for (var join = 2; join <= MAX_JOIN && join < words.length; join++) {
      var tail = words.slice(words.length - join).join(NBSP);
      el.textContent = words.slice(0, words.length - join).join(' ') + ' ' + tail;
      var n = lines(el);
      if (!n) { el.textContent = orig; return; }             /* collapsed to one line */
      if (n.n > m.n) break;                                  /* cost an extra line: too far */
      best = el.textContent;
      if (n.last >= n.prev * MIN_TAIL) return;               /* good enough, stop */
    }
    el.textContent = best !== null ? best : orig;
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
