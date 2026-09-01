# ILLUSORR — Website

Static multi-page site. No build step: deploy the `site/` folder as-is to any static host (Netlify, Vercel, Cloudflare Pages, S3+CloudFront). Domain: https://illusorr.com

## Structure

```
site/
  index.html            Home (only page that loads the WebGL field)
  work.html             Filterable grid, 36 projects
  about.html            Studio
  sectors.html          Sectors hub
  sectors/<slug>.html   6 sector pages (beauty, fashion, real-estate, gaming, culture, business)
  lab.html              Original IP & tech
  collective.html       Talent pipeline
  contact.html          Direct enquiry
  brief.html            Guided brief intake (deep-linkable: brief.html?intent=pricing&sector=...)
  projects/<slug>.html  36 project pages: 27 full designed case studies imported from the
                        design project; 9 placeholder shells (hob, monaco-chain,
                        aquatic-architects, lapillus, illusorr-spaces, ant-systems,
                        alberwaz, arga + any future additions)
  assets/
    css/base.css        The palette and type tokens, lifted verbatim from main.css.
                        NOT YET LOADED BY ANY PAGE — adopting it is a per-page
                        decision, reviewed in tools/tokens-review.dc.html (outside
                        site/, so it never deploys). Site-wide values only: main.css
                        also re-declares some tokens inside #aboutRoot and #workGrid
                        on purpose, so those sections run a fraction lighter. Leave
                        those alone.
    css/mobile.css      The mobile layer, additive: every rule is gated behind
                        html[data-touch] (set by js/mobile.js on devices with no
                        hover-capable pointer) or a max-width query. Remove the
                        <link> and the page is exactly as it was. Feature switches
                        use [data-touch]; max-width is for layout only.
    css/main.css        Shared stylesheet for the site shell (home, work, about, sectors,
                        lab, collective, contact, brief + placeholder project shells)
    css/nav.css         The header and menu overlay, every page. il- namespaced so
                        per-page case CSS cannot collide with it.
    css/case/           Shared case-study layer, extracted from the pages themselves:
      fonts.css         @font-face for every case-study family, all self-hosted:
                        Outfit, PP Monument Extended, Squaresharps, Cormorant
                        Garamond (variable, roman + italic) and Space Mono.
                        Every case page links it. No remote font requests remain
                        on any case study.
      case-base.css     the 45KB editorial case layout (al-berwaz, ant-systems, arga,
                        coffee-merchant)
      hero-refine*.css rhythm-refine*.css proj-tags*.css cm-type*.css
                        the small refinement layers. Suffixes -b/-c/-d are genuinely
                        different variants, not copies: check which one a page links
                        before editing.
    projects/<name>/    per-case-study media (imported: barbie, fabrika, echoes, trt,
                        uhub, optiverse, pylon, metagenus, metaculture, koton-*, v5, shared…)
    js/case/ css/case/   case-study helper scripts/styles (image-slot, trt-orb, uhub-spaces…)
    js/                 Page-scoped modules, all loaded with `defer`:
      nav.js            the one navigation script, every page: menu open/close,
                        light/dark header inversion (data-tone or data-bg-theme
                        hints win over measurement) and the frosted glass band.
                        Markup contract: #ilTopbar / #ilOverlay / #ilMenuOpen /
                        #ilMenuClose, classes il-topbar, il-brand, il-logo,
                        il-talk, il-burger, il-overlay, il-ohead, il-oclose,
                        il-ofoot. Copy the block from any existing page.
      home.js field.js  home only (field.js = WebGL background)
      work.js           work grid filters
      components.js     rails, reveals, sector stacks, canvas studies
      case/             shared case-study behaviour, extracted from inline scripts:
                        cursor-scroll.js (pointer follower + smooth anchors, 14 pages),
                        hero-carousel.js / -b / -c (three variants), film-carousel.js,
                        lightbox.js, reveal-reel.js, nav-tone.js, cursor-dot.js,
                        cursor-legacy.js, rail-drag.js
      mobile.js         The mobile layer's behaviour. Loaded in <head> so
                        html[data-touch] is set before first paint. On touch
                        devices it: strips autoplay/preload from every <video>
                        and puts it behind a tap (stashing data-src as data-m-src
                        so page-level lazy loaders skip it), removes pointer-
                        follower elements, and turns a 3D canvas into a tap-to-
                        load placeholder. Add ?mobile=1 to any URL to force the
                        whole mobile layer on from a desktop browser.
                        A page with heavy libraries keeps them in a <template>
                        and exposes window.MG_START_3D (see metagenus.html);
                        mobile.js calls that instead of guessing load order.
      about.js contact.js brief.js
    fonts/*.woff        self-hosted (Outfit variable, PP Monument Extended, Squaresharps,
                        Cormorant Garamond variable roman + italic, Space Mono 400/700,
                        Fraunces variable). Fraunces' @font-face lives in main.css;
                        the case-study families live in css/case/fonts.css.
    fonts/licences/     OFL text for the open-licence families, as the licence requires.
                        Fraunces, Cormorant Garamond, Space Mono and Outfit are OFL;
                        PP Monument Extended is commercially licensed — do not
                        redistribute it outside this site.
                        No page on the site requests a remote font. The one
                        exception is the standalone embeds under
                        projects/ant-live/, projects/aa/ and projects/lap/, which
                        still pull Outfit and IBM Plex Mono from Google Fonts.
    img/
      brand/            logo pngs (light/dark)
      sectors/<name>.jpg   sector hero imagery
      projects/<slug>/cover.webp   project covers, max 1200px wide
      og/og-default.jpg    social share card (1200x630)
      about/team-*.jpg
  sitemap.xml robots.txt
```

## Conventions

- **Images**: `assets/img/projects/<slug>/<name>.webp` (photographic fallback `.jpg`). Max 1600px wide, WebP q≈80. Covers are always `cover.webp`.
- **Video**: `assets/video/<slug>/<name>.webm` (VP9) with `<name>.mp4` (H.264) fallback and `<name>-poster.webp`. Use `preload="none" poster="..."`.
- **Slugs**: lowercase kebab-case, matching `projects/<slug>.html`, the work-grid `data-slug`, and the asset folder name.
- **SEO per page**: unique `<title>`, `meta description`, `link canonical`, OG/Twitter tags, JSON-LD (Organization on home, CreativeWork on projects). Keep these when replacing project pages.
- **Replacing a project page**: drop the new page at `projects/<slug>.html`, keep the `<head>` SEO block, the `assets/js/nav.js` include, and the shared topbar/overlay markup so navigation keeps working. Add the page's media under `assets/img/projects/<slug>/` and `assets/video/<slug>/`.
- **Sitemap**: `sitemap.xml` lists only pages with real content. Deliberately excluded until
  their content arrives: `projects/hob.html`, `projects/metacon.html`,
  `projects/monaco-chain.html` (archived placeholder shells) and
  `projects/spaces-breakpoints.html` (test page). Add each `<loc>` back at the same time
  you add the content, not before.

## Performance notes

- WebGL fluid field runs on Home only; inner pages use static gradients.
- All JS is `defer`; no blocking scripts. Fonts are self-hosted, preloaded, `font-display: swap`.
- All former base64 payloads (≈1MB) extracted to cacheable files.
