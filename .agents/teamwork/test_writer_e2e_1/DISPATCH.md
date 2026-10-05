## 2026-10-02T20:18:02Z
You are test_writer_e2e_1, a teamwork_preview_test_writer.
Your working directory is: c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\test_writer_e2e_1
Project root: c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal
Your parent conversation ID is: 15b0a8e7-07ca-4ff9-aa0f-b752c200529d

MANDATORY: Read the authoritative user requirements at:
c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\ORIGINAL_REQUEST.md
Also read the project architecture at:
c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\PROJECT.md
and the specification report at:
c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\.agents\teamwork\survey_spec_miner_1\report.md

FILE WRITE OWNERSHIP:
You EXCLUSIVELY own and write to:
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\TEST_INFRA.md`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\test_landing_page.py`
- `c:\Users\juan.zarate\OneDrive - bancofie.com.bo\Escritorio\Goal - Portal\TEST_READY.md`
- Files in your working directory (`.agents/teamwork/test_writer_e2e_1/*`)
DO NOT modify `landing.html`, `index.html`, `vercel.json`, or any source code files.

YOUR TASK:
1. Create `TEST_INFRA.md` at project root documenting test philosophy, architecture, feature inventory (F1-F19), and the 4-tier testing methodology:
   - Tier 1: Feature Coverage (>=5 test cases per feature for all core features)
   - Tier 2: Boundary & Corner Cases (>=5 test cases per feature where boundaries exist)
   - Tier 3: Cross-Feature Combinations (pairwise interactions)
   - Tier 4: Real-World Application Scenarios (end-to-end user journeys)
2. Implement `test_landing_page.py` at project root:
   - Must be clean, runnable Python (e.g. `python test_landing_page.py`) using standard library or BeautifulSoup/html.parser.
   - Comprehensive test assertions:
     - Tier 1: Validates existence and structure of landing.html, data attributes (`[data-header]`, `[data-block="masthead-full"]`, `[data-venue-metadata]`, `[data-carousel-swiper]`, `[data-gift-card-animation]`, `[data-listing-carousel]`, `[data-find-a-table-btn]`, `<dialog id="find-a-table">`, `<dialog id="enquire">`, `[data-footer]`), fonts, colors, and bidirectional links.
     - Tier 2: Boundary and edge cases (empty form inputs, invalid phone numbers, attribute escaping, mobile viewport tags, local asset paths existence).
     - Tier 3: Cross-feature combinations (modal close vs drawer open, credencial CTA triggering registration drawer, header scrolled class mechanics, bottom bar trigger).
     - Tier 4: End-to-end user journeys (visitor flow from hero -> metadata -> gallery -> 3D card -> registration enquiry -> portal access link).
   - Clear output reporting: prints detailed tier breakdowns, total tests run, passed, failed, and exits with 0 on success or 1 on failure.
3. Test your test suite: Run `python test_landing_page.py` during your work to confirm it executes without syntax errors and appropriately reports failures/passes.
4. When test suite is fully designed and operational, create `TEST_READY.md` at project root with runner command, test summary counts per tier, and feature checklist.
5. Write your comprehensive report to `report.md` and structured 5-component handoff to `handoff.md` in your working directory.
6. Notify your parent via `send_message` when complete.
