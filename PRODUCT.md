# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: brand and agency clients.** A marketing lead, brand owner or producer
evaluating whether ILLUSORR can deliver a campaign, a world, or a build. They
usually arrive already referred or mid-pitch, scan the work, and decide whether
to start a conversation. When client needs and other audiences conflict, the
client wins.

**Secondary: talent for the Collective.** Artists, developers and designers
deciding whether to apply. They want to know what they would learn, whose work
they would sit beside, and whether it leads to paid commissions.

**Third: partners and institutions.** Government and cultural bodies assessing
credibility and fit, in the vein of the Abu Dhabi Gaming relationship.

## Product Purpose

ILLUSORR is a multidisciplinary creative technology studio in Abu Dhabi working
across physical, digital and virtual worlds: content and film, immersive spaces
and real-time environments, games and original IP, and the procedural and web
production behind them.

The site exists to convert. Success over the next six to twelve months is
measured four ways, all of them named by the studio:

1. **Qualified enquiries through the guided brief** — briefs carrying real scope
   and budget signal, not generic contact-form noise. Now measurable, since
   submissions are stored rather than discarded.
2. **Collective applications** — a steady flow of applicants with genuine
   portfolios, in the disciplines where commissions actually arrive.
3. **Credibility in the room** — the site holds up when sent to a client
   mid-pitch or opened in a meeting. Judged by what people say, not by
   analytics.
4. **Findable in search** — ranking for the sectors and services, so work
   arrives from people who were not already referred.

Note the tension future work must hold: 1, 2 and 4 are measurable and 3 is not,
but 3 is the one that loses the deal when it fails.

## Positioning

**AI and procedural production at studio standard.**

Custom generative and procedural pipelines, directed to a brand look rather than
left to chance, producing volume and speed traditional production cannot match
while holding a real quality bar. The claim is not that the studio uses AI; it
is that the output is directed and holds up. A neighbouring studio can buy the
same tools and cannot truthfully claim the same control over them.

Three things support the claim without being the claim: the Collective as real
trained capacity, one team across the whole pipeline with no agency handoffs,
and owned IP shipped alongside client work.

## Operating Context

- Clients typically arrive referred, or are sent a link during a pitch. First
  contact with the site is often on someone else's screen, in a meeting.
- Two intake paths exist and serve different states of readiness: a direct
  contact form for people who know what they want, and a guided brief for people
  who do not yet. The brief branches by intent (project, sector pricing,
  licensing, joining the Collective).
- The Collective runs as an open, rolling application, not a cohort intake.
- The studio is based at Yas Creative Hub, Abu Dhabi, inside the emirate's media
  and gaming cluster.

## Capabilities and Constraints

- **Static multi-page site, no build step.** Plain HTML, CSS and ES modules.
  No npm, bundler, framework or package.json in the deployable folder. Deploy
  `site/` as-is to any static host. This is a deliberate constraint, not an
  accident, and it is why the site has no dependency surface to rot.
- **Self-hosted assets.** Fonts, scripts and libraries are all local; no CDN is
  required to render any page. Third-party embeds are limited to video players
  and the Sketchfab model viewer.
- **Form intake is live.** Contact, brief and Collective applications write to a
  Supabase project (`web` schema), which also notifies by email and creates a
  ClickUp task. Anonymous visitors can insert and can read nothing back.
- **29 project pages**, matching 29 tiles in the work grid.
- **6 sector pages**: beauty, business, culture, fashion, gaming, real-estate.
- **9 Collective disciplines**: 3D artists, environment artists, character
  artists, game developers, AI content creators, motion designers, technical
  artists, web developers, producers.
- **Undecided / unresolved:** four case studies were moved out of `site/` because
  they had no work-grid tile; whether they return is open.

## Brand Commitments

- Name **ILLUSORR**, single contact address `hello@illusorr.com`.
- Partnership with **Abu Dhabi Gaming**, Department of Culture and Tourism,
  Abu Dhabi. Displayed on about, contact and Collective.
- Social presence is Instagram, LinkedIn and YouTube only. Behance and Vimeo were
  explicitly dropped.
- Existing identity assets: the orb mark and ILLUSORR wordmark, and an
  established type pairing already in production across every page.

## Evidence on Hand

Real, verifiable, and not to be embellished:

- **Named clients** with shipped work: Disney+, Unilever, TRT, Boyner, Koton,
  ABB Robotics, DressX, Optima, Michael Cinco, Khaltat, Hind Al Oud, Bawtaqah.
- **Live client sites** the studio designed and built: `aa-ds.com` (Aquatic
  Architects), `lapillusfsr.com` (Lapillus).
- **Owned IP**: Metagenus, Pylon, ILLUSORR Spaces.
- **Client logo set** at `site/assets/img/clients/fit/`, 16 marks normalised to
  one spec.
- **Collective territories**: Abu Dhabi, Türkiye, UAE, Europe, Indonesia, Canada,
  United States, Philippines, Egypt.

**Absences future work must not fabricate:** there are no testimonials, no
published pricing, no named case-study results beyond what each project page
already states, and no client quotes. Do not invent them.

**Two stale claims in current copy, to correct rather than propagate:**
- "seven sectors" appears once in about copy; six sector pages exist.
- "36 projects" appears once; 29 project pages and 29 grid tiles exist.

## Product Principles

1. **The work is the argument.** Clients arrive to judge output. Anything that
   delays the work costs the pitch.
2. **Directed, not generated.** The positioning is control over AI and
   procedural pipelines. Any surface implying automation without direction
   contradicts the studio's core claim.
3. **One studio, no seams.** Design, content and production come from the same
   team. Surfaces should not read as if assembled by separate hands.
4. **Weight is a credibility cost.** The site is often opened on someone else's
   machine, mid-meeting, on unknown bandwidth. A page that stalls loses the room
   before the work is seen.
5. **Claim only what is shipped.** Real clients, real live sites, real IP. No
   invented proof, and no counts that the repository contradicts.

## Accessibility & Inclusion

No external standard has been mandated by the studio. Floors currently held in
production and worth preserving:

- Interactive targets at 44px minimum on touch.
- Body text at 16px on phones.
- Micro-labels render at 10px in ~780 places (tile eyebrows, filter counts,
  board figures). CLAUDE.md carried an 11px label floor for phones; it was
  never a desktop rule, no external standard requires one, and the studio
  has chosen to keep 10px. Recorded so a later pass does not read it as a
  defect and "fix" 780 nodes.
- Every content image carries a description; decorative images are marked empty.
- Motion-heavy surfaces respect `prefers-reduced-motion`.
- 3D scenes do not auto-run on phones; they load on tap.
