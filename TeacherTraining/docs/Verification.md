# Verification record — 1 October 2026

This record distinguishes executed checks from checks blocked by the environment.

| Check | Result / evidence |
| --- | --- |
| Entire attachment read | All 547 source paragraphs (including blanks) and 12 tables extracted; no embedded images. Full non-empty text/table rows in review appendix. |
| Rule catalogue | 54 unique IDs with roles/triggers/behavior/messages/exceptions and classification. |
| Traceability | 609 entries: every non-empty paragraph and table row; broad module mapping plus explicit catalogue references. Mapping is coverage evidence, not business approval. |
| Validation coverage | 27 matrix entries; missing business values marked, no invented character lengths/past-date ban/noon cutoff. |
| JavaScript syntax | `node --check` passed for app.js, excel.js and rules.js. |
| Business engine | 18 assertions passed: valid batch, equal/reversed project dates, duplicate code, unavailable project/trainer, project period, holidays, capacity, duplicates, future attendance, unset completion, attendance evidence, mandatory assessment and pass gate. |
| Actual view functions / role scoping | 96 render-function executions (16 screens × 6 personas) passed in minimal non-browser DOM fixture. Central=3 batches, assigned trainer=2 batches, trainee=1 batch/1 own record assertions passed. This is not real DOM or layout testing. |
| XLSX writer | Actual generated workbook ZIP structure validated with JSZip; both templates independently read by openpyxl: batch 2 rows × 10 columns, trainee 2 × 4; expected sample values preserved. |
| Static controls / assets | Every literal `btn()` action maps to a handler; 16 routes map to render functions; authored local asset links exist; exact upstream version pins checked. |
| Live browser smoke test | **Blocked / not passed.** Local Playwright had no installed Chromium; local CDP was unavailable. Cloud browser navigation to localhost was rejected with `net::ERR_BLOCKED_BY_CLIENT`. No claim of browser E2E success. |
| Desktop/tablet/mobile visual QA | **Unverified.** Responsive CSS breakpoints at 1100 and 760 px implemented. Included browser test is designed for 1440, 768 and 390 px; unable to execute here. |
| Live Bootstrap/jQuery integration | **Unverified.** Official versions verified via public source retrieval, but CDN binary downloads were denied. Exact CDN references and local setup script delivered. Core native fallback syntax/model checked. |
| IndexedDB persistence / browser downloads / keyboard focus | Code implemented; **browser verification pending** because browser unavailable. Failures surfaced rather than claimed successful. |
| Production security/backend | Outside prototype capability: authentic login/OTP, encryption, authorization, Odoo/UDISE, immutable audit and actual certificate issuance need backend and business sign-off. |

## Pending acceptance checklist on a browser-enabled machine

Run `tests/browser.test.cjs` after installing Playwright/Chromium and serving the parent folder on port 8047. This test aborts external CDN requests intentionally to check core fallback, then exercises project save/error/persistence, approval, attendance/future rejection, unset completion, own scope/form submission, XLSX template/import, uploaded byte roundtrip, nine reports/Excel export and responsive body overflow. Run another session with the pinned libraries locally vendored to verify the jQuery path.

Manually inspect visible focus/Tab order, labelled searchable selects, modal Escape/return focus, error association and preserved inputs; inspect all screens on desktop/tablet/mobile; test storage denial/quota, malformed XLSX/XLS rejection, invalid mixed-row atomic import, conflicting UDISE/plan/project, capacity races after preview, resource day expiry, common propagation defaults, pending/completed eligibility and certificate logo/template preview. No reviewer approval has been inferred for provisional criteria.

## v3.1 Trainee Registration update — 1 October 2026

39 new assertions passed using the actual registration handlers in a non-browser DOM fixture plus rule-engine checks. Covered: unassigned trainee opening exact B3 link; invalid link no fallback; no contact data exposed in registration view; request-before-verify demo OTP; contact-change invalidation; duplicate registration; Unique ID lookup without name and after disabling registration; assigned trainer grant versus out-of-scope denial; enable/disable controls; XLSX commit when self-registration disabled; late capacity revalidation; pending list closure denial; trainer approval; independent unresolved completion gate. Existing 18 rule assertions and 96 view executions across six personas passed. XLSX generation, action handler coverage, asset references and 63 unique catalogue IDs passed.

