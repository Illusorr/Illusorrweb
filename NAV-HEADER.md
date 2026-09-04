# The mobile header: a brief

One header serves all 49 pages. It broke repeatedly during the launch push,
and most of the time the cause was not where it looked. This is what it does,
what it must never do again, and how to check.

## Where it lives

| File | Owns |
| --- | --- |
| `site/assets/css/nav.css` | the bar itself: geometry, safe-area padding, the desktop band |
| `site/assets/css/mobile.css` | the phone band, gated on `html[data-touch]` |
| `site/assets/css/case/case-mobile.css` | loads AFTER mobile.css on case studies and can silently override it |
| `site/assets/js/nav.js` | menu open/close, tone sampling, the glass trigger |

Markup contract: `#ilTopbar`, `#ilOverlay`, `#ilMenuOpen`, `#ilMenuClose`.
Copy the block verbatim from an existing page.

## Rule 1: the header follows the section's ground

Two inputs, in order:

1. **A declared theme wins outright.** `data-tone` or `data-bg-theme` on a
   section, or one of the light-section classes. 518 declarations exist
   across 32 pages; this answers most of the site.
2. **Otherwise the ground is measured** — but only from boxes that span the
   bar. A section, a band, a page wrapper does. A card, a logo, a badge, a
   pill does not, and gets no vote.

**Media never speaks for the ground.** Not measured, not assumed. The old
version sampled photographs to an 8x8 canvas and averaged them, and let a
client signature covering a third of the band decide the whole header. Every
one of those was a way for the header to flip while the section's design had
not changed. `imgTone`, `coversBand`, the tone cache and `data-media-tone`
are all gone. Do not reintroduce them.

Legibility over a bright photo is the band's job, not the logo's.

## Rule 2: no backdrop-filter on the phone band. Ever.

It has been removed twice and put back once. Both times it broke the header
on iOS: a flat pale plate over dark sections, on pages Chrome rendered
perfectly. The first removal blamed the accompanying `mask-image`; the second
proved that wrong, because the filter alone did it again within the hour.

WebKit mishandles a backdrop-filtered band on a fixed full-width layer. The
glass comes from translucency alone: `.58` over the page, fading out on the
lower edge, no compositor work at all.

The mask is off on touch for the same reason, and because it would clip the
band's upward reach.

## Rule 3: the band is taller than the bar

`.il-topbar::before` starts at `top: -220px` and runs to the bar's lower
edge. On iOS a strip of page paints above the header, and a fixed layer
cannot always reach it; the band being oversized covers it under every
explanation of why the strip is there. The bar itself does not move.

The gradient's stops are measured from the BOTTOM (`calc(100% - 56px)`), so
the fade lands on the bar's own edge at any height: 88px normally, 147px
where a notch inset applies.

## Rule 4: case pages must scroll the document, not the body

`case-mobile.css` had `html[data-touch] body { overflow-x: hidden }`.
Setting `hidden` on one axis forces the other to `auto`, which makes the body
a scroll container instead of the document:

    about, index      clip / visible    scroller: document
    every case page   hidden / auto     scroller: body

That was the only structural difference between the pages where the header
read as fixed and the nineteen where content showed above it. Use `clip`.
It does the same job without creating a scroller.

## Rule 5: bump the cache stamp on every CSS or JS edit

`netlify.toml` once served `/assets/*` as `immutable` for a year on
unfingerprinted names. A phone that loaded the site once was pinned to that
day's stylesheets and **no deploy could reach it**. Three separate fixes were
declared broken when they had simply never arrived.

Stylesheets and scripts now revalidate, and every reference in the markup
carries `?v=<stamp>`. There is no build step and no fingerprinting, so that
stamp is the only thing making a new file a new URL.

**Edit CSS or JS, bump the stamp in the same commit.** Current: `20260904f`.

## Safe areas

Every page declares `viewport-fit=cover`. The fixed chrome takes the insets
as padding, never as offsets:

- `.il-topbar` — `padding-top: 22px + inset-top`, gutters `max(gutter, side inset)`
- `.il-overlay` — all four sides
- `.sfoot`, `.il-amb`, `.ill-totop` — `+ inset-bottom`

Every value is `env(..., 0px)`, so a desktop, an Android phone and any
handset without a notch render identically to before.

## How to check before shipping

The header is not verifiable by reading it. Sample it.

- **Tone:** walk 25+ scroll positions per page; at each one compare the
  header's classes against the declared theme, or the measured ground where
  none is declared. Current state: 0 mismatches and 0 plate/brand splits
  across 875 positions on 35 pages.
- **Splits:** `on-light` and `brand-on-light` must never disagree. A white
  plate carrying a white wordmark is what that failure looks like.
- **Geometry:** the bar computes 88px at `top: 0` with no notch, 147px with
  an iPhone 15 inset, unchanged on desktop.
- **iOS is not Chrome.** Both backdrop-filter failures were invisible in
  Chrome at every viewport. If a fix cannot be reproduced locally, get a
  reading off the device before changing code.

## Things that turned out not to be the cause

Recorded so they are not re-investigated: duplicate viewport metas (none
exist), a service worker (none exists), case CSS overriding the topbar (it
does not), an element painting above z-index 2147483000 (nothing does),
horizontal document overflow (none at 360, 390 or 428), and a transformed
ancestor breaking `position: fixed` (there is none).
