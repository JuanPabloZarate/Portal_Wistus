# Project: Tinkus Wistus - Carnaval de Oruro 2027 Editorial Landing Page (Monte Style)

## Architecture
- **Paradigm**: Autonomous, bundlerless, ultra-high-fidelity editorial landing page (`landing.html`) faithfully modeling DOMA R&B Monte (`https://domarb.com.au/venue/monte/`).
- **Visual Design & Typography Trinity**:
  - Palette: Monte Silver (`#f5f0ea`), Charcoal (`#111111`), Stone Grey (`#b9b1a4`), Grey Lighter (`#ddd8d2`), accented with Tinkus Wistus Imperial Purple (`#7c3aed`) and Sun Gold (`#d97706`).
  - Fonts: Playfair Display / Cormorant Garamond (Editorial Serif), Plus Jakarta Sans (Modern Sans-serif), DM Mono (Technical Monospace).
- **Technology Stack**:
  - HTML5 Semantic Structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<dialog>`, `<footer>`).
  - Tailwind CSS (Play CDN v3) with custom theme extension for Monte tokens and typography.
  - Swiper.js v11 (CDN) for fluid photo gallery and fraternal blocks carousel.
  - Vanilla ES6 JavaScript for scroll blur transitions, 3D holographic tilt physics with specular glare, modal/drawer controls, and form validation.
  - Local Assets: `assets/img/wistus-banner.jpg`, `assets/img/wistus-badge.svg`, `assets/img/wistus-logo-w.svg`, `assets/img/wistus-escudo.svg`.
- **Bidirectional Integration**:
  - Outbound: `landing.html` links directly to `index.html` across Header, Modal Access, Metadata `<dl>`, Credencial CTA, and Footer.
  - Inbound: `index.html` includes top bar and sidebar return links to `landing.html`.
  - Routing: `vercel.json` provides explicit rewrite rule for `/landing` preserving static file delivery.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | F1: Base HTML5 & Editorial Architecture | Semantic document skeleton, meta viewport, SEO tags, Monte layout hierarchy | M1 | Survey R1 | VERIFIED |
| 2 | F2: Visual Design Tokens & Typography | Theme tokens (#f5f0ea, #111111, #b9b1a4, #7c3aed, #d97706) and serif/sans/mono font family trinity | M1 | Survey R2 | VERIFIED |
| 3 | F3: Sticky Blur Header & Scrolled State | Header with backdrop blur, transparency on top, solid silver upon scroll (`.scrolled`) | M1 | Survey R1 | VERIFIED |
| 4 | F4: Responsive Drawer Menu | Animated hamburger toggle and full-height navigation drawer (`data-menu-drawer`) | M1 | Survey R1 | VERIFIED |
| 5 | F5: Bidirectional Navigation | Seamless round-trip links between `landing.html` and `index.html` (header, modal, sidebar) | M1 | Survey R1, AC | VERIFIED |
| 6 | F6: Vercel Routing Rule | Explicit rewrite entry in `vercel.json` for `/landing` without breaking catch-all | M1 | Survey AC | VERIFIED |
| 7 | F7: Hero Masthead Full-Screen (`h-svh`) | Full-height masthead (`100svh`), monumental headline, badge, and background overlay | M2 | Survey R3 | VERIFIED |
| 8 | F8: Editorial Quote Section | High-impact left column quote on Tinku passion, identity, and folklore | M2 | Survey R3 | VERIFIED |
| 9 | F9: Structured Key/Value Metadata (`<dl>`) | Right column 2-column definition list with rehearsal schedule, venue address, contacts | M2 | Survey R3 | VERIFIED |
| 10 | F10: Photographic Gallery Carousel | Swiper.js fluid slider (`[data-carousel-swiper]`) with touch/drag support and dynamic widths | M3 | Survey R4 | VERIFIED |
| 11 | F11: 3D Holographic Credencial CTA | Monte-style gift card CTA with interactive 3D perspective tilt, specular reflection, and glow | M3 | Survey R4 | VERIFIED |
| 12 | F12: Membership Acquisition Action | Direct CTA button within Credencial block to open registration drawer | M3 | Survey R4 | VERIFIED |
| 13 | F13: Fraternal Blocks Carousel | Dedicated carousel ("Nuestros Bloques") for Machas, Imillas, Ñaupas, Sambos with synopsis | M3 | Survey R4 | VERIFIED |
| 14 | F14: Fixed Bottom Action Bar | Persistent bar (`[data-find-a-table-btn]`) with "Unirse a la Fraternidad / Ingresar al Portal" | M4 | Survey R5 | VERIFIED |
| 15 | F15: Fullscreen Navigation Modal | Native `<dialog id="find-a-table" data-modal>` offering direct portal and fraternity actions | M4 | Survey R5 | VERIFIED |
| 16 | F16: Lateral Registration Drawer | Native `<dialog id="enquire" data-modal-drawer>` with reactive validation form | M4 | Survey R5 | VERIFIED |
| 17 | F17: Editorial Footer & Newsletter | High-fashion footer (`data-footer`) with newsletter subscription and legal copyright | M4 | Survey R5 | VERIFIED |
| 18 | F18: Comprehensive E2E Test Suite | Automated verification script `test_landing_page.py` covering Tiers 1-4 | E2E Track | Survey Verification | VERIFIED |
| 19 | F19: Multi-Device Responsive Design | Fluid adaptability across 375px mobile, tablet, desktop, and large displays | M5 | Survey AC | VERIFIED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Test Suite Creation | Design & implement `test_landing_page.py` (Tiers 1-4) and publish `TEST_READY.md` | none | DONE |
| M1 | Base Layout, Navigation & Theme | HTML skeleton, Tailwind config, typography, blur header, menu drawer, bidirectional links, vercel.json | none | DONE |
| M2 | Hero Masthead & Metadata Section | `h-svh` hero with monumental title & badge, 2-column quote and structured `<dl>` metadata | M1 | DONE |
| M3 | Interactive Components (Carousels & 3D Credencial) | Swiper photographic gallery, 3D holographic credencial with tilt & glare, Fraternal blocks carousel | M2 | DONE |
| M4 | Fixed Bottom Bar, Modals, Drawer & Footer | Persistent bottom action bar, fullscreen `<dialog>` modal, lateral registration drawer, editorial footer | M3 | DONE |
| M5 | Final Milestone: E2E Verification & Polish | 100% E2E test pass (Tiers 1-4), adversarial stress testing (Tier 5), responsive verification | M4, E2E | DONE |

## Interface Contracts
### `landing.html` ↔ `index.html`
- Outbound Links in `landing.html`:
  - Header CTA: `<a href="index.html" class="...">Ingresar al Portal</a>`
  - Modal Access Option: `<a href="index.html" class="...">Ingresar al Portal Fraterno</a>`
  - Footer & Metadata: `<a href="index.html" class="...">Portal Oficial</a>`
- Inbound Links in `index.html`:
  - Login view `#view-login`: `<a href="landing.html" class="...">← Carnaval de Oruro 2027</a>`
  - Portal sidebar `#appSidebar`: `<a href="landing.html" class="...">Landing Carnaval Oruro 2027</a>`

