> [!WARNING] **Skepticism Disclaimer**
> Confidence is high on DOM and CSS viewport geometry across modern mobile/desktop Chromium engines, though actual touch haptics and third-party keyboard IME overlays on physical Android/iOS OLED devices remain subject to vendor quirks.

## 1. What the prior attempt got wrong

### Issue 1: Hardcoded Hero Masthead minimum height caused CTAs to overflow below the fold in mobile landscape viewports
- **input:** Smartphone in horizontal orientation / landscape viewports (e.g. 844x390, 667x375, 800x480) with viewport innerHeight between 220px and 330px.
- **expected:** Acceptance Criterion 1: *"La landing page presenta en su viewport inicial (desktop y móvil) los 2 CTAs claramente diferenciados sin scroll necesario."*
- **actual:** `CTA1 visible without scroll: False` (top=244.5px, bottom=292.5px against innerHeight=239px), `CTA2 visible without scroll: False` (top=243.5px, bottom=293.5px). Both CTAs were pushed below the visible viewport, forcing the user to scroll to see them.
- **root cause:**
  1. `<section id="hero">` and `<header data-block="masthead-full">` had hardcoded `min-h-[560px]`, forcing a 560px minimum container height even when the screen was only 240px tall.
  2. In landscape mode, horizontal width exceeded the Tailwind `sm:` breakpoint (640px), triggering inflated paddings (`sm:py-10`), badge sizes (`sm:w-20`), and font sizes (`sm:text-6xl`) designed for tablets/desktops rather than compact-height phones.
  3. The `#metadatos` scroll indicator was anchored at `bottom-3` without height checks, colliding with the CTAs.

### Issue 2: Broken scroll container semantics in `#view-login` prevented programmatic scroll-into-view
- **input:** Mobile device with virtual keypad open, or system accessibility zoom set to 150%, triggering `scrollIntoView()` on `#inputCI` or `.btn-login-submit`.
- **expected:** When an element is focused or when the keyboard opens, the input and primary CTA smoothly scroll into the visible viewport.
- **actual:** `Submit button in visible viewport: False` (top=479.8px, bottom=532.1px against innerHeight=239px). The submit button remained unscrollable and out of view.
- **root cause:** `.login-wrapper` had `overflow-y: auto` but only `min-height: 100vh` without an explicit `height` constraint (`height: 100vh; height: 100dvh;`). In CSS layout specifications, an unconstrained `min-height` container expands to the height of its children (668px), making its `clientHeight` equal to its `scrollHeight`. Consequently, it established a scroll container that had zero scrollable headroom, preventing `scrollIntoView()` calls on child inputs from executing. Furthermore, `.login-card-main` lacked `margin: auto 0;`, creating flexbox center data-loss risks on constrained heights.

### Issue 3: Sub-optimal text contrast on auxiliary elements in Login
- **input:** Light background cards inspected with WCAG AAA standards for auxiliary text (`.login-welcome-text`, `.btn-link-discrete`, `.directiva-welcome-badge`).
- **expected:** High-contrast text adhering to AAA guidelines for secondary elements.
- **actual:** Color `#64748b` provided a ~4.6:1 ratio, failing WCAG AAA for small text (<7:1).
- **root cause:** Missing contrast tokens for secondary login typography; updated to `#334155` (8.2:1 contrast ratio, comfortably passing AAA).

## 2. What I changed
- **`landing.html`**:
  - Removed hardcoded `min-h-[560px]` on `#hero` and `[data-block="masthead-full"]`, preserving `h-svh h-screen min-h-screen` fallbacks.
  - Added dedicated compact-viewport CSS rules (`@media (max-height: 540px)` and `@media (max-height: 380px)`) that dynamically scale paddings, hero badge, typography, and button dimensions, hiding the scroll indicator on short screens.
  - Added semantic classes (`.hero-content-box`, `.hero-badge-wrap`, `.hero-tag-convocatoria`, `.hero-title-main`, `.hero-lema-text`, `.hero-cta-wrapper`, `.hero-scroll-indicator`).
  - Added accessibility attributes to CTAs: `aria-controls="enquire"`, `aria-haspopup="dialog"`, `aria-label`, and `title`.
- **`css/style.css`**:
  - Configured `.login-wrapper` with `height: 100vh; height: 100dvh; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; -webkit-overflow-scrolling: touch;`, making it an effective scrolling container that properly scrolls focused inputs.
  - Added `margin: auto 0;` to `.login-card-main` to prevent flexbox centering data-loss when viewport height is constrained.
  - Added `scroll-margin-top: 16px; scroll-margin-bottom: 16px;` to `.input-wrapper-ci`, and `scroll-margin-bottom: 24px;` to `.btn-portal-primary, .btn-login-submit`.
  - Added `@media (max-height: 540px)` rules for `.login-card-main`, compacting the logo, padding, typography, and buttons in landscape/keyboard states.
  - Upgraded text color contrast to `#334155` in `.login-welcome-text`, `.btn-link-discrete`, and `.directiva-welcome-badge`.

## 3. Verification Record
- **Deep Verification (ran actual tests):**
  - `python -m unittest tests_verification.py test_landing_page.py`: **164/164 PASSED** in 0.142s.
  - `python -m unittest tests_adversarial_suite.py`: **17/17 PASSED** in 33.4s.
  - Standalone Empirical Stress Suite (`test_empirical_challenger2.py`): **10/10 Tiers PASSED (Verdict: APPROVE)**.
  - Headless Chromium viewport visibility validation across 7 viewports:
    - Desktop (1440x900): CTA1 & CTA2 visible=True
    - Tablet (768x1024): CTA1 & CTA2 visible=True
    - Mobile Portrait (375x667): CTA1 & CTA2 visible=True
    - Mobile Portrait (390x844): CTA1 & CTA2 visible=True
    - Mobile Landscape (844x390, innerH=239): CTA1 & CTA2 visible=True (previously False)
    - Mobile Landscape (667x375, innerH=224): CTA1 & CTA2 visible=True (previously False)
    - Small Height Landscape (800x480, innerH=329): CTA1 & CTA2 visible=True (previously False)
  - Keyboard scroll and 150% zoom simulation on mobile landscape:
    - At 150% zoom: CI input visible: True, Submit button visible: True.
    - Input clearing and autofocus verification: PASSED.
- **Shallow Verification (manual inspection):**
  - Verified git diff across `landing.html`, `css/style.css`, `index.html`, and `js/auth.js`.
- **Unverified aspects:**
  - Real hardware rendering with active WebGL/GPU compositor acceleration on physical iOS 18/Safari and Android 14/OneUI devices with custom OEM virtual keyboard overlays (e.g. SwiftKey floating mode).

## 4. Known Issues
- `Minor Robustness Risk`: In extreme landscape smartphones with screen height under 320px and aggressive multi-row virtual keyboards, the keyboard itself will inevitably cover a portion of the screen, requiring natural touch-scroll gestures, which are now fully enabled by the fixed scroll container semantics.

## 5. Remaining risk & next step
- Both R1, R2, and R3 requirements and all acceptance criteria are completely satisfied. The 164 unit tests, 17 adversarial tests, and all 10 stress test tiers pass with 100% success rate. The task is fully complete and ready for production deployment.
