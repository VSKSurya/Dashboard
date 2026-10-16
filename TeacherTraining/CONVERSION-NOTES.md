# Training Tracker — Multi-page HTML5 conversion

Converted from the v3.4 single-page hash-routed stakeholder POC into separate HTML entry pages while preserving the existing Bootstrap/jQuery-compatible behavior, browser persistence, role/persona scoping, business-rule engine, Excel import/export, local resource storage, validations, reports and audit trail.

## Pages

- `index.html` / `dashboard.html` — Dashboard
- `projects.html` — Projects
- `training-plans.html` — Training Plans
- `batches.html` — Batches and XLSX import
- `trainees.html` — Trainees and approval
- `registration.html` — Open registration
- `resources.html` — Learning resources
- `attendance.html` — Attendance
- `assessments.html` — Assessments and feedback
- `completion.html` — Completion review
- `certificates.html` — Certificates
- `masters.html` — Master data
- `reports.html` — MIS reports
- `users.html` — Users and roles
- `audit.html` — Audit trail
- `rules-decisions.html` — Rules and decisions

## Run

From this folder:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/`.

Bootstrap 5.3.8 and jQuery 4.0.0 remain pinned exactly as in the supplied POC. `setup-assets.py` can vendor them locally on an internet-connected machine.

## v4.1 Trainee Registration update — 3 October 2026

The complete multi-page POC retains all existing modules. Trainee registration now clearly presents Excel upload and batch-specific open registration, enabled/disabled state, capacity, trainee approval status and the registration-page action. Copied links use `registration.html?batch=<internal ID>` instead of legacy hash routing. Query-string batches are consumed by Registration, Trainees and Completion pages.

See `docs/Trainee-Registration-v4.1.html` for the eight rules, Unique ID lookup, demo walkthrough and policy assumptions. Serve this folder with `python -m http.server 8080`; open `http://localhost:8080/`. Open registration uses a provisional Day 1 window; OTP is simulated (request first, then enter 123456). Links require the same browser's stored POC data.

## v4.2 Training / Learning Resources update — 3 October 2026

Resources follow Project → Training Plan → Batches. The repository shows the actual project of each linked plan, its code, availability policy and count of matching batches. Batch availability can now be inspected by users who can see the resource, with plan and batch results restricted to their scope; only the administrator can include existing batches. Common resources can be reused across projects/plans, permitted trainers can upload and optionally request common publication, and administrator-approved multimedia extensions are supported.

See `docs/Training-Resources-v4.2.html` for the five business rules and review walkthrough. Existing-batch propagation and common publication remain explicit review choices. This complete package retains all modules and the v4.1 registration updates.

## v4.3 Central Master Data — 4 October 2026

Master data now covers Trainer Pool, Trainer Availability, Holiday Calendar, Training Resources and Assessment/Feedback Forms. Each has its own XLSX bulk upload with preview and revalidated all-or-nothing save. Six generated templates are included under `templates/` (assignment history has a separate template). Bulk resources require the workbook plus actual files matching File Name. Imports add records; use manual controls for trainer/availability/holiday changes.

Forms link to a valid Project/Training Plan and day numbers at creation/import. They become accessible on the linked training day through project end. Holiday/availability changes feed batch scheduling validation. Imported assignment history does not create batches. See `docs/Master-Data-v4.3.html` for details and the walkthrough.

## v4.4 Login update — 4 October 2026

Added login.html and assets/auth.js. All 17 workspace entry pages load the session guard before app.js; public registration remains accessible. Existing index dashboard is retained behind login or explicit demo review. Credential login initializes the existing persona ID and preserves it across page navigation, fixes the persona selector, shows identity and Logout, filters navigation and denies restricted pages. Demo review remains switchable. Login is client-side simulation only.

## v4.5 Schoolnet footer — 4 October 2026

All 18 application pages, including Login, now display “Powered by Schoolnet India Limited” and the supplied Schoolnet logo. The original logo is included locally as assets/schoolnet-logo.webp and retains its transparency/aspect ratio. A navy footer provides contrast for the white logo artwork.

## v4.6 Certification — 5 October 2026

Certification now supports project-specific configurable templates (program, signatory, organization/project logos, custom colour, landscape/portrait), trainee certificate records containing all requested data, manual template editing, bulk template/logo import, bulk record import, scoped preview/download and ZIP download. Existing completion criteria remain enforced. Saved records preserve a template snapshot. All output is labelled SAMPLE or LOCAL POC.

Two additional templates are included: `templates/master-certificateTemplates-template.xlsx` and `templates/master-certificateRecords-template.xlsx`. Three standalone HTML samples with embedded logos are in `samples/certificates/`. Open a sample and use browser Print / Save as PDF if desired. See `docs/Certification-v4.6.html` for fields and the walkthrough.

## v4.7 Attendance Management — 5 October 2026

Attendance now follows Project → Batch → Training day/date → Trainees with Present/Absent marking. Assigned trainers primarily record it; authorized scoped managers can also correct. Today and earlier training dates are allowed, future dates are rejected, trainee/batch/date linkage is enforced and changed values are audited.

Bulk upload is now confirmed. Use `templates/attendance-template.xlsx` or download a batch-specific template from Attendance. Excel preview shows current → uploaded status; all rows revalidate before atomic add/correction save. Missing rows remain unchanged. See `docs/Attendance-v4.7.html`.
