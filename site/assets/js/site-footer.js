/* ILLUSORR — global site footer, injected on every page.
   Self-contained: the styles are inlined below (assets/css/footer.css is the
   readable source of truth — re-inline CSS_TEXT after editing it), and the
   path prefix is derived from any existing assets/ reference, so the same file
   works at the root and one level down (projects/, sectors/), on pages that
   load main.css and on the case studies that do not.
   Skipped on app-shell pages with no document flow, and on <body
   data-no-site-footer>. */
(function () {
var CSS_TEXT = "/* ILLUSORR — global site footer.\n   Self-contained: case-study pages do not load main.css, so every value the\n   footer needs is declared here (tokens, wordmark font, logo art). */\n\n@font-face{font-family:'Squaresharps';font-style:normal;font-weight:400;font-display:swap;\n  src:url(../fonts/squaresharps-400.woff) format('woff')}\n\n.sfoot{--sf-bg:#05060a;--sf-ink:#eef1f8;--sf-dim:#8b96ad;--sf-faint:#8b96ad;\n  --sf-line:#1b2231;--sf-indigo:#4c63ff;--sf-cold:#8ea2ff;\n  box-sizing:border-box;position:relative;background:var(--sf-bg);color:var(--sf-ink);\n  font-family:'Outfit',system-ui,sans-serif;-webkit-font-smoothing:antialiased;\n  border-top:1px solid var(--sf-line);text-align:left;\n  padding:clamp(44px,5.4vw,84px) clamp(18px,3.2vw,46px) clamp(22px,2.4vw,34px);\n  overflow:hidden;z-index:2}\n.sfoot *{box-sizing:border-box}\n\n.sf-in{position:relative;z-index:2;display:grid;\n  grid-template-columns:minmax(280px,1.15fr) repeat(3,minmax(120px,.62fr));\n  gap:clamp(26px,3.4vw,56px)}\n.sf-brand{display:flex;flex-direction:column;align-items:flex-start;gap:18px}\n.sf-logo{display:block;width:116px;height:34px;flex:none;\n  background:url(../img/brand/logo-on-dark.webp) left center/contain no-repeat}\n.sf-say{margin:0;font-size:15px;font-weight:300;line-height:1.65;color:var(--sf-dim);\n  max-width:340px;text-wrap:pretty}\n.sf-mail{font-weight:700;letter-spacing:-.02em;font-size:clamp(20px,2.2vw,32px);\n  color:var(--sf-ink);text-decoration:none;border-bottom:1px solid var(--sf-line);\n  padding-bottom:4px;transition:.28s}\n.sf-mail:hover{color:var(--sf-cold);border-color:var(--sf-cold)}\n.sf-partner{margin:0;font-size:12px;letter-spacing:.06em;color:var(--sf-faint);\n  line-height:1.6;max-width:300px}\n.sf-partner b{display:block;font-weight:400;color:var(--sf-dim);letter-spacing:.16em;\n  text-transform:uppercase;font-size:12px;margin-bottom:6px}\n\n.sf-col{display:flex;flex-direction:column;min-width:0}\n.sf-col h4{margin:0;font-size:12px;letter-spacing:.24em;text-transform:uppercase;\n  color:var(--sf-cold);font-weight:400;padding-bottom:14px;border-bottom:1px solid var(--sf-line)}\n.sf-col a{display:flex;align-items:center;justify-content:space-between;gap:10px;\n  font-size:14px;font-weight:300;color:var(--sf-dim);text-decoration:none;cursor:pointer;\n  padding:9px 0;border-bottom:1px solid rgba(27,34,49,.55);\n  transition:color .22s,padding .28s cubic-bezier(.16,1,.3,1)}\n.sf-col a::after{content:\"↗\";font-size:10px;color:var(--sf-indigo);opacity:0;\n  transform:translateX(-4px);transition:.28s cubic-bezier(.16,1,.3,1)}\n.sf-col a:hover{color:var(--sf-ink);padding-left:8px}\n.sf-col a:hover::after{opacity:1;transform:none}\n.sf-col a[aria-current=\"page\"]{color:var(--sf-ink)}\n\n.sf-bar{position:relative;z-index:2;margin-top:clamp(34px,4vw,64px);\n  padding:18px 0 0;border-top:1px solid var(--sf-line);\n  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;\n  font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--sf-faint)}\n.sf-bar .sf-note{color:var(--sf-dim)}\n.sf-top{color:var(--sf-dim);text-decoration:none;cursor:pointer;transition:.22s}\n.sf-top:hover{color:var(--sf-cold)}\n\n@media(max-width:980px){\n  .sf-in{grid-template-columns:1fr 1fr}\n  .sf-brand{grid-column:1/-1}\n}\n@media(max-width:560px){\n  .sf-in{grid-template-columns:1fr;gap:26px}\n  .sf-bar{flex-direction:column;align-items:flex-start;gap:8px}\n}\n";


/* App-shell pages (a stack of position:fixed layers inside an overflow:hidden
   body) have no document flow to append to: a footer there would paint over
   the experience and be unreachable. Skip those, and honour an explicit
   <body data-no-site-footer> opt-out. */
function hasDocumentFlow() {
  var b = document.body;
  if (!b) return false;
  /* any in-flow child with real height means there is a document to append to */
  var kids = b.children, flow = false;
  for (var i = 0; i < kids.length; i++) {
    var el = kids[i];
    if (/^(SCRIPT|LINK|STYLE|TEMPLATE|NOSCRIPT|META)$/.test(el.tagName)) continue;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.position === 'fixed' || cs.position === 'absolute') continue;
    if (el.getBoundingClientRect().height > 4) { flow = true; break; }
  }
  if (!flow) return false;
  /* clipped AND nothing to scroll: a footer would sit off-screen unreachable */
  var bs = getComputedStyle(b), hs = getComputedStyle(document.documentElement);
  var clipped = /hidden|clip/.test(bs.overflowY) || /hidden|clip/.test(hs.overflowY);
  if (clipped && document.documentElement.scrollHeight <= window.innerHeight + 8) return false;
  return true;
}

function build() {
  if (document.querySelector('.sfoot')) return;
  if (document.body.hasAttribute('data-no-site-footer')) return;
  if (!hasDocumentFlow()) return;

  var ref = document.querySelector('link[href*="assets/css/"], script[src*="assets/js/"]');
  var url = ref ? (ref.getAttribute('href') || ref.getAttribute('src')) : '';
  var pre = (url.match(/^((?:\.\.\/)*)assets\//) || ['', ''])[1];

  if (!document.getElementById('sfoot-css')) {
    var st = document.createElement('style');
    st.id = 'sfoot-css';
    st.textContent = CSS_TEXT.replace(/\.\.\/(img|fonts)\//g, pre + 'assets/$1/');
    document.head.appendChild(st);
  }

  /* a legacy footer's second line is the page's own colophon — keep it */
  var note = '';
  Array.prototype.forEach.call(document.querySelectorAll('.footer, footer.foot'), function (el) {
    var d = el.querySelectorAll('div');
    if (!note && d.length > 1) note = d[1].textContent.trim();
    el.parentNode.removeChild(el);
  });

  var nav = [
    ['Home', 'index.html'], ['About', 'about.html'], ['Sectors', 'sectors.html'],
    ['Work', 'work.html'], ['Lab', 'lab.html'], ['Collective', 'collective.html'],
    ['Contact', 'contact.html']
  ];
  var sectors = [
    ['Fashion', 'sectors/fashion.html'], ['Beauty', 'sectors/beauty.html'],
    ['Real estate', 'sectors/real-estate.html'], ['Gaming', 'sectors/gaming.html'],
    ['Culture', 'sectors/culture.html'], ['Business', 'sectors/business.html']
  ];
  var studio = [['Start a brief', 'brief.html'], ["Let's talk", 'contact.html']];
  /* These rendered as bare <a> with no href, so all four looked like links
     and none of them went anywhere. Behance and Vimeo are dropped: the
     studio does not run them. */
  var social = [
    ['Instagram', 'https://www.instagram.com/illusorr/'],
    ['LinkedIn',  'https://www.linkedin.com/company/illusorr/'],
    ['YouTube',   'https://www.youtube.com/illusorr']
  ];

  var here = location.pathname.split('/').pop() || 'index.html';
  function links(list) {
    return list.map(function (l) {
      var file = l[1].split('/').pop();
      var cur = file === here ? ' aria-current="page"' : '';
      return '<a href="' + pre + l[1] + '"' + cur + '>' + l[0] + '</a>';
    }).join('');
  }

  var html =
    '<footer class="sfoot">' +
      '<div class="sf-in">' +
        '<div class="sf-brand">' +
          '<a class="sf-logo" href="' + pre + 'index.html" aria-label="ILLUSORR home"></a>' +
          '<p class="sf-say">A multidisciplinary studio building original worlds, engines and IP, ' +
            'from Abu Dhabi to wherever the work lands.</p>' +
          '<a class="sf-mail" href="mailto:hello@illusorr.com">hello@illusorr.com</a>' +
          '<p class="sf-partner"><b>In partnership with</b>Abu Dhabi Gaming · Department of ' +
            'Culture and Tourism, Abu Dhabi</p>' +
        '</div>' +
        '<nav class="sf-col" aria-label="Site"><h4>Navigate</h4>' + links(nav) + '</nav>' +
        '<nav class="sf-col" aria-label="Sectors"><h4>Sectors</h4>' + links(sectors) + '</nav>' +
        '<nav class="sf-col" aria-label="Studio"><h4>Studio</h4>' + links(studio) +
          social.map(function (s) {
            return '<a href="' + s[1] + '" target="_blank" rel="noopener me">' +
                   s[0] + '</a>';
          }).join('') +
        '</nav>' +
      '</div>' +
      '<div class="sf-bar">' +
        '<span>© ' + new Date().getFullYear() + ' ILLUSORR</span>' +
        '<span>Yas Creative Hub · Abu Dhabi</span>' +
        (note ? '<span class="sf-note">' + note + '</span>' : '') +
        '<a class="sf-top" href="#top">Back to top ↑</a>' +
      '</div>' +
    '</footer>';

  document.body.insertAdjacentHTML('beforeend', html);
  var top = document.querySelector('.sf-top');
  if (top) top.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Retried: a page that is still mid-intro when the first attempt runs (body
   briefly clipped, content not laid out) gets the footer on a later pass.
   build() is idempotent. */
function attempt() { try { build(); } catch (e) {} }
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function () { requestAnimationFrame(attempt); });
} else {
  requestAnimationFrame(attempt);
}
addEventListener('load', attempt);
setTimeout(attempt, 1500);
})();