These are code/model checks. Real browser behavior, visual layout, responsive display, clipboard access, concurrent browser sessions and real OTP delivery remain unverified or unsupported. No production security claim is made. Assets remain pinned to Bootstrap 5.3.8 and jQuery 4.0.0 as verified for the baseline; no dependency upgrade was needed.

## v3.2 Training / Learning Resources update — 1 October 2026

44 resource assertions passed. Coverage: PPT/PPTX/PDF and review extension allowlist; missing-file rejection; project/plan consistency; non-common cross-project rejection; common reuse; duplicate plan/resource links; per-link inheritance independent of legacy global setting; individual trainer grant; no-grant denial; atomic metadata+link save after file-store success; trainer common publication request and admin publication; trainee visibility after explicit propagation; failed byte storage; metadata quota rollback plus byte cleanup; duplicate in-flight save prevention. Actual application handlers executed against a non-browser DOM/file-store fixture. The stored Blob fixture was read back and matched its input bytes, which does not verify browser IndexedDB.

Regression checks passed: 18 business-engine assertions, 96 view-function executions across six personas, 39 registration assertions, XLSX templates/asset references/button handler coverage and 70 unique catalogue entries. Both updated JavaScript files passed syntax checks. The browser acceptance script was updated to select the required training plan on upload but has not been executed. Visual/responsive, actual IndexedDB, multimedia download/playback and production backend enforcement remain unverified or outside prototype scope. Bootstrap 5.3.8 and jQuery 4.0.0 pins retained.

## v3.3 Training Plan update — 3 October 2026

39 Training Plan rule/action assertions passed: required project/name/type/duration; enumerated types; positive integer duration; unique auto codes; multiple plans per project; multi-day resource assignment; day-boundary rejection; duration-reduction consistency; unused link/day-note editing; used-plan structural and assignment locks; metadata reason/audit; reason for new historical day activity; independent revision/new code with unchanged original batch/link records; sample four-day schedule; role denial. Non-browser DOM fixture only. A duplicate legacy link editor definition found during verification was removed, leaving the checkbox day editor as the sole implementation.

Regressions passed: 18 baseline rule assertions, 96 view-function executions across six personas, 39 registration assertions, 44 resource assertions, XLSX/asset/action checks and 78 unique catalogue entries. Syntax checks passed for app.js and rules.js. Offline asset setup fixture passed: Bootstrap header whitespace normalization accepts double-spacing; unexpected header leaves index unchanged. Actual network retrieval was not performed. Existing Bootstrap 5.3.8 and jQuery 4.0.0 pins retained.

Browser visual/responsive, real IndexedDB, CDN/vendored dependency browser paths and backend/security controls remain unverified or unsupported. Revision workflow is provisional and is not business approval or production versioning.

## v3.4 Batch Management / Trainee Registration update — 3 October 2026

40 new batch assertions passed, exercising actual handlers and rules against non-browser DOM/Excel-input fixtures. Covered project/plan/date/trainer/availability/capacity/holiday/registration-choice/UDISE checks; explicit scoped Admin grant; Excel preview without saving; atomic commit; derived location and ignored forged location; subsequent edit validation; staged duplicate rows; late holiday revalidation; out-of-scope import; protected linked-record deletion; audited permitted deletion; trainer batch-delete denial; disabled-registration link gate. Existing 39 registration checks, 39 plan checks, 44 resource checks, 18 baseline rules and 96 view-function executions across six personas passed. Syntax and XLSX/asset/action coverage checks passed with 88 catalogue entries.

Fixtures do not verify real browser workbook parsing, layout, responsive display or actual IndexedDB. Existing browser acceptance script remains unexecuted. OTP, UDISE, authorization and audit are local prototype demonstrations; production server enforcement and business policy sign-off remain necessary. Bootstrap 5.3.8 / jQuery 4.0.0 pins retained.

## v4.1 complete POC registration update — 3 October 2026

