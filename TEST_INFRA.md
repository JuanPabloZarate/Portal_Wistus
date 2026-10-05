# TEST INFRASTRUCTURE & ARCHITECTURE: TINKUS WISTUS 2026 LANDING PAGE

## 1. Test Philosophy & Overview

The testing infrastructure for the **Tinkus Wistus 2026 Editorial Landing Page (Monte Style)** provides strict, deterministic, and comprehensive verification of visual fidelity, DOM contracts, typography, interactive behaviors, cross-feature state transitions, boundary robustness, and end-to-end user journeys.

### Core Testing Principles
1. **Zero Facade Testing**: No mock or hollow tests that pass vacuously. Every test parses actual DOM trees, extracts CSS tokens, inspects JS event handlers and scripts, validates asset files on disk, and enforces strict interface contracts.
2. **Deterministic Output & Authoritative Sources**: Expected outputs are derived strictly from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and the authoritative Monte reference architecture (`survey_spec_miner_1/report.md`).
3. **Multi-Tier Coverage**: Tests are stratified into four distinct tiers:
   - **Tier 1**: Feature Coverage (Sanity, structural existence, data attributes, contracts).
   - **Tier 2**: Boundary & Corner Cases (Extreme inputs, escaping, missing assets, viewport fallbacks).
   - **Tier 3**: Cross-Feature Combinations (Pairwise state transitions, modal/drawer switches, scroll mechanics).
   - **Tier 4**: Real-World Application Scenarios (Complete end-to-end user journeys).
4. **Zero External Runtime Overhead**: The test suite is implemented in pure, portable Python using standard library modules (`unittest`, `html.parser`, `re`, `pathlib`, `json`) complemented by `BeautifulSoup4` for robust DOM traversing.
5. **Clear Diagnostic Reporting**: The test runner outputs detailed breakdowns per tier, tracks individual test assertions, reports execution time, and returns standard exit codes (`0` for success, `1` for failures) for seamless CI/CD integration.

---

## 2. Test Suite Architecture

```
Goal - Portal/
├── landing.html                 <-- Primary target under test (Editorial Landing)
├── index.html                   <-- Secondary target (Bidirectional portal return links)
├── vercel.json                  <-- Deployment route verification (/landing rewrite)
├── assets/img/*                 <-- Static assets verification (images, badges, svgs)
│
├── test_landing_page.py         <-- Autonomous multi-tier test runner
├── TEST_INFRA.md                <-- Architecture, philosophy, and test matrix (This file)
└── TEST_READY.md                <-- Execution instructions and readiness status
```

### Test Runner Execution Pipeline
```
[Start Execution]
       │
       ▼
[Environment & File Presence Check] ──> landing.html, index.html, vercel.json, assets
       │
       ▼
[Tier 1: Feature Coverage] ────────────> F1 - F17 structural & contract assertions (>=5 per feature)
       │
       ▼
[Tier 2: Boundary & Corner Cases] ─────> Input validation, regex, escaping, viewport fallbacks
       │
       ▼
[Tier 3: Cross-Feature Interactions] ──> Modals vs drawers, CTA triggers, scroll mechanics
       │
       ▼
[Tier 4: E2E User Journeys] ───────────> 5 Complete multi-step visitor flows
       │
       ▼
[Consolidated Diagnostic Report] ─────> Summary table, pass/fail counts, exit code (0 or 1)
```

---

## 3. Feature Inventory (F1 - F19)

