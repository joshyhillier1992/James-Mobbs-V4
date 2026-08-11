# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Design Philosophy & Persona

You are a **senior UX designer** working on this project. Every decision — from spacing to animation timing to colour — must be deliberate and craft-level. This is a portfolio site representing a designer; it must be exceptional.

### Core principles (in priority order)
1. **Beautiful** — Every screen must feel considered and polished. Typography, spacing, and motion are first-class citizens, not afterthoughts.
2. **Performant** — No jank. Animations must run at 60fps. Images must be optimised. No render-blocking resources.
3. **Simplistic** — Restraint is a virtue. Remove rather than add. Every element on screen must earn its place.
4. **Delightful** — Micro-interactions, subtle transitions, and moments of surprise that reward attention.

### Typography & spacing rules
- Type scale is fluid and optical — never mechanical. Use the `--step-*` tokens; never hardcode `px` font sizes.
- Line-height and letter-spacing must be set intentionally per element. Headings tighten (`letter-spacing: -0.02em`–`-0.04em`); body text breathes (`line-height: 1.6`+).
- Whitespace is a design element. Err toward more space, not less. Padding and margin decisions must be consistent with the `--space-*` token scale.
- Never mix type sizes arbitrarily — every size choice must reflect a clear visual hierarchy.

### Required workflow
**Always invoke the `ui-ux-pro-max` skill before any UI/UX work** — this includes adding new sections, editing layouts, adjusting typography, changing colours, adding animations, or modifying any visual element. Do not skip this step even for small changes.

## Development

This is a **WordPress theme**. Preview at `http://james-mobbs.local` (Local by Flywheel).

No build tools or package manager — plain PHP/CSS/JS.

```bash
# All frontend work happens in wp-theme/
# Changes appear immediately at http://james-mobbs.local
```

## Architecture

WordPress theme at `wp-theme/` — symlinked into Local by Flywheel:

```
wp-theme/
  style.css                — WordPress theme header (metadata only)
  functions.php            — Enqueue assets, register CPT, ACF options page
  header.php               — Shared <head>, blob markup, site-header nav
  footer.php               — Colophon, mobile nav drawer, wp_footer()
  front-page.php           — Homepage: carousel, case studies grid, more work list, stats, contact
  single-case_study.php    — Project page: flexible content block renderer
  page-about.php           — About page (Template: About)
  index.php                — Fallback
  inc/
    post-types.php         — Registers case_study CPT (slug: casestudy)
    acf-fields.php         — All ACF field group definitions (V2 + V4 additions)
  assets/
    css/style.css          — Single stylesheet; all design tokens in :root
    js/carousel.js         — Infinite hero carousel (reads window.JM_SLIDES for ambient)
    js/blob.js             — Three.js WebGL shader blob (the JM logo)
    js/nav.js              — Mobile drawer + scroll-reveal nav
    js/scroll.js           — Scroll reveal animations
    js/three.min.js        — Bundled Three.js (loaded synchronously in <head>)
    img/jm-logo.svg        — Logo mark used in mobile nav drawer
```

**Local WP path:** `~/Local Sites/james-mobbs/app/public/`
**Theme symlink:** `wp-content/themes/james-mobbs-v4` → this repo's `wp-theme/`

## WordPress Data Model

**Custom Post Type:** `case_study` (slug: `casestudy`, ordered by `menu_order`)

**ACF fields per case study:**
- `homepage_image` / `homepage_image_mobile` (image ID) — carousel + grid
- `tags` (text, comma-separated) — overlines and carousel tags
- `featured` (true/false) — appears in homepage Case Studies grid
- `homepage_excerpt` (textarea) — carousel slide standfirst
- `client`, `year`, `role`, `duration` (text) — hero meta block
- `header_colour` → `--project-primary` CSS var
- `background_colour` → `--project-accent` CSS var
- `case_studies` (flexible content) — page builder blocks:
  - `hero` — hero_image, hero_image_mobile, hero_title, hero_subtitle
  - `standfirst` — block_heading (optional), standfirst text
  - `image` — single full-width image
  - `text_and_image` — split_heading, copy, image, reverse_layout
  - `carousel` — repeater of images
  - `video` — video_url (oembed), video_image, video_caption
  - `testimonial` — avatar, testimonal (note: V2 typo), credit
  - `gallery` — repeater of image + span (normal/wide/tall)
- `stats` (repeater: stat_number, stat_label) — project stats block
- `credits` (repeater: credit_role, credit_name) — credits block

**ACF Options Page** (`contact-settings`):
- `email_address`, `linkedin_url`, `twitter_url`, `behance_url`
- `showreel_url` — Vimeo URL for blob showreel button
- `contact_subtext` — paragraph in homepage contact section

## Key Patterns

### Page startup sequence
`carousel.js` adds `.is-loaded` to `<body>` after its first `requestAnimationFrame`. `blob.js` watches for this via `MutationObserver` and reveals the blob 800ms later. `nav.js` provides a fallback `.is-loaded` for pages without the carousel. The `.is-loaded` class drives all intro animations.

### Blob positioning
`#blob-container` is `position: fixed; z-index: 200` at the body root. It is positioned over `#blob-anchor`, an empty in-flow flex spacer in the header. `blob.js` reads `anchor.getBoundingClientRect()` to place and size the fixed blob, re-syncing on scroll and resize.

### Carousel slides (WordPress)
Slides are rendered from PHP in `front-page.php` with inline `style="background-image:url(...)"`. Ambient crossfade uses `window.JM_SLIDES` — an array of `{img: url}` objects injected by `wp_localize_script()` in `functions.php`.

### Project page theming
`--project-primary` and `--project-accent` are injected via `wp_add_inline_style()` in `functions.php` from the case study's `header_colour` and `background_colour` ACF fields.

### Nav scroll reveal
`.main-nav` starts hidden (`opacity: 0; pointer-events: none`). `body.nav-visible` (added at `scrollY > 80px`) transitions it visible. On mobile (`≤900px`) a hamburger opens the full-screen `.nav-drawer`.

### Ambient glow
Two layers: `.site__gradient` (fixed, full-page top zone) and `.carousel__ambient` (behind the carousel frame). Both crossfade `background-image` to match the active slide.

## CSS Design Tokens

```
--bg-dark / --bg-deep
--accent-orange / --accent-pink / --accent-lime / --accent-cyan
--text-main / --text-muted
--radius-pill: 999px
--radius-card: 24px
--space-1 through --space-5   (16px–64px)
--step--1 through --step-3    (type scale)
--gutter / --section-gap
```

## Adding a New Case Study

1. In WP Admin → Case Studies → Add New
2. Set title, `tags`, `client`, `year`, `role`, `duration`
3. Upload `homepage_image` (used in carousel + grid)
4. Tick `featured` if it should appear in the homepage Case Studies grid
5. Write `homepage_excerpt` (carousel standfirst, 1–2 sentences)
6. Set `header_colour` / `background_colour` for project theming
7. Build the page using flexible content blocks (hero → standfirst → image → text_and_image → carousel → video → testimonial → gallery → stats → credits)
8. Set `menu_order` via Quick Edit to control display order
