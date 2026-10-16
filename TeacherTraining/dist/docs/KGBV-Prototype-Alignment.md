# KGBV Training Tracker prototype alignment

The local tracker now includes the KGBV programme in the project selector as **Digital Classrooms in 750 KGBVs** (`ERN-KGBV-26`). It is seeded alongside the existing sample projects. On first load, the scenario is added to browser storage without replacing existing tracker records. **Rules & decisions → Reset sample data** recreates the base demo and KGBV scenario.

## Programme data represented

- 750 synthetic KGBV records across 13 states, with the state totals, district names, language, UDISE-like identifiers, installation dates, and targets (10 teachers and 100 students per school) taken from the supplied prototype. Identifiers and participant contacts are fabricated demo values.
- State trainer pools, trainer availability, local holidays, learning-resource/form catalogue, training-plan links, and sample teacher/student records are included.
- Project dates: 1 September 2026 to 31 August 2029. PO date, installation deadline (1 January 2027), and initial training deadline (1 March 2027) are marked as prototype assumptions in the project description.

## Delivery process

| Audience / phase | Duration | Prototype window | Process represented |
| --- | ---: | --- | --- |
| Teachers — Phase 1: Orientation | 1 day, 2 hours | 1 Nov–31 Dec 2026 | Digital classroom operations; pre-assessment |
| Teachers — Phase 2: Device and content use | 2 days, 8 hours (4 + 4) | 15 Nov 2026–15 Feb 2027 | Device, multimedia content and lesson planning; assessment and feedback |
| Teachers — Phase 3: Digital skills | 1 day, 5 hours | 1 Dec 2026–28 Feb 2027 | Joint teacher/student session; post-assessment and feedback |
| Teachers — Refresher I | 1 day, 5 hours | 1 Nov 2027–31 Jan 2028 | Implementation queries and troubleshooting |
| Teachers — Refresher II | 1 day, 5 hours | 1 May–31 Jul 2028 | Sustaining adoption and operational support |
| Students — Digital skills | 3 days, 15 hours (5/day) | 1 Dec 2026–28 Feb 2027 | Cyber safety/pre-assessment, digital creativity, AI awareness/post-assessment and feedback |

Teacher batches are grouped in clusters of up to three KGBVs from the same district and state; their capacity is 10 participants per included school. Student batches are one school each, capacity 100. The seeded schedules observe each phase window, recorded trainer availability, prototype holidays, and the installation readiness lead time (2 days for initial teacher phases and 5 days for students). Teacher self-registration is enabled only for Phases 1–3. Participant approval, attendance, assessment/feedback evidence, and completion continue to use the tracker’s existing workflows.

## Using the KGBV records

Select the KGBV project to scope the project pages and reports. Training plans show phase, audience, duration in days and hours, hours per day, and the delivery window. Batch management displays all schools and UDISE codes in a cluster. The XLSX batch template includes optional **Additional UDISE Codes**; enter extra codes separated by commas or semicolons. Manual batch entry accepts those codes in the corresponding additional-schools field.

Schedules are seeded demonstration records, not live bookings. Calendar placement is generated within each phase window from synthetic installation dates. The app does not reproduce the prototype’s historical “as of” snapshots; reports show the current browser-side sample records. Assessment resources are placeholders and must be configured before live use.
