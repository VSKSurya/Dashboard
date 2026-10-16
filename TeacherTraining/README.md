# Complete Teacher Training POC v4.10

## Quick start

1. Install Python 3 if it is not already installed.
2. Double-click **Start-Training-Tracker.bat**. On Windows, the launcher starts a local server and opens the sign-in page. Keep its console window open while using the app.
3. Or run `py -3 start-poc.py` from this folder and open [http://localhost:8080/login.html](http://localhost:8080/login.html).
4. Sign in with the local demo account `admin` / `admin@123`, or choose a demo persona on the login page. The demo account is browser-side only and does not provide production authentication.

The app is a static HTML, CSS, and JavaScript prototype. It has no build step or backend; records are stored in browser storage for the current origin. Changing the hostname or port opens a separate local data store. Use **Rules & decisions → Reset sample data** to restore the sample records.

## Project contents

- `*.html` — sign-in and tracker pages.
- `assets/` — application logic, shared styling, logos, and vendored browser libraries.
- `docs/` — business rules, workflows, version notes, and prototype alignment.
- `templates/` — XLSX import templates and sample feedback document.
- `samples/` — sample content and certificate previews.
- `tests/` — automated project checks (run only when requested).

For the KGBV programme, choose **Digital Classrooms in 750 KGBVs** (`ERN-KGBV-26`) in the project selector. The synthetic school and participant records, training phases, cluster model, scheduling assumptions, and usage notes are in [KGBV-Prototype-Alignment.md](docs/KGBV-Prototype-Alignment.md).

## KGBV prototype alignment

The **Digital Classrooms in 750 KGBVs** programme (`ERN-KGBV-26`) is included with 750 synthetic school records, state trainer pools, six training plans, phase windows, cluster-based teacher batches, per-school student batches, resource links, and sample participants. Select this project in the app to work through its training lifecycle. Batch XLSX imports support optional additional UDISE codes for teacher clusters. Read [KGBV-Prototype-Alignment.md](docs/KGBV-Prototype-Alignment.md) for the phase schedule, process rules, synthetic-data notes, and date assumptions.

**Default admin sign-in:** User ID `admin`, password `admin@123` (local prototype shortcut for the Schoolnet Admin sample account). Demo User IDs `A1`-`A6` continue to use `Demo@123`. These credentials are browser-side demonstration values and are not production authentication.

**Content Library** is a separate sidebar page with **ALL | Videos | PPTx | Docx | Images** tabs. Click a tab to filter in place. ALL displays every content format together; search works within the selected tab. Bulk upload accepts multiple files directly, validates all files, then saves file bytes and audit records together. No Excel manifest is required for this new upload.

Supported formats: MP4/WEBM videos by default (other configured video formats require an existing admin format grant), PPT/PPTX, DOCX and PNG/JPG/JPEG. Images and supported videos have a Preview action; every file can be downloaded in its original format. Schoolnet Admin may choose Common or Project-specific scope; permitted trainers upload into authorized projects.

**Learning Resources remains the v4.8 page and workflow**: resource repository, upload & link, Excel + files bulk upload, common reuse, Training Plan mapping and batch availability. Content uploads are independent and do not automatically create Learning Resource records.

Extract this ZIP and open **login.html**. Demo User IDs **A1–A6**, password **Demo@123**. All prior POC modules and samples remain included. Read `docs/Content-Library-v4.10.html` for the update. Browser data and existing files are retained.

Older notes below are historical and are superseded by this revision.

# Complete Teacher Training POC v4.9

Resource Library now follows the selected Training Plan. Use the sidebar **Resource Library**, search/select a plan, then select its current master configuration (Schoolnet Admin) or a permitted batch’s saved version. Search resources and filter by Resource Type or Training Day. The table and day cards show linked resources/forms, with release-date and project-expiry gates for learners. Common resources and project-specific scope are respected. Existing upload, bulk Excel + files, common-publication and reuse controls remain available according to permissions.

Open **login.html**. Demo User IDs **A1–A6**, password **Demo@123**. A1 is Schoolnet Admin, A5 is Trainer and A6 is Trainee. Sample plan TP-0001 has ten mapped resources/forms. Existing browser records are retained.

Read `docs/Resource-Library-v4.9.html` for the current workflow. Earlier version notes below remain historical.

# Complete Teacher Training POC v4.8

This revision supersedes project-owned Training Plans with independent reusable masters. Open **login.html**; A1–A6 use **Demo@123**, or select a Demo persona.

Training plans now include staged day-wise resource mapping, minimum 4-day duration, sequential unique codes, modify/rename, duplicate-before-save, draft/active/inactive status, search/filter/pagination and day cards. Batch assignment supports active masters across projects, selected-plan details, duration-aware dates and historical snapshots. All earlier POC modules, bulk templates, Schoolnet footer and sample certificates remain included.

Read `docs/Training-Plans-v4.8.html` for the current business model, demo steps, migration and validation limitations. Older addenda below describe previous versions and are superseded where they conflict.

# Complete Training Tracker POC v4.4 — Role Login

Start with `login.html` (opening `index.html` redirects here without a session). Serve the extracted folder from a terminal using `python -m http.server 8080` or Windows `py -m http.server 8080`; open `http://localhost:8080/login.html`.

| User ID | Role | Demo password |
|---|---|---|
| A1 | Schoolnet Admin | Demo@123 |
| A2 | ERNET Admin | Demo@123 |
| A3 | State Admin | Demo@123 |
| A4 | School Admin | Demo@123 |
| A5 | Trainer | Demo@123 |
| A6 | Trainee Teacher / Student | Demo@123 |

Credential login fixes the role until Logout. The sidebar shows User ID, name and role. Enter demo review from the login page to retain the index persona selector. Public batch registration links remain available without login. All existing modules and six master-data templates are included.

**Local POC login only:** published demo credentials and browser sessions do not provide production authentication/security. See `docs/Role-Login-v4.4.html`.

---

# Training Tracker — stakeholder review prototype

Open `docs/Business-Review-Pack.html` for the requirements summary, complete business rules catalogue, journeys/screen inventory, validations/messages, source appendix, clarifications, assumptions, UX suggestions and paragraph/table traceability. CSV versions are in `docs/`.

## Launch

1. Extract this ZIP.
2. Recommended: in this folder run `python -m http.server 8080` (Windows: `py -m http.server 8080`).
3. Open `http://localhost:8080/` in a modern browser. No npm/build/backend is needed.
4. Choose a **Demo persona** in the topbar. This is a review session selector, not authentication.

Opening `index.html` directly may work, but file-origin browser storage/clipboard/download policies vary. Use localhost for repeatable review. Records belong to the exact origin (protocol, hostname, port); changing localhost port creates a different storage scope.

## Pinned dependencies

Verified from official release pages on 1 October 2026:

- Bootstrap **5.3.8**, https://getbootstrap.com/ (current version); https://getbootstrap.com/docs/5.3/getting-started/introduction/
- jQuery **4.0.0**, https://releases.jquery.com/ and https://blog.jquery.com/2026/01/17/jquery-4-0-0/
- JSZip **3.10.1**, vendored locally, used for minimal XLSX ZIP reading/writing. License included.

**Delivery environment limitation:** external CDN asset downloads were blocked. Bootstrap and jQuery are exact-version CDN references in `index.html`, not silently replaced with old releases. The custom stylesheet and native interaction fallback support offline core review. jQuery delegates interactions when it loads; native DOM delegation runs when it does not. Bootstrap's responsive/control CSS is complemented by the full custom fallback stylesheet. No modal relies on Bootstrap loading (native HTML dialog).

To vendor the two upstream dependencies and make the entire bundle offline, run **`python setup-assets.py`** on an internet-connected machine. It downloads the exact files, checks package-version headers and rewrites `index.html` to local references only after every download succeeds. Until then the archive contains all authored assets and the local Excel library; Bootstrap/jQuery require internet access. This limitation is material and explicit.

## Sample data and roles

Initial records are labelled sample: two projects, two training plans, three batches, two teachers, two trainers, two schools, three learning resources/forms. Dates are generated relative to the first launch date in **Asia/Kolkata**; they remain fixed after refresh. Use Rules & decisions → Reset sample data to regenerate dates. Reset deletes local records and uploaded bytes with confirmation.

| Persona | Demo scope/actions |
| --- | --- |
| Schoolnet Admin | All projects; create/edit projects/plans/batches; batch deletion subject to dependencies; masters, users, certificate template, scoped reports |
| ERNET Admin | Monitor project P1; no inferred operational writes |
| State Admin | P1 and Karnataka school batches; read/report |
| School Admin | P1 and school S1; read/report |
| Trainer | Trainer T1 assigned batches; bulk trainees, approve list, close registration, attendance, own availability; resource upload only with explicit review grant |
| Trainee | U1 own training/evidence; complete linked forms, accessible resources and conditional certificate preview; batch-scoped self-registration demo |

These boundaries are **temporary assumptions** (Q1), not an approved production permission matrix. Settings are accessible to the stakeholder facilitator using any persona; they are explicitly prototype review controls. Browser-side checks can be altered and do not provide security.

## Review walkthrough

1. Central Admin → Projects → Create → search sample Odoo, choose Inclusive Teaching Programme → try equal dates (inline rejection) → save valid dates. Refresh: record persists.
2. Create a plan with duration; link resource/form days. Out-of-range days reject. Used plan structural changes are locked/audited pending versioning policy.
3. Batches → Import XLSX → download template → edit values → select → inspect row errors → Save validated import. Manual form also available. Plans preload/filter by project; school actual location comes from sample UDISE data.
4. Trainer → Trainees & approval → import trainee workbook → approve each or the whole list → close self-registration. Admin bulk upload is permitted, but approval is the assigned trainer’s action.
5. Open registration → select a batch; use displayed **123456** demo OTP. The default provisional self-registration window is Day 1. For sample B1's four-day batch, Day 1 has passed; Rules & decisions can temporarily choose Within batch period to test registration. A batch link includes `#registration/<batch ID>` and works only with this browser's local data; it is not a public cross-device registration service.
6. Trainer → Attendance → choose batch/date → Present/Absent → save. Future dates reject; corrections generate audit entries.
7. Trainee → Assessments & feedback → submit available sample pre-assessment. Example correct answer: **Discussion**. Demo exact-answer matching generates 0% or 100%; this is not a finalized examination engine. Feedback stores actual entered response; forms become available by linked training day until project end.
8. Completion defaults to **Business clarification required**. In Rules & decisions, enter provisional attendance/pass values and required assessment/feedback selections to inspect eligibility. Both sample trainees need approval and evidence. Required plan days, attendance, forms and pass gates apply before final closure; no arbitrary “Mark complete” shortcut exists.
9. Certificates → configure template with program/signatory/color/logos → preview eligible trainee → download printable **DEMO HTML**. No official certificate is issued. Clear synthetic trainee name appears in the certificate preview. Unique official numbering/issuer policy is pending.
10. MIS → choose any of nine views → filters → actual XLSX/CSV export, or browser Print → Save as PDF. CSV/XLSX contain current filtered rows; missing metrics show N/A or pending rather than manufactured values.
11. Audit shows local changes with masked personal old/new fields. Users & roles allows central admin demo scope assignment; self profile edits record masked profile audit.

## Excel contract and uploads

- Demonstration contract only: `.xlsx`, first worksheet, exact headers from downloaded templates. Header **order may vary**, names must match. Dates are ISO YYYY-MM-DD text or Excel serial values (1900 date system). No macros, binary `.xls`, merged-header layouts, styled date inference, password protection or formula evaluation. These unsupported formats produce an explicit error. This is a small contract-specific parser, not a full spreadsheet engine.
- Batch columns: Batch ID, Project Code, Training Plan Code, UDISE Code, Reference Location, Start Date, End Date, Maximum Size, Trainer Code, Open Registration (Yes/No).
- Trainee columns: Batch ID, Name, Mobile, Email. Rows must refer to the selected batch. Duplicate demo identity is mobile OR email in the same batch. Capacity is checked across staged rows and rechecked immediately before commit.
- File selection ≠ parsing ≠ persistence. Valid Excel rows become records in localStorage only after Save validated import. Original Excel workbook bytes are **not retained**. Saving is all-or-nothing in this demonstration; the production partial-save policy is unresolved.
- Resource formats in demo: ppt, pptx, pdf, mp4, webm. Extension checks are not content inspection or antivirus. Actual selected **resource file bytes** are stored in IndexedDB; metadata stays in localStorage. Open/download retrieves those bytes. A failed storage transaction never says upload succeeded. Sample classroom guide is intentionally a local generated text example, not a real PDF.
- Logos (PNG/JPG) are stored as data URLs with template metadata. No invented business file size ceiling is used; actual browser memory/quota failures are surfaced. Precise format/size/MIME policies require Q7/Q16 sign-off.
- Offline attendance and trainer assignment/project-work uploads are not confirmed in this attachment. They are not silently imported from prior conversations.

## Persistence, privacy and server obligations

Records/settings/evidence/metadata/audit persist through refresh in localStorage. Resource bytes persist through refresh in IndexedDB. Persona and selected batch use sessionStorage. Browser clearing/private mode/quota/origin changes can remove or limit storage. Users of another browser/device will not share data. No synchronization, concurrency protection or backend upload occurs. Metadata and bytes use separate stores; errors roll back metadata and attempt byte cleanup, but a browser crash between stores can leave orphan bytes. Reset removes them.

**Use synthetic data only. Browser storage is unencrypted.** The attachment's encryption and masking requirements need a server and approved Q14 policy; the prototype does not fulfill production storage security. No passwords are captured. OTP is displayed simulation with no sending, expiry, retries, account recovery or rate-limit claims. Failed-login lockout thresholds/15-minute scope and hidden-URL wording remain unresolved.

A backend must enforce role/project/state/school/batch/self authorization, atomic capacity and unique checks, scheduling, day gates, correction/closure/versioning, file permissions/validation/scanning/limits, audit immutability/retention, encrypted storage with keys, approved masking, authentic login/OTP and authoritative completion/certificate issuance. Real Odoo and UDISE integrations are unavailable and labelled sample.

## Clarifications and suggested behavior

The review pack retains **Q1–Q18**, including source contradictions. Explicit §5 date ordering and §7 project boundaries are applied even though Q3 says these are unstated; this is visible as an unresolved conflict. Conditional propagation, registration windows, suggested status stages, completion and certification criteria are not treated as approved business decisions. Full assumptions and UX suggestions are separate in the pack and app.

## Verification

`node tests/rules.test.cjs` runs the business-engine checks. `node tests/artifacts.test.cjs` generates/validates XLSX ZIP structure and static action/route coverage. See `docs/Verification.md` for actual results and limitations. The browser smoke-test script is included for a machine with Node + Playwright + Chromium; install dependencies there with `npm install --no-save playwright` and `npx playwright install chromium`, serve the parent folder on port 8047, then run `node tests/browser.test.cjs`. Browser checks were **not passed** in this delivery environment because Chromium was missing and the cloud browser blocked localhost. Desktop/tablet/mobile CSS is implemented but visual/device and live CDN integration QA remains unverified; do not mistake static checks for those checks.


## Trainee registration update — v3.1

- Trainer/Schoolnet Admin: Trainees & approval → select batch → enable/disable registration, copy link, import XLSX. Uploads remain available when self-registration is open or disabled; final closure blocks imports provisionally.
- Open the copied `#registration/<batch-id>` link. An existing trainee assignment is no longer necessary. Invalid links never select another batch.
- Enter synthetic name and mobile or email → Request demo OTP → enter displayed **123456** → Verify OTP & register. Changing contact details requires another request. New entries await assigned trainer approval. Generated Unique ID appears in the success message.
- Find my Unique ID uses an independent mobile/email form and simulated OTP; works when self-registration is disabled/full/outside its window.
- Day 1 only in Asia/Kolkata is provisional. Rules & decisions can select Within batch period for review. To exercise a successful registration today, create a batch starting today with capacity, available trainer, valid project dates and no applicable holiday.
- Mobile OR email identity is a temporary assumption. Email checked for basic format; no invented mobile length, country-code requirement or file-size cap. Duplicate scope is same batch: mobile ignores spaces/hyphens/parentheses; email ignores outer whitespace/case. All entries count toward capacity.
- Pending trainees must all be approved by the assigned trainer before final closure. Existing unresolved completion gates still apply.
- Records persist in the same browser localStorage; OTP challenges do not persist. Copies of a link do not transfer records to another browser/device. No SMS/email is delivered and browser access checks provide no production security.
- See docs/Trainee-Registration-Update.html and TR-001–TR-009 in the catalogue, validation matrix and traceability CSV.
- Run `node tests/registration.test.cjs` plus the existing checks. Browser layout/responsive verification remains unverified, as recorded in docs/Verification.md.


## Training / Learning Resources update — v3.2

This section supersedes baseline resource instructions; all v3.1 Trainee Registration features remain included.

1. Choose Schoolnet Admin → Learning resources → Permissions & approved formats. Select a trainer user and grant upload permission; review/extend the multimedia extension list. Exact approval authority and allowed formats need business sign-off.
2. Upload & link resource → enter resource name → project → dependent Training Plan Code/name → select file. Admin may publish directly as common and explicitly include existing batches. A permitted trainer may request common publication; existing-batch propagation needs Admin review. Upload retains actual bytes in IndexedDB and saves metadata plus plan link in localStorage.
3. For a trainer request, Admin publishes using Publish as common. Trainer request → Admin publication is a clearly labelled temporary approval workflow.
4. Admin uses Link to another plan to reuse a common file across projects/plans, or a project-only file within its project. Duplicate plan/resource links are blocked.
5. Batch availability lists plan codes, access policy and matching batches. Include existing batches applies only to that resource link. Defaults off. Otherwise future batches created after the link inherit it. Legacy links retain baseline review propagation; new links ignore the global review switch.
6. Materials have no day restriction once their link applies, until project end. Existing form/assessment day gates remain. Trainer may inspect their own upload before batch propagation.
7. PPT/PPTX and PDF supported; MP4/WEBM are initial demo video formats. Other formats need an explicit Admin review grant through the multimedia extension list. Validation is extension-based; no content/MIME/antivirus inspection or business size cap is invented.

See docs/Training-Resources-Update.html, LR-001–LR-007, updated catalogue/validation/traceability, and tests/resources.test.cjs. Bytes and metadata use separate browser stores; failed byte writes save no metadata; failed metadata writes roll back metadata and attempt byte cleanup. Site-data clearing/quota can lose records. Server authorization/approval/file validation/transactional storage remain backend work. Browser visual and actual IndexedDB checks remain unverified.


## Training Plan update — Complete POC v3.3

All prior registration and learning resource updates remain included.

1. Schoolnet Admin → Training plans → Add Training Plan. Select project, enter name, choose Induction / Refresher 1 / Refresher 2 / Other, enter description and positive whole-number training days. Save generates a globally checked UUID-derived TP code. Description optional pending mandatory-field confirmation.
2. View day schedule shows each day, optional activity note and assigned resources/forms. Assign resources/forms supports one or more day checkboxes from 1 through plan duration. Change assigned days edits existing links for unused plans; plan-wide materials also have that action. Out-of-range/empty/fractional days and invalid reductions are blocked. Day activities edits optional training notes.
3. Used plans protect project/type/duration, existing day notes and assignments. Modify Plan permits audited name/description changes with reason. Create revised plan copies the plan/links to an independent code and retains every original batch association. Modify the revision for future batches. This is a provisional history-control workflow awaiting business approval.
4. Existing batches can receive new resources under the v3.2 explicit per-link decision. Adding a day activity to existing batches requires a reason and is audited. A started or registered batch cannot switch plan. Exact completed-batch propagation/version activation policy remains open.
5. Create 4-day example saves a separate SAMPLE Digital Teaching – Induction plan: Day 1 pre-assessment + training; Day 2/3 training + learning resources; Day 4 post-assessment + feedback. Sample forms and text resource are linked to days and saved. It does not modify existing records.

See docs/Training-Plan-Update.html, TP-001–TP-008 and the updated catalogue/validation/traceability. Run `node tests/plans.test.cjs` plus existing rule/render/registration/resource/artifact checks. 39 plan assertions passed; these are non-browser tests. Browser visual/responsive and actual IndexedDB checks remain unverified. Production needs server ACLs, atomic unique code enforcement, plan versioning/approval and immutable audit.

### Windows launch

Open Command Prompt or PowerShell in the extracted `training-tracker` folder. Run `py -m http.server 8080`, then visit http://localhost:8080/. Run shell commands in the terminal, not at Python’s `>>>` prompt. To exit that prompt use `exit()`. The asset setup script retains the pinned Bootstrap/jQuery versions.


## Batch Management & Trainee Registration — Complete POC v3.4

All Training Plan and Learning Resource updates remain included.

- Batch management emphasizes Upload batches from Excel: download XLSX template → populate → upload → preview row validation/actual UDISE location → explicit Save validated import. Preview does not save. All rows validate again at commit, including current scope and holidays. Binary XLS is unsupported; columns, file sizes and partial-save policy remain clarification items.
- Edit/create uses Project, Training Plan Code/name, School/UDISE, separate Reference Location and read-only Actual Location, training dates, Maximum Batch Size, Trainer, and Open Registration Yes/No. Actual location derives from sample UDISE registry even if posted value is altered. Unknown trainer/UDISE, invalid project-plan dates, holiday conflict and capacity reduction below registrations block save.
- Schoolnet Admin → Batch permissions grants/revokes scoped ERNET/State/School Admin batch management. Their project/state/school scope applies to create/import/edit/delete and trainee management. Trainer remains assigned-batch trainee manager/approver. These demo grants need production business sign-off and server ACLs.
- Manage trainees shortcut opens the specific batch. Enabled open registration exposes its link; sharing a disabled link is blocked with explanation. A copied link requires the same browser records; it does not transfer data to other devices.
- Bulk trainee Excel remains possible while self-registration is enabled or disabled. Self-registration requires applicable batch, capacity, duplicate checks, provisional window and contact-bound demo OTP request/verification. Unique ID lookup remains independent. Assigned trainer approves every entry before final closure; unresolved completion criteria still block closure.
- Deleting empty, open batches requires authorized scope and confirmation; closed/linked records are protected pending retention/deletion policy. Started or registered plan reassignment remains blocked. All mutations are locally audited; browser auditing is mutable.

See docs/Batch-Trainee-Update.html, BM-001–BM-010 and TR-001–TR-009, catalogue/traceability/validation updates. Run `node tests/batches.test.cjs` and the existing registration/plan/resource/rule/render/artifact checks. 40 new batch checks passed; tests use Excel-input and DOM fixtures, not real browser upload acceptance. Browser visual/responsive, live UDISE/OTP/backend security remain unverified or unsupported.

## v4.1 Trainee Registration update — 3 October 2026

The complete multi-page POC retains all existing modules. Trainee registration now clearly presents Excel upload and batch-specific open registration, enabled/disabled state, capacity, trainee approval status and the registration-page action. Copied links use `registration.html?batch=<internal ID>` instead of legacy hash routing. Query-string batches are consumed by Registration, Trainees and Completion pages.

See `docs/Trainee-Registration-v4.1.html` for the eight rules, Unique ID lookup, demo walkthrough and policy assumptions. Serve this folder with `python -m http.server 8080`; open `http://localhost:8080/`. Open registration uses a provisional Day 1 window; OTP is simulated (request first, then enter 123456). Links require the same browser's stored POC data.

## v4.2 Training / Learning Resources update — 3 October 2026

Resources follow Project → Training Plan → Batches. The repository shows the actual project of each linked plan, its code, availability policy and count of matching batches. Batch availability can now be inspected by users who can see the resource, with plan and batch results restricted to their scope; only the administrator can include existing batches. Common resources can be reused across projects/plans, permitted trainers can upload and optionally request common publication, and administrator-approved multimedia extensions are supported.

See `docs/Training-Resources-v4.2.html` for the five business rules and review walkthrough. Existing-batch propagation and common publication remain explicit review choices. This complete package retains all modules and the v4.1 registration updates.

## v4.3 Central Master Data — 4 October 2026

Master data now covers Trainer Pool, Trainer Availability, Holiday Calendar, Training Resources and Assessment/Feedback Forms. Each has its own XLSX bulk upload with preview and revalidated all-or-nothing save. Six generated templates are included under `templates/` (assignment history has a separate template). Bulk resources require the workbook plus actual files matching File Name. Imports add records; use manual controls for trainer/availability/holiday changes.

Forms link to a valid Project/Training Plan and day numbers at creation/import. They become accessible on the linked training day through project end. Holiday/availability changes feed batch scheduling validation. Imported assignment history does not create batches. See `docs/Master-Data-v4.3.html` for details and the walkthrough.

## v4.5 Schoolnet footer — 4 October 2026

All 18 application pages, including Login, now display “Powered by Schoolnet India Limited” and the supplied Schoolnet logo. The original logo is included locally as assets/schoolnet-logo.webp and retains its transparency/aspect ratio. A navy footer provides contrast for the white logo artwork.

## v4.6 Certification — 5 October 2026

Certification now supports project-specific configurable templates (program, signatory, organization/project logos, custom colour, landscape/portrait), trainee certificate records containing all requested data, manual template editing, bulk template/logo import, bulk record import, scoped preview/download and ZIP download. Existing completion criteria remain enforced. Saved records preserve a template snapshot. All output is labelled SAMPLE or LOCAL POC.

Two additional templates are included: `templates/master-certificateTemplates-template.xlsx` and `templates/master-certificateRecords-template.xlsx`. Three standalone HTML samples with embedded logos are in `samples/certificates/`. Open a sample and use browser Print / Save as PDF if desired. See `docs/Certification-v4.6.html` for fields and the walkthrough.

## v4.7 Attendance Management — 5 October 2026

Attendance now follows Project → Batch → Training day/date → Trainees with Present/Absent marking. Assigned trainers primarily record it; authorized scoped managers can also correct. Today and earlier training dates are allowed, future dates are rejected, trainee/batch/date linkage is enforced and changed values are audited.

Bulk upload is now confirmed. Use `templates/attendance-template.xlsx` or download a batch-specific template from Attendance. Excel preview shows current → uploaded status; all rows revalidate before atomic add/correction save. Missing rows remain unchanged. See `docs/Attendance-v4.7.html`.

## v4.10 Content Library samples
Five bundled SAMPLE files appear automatically in ALL and their matching tabs: MP4 (5 seconds), PPTX, DOCX, PNG and JPG. Downloads retain real file bytes; video/image previews use bundled bytes and work offline. Existing browser data is preserved; reset restores the samples. Sample metadata persists with the existing database; sample bytes ship in the package. The files are also in samples/content-library/. Launch with the existing localhost instructions. The v4.10 design and Learning Resources workflow are retained.

## Teacher registration update (v4.10)
Login links to public registration. Select an open batch or use its batch-specific URL. Fields follow Sample Registration Form.docx: mandatory State, District, Block, searchable School, UDISE, Teacher Name, 10-digit Mobile, Gender, Designation, Classes, Subjects and Experience. Email is optional. Classes/subjects use semicolon-separated values in Excel. The same rules validate preview and commit; mobile duplicates remain blocked within the batch. The sample school directory is not a live UDISE source. Unknown UDISE entries are rejected pending a directory/manual-entry policy. Existing trainees remain unchanged and may lack the new profile fields. OTP is still simulated; registration dates/capacity/approval rules are retained. Bulk uploads do not require trainee OTP.

## Batch Code and mobile login update
Login → Teacher / Trainee Registration → enter supplied Batch Code → view Project, Training Plan, School/Location, Trainer and dates → complete the 13-field profile and simulated OTP → receive Mobile Number Login ID with default Demo@123. Account and trainee save atomically in this browser. Registered accounts see their own assigned batch; trainer approval remains pending. Login accounts are created by successful self-registration, not Excel imports. A mobile already used as a login is blocked from another self-registration; multiple-batch account linking requires business clarification. Registration window and capacity rules remain unchanged. Use the same browser and localhost port for login. Default password is a prototype assumption matching the existing demo accounts; no production credentials or real OTP service are provided.

## Content Library design update
Six bundled sample formats: MP4, PPTX, PDF, DOCX, PNG and JPG. Tabs: ALL, Videos, Presentations, PDF, Documents and Images. PNG/JPG share Images. Added PDF validation, bulk upload and downloads. Cards use image thumbnails, a video poster, and format covers for office/PDF files; all video/image previews retain the existing modal. Other uploaded files display a format cover until Preview is opened. The summary counts and displayed result count reflect the permitted library and active filters. Existing data, branding, registration/mobile login and Learning Resources remain intact. Browser layout checks remain unverified.

## PDF Viewer
PDF cards now include Preview. The dialog embeds the browser PDF viewer with Download PDF and Open in new tab options. Works with bundled sample PDFs and PDF bytes uploaded to IndexedDB. Page navigation, zoom and printing depend on browser support. Temporary object URLs are released when the dialog closes.

## ERNET Admin dashboard
Login A2 / Demo@123. Sponsor filters, ten KPI cards, lifecycle visualization, target achievement, teacher/student grouped bars, batch status buttons and geographic drill-downs. Counts derive from assigned-project data, with missing targets/criteria labelled. See docs/ERNET-Dashboard-Update.md for metric definitions and example conflicts.

## ERNET visual dashboard update
Reference-inspired compact sponsor dashboard with ten KPI cards, target/trained columns and achievement donut, six-stage lifecycle bars, attendance line chart, grouped teacher/student bars, batch table, training effectiveness and location/attention panels. Login A2 / Demo@123. Live measures and missing-data states retained. Attendance chart uses actual recorded dates; pre/post averages use named linked assessments and recorded scores. Alerts show overdue closure, approval pending and missing trainer counts; no unspecified thresholds or trend deltas are invented. Browser visual comparison remains unverified.

## Batch Status visual update
ERNET dashboard removes Training Effectiveness and the Batch Status table. Wider Batch Status section uses Upcoming/Ongoing/Completed count cards and a distribution bar. Clicking a status opens matching batches as cards. Delayed is excluded from this section; its records are not reclassified and the existing Needs Attention panel remains unchanged. The displayed status total and percentages use only the three shown statuses. Login A2 / Demo@123.

## Reset Password
Login → Reset Password → registered Mobile Number → Request OTP → enter displayed simulated 123456 → secure new password + confirmation → Set New Password → Login using new password. OTP expires after five minutes (POC assumption), resend invalidates the prior challenge, successful reset consumes it. Registered mobile accounts and accounts with a matching linked trainee mobile are eligible; accounts without registered mobile data cannot reset. Passwords persist as local demonstration data in a separate browser store; production requires server-side authentication, hashing, OTP delivery/verification, expiry and rate limiting. Browser-only checks are not security. Guessable-information checks cover recorded name tokens, username, mobile, email and recorded DOB; unknown DOB cannot be checked. Sample reset clears training records but does not remove separate password overrides; use the existing registered account data for login.