| Feature ID | Feature Name | Description | Key DOM Selectors / Contracts | Target Milestone |
|---|---|---|---|---|
| **F1** | Base HTML5 & Architecture | Semantic skeleton, DOCTYPE, meta tags, Monte container hierarchy | `<!DOCTYPE html>`, `<html lang="es">`, `<meta name="viewport">` | M1 |
| **F2** | Design Tokens & Typography | Monte color palette & editorial font trinity (Serif, Sans, Mono) | `#f5f0ea`, `#111111`, `#b9b1a4`, `#7c3aed`, `#d97706`, Playfair/Cormorant, Jakarta/Inter, DM Mono | M1 |
| **F3** | Sticky Blur Header | Transparent header with blur that transitions to solid on scroll | `header[data-header]`, class `.scrolled`, `window.scrollY > 50` | M1 |
| **F4** | Responsive Drawer Menu | Animated hamburger toggle and navigation drawer | `button[data-menu-drawer-toggle]`, `div[data-menu-drawer]` | M1 |
| **F5** | Bidirectional Navigation | Seamless round-trip links between `landing.html` and `index.html` | Outbound: `a[href*="index.html"]`; Inbound: `index.html` return links | M1 |
| **F6** | Vercel Routing Rule | Explicit rewrite in `vercel.json` for `/landing` | `vercel.json` contains `src: "/landing"` or equivalent route | M1 |
| **F7** | Hero Masthead Full-Screen | Full-height hero (`h-svh`), monumental title, official badge | `header[data-block="masthead-full"]`, `.h-svh`, `img[src*="wistus-badge"]` | M2 |
| **F8** | Editorial Quote Section | 2-column layout with high-impact quote on Tinku passion | `section[data-block="columns"]`, blockquote/prose serif | M2 |
| **F9** | Structured Metadata List | Definition list `<dl>` with rehearsal, address, and contacts | `dl[data-venue-metadata]`, `dt`, `dd`, border dividers | M2 |
| **F10** | Photographic Swiper Carousel | Fluid Swiper slider with draggable slides and rounded borders | `div[data-block="carousel"]`, `div[data-carousel-swiper]`, `.swiper-slide` | M3 |
| **F11** | 3D Holographic Credencial CTA | Monte-style gift card CTA with 3D perspective tilt & specular glare | `aside[data-block="cta"]`, `div[data-gift-card-animation]`, `div[data-gift-card]` | M3 |
| **F12** | Membership Acquisition Action | Direct CTA button in credencial block opening registration drawer | CTA button triggering `<dialog id="enquire">` | M3 |
| **F13** | Fraternal Blocks Carousel | "Nuestros Bloques" carousel (Machas, Imillas, Ñaupas, Sambos) | `section[data-block="listing-carousel"]`, 4 block cards with synopsis | M3 |
| **F14** | Fixed Bottom Action Bar | Persistent bar at bottom with "Unirse / Ingresar" CTA | `div[data-find-a-table-btn]`, `fixed bottom-0` | M4 |
| **F15** | Fullscreen Navigation Modal | Native `<dialog>` modal with key navigation and portal links | `<dialog id="find-a-table" data-modal>` | M4 |
| **F16** | Lateral Registration Drawer | Native `<dialog>` drawer with reactive membership form | `<dialog id="enquire" data-modal-drawer>`, form fields | M4 |
| **F17** | Editorial Footer & Newsletter | High-fashion footer with newsletter subscribe form and legal | `footer[data-footer]`, `form[data-subscribe-form]` | M4 |
| **F18** | Comprehensive E2E Test Suite | Automated verification script covering Tiers 1-4 | `test_landing_page.py` | E2E |
| **F19** | Multi-Device Responsive Design | Responsive breakpoints (mobile 375px, tablet 768px, desktop 1024px+) | CSS grid/flex utility classes, responsive media classes | M5 |

---

## 4. Four-Tier Testing Methodology

### Tier 1: Core Feature Coverage (Structural & Interface Contracts)
Ensures every core feature exists, complies with semantic standards, and honors data attribute contracts with >= 5 test cases per feature.

- **F1: Base HTML5 & Editorial Architecture**
  1. `test_f01_doctype_and_html_lang`: Validates `<!DOCTYPE html>` and `<html lang="es">`.
  2. `test_f01_meta_viewport`: Validates `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
  3. `test_f01_document_title`: Validates `<title>` containing "Tinkus Wistus" and "2026".
  4. `test_f01_semantic_tags_hierarchy`: Validates presence of `<header>`, `<main>`, `<section>`, `<aside>`, `<dialog>`, and `<footer>`.
  5. `test_f01_minimum_file_size`: Ensures `landing.html` is a substantial document (> 3,000 bytes).

- **F2: Visual Design Tokens & Typography**
  1. `test_f02_monte_color_silver`: Validates base stone silver color `#f5f0ea` / `bg-silver` in styles or Tailwind config.
  2. `test_f02_monte_color_black`: Validates deep charcoal `#111111` or `#000000` text color tokens.
  3. `test_f02_monte_color_stone_grey`: Validates border stone grey `#b9b1a4`.
  4. `test_f02_wistus_accent_purple`: Validates Wistus Imperial Purple `#7c3aed`.
  5. `test_f02_wistus_accent_gold`: Validates Wistus Sun Gold `#d97706`.
  6. `test_f02_typography_fonts_imported`: Validates import of Serif (Playfair/Cormorant), Sans (Plus Jakarta/Inter), and Monospace (DM Mono) fonts.

