# POC v4.10 — Dashboards for every login

All six roles now open a graphical dashboard using the ERNET navy, blue and orange design, KPI cards, chart panels, top filters and prominent graphical Batch Status. Batch Status offers Upcoming, Ongoing and Completed with card-based drill-down. Training Effectiveness and the Batch Status table remain removed.

| Login | Dashboard KPI focus |
|---|---|
| A1 — Schoolnet Admin | Projects, schools, targets, registrations, trained participants, attendance, active/completed/upcoming batches, assigned trainers |
| A2 — ERNET Admin | Training progress, targets, registrations, trained participants, attendance, batch status, teachers/students trained |
| A3 — State Admin | Sponsor KPIs restricted to assigned state and projects |
| A4 — School Admin | Schools and batches in scope, targets, registrations, teachers/students trained, attendance, batch status, approval pending |
| A5 — Trainer | Assigned batches/trainees, approvals pending, attendance, trainees attended/completed, batch status, linked resources |
| A6 — Trainee | Own batches, training days, present days, attendance, approval, completion eligibility, accessible resources, assigned/submitted forms, certificate previews |

Demo passwords remain Demo@123 unless changed through Reset Password. Registered users continue to log in using their mobile number. Open login.html after extracting the complete ZIP; keep assets and HTML files together.

## Data and permissions

Existing login permissions remain in force. Filters narrow permitted scope. The learner dashboard calculates metrics only from the signed-in learner’s records, without peer counts. Admin and trainer dashboards use scoped batch records. Targets use capacity when no explicit target is set. Completion requires configured review criteria and displays Pending when unavailable. Attendance rate is present marks divided by recorded marks; unmarked days are not assumed absent. Training Day Progress compares planned days with present marks; date filters limit marks. Certificate previews are demo records.

Prior registration, reset password, Content Library samples, PDF preview and ERNET dashboard updates are retained.

## Validation

Passed JavaScript syntax check and non-browser fixtures for all six role dashboards, scope checks, batch card drill-down, ERNET filters and missing criteria, password reset/new login, mobile registration, PDF preview and graphical batch status. Browser visual verification was unavailable in this environment.
