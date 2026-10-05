## 2026-10-02T20:18:02Z

You are worker_impl_1, a teamwork_preview_worker.
Your working directory is: c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\worker_impl_1
Project root: c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal
Your parent conversation ID is: 15b0a8e7-07ca-4ff9-aa0f-b752c200529d

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY READING:
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\ORIGINAL_REQUEST.md`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\PROJECT.md`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\survey_spec_miner_1\report.md`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\survey_explorer_monte_3\report.md`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\survey_explorer_portal_2\report.md`

FILE WRITE OWNERSHIP:
You EXCLUSIVELY own and write to:
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\landing.html`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\index.html` (only adding bidirectional navigation return links)
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\vercel.json` (adding /landing route rule)
- Files in your working directory (`.agents/teamwork/worker_impl_1/*`)
DO NOT modify `test_landing_page.py`, `TEST_INFRA.md`, `TEST_READY.md`, or files of other agents.

YOUR TASK:
Implement the complete, high-fidelity, autonomous editorial landing page `landing.html` faithful to Monte (DOMA R&B: https://domarb.com.au/venue/monte/) and Tinkus Wistus 2026:
1. R1 & R2: Full HTML5 skeleton with Tailwind Play CDN v3 configured with Monte tokens (#f5f0ea silver, #111111 charcoal, #b9b1a4 stone grey, #ddd8d2) and Tinkus Wistus accents (#7c3aed purple, #d97706 gold). Google Fonts: Playfair Display / Cormorant Garamond, Plus Jakarta Sans, DM Mono. Header with `[data-header]`, transparent at top, solid stone on scroll (`.scrolled`), mobile/desktop drawer menu (`data-menu-drawer`), hamburger toggle (`data-menu-drawer-toggle`), top action bar, bidirectional links.
2. R3: Hero masthead (`h-svh`, `[data-block="masthead-full"]`) using `assets/img/wistus-banner.jpg` with dark overlay, monumental centered typography, official badge (`assets/img/wistus-badge.svg`). Section of Quote & Metadata (`data-block="columns"`, `data-columns="2"`): left editorial quote on Tinku passion, right `<dl data-venue-metadata>` 2-column key/value list (Horarios de Ensayos, Local Munaypata/San Pedro, Directiva, Redes Sociales oficiales, Enlace al Portal).
3. R4: Photographic gallery carousel (`[data-block="carousel"]`, `[data-carousel-swiper]`) using Swiper.js v11 CDN with fluid responsive slide widths and drag/touch physics. 3D Holographic Credencial CTA block (`[data-block="cta"]`, `[data-gift-card-animation]`, `data-gift-card`) reproducing Monte gift card interaction for "Credencial Digital Fraterna Wistus 2026", with interactive 3D perspective mouse tilt, dynamic specular glare highlight, and CTA button opening registration drawer. Fraternal blocks carousel ("Nuestros Bloques", `[data-block="listing-carousel"]`) for Machas, Imillas, Ñaupas, Sambos with imagery, synopsis, and details.
4. R5: Fixed bottom action bar (`[data-find-a-table-btn]`) with "Unirse a la Fraternidad / Ingresar". Fullscreen modal (`<dialog id="find-a-table" data-modal>`) with direct portal links, directiva, schedules, and cuotas payment. Lateral registration drawer (`<dialog id="enquire" data-modal-drawer>`) with reactive registration form (Nombre, Apellidos, Teléfono, Bloque, Mensaje) with interactive validation and submission feedback. Editorial footer (`footer[data-footer]`, `form[data-subscribe-form]`) with newsletter subscription and legal copyright.
5. Update `index.html` to add reciprocal links back to `landing.html` (e.g. in login screen `#view-login` and sidebar `#appSidebar`).
6. Update `vercel.json` to add rewrite rule for `/landing` preserving static routing.
7. Verification: Run Python syntax or test suite if available (`python test_landing_page.py`), verify file existence, verify no broken links or console errors.
8. Write comprehensive report to `report.md` and 5-component handoff to `handoff.md` in your working directory.
9. Notify parent via `send_message` when complete.