- **F3: Sticky Blur Header & Scrolled State**
  1. `test_f03_header_element_data_attribute`: Validates `header[data-header]` exists.
  2. `test_f03_header_initial_transparency`: Validates fixed positioning and transparent background classes.
  3. `test_f03_header_backdrop_blur`: Validates `backdrop-blur` CSS class or style.
  4. `test_f03_header_script_scroll_listener`: Validates JavaScript contains scroll listener tracking `window.scrollY > 50` (or >= 40).
  5. `test_f03_header_scrolled_class_mutation`: Validates JavaScript toggles the `.scrolled` class.

- **F4: Responsive Drawer Menu**
  1. `test_f04_drawer_toggle_button`: Validates `button[data-menu-drawer-toggle]` exists with aria attributes.
  2. `test_f04_drawer_container`: Validates `div[data-menu-drawer]` exists.
  3. `test_f04_drawer_navigation_links`: Validates navigation links inside drawer pointing to sections (#historia, #metadatos, #galeria, #bloques, #credencial).
  4. `test_f04_drawer_close_mechanism`: Validates close trigger or button (`data-menu-drawer-close` or toggle logic).
  5. `test_f04_drawer_script_toggle`: Validates JavaScript logic toggling drawer open class / state.

- **F5: Bidirectional Navigation**
  1. `test_f05_outbound_header_portal_link`: Validates header contains `<a href="index.html">` linking to Portal.
  2. `test_f05_outbound_modal_portal_link`: Validates modal contains link to `index.html`.
  3. `test_f05_outbound_metadata_or_footer_portal_link`: Validates metadata `<dl>` or footer contains link to `index.html`.
  4. `test_f05_inbound_index_login_link`: Validates `index.html` contains return link to `landing.html`.
  5. `test_f05_inbound_index_sidebar_link`: Validates `index.html` sidebar navigation contains return link to `landing.html`.

- **F6: Vercel Routing Rule**
  1. `test_f06_vercel_json_exists`: Validates `vercel.json` exists in project root.
  2. `test_f06_vercel_json_valid_json`: Validates `vercel.json` parses as valid JSON.
  3. `test_f06_vercel_json_landing_rewrite`: Validates `routes` or `rewrites` contains explicit rule mapping `/landing` to `/landing.html`.
  4. `test_f06_vercel_json_static_asset_routes_preserved`: Validates asset cache routes for `/assets/`, `/css/`, `/js/` remain intact.
  5. `test_f06_vercel_json_catchall_fallback_preserved`: Validates catch-all fallback to `index.html` remains functional.

- **F7: Hero Masthead Full-Screen**
  1. `test_f07_hero_data_block_masthead`: Validates `header[data-block="masthead-full"]` or `[data-block="masthead-full"]` exists.
  2. `test_f07_hero_fullscreen_height`: Validates `h-svh` or `100svh` / `h-screen` viewport height class.
  3. `test_f07_hero_monumental_title`: Validates monumental title containing "TINKUS WISTUS".
  4. `test_f07_hero_official_badge_image`: Validates presence of `img[src*="wistus-badge"]` or official insignia.
  5. `test_f07_hero_background_banner_image`: Validates banner image `wistus-banner` with subtle overlay.

- **F8: Editorial Quote Section**
  1. `test_f08_columns_section_container`: Validates `section[data-block="columns"]` exists.
  2. `test_f08_quote_column_grid`: Validates multi-column grid layout (e.g. `grid` / `lg:grid-cols-12`).
  3. `test_f08_quote_text_content`: Validates substantive quote reflecting Tinku passion and Andean cultural identity.
  4. `test_f08_quote_typography_serif`: Validates quote uses serif typography (`font-serif` / large editorial type).
  5. `test_f08_quote_border_separator`: Validates editorial border divider separating sections.

- **F9: Structured Key/Value Metadata (`<dl>`)**
  1. `test_f09_metadata_dl_container`: Validates `dl[data-venue-metadata]` exists.
  2. `test_f09_metadata_schedule_entry`: Validates `<dt>` and `<dd>` pair for Rehearsal Schedule ("Horarios de Ensayo").
  3. `test_f09_metadata_venue_entry`: Validates `<dt>` and `<dd>` pair for Venue / Address ("Lugar de Ensayo" / Cancha Zapata).
  4. `test_f09_metadata_contact_entry`: Validates `<dt>` and `<dd>` pair for Directiva Contact (phone / email).
  5. `test_f09_metadata_social_links`: Validates presence of social media channels or official portal reference.

- **F10: Photographic Gallery Carousel**
  1. `test_f10_carousel_block_container`: Validates `div[data-block="carousel"]` exists.
  2. `test_f10_carousel_swiper_container`: Validates `div[data-carousel-swiper]` with `.swiper` or Swiper markup.
  3. `test_f10_carousel_slides_count`: Validates at least 4 slides inside `.swiper-wrapper`.
  4. `test_f10_carousel_swiper_js_script`: Validates Swiper.js bundle inclusion (CDN or local script).
  5. `test_f10_carousel_initialization_code`: Validates JS code initializing Swiper with fluid slide configuration.

- **F11: 3D Holographic Credencial CTA**
  1. `test_f11_cta_block_container`: Validates `aside[data-block="cta"]` exists.
  2. `test_f11_gift_card_animation_container`: Validates `div[data-gift-card-animation]` exists.
  3. `test_f11_gift_card_element`: Validates `div[data-gift-card]` or card markup with holographic styling.
  4. `test_f11_tilt_perspective_css`: Validates 3D perspective styling (`perspective(1000px)` or CSS 3D transforms).
  5. `test_f11_tilt_js_event_listeners`: Validates JS code attaching `mousemove` and `mouseleave` for dynamic 3D tilt.

- **F12: Membership Acquisition Action**
  1. `test_f12_membership_cta_button`: Validates button with text "Adquirir Membresía" or "Inscribirse" exists.
  2. `test_f12_membership_cta_target`: Validates button connects to registration drawer (`#enquire`).
  3. `test_f12_membership_cta_button_styling`: Validates pill button styling with editorial contrast.
  4. `test_f12_membership_card_qr_code`: Validates membership card includes digital QR or security chip motif.
  5. `test_f12_membership_year_label`: Validates membership displays official year "2026".

- **F13: Fraternal Blocks Carousel**
  1. `test_f13_listing_carousel_section`: Validates `section[data-block="listing-carousel"]` exists.
  2. `test_f13_machas_block_card`: Validates card for "Bloque Machas" with synopsis and imagery.
  3. `test_f13_imillas_block_card`: Validates card for "Bloque Imillas" with synopsis and imagery.
  4. `test_f13_naupas_block_card`: Validates card for "Bloque Ñaupas" with synopsis and imagery.
  5. `test_f13_sambos_block_card`: Validates card for "Bloque Sambos" with synopsis and imagery.

- **F14: Fixed Bottom Action Bar**
  1. `test_f14_fixed_bottom_bar_element`: Validates `div[data-find-a-table-btn]` exists.
  2. `test_f14_fixed_bottom_bar_positioning`: Validates `fixed bottom-0` fixed viewport positioning.
  3. `test_f14_fixed_bottom_bar_text`: Validates text "UNIRSE" / "INGRESAR" in uppercase editorial format.
  4. `test_f14_fixed_bottom_bar_modal_trigger`: Validates click action triggers `<dialog id="find-a-table">`.
  5. `test_f14_footer_bottom_padding_compensation`: Validates page content has bottom margin to prevent footer overlap.

- **F15: Fullscreen Navigation Modal**
  1. `test_f15_dialog_element_exists`: Validates `<dialog id="find-a-table">` exists.
  2. `test_f15_dialog_modal_data_attribute`: Validates `[data-modal]` attribute on dialog.
  3. `test_f15_dialog_portal_access_option`: Validates navigation item linking to `index.html`.
  4. `test_f15_dialog_enquire_drawer_trigger`: Validates option to open registration drawer (`#enquire`).
  5. `test_f15_dialog_close_button`: Validates close button with `data-modal-close` or form method="dialog".

- **F16: Lateral Registration Drawer**
  1. `test_f16_enquire_dialog_exists`: Validates `<dialog id="enquire">` exists.
  2. `test_f16_enquire_modal_drawer_data_attribute`: Validates `[data-modal-drawer]` attribute on dialog.
  3. `test_f16_enquire_form_required_fields`: Validates form contains Nombres, Apellidos, and Teléfono as required.
  4. `test_f16_enquire_form_block_select`: Validates select dropdown with options for Machas, Imillas, Ñaupas, Sambos.
  5. `test_f16_enquire_form_submit_button`: Validates submit button for sending postulación.

- **F17: Editorial Footer & Newsletter**
  1. `test_f17_footer_data_attribute`: Validates `footer[data-footer]` exists.
  2. `test_f17_subscribe_form_data_attribute`: Validates `form[data-subscribe-form]` inside footer.
  3. `test_f17_newsletter_email_input`: Validates email input with `type="email"`.
  4. `test_f17_copyright_text`: Validates copyright notice with "2026" and "Tinkus Wistus".
  5. `test_f17_quick_navigation_links`: Validates footer quick links to sections and portal.

---

### Tier 2: Boundary & Corner Cases
Ensures robustness against abnormal states, malformed inputs, missing local files, and viewport boundaries.

- **B1: Form Input Boundaries & Empty Submissions**
  1. `test_b01_enquire_empty_form_validation`: Verifies form enforces `required` on name, surname, and phone.
  2. `test_b01_enquire_whitespace_only_handling`: Verifies JS trims input fields before validation.
  3. `test_b01_newsletter_empty_email_validation`: Verifies newsletter email input has `required` attribute.
  4. `test_b01_newsletter_invalid_email_format`: Verifies HTML5 `type="email"` validation regex compliance.
  5. `test_b01_form_submission_prevents_default`: Verifies JS form handlers use `e.preventDefault()` to avoid unwanted page reload.

- **B2: Phone Number Formats & Boundary Values**
  1. `test_b02_phone_regex_bolivia_prefix`: Validates JS/HTML handles `+591` country code.
  2. `test_b02_phone_minimum_length`: Validates minimum length enforcement (at least 7 or 8 digits).
  3. `test_b02_phone_alphabetic_characters_rejection`: Validates phone input rejects non-numeric/phone characters.
  4. `test_b02_phone_whitespace_tolerance`: Validates phone input allows space-delimited formats (e.g. `+591 7654 3210`).
  5. `test_b02_phone_input_type_tel`: Validates `<input type="tel">` for proper mobile numeric keypad popup.

- **B3: Attribute Escaping & HTML Entity Integrity**
  1. `test_b03_no_unescaped_special_chars_in_attributes`: Verifies attributes do not contain naked `<`, `>`, or unbalanced quotes.
  2. `test_b03_clean_spanish_accents_and_entities`: Validates correct UTF-8 encoding for Spanish accents (á, é, í, ó, ú, ñ).
  3. `test_b03_image_alt_attributes_present`: Verifies all critical `<img>` elements possess descriptive `alt` attributes.
  4. `test_b03_aria_labels_on_icon_buttons`: Verifies hamburger toggle and close buttons possess `aria-label` or accessible names.
  5. `test_b03_script_cdata_or_clean_delimiters`: Verifies inline scripts parse cleanly without premature tag closing.

- **B4: Mobile Viewport & CSS Fallbacks**
  1. `test_b04_viewport_meta_scalable`: Verifies viewport meta tag contains `width=device-width` and `initial-scale=1.0`.
  2. `test_b04_hero_svh_fallback_classes`: Verifies hero includes fallback `min-h-screen` or `h-screen` alongside `h-svh`.
  3. `test_b04_touch_friendly_tap_targets`: Verifies buttons have minimum height/padding (at least 40px/h-10).
  4. `test_b04_horizontal_overflow_prevention`: Verifies body or root container uses `overflow-x-hidden`.
  5. `test_b04_lenis_or_smooth_scroll_containment`: Verifies modal dialogs prevent background scrolling (`overflow-hidden`).

- **B5: Local Asset File Existence on Disk**
  1. `test_b05_wistus_banner_jpg_exists`: Verifies `assets/img/wistus-banner.jpg` exists and is > 10,000 bytes.
  2. `test_b05_wistus_badge_svg_exists`: Verifies `assets/img/wistus-badge.svg` exists and contains valid SVG XML.
  3. `test_b05_wistus_logo_w_svg_exists`: Verifies `assets/img/wistus-logo-w.svg` exists and contains valid SVG XML.
  4. `test_b05_wistus_escudo_svg_exists`: Verifies `assets/img/wistus-escudo.svg` exists and is non-empty.
  5. `test_b05_avatar_default_svg_exists`: Verifies `assets/img/avatar-default.svg` exists for portal consistency.

---

### Tier 3: Cross-Feature Combinations & State Transitions
Verifies pairwise and multi-component state interactions to guarantee no race conditions or UI lockups occur.

- **X1: Fullscreen Modal `<dialog id="find-a-table">` ➔ Registration Drawer `<dialog id="enquire">`**
  1. `test_x01_modal_to_drawer_transition_logic`: Verifies script closes `#find-a-table` when user clicks "Postular" to open `#enquire`.
  2. `test_x01_no_stacked_modal_backdrop_conflicts`: Validates backdrop cleanup when transitioning between dialogs.

- **X2: Credencial CTA Triggering Registration Drawer**
  1. `test_x02_credencial_cta_opens_enquire_drawer`: Verifies clicking CTA inside `aside[data-block="cta"]` invokes `#enquire.showModal()`.
  2. `test_x02_credencial_cta_preselects_membership`: Verifies drawer form or title accommodates membership inquiry.

- **X3: Header Scrolled Class Mechanics**
  1. `test_x03_scroll_threshold_event_listener`: Verifies scroll event threshold (`scrollY > 50` or `scrollY > 40`).
  2. `test_x03_header_class_toggle_idempotency`: Verifies script adds `.scrolled` when scrollY > threshold and removes when <= threshold.

- **X4: Fixed Bottom Bar Modal Trigger**
  1. `test_x04_fixed_bar_triggers_modal`: Verifies `[data-find-a-table-btn]` click listener triggers `#find-a-table.showModal()`.
  2. `test_x04_fixed_bar_hidden_or_inactive_when_modal_open`: Verifies fixed bar does not obscure opened dialogs.

- **X5: Hamburger Drawer vs Body Scroll Locking**
  1. `test_x05_menu_drawer_toggles_open_class`: Verifies hamburger toggle adds/removes `menu-drawer--open` or equivalent state.
  2. `test_x05_menu_drawer_locks_body_scroll`: Verifies opening drawer adds `overflow-hidden` to `<body>` or `<html>`.

- **X6: Native Dialog ESC Key Handling**
  1. `test_x06_escape_key_listener_or_native_dialog`: Verifies `<dialog>` native cancellation or keydown ESC listener closes modals and unlocks body scroll.

- **X7: Newsletter Form State Isolation**
  1. `test_x07_newsletter_submission_state_isolation`: Verifies newsletter submit displays confirmation feedback without affecting page scroll or modal states.

---

### Tier 4: Real-World Application Scenarios (End-to-End User Journeys)
Verifies realistic user flows through the entire site experience.

- **Journey 1: New Visitor Exploration Flow**
  - Steps:
    1. Visitor lands on `landing.html`.
    2. Hero masthead displays monumental title "TINKUS WISTUS", official badge, and banner.
    3. Visitor scrolls down; header transitions to solid stone blur (`.scrolled`).
    4. Visitor reads editorial quote and reviews `<dl>` metadata (Horarios, Lugar Cancha Zapata, Directiva).
    5. Visitor browses photographic Swiper gallery with fluid slides.
    6. Visitor inspects the 4 fraternal blocks (Machas, Imillas, Ñaupas, Sambos).
    7. Visitor clicks "Ingresar al Portal" in footer/metadata to navigate to `index.html`.
  - Assertions: All required nodes, attributes, text values, and links exist in sequence.

- **Journey 2: Prospective Fraterno Membership Registration Flow**
  - Steps:
    1. Visitor scrolls to 3D Credencial Fraterna block (`aside[data-block="cta"]`).
    2. Card displays holographic design, QR code, and interactive 3D tilt attributes.
    3. Visitor clicks "Adquirir Membresía / Inscribirse".
    4. Registration drawer `<dialog id="enquire">` opens.
    5. Visitor fills in Nombres, Apellidos, Teléfono, selects "Bloque Machas", and enters experience.
    6. Form submission triggers client-side validation, invokes submit handler, and presents success message.
  - Assertions: Verifies CTA button hooks, form input definitions, select options, and submit event logic.

- **Journey 3: Quick Action Bottom Bar Navigation Flow**
  - Steps:
    1. Visitor views page; persistent bottom bar `[data-find-a-table-btn]` is visible at `fixed bottom-0`.
    2. Visitor clicks "UNIRSE / INGRESAR".
    3. Fullscreen modal `<dialog id="find-a-table">` opens with backdrop blur.
    4. Visitor selects "Ingresar al Portal Fraterno" (`<a href="index.html">`).
    5. Browser navigates to `index.html`.
    6. From `index.html`, visitor clicks return link "← Carnaval de Oruro 2027" / "Landing Carnaval Oruro 2027" to return to `landing.html`.
  - Assertions: Validates bottom bar element, modal options, outbound link, and reciprocal inbound links in `index.html`.

- **Journey 4: Mobile Visitor Exploration Flow**
  - Steps:
    1. User views site on mobile viewport (375px).
    2. User taps hamburger button `[data-menu-drawer-toggle]`.
    3. Mobile drawer `[data-menu-drawer]` slides into view.
    4. User taps anchor link `#metadatos` or `#bloques`.
    5. Page scrolls to target section; drawer closes.
  - Assertions: Validates toggle button, drawer container, internal anchor links, and mobile layout classes.

- **Journey 5: Returning Member Direct Login Flow**
  - Steps:
    1. Fraterno opens `landing.html`.
    2. Immediately clicks header CTA "Portal Fraterno" (`<a href="index.html">`).
    3. Reaches `index.html` login view.
    4. Return navigation link to `landing.html` is present on login screen and sidebar.
  - Assertions: Verifies header CTA exists, points to `index.html`, and reciprocal links exist in `index.html`.

---

## 5. Test Runner & Verification Guide

### Runner Command
```bash
python test_landing_page.py
```

### Verbose Mode
```bash
python test_landing_page.py -v
```

### Expected Output Summary
```
================================================================================
  TINKUS WISTUS 2026 — EDITORIAL LANDING PAGE TEST SUITE (MONTE STYLE)
================================================================================
  Target File: landing.html
  Secondary Targets: index.html, vercel.json, assets/img/*

  TIER BREAKDOWN:
  ------------------------------------------------------------------------------
  [TIER 1] Feature Coverage (F1 - F17)           :  85 tests
  [TIER 2] Boundary & Corner Cases (B1 - B5)     :  25 tests
  [TIER 3] Cross-Feature Combinations (X1 - X7)  :  14 tests
  [TIER 4] E2E User Journeys (J1 - J5)           :   5 tests
  ------------------------------------------------------------------------------
  TOTAL TESTS EXECUTED                           : 129 tests

  RESULT: ALL TESTS PASSED (129 / 129)
================================================================================
```

### Exit Codes
- `0`: All test suites passed cleanly with 100% compliance.
- `1`: One or more tests failed, indicating defects or incomplete contract implementation.