Passed 44 registration rule/action assertions, including copied absolute batch URL, registration-page navigation, selected batch on page load and disabled-link gate. Passed 17 HTML entry page identifiers and local asset references. Existing regressions passed: 96 view executions across six personas, 40 batch assertions, 39 plan assertions, 44 resource assertions, 18 business-engine assertions, XLSX template generation/structure, literal action coverage and 88 catalogue IDs. JavaScript syntax passed.

These are non-browser DOM/Excel-input fixtures and static checks. Browser layout/responsive display, clipboard behavior in an actual browser, real IndexedDB and browser workbook parsing remain unverified. OTP is simulated; shared multi-user data and secure server enforcement are outside this local POC. Day 1 registration remains provisional.

## v4.2 resource update — 3 October 2026

53 resource rule/action assertions passed: permitted formats, project/plan association, common cross-project reuse, upload grants, optional publication request, per-link propagation, scoped resource visibility, actual file-store fixture bytes and storage failures, duplicate upload prevention, plan/project presentation and scoped Batch availability. Other passed regressions: 44 registration assertions, 96 view executions across six personas, 40 batch assertions, 39 plan assertions, 18 business-engine assertions, 17 HTML entry pages and artifact/template/action coverage with 88 catalogue IDs. JavaScript syntax passed.

All action and rendering checks use non-browser fixtures. Actual IndexedDB, clipboard, browser layout/responsiveness and multimedia playback remain unverified. Files/permissions/audit are local prototype demonstrations.

## v4.3 central master data update — 4 October 2026

87 master-data assertions passed: trainer categories/codes; availability intervals/ownership/CRUD/future view; holiday scopes and schedule validation; form purposes, required answer and day limits; training-day release and project-end expiry; resource manifests/actual byte-store fixture uploads; duplicate detection; stale preview revalidation; permission checks; upload failure and metadata rollback; historical references; manual trainer editing and form creation; and six generated XLSX workbook structures.

Regressions passed: 53 resource assertions, 44 registration assertions, 96 view executions across six personas, 40 batch assertions, 39 plan assertions, 18 business-engine assertions, 17 HTML entry-page checks, artifact/template/action coverage and 97 unique catalogue IDs. App JavaScript syntax passed.

Non-browser fixtures and generated ZIP/XML checks only. Actual browser workbook parsing, IndexedDB, file playback, clipboard and visual/responsive layout remain unverified. Imports are additive; server security/shared storage/transactional enforcement/durable audit are outside this local POC.

## v4.4 role login — 4 October 2026

76 local credential/session/route/public-registration/logout assertions and 65 actual workspace role-scope/fixed-persona/access-denial/guest/logout assertions passed (141 combined). All six credential logins map to the existing scoped personas. Demo mode remains switchable; guest navigation is registration-only. All 17 workspace HTML pages load auth.js before app.js; login.html is present. Back/forward page restoration rechecks session and refreshes persisted pages.

Regressions passed: 87 master-data, 53 resource, 44 registration, 96 view executions across six personas, 40 batch, 39 plan and 18 business-engine assertions, plus entry-page/static asset checks and artifact/template/action coverage with 101 rule IDs. Both auth.js and app.js passed syntax checks.

Non-browser fixtures only. Real browser layout/navigation/autofill and IndexedDB remain unverified. Published JavaScript demo credentials and sessionStorage do not provide production authentication, password security or server authorization. Existing production limitations remain.

## v4.5 footer update — 4 October 2026

Static checks passed for exactly one branded footer on each of 18 application pages, including login; supplied logo bytes preserved exactly; local logo reference included throughout. Page/asset and artifact coverage checks passed. Footer CSS preserves logo aspect ratio, uses a navy background for white artwork and wraps on narrow screens. Browser visual verification remains unperformed.

## v4.6 certification — 5 October 2026

54 certificate-specific assertions passed: all certificate fields, three sample layouts, embedded organization/project logos, template project/code/colour/layout validation, duplicate row/code prevention, blocked unresolved completion criteria, approved completion evidence, trainee/batch/name/plan/duration/date consistency, unique certificate number and trainee/batch identity, snapshot preservation after actual template edit, failed logo read rollback, scoped access and denied trainer mutation, marked preview and ZIP download contents. Generated three standalone HTML samples.

