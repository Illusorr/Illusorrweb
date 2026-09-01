# CLAUDE.md

Guidance for Claude Code working in this repository.

## Chat style
Do not use hyphens or dashes in chat responses. No em dashes, no en dashes, no hyphenated
compounds. Rewrite the sentence instead: use commas, colons, separate sentences, or
closed/spaced word forms.

This applies to chat messages only, not to code, file names, CSS properties, or copy inside
the designs themselves.

## What this project is

The ILLUSORR studio website. A static multi page site, no build step, no framework, no
package.json. Deploy the `site/` folder as is to any static host. Domain: https://illusorr.com

Everything outside `site/` is workshop material and must never ship:

```
site/        the deployable site. This is the product.
tools/       internal review pages and generated JSON manifests (image audits,
             colour map, token review). Deliberately outside site/.
reference/   design mockups kept for reference only.
import-aa/   staging folders for case studies imported from other projects.
import-lap/
uploads/     raw user drops: fonts, source images, briefs. Treat as input, not source.
screenshots/ review captures.
```

## Ground rules

1. **No build step.** Never introduce npm, bundlers, TypeScript, JSX, or a framework.
   Plain HTML, plain CSS, plain ES modules loaded with `defer`.
2. **No remote requests from `site/`.** Fonts, scripts and styles are all self hosted. The
   only exceptions are the standalone embeds under `site/projects/ant-live/`, `aa/` and
   `lap/`, which still pull from Google Fonts.
3. **Match the page you are editing.** Read the whole page and its linked CSS before
   changing anything. Copy the existing pattern rather than inventing a new one.
4. **Small edits stay small.** Change what was asked. Do not reformat, retitle or
   restructure surrounding markup.
5. **Preserve the head block.** Every page carries `<title>`, meta description, canonical,
   OG and Twitter tags, and often JSON-LD. Keep them when replacing page bodies.

## Site structure

```
site/
  index.html          home, the only page that loads the WebGL field (js/field.js)
  work.html           filterable grid, 36 projects
  about.html sectors.html lab.html collective.html contact.html brief.html
  404.html            noindex, excluded from sitemap
  sectors/<slug>.html 6 sector pages
  projects/<slug>.html 36 project pages: 27 designed case studies, 9 placeholder shells
  assets/css assets/js assets/fonts assets/img assets/video assets/projects
  sitemap.xml robots.txt
  _index.json _pages.json _ren.json _apo-map.json   generated indexes
```

`site/README.md` holds the long form notes on every folder. Read it before touching the
asset layer.

## CSS layers, in cascade order

| File | Scope |
| --- | --- |
| `css/main.css` | the shell: tokens, page system, every shared component |
| `css/nav.css` | topbar and menu overlay, `il-` namespaced, every page |
| `css/mobile.css` | shared touch layer, gated on `html[data-touch]` |
| `css/pages-mobile.css` | phone edition of the site pages, gated the same way |
| `css/case/*` | case study layer: `fonts.css`, `case-base.css`, refinement layers |
| `css/base.css` | token file, **not yet loaded by any page**, adoption is per page |

Rules:

- Tokens live in `:root` in `main.css`: `--bg --ink --dim --faint --line --indigo --cold
  --glow --own --cream --cream-ink --cream-dim --cream-line --head --track`. Never invent a
  colour. `#aboutRoot` and `#workGrid` redeclare some tokens on purpose, leave that alone.
- The mobile layers are additive. Every rule is behind `html[data-touch]` or a max width
  query, so removing the `<link>` restores desktop exactly. Keep it that way.
- Case refinement layers with `-b` `-c` `-d` suffixes are genuinely different variants, not
  copies. Check which one a page links before editing it.
- Type: `PP Monument Extended` for the big header tier via `.mnt` and `var(--head)`,
  `Outfit` for everything else. Case studies add Squaresharps, Cormorant Garamond and Space
  Mono through `css/case/fonts.css`.

## JavaScript

All page scripts are `defer` and page scoped. `js/mobile.js` is the exception: it loads in
`<head>` so `html[data-touch]` is set before first paint.

- `nav.js` runs on every page. Markup contract: `#ilTopbar` `#ilOverlay` `#ilMenuOpen`
  `#ilMenuClose` and the `il-topbar il-brand il-logo il-talk il-burger il-overlay il-ohead
  il-oclose il-ofoot` classes. Copy the header and overlay block verbatim from an existing
  page when creating a new one.
- `mobile.js` strips autoplay from video behind a tap, removes pointer followers, and turns
  3D canvases into tap to load placeholders. A page with heavy libraries keeps them in a
  `<template>` and exposes a global starter, see `window.MG_START_3D` in
  `projects/metagenus.html`. Force the layer from desktop with `?mobile=1`.
- `collective.js` carries the page data at the top of the file: `TERRITORIES`,
  `DISCIPLINES`, `COMMISSIONS`, `BOARD_UPDATED`. Edit those arrays, the map, filters,
  constellation and totals all follow. A commission's `disc` must match a `DISCIPLINES`
  name or the filter will not reach it.
- `js/case/` holds the shared case study behaviour extracted from inline scripts:
  `cursor-scroll.js`, `hero-carousel.js` and its `-b` `-c` variants, `film-carousel.js`,
  `lightbox.js`, `reveal-reel.js`, `nav-tone.js`, `rail-drag.js`.

## Conventions

- **Slugs**: lowercase kebab case, identical across `projects/<slug>.html`, the work grid
  `data-slug`, and `assets/img/projects/<slug>/`.
- **Images**: `assets/img/projects/<slug>/<name>.webp`, max 1600px wide, WebP q80. Covers
  are always `cover.webp`, max 1200px.
- **Video**: `assets/video/<slug>/<name>.webm` (VP9) plus `.mp4` fallback and
  `<name>-poster.webp`. Always `preload="none"` with a poster.
- **Section theming**: sections carry `light` or `dark` plus `data-bg-theme`, which `nav.js`
  reads to invert the header. Set it, do not rely on measurement.
- **Sitemap**: `sitemap.xml` lists only pages with real content. Placeholder shells
  (`hob`, `metacon`, `monaco-chain`), the test page `spaces-breakpoints.html` and `404.html`
  stay out. Add a `<loc>` at the same time as the content, not before.

## Accessibility and performance floors

- Touch targets: 44px minimum, 48px for primary buttons.
- Phone type: 16px body, 11px labels, Monument capped at 28 to 34px.
- One gutter on phone: 20px. Spacing scale: 8 / 12 / 20 / 40 / 128.
- No blocking scripts. Fonts preloaded with `font-display: swap`. WebGL runs on home only.

## Before you finish

- Open the page and check the console is clean.
- Check the phone layer with `?mobile=1` and a narrow window, both paths exist.
- If you added a page: head block, nav markup, footer, sitemap entry, and a link to it from
  somewhere real.
- If you added media: correct folder, correct format, size within the caps above.
