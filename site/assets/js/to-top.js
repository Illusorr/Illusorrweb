/* Back to top — self-injecting, no markup required.
   A thin ring reports how far through the page you are; the disc lifts you back.
   Appears only once there is a meaningful distance to return from. */
(function () {
  if (window.__illToTop) return;
  window.__illToTop = true;

  const SHOW_AT = 1.2;              // viewport heights scrolled before it appears
  const R = 15.5, C = 2 * Math.PI * R;

  function build() {
    if (document.querySelector('.ill-totop')) return;

    const css = document.createElement('style');
    css.textContent = `
.ill-totop{position:fixed;right:clamp(16px,2.2vw,30px);bottom:clamp(16px,2.4vh,32px);z-index:940;
  width:46px;height:46px;padding:0;border:0;border-radius:50%;cursor:pointer;
  display:grid;place-items:center;background:rgba(8,11,20,.58);color:#eef1f8;
  -webkit-backdrop-filter:blur(10px) saturate(1.2);backdrop-filter:blur(10px) saturate(1.2);
  box-shadow:0 6px 26px rgba(0,0,0,.42),inset 0 0 0 1px rgba(238,241,248,.14);
  opacity:0;transform:translateY(14px) scale(.9);pointer-events:none;
  transition:opacity .42s cubic-bezier(.2,.7,.2,1),transform .42s cubic-bezier(.2,.7,.2,1),
             box-shadow .3s ease,background .3s ease}
.ill-totop.on{opacity:1;transform:none;pointer-events:auto}
.ill-totop:hover{background:rgba(12,17,32,.74);
  box-shadow:0 8px 30px rgba(0,0,0,.5),inset 0 0 0 1px rgba(142,162,255,.42)}
.ill-totop:active{transform:scale(.94)}
.ill-totop:focus-visible{outline:2px solid #8ea2ff;outline-offset:3px}
.ill-totop svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);overflow:visible}
.ill-totop .tt-tr{fill:none;stroke:rgba(238,241,248,.13);stroke-width:1.5}
.ill-totop .tt-pr{fill:none;stroke:#8ea2ff;stroke-width:1.5;stroke-linecap:round;
  stroke-dasharray:${C.toFixed(2)};stroke-dashoffset:${C.toFixed(2)};
  transition:stroke-dashoffset .12s linear;filter:drop-shadow(0 0 5px rgba(142,162,255,.5))}
.ill-totop .tt-ar{position:relative;width:13px;height:13px;fill:none;stroke:currentColor;
  stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;transform:none;inset:auto;
  transition:transform .3s cubic-bezier(.2,.7,.2,1)}
.ill-totop:hover .tt-ar{transform:translateY(-2px)}
@media (prefers-reduced-motion:reduce){.ill-totop,.ill-totop .tt-ar{transition:opacity .2s linear}}
@media print{.ill-totop{display:none}}`;
    document.head.appendChild(css);

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ill-totop';
    b.setAttribute('aria-label', 'Back to top');
    b.title = 'Back to top';
    b.innerHTML =
      '<svg viewBox="0 0 46 46" aria-hidden="true">' +
        '<circle class="tt-tr" cx="23" cy="23" r="' + R + '"></circle>' +
        '<circle class="tt-pr" cx="23" cy="23" r="' + R + '"></circle>' +
      '</svg>' +
      '<svg class="tt-ar" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M12 19V6M6 11.5 12 5.5l6 6"></path>' +
      '</svg>';
    document.body.appendChild(b);

    const ring = b.querySelector('.tt-pr');
    let shown = false, raf = 0;

    function frame() {
      raf = 0;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const max = Math.max(1, (document.documentElement.scrollHeight || 0) - innerHeight);
      const p = Math.min(1, Math.max(0, y / max));
      ring.style.strokeDashoffset = (C * (1 - p)).toFixed(2);
      const want = y > innerHeight * SHOW_AT && max > innerHeight * 0.6;
      if (want !== shown) { shown = want; b.classList.toggle('on', want); }
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(frame); }

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    frame();

    b.addEventListener('click', () => {
      const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