All regressions passed: 89 master-data assertions and eight generated workbook template structures, 76 auth, 65 login-workspace, 53 resource, 44 registration, 96 view executions, 40 batch, 39 plan, 18 business-engine checks, 17 workspace route/asset checks, artifact/action coverage and 106 catalogue IDs. App syntax passed.

Non-browser fixtures and ZIP/XML checks only. Actual browser printing/visual responsiveness/logo decoding and workbook parsing remain unverified. PDF files are not generated; samples and saved certificates are printable standalone HTML. Certification is marked SAMPLE / LOCAL POC; server issuance and numbering/reissue policies remain unresolved.

## v4.7 attendance — 5 October 2026

64 attendance assertions passed: explicit project/day controls, Present/Absent, today/previous/future/invalid/out-of-batch dates, complete manual list, forged status/trainee rejection, scoped authorization, assigned trainer and authorized admin behavior, read-only trainee/monitor display, closed-batch correction gate, trainee/batch/date upsert, audit actor/before/after, unchanged value handling, Excel row linkage/duplicates/status, partial-upload rejection, storage rollback, stale trainee revalidation, preview headers and generated attendance workbook structure.

All regressions passed: 54 certification, 89 master data, 76 auth, 65 workspace login, 53 resource, 44 registration, 96 view executions, 40 batch, 39 plan, 18 business engine, 17 route/asset and artifact checks with 114 catalogue IDs. App syntax passed.

Non-browser fixtures and generated workbook XML/ZIP checks only. Actual browser workbook parsing/layout, shared attendance concurrency and server audit/security remain unverified or unsupported. Bulk Excel is confirmed; batch bounds, final-closure correction restriction and atomic/missing-row policies remain POC contracts.


## v4.8 reusable training masters — 6 October 2026

51 targeted assertions passed for independent masters, exact ten-mapping sample, sequential/stable codes, staged duplicate/rename, minimum duration, duplicate mapping rejection, duration conflict preservation, draft exclusion, cross-project assignment, duration-aware dates, snapshot preservation and legacy migration. Regression checks passed: 89 masters, 53 resources, 40 batches, 64 attendance, 54 certification, 76 auth, 65 workspace login, 44 registration, 96 view executions, 18 rules, 17 workspace page/asset checks plus catalogue/action/template and asset-setup fixtures. Node syntax checks passed.

Latest stable Bootstrap 5.3.8, jQuery 4.0.0 and Bootstrap Icons 1.13.1 verified using official primary pages. Asset setup vendors all 18 entry pages plus icon fonts atomically after successful downloads.

Non-browser fixtures only. A real browser executable is absent; installing it was unavailable under current network access. Browser layout, navigation, printing, IndexedDB and browser XLSX parsing are not verified. The earlier browser.test.cjs is a legacy diagnostic and is not counted as passing evidence. Server-wide codes, concurrent editing, production authorization, real OTP and backend storage are outside this local POC.


## v4.9 Resource Library — 6 October 2026

41 targeted assertions passed for plan-driven resource selection, plan search/filter controls, type/day/name filtering, current-master versus batch snapshot lists, historical mappings after master changes, future release gates, expiry, trainee/trainer/admin scope, upload grants and project-specific content isolation. The existing 53 resource assertions and all other regression suites pass. Tests are non-browser fixtures; real browser layout/interaction, IndexedDB and XLSX parsing remain unverified.


## v4.10 separate Content Library — 6 October 2026

50 targeted non-browser assertions passed for ALL/Videos/PPTx/Docx/Images filters, extension categories, independent content records, bulk multi-file save, original byte retention, duplicate rejection, invalid-file rollback, partial byte-store failure cleanup, metadata quota failure, audits, common/project scope, upload grants and restored Learning Resources. New content-library.html has the shared shell, footer and authentication guard; 18 workspace entry pages are checked. Existing POC regression suites pass. The v4.9 library fixture was removed because that replacement UI is no longer active. Browser layout, codec support, browser IndexedDB and XLSX parsing remain unverified.