### DOM Data Attributes & Selectors Contract
- Header: `header[data-header]` containing `button[data-menu-drawer-toggle]` and `div[data-menu-drawer]`
- Hero: `header[data-block="masthead-full"]` with class `h-svh` and official badge `img[src*="wistus-badge"]`
- Metadata: `section[data-block="columns"]` containing `dl[data-venue-metadata]` with `dt` and `dd` pairs
- Photo Carousel: `div[data-block="carousel"]` containing `div[data-carousel-swiper]`
- 3D Credencial: `aside[data-block="cta"]` containing `div[data-gift-card-animation]` and `div[data-gift-card]`
- Blocks Carousel: `section[data-block="listing-carousel"]`
- Bottom Fixed Bar: `div[data-find-a-table-btn]` containing button opening modal
- Modals & Drawers: `<dialog id="find-a-table" data-modal>` and `<dialog id="enquire" data-modal-drawer>`
- Footer: `footer[data-footer]` containing `form[data-subscribe-form]`

## Code Layout
- `landing.html`: The primary standalone editorial landing page.
- `index.html`: Existing portal, updated with return navigation links.
- `vercel.json`: Deployment configuration with routing rewrite for `/landing`.
- `test_landing_page.py`: Autonomous comprehensive automated test suite (131 tests).
- `TEST_INFRA.md`: E2E test suite architecture and coverage documentation.
- `TEST_READY.md`: Signal published when E2E test suite is complete.
