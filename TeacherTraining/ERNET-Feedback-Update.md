# ERNET Admin feedback — v4.10

Login A2 / Demo@123. Serve the extracted folder with `py -m http.server 8080` and open http://localhost:8080/login.html.

## Delivered
- Overall programme targets: 7,500 teachers, 75,000 students; All = 82,500. Teachers remains default.
- State teacher target: distinct scoped schools × 10, not delivery batch count. Display the state school count and target together. Student targets by state remain Not configured because no allocation was supplied. School directory/sample data must be replaced with the actual project school list for production targets. Overall targets remain programme figures; they are not fabricated from demo enrolments. Plan/batch/date targets are Pending where no allocation exists.
- Attendance: Present / (Present + Absent recorded marks) × 100; display counts, exclude unmarked days and use participant/date filters.
- Teacher hours: sum delivered hours on Present dates through today. Authorized attendance users can record the batch's delivered daily duration; an attendance-specific `hours` value takes precedence. Missing duration remains pending. Records sharing a mobile number aggregate as one teacher within scope. The batch duration field assumes the same delivered hours per day; use attendance-specific durations when sessions differ. No default training-hour claim is made.
- Each project/school receives a persistent school batch code, stored in `schoolCohorts`. Its period follows the project's start/end. Existing dated delivery batches remain linked through project/school and preserve attendance/history. Schools explicitly assigned by `school.project` or `school.projects`, and schools with existing project batches, are included. A school without delivery sessions shows Planning pending. This distinguishes project-long school cohorts from dated delivery training.
- Batches: state and From/To overlap filters; project-long school cohort view and delivery planning table.
- Teacher Data: hours and read-only records, no ERNET approval actions or approval lifecycle stage. Trainer approvals for other roles remain intact.
- Assessment & Feedback: state/school feedback response totals, teacher comments, assessment scores. Free-text responses are not converted to invented satisfaction scores.
- Dashboard certifications: total certificate record count plus state/school counts, filtered by participant type and issue/completion date. Duplicate record mirrors with the same certificate number count once. These remain local POC records, not verified external issuance.
- ERNET access blocks Open Registration, Certificates, Master Data, Training Plans and operational Completion review. Other roles retain existing menus and workflows.

## Review
1. Login as A2. Switch Teachers/Students/All to see 7,500/75,000/82,500 with filters cleared.
2. Select Karnataka: sample one-school teacher target is 10, regardless of two delivery batches. Student allocation is pending.
3. Review attendance definition/counts, teacher hours and certifications on Dashboard. Fresh sample data has no recorded attendance or certificate issuance; empty/zero evidence is intentional.
4. Login as A5 and open Attendance. Record a delivered daily duration and Present/Absent attendance; return to A2 to inspect hours. Future attendance remains blocked.
5. Open Batches; choose state and dates. Compare project-long School Batch Continuity with dated delivery sessions.
6. Open Teacher Data and Assessment & Feedback. A6 can submit the sample feedback when its day is available; A2 sees the response at each analysis level.
7. Attempt direct access to training-plans.html, certificates.html, masters.html and registration.html as A2: access is restricted. Public registration remains available outside the ERNET session.

## Verification
34 new model/render/access checks pass. Existing attendance, certification, batches, masters, resources, training plans, content library, PDF preview, six-role dashboards, auth, login workspace, mobile registration, password reset, teacher-profile, page and rule checks pass.
Four legacy test files already fail in the original supplied archive: registration.test.cjs, artifacts.test.cjs, ernet-dashboard.test.cjs and render-model.test.cjs. Their failures were reproduced against the unmodified source; they are not represented as passing. New ERNET feedback checks replace the stale target/section expectations for this revision.
Browser visual verification could not run: Playwright browser executable is unavailable. Login/OTP/storage remain a local browser POC; existing backend limitations remain.
