# Code Review Report

**Project:** EduTrain Training Progress Dashboard  
**Review date:** 13 October 2026  
**Reviewed snapshot:** `a08a3c9` (`main`)  
**Scope:** Static review of the published dashboard, login page, and Pages deployment workflow.

## Executive summary

The repository contains a useful visual dashboard prototype, but the login is not authentication and the dashboard controls do not operate on live data. These constraints are documented in the README and are appropriate for a demonstration. They must be addressed before the site is used to protect accounts or make operational decisions. This review also found two navigation issues and an export control whose behavior does not match its label.

The review was read-only. The supplied merge-base review reported no tracked code changes in its diff; the findings below describe the current committed source and are not attributed to a new patch. The untracked Codex session file was excluded. No tests or runtime checks were run.

## Findings

### CR-01: Demo credentials are embedded in public client code

**Priority:** High before production use  
**Locations:** `experiments/login.html:156`, `experiments/login.html:198`

The password is prefilled in the page, and the submit handler compares both values in browser JavaScript. Anyone can inspect the published HTML and JavaScript and bypass this screen. This is acceptable only as clearly labeled demo access. It must not be used to protect real accounts, private data, or privileged actions.

**Recommendation:** Replace the client-side check with a server-backed identity provider and enforce authorization on protected data and operations. Remove the embedded password and avoid pre-filling a credential in the public page.

### CR-02: Dashboard filters do not filter the displayed data

**Priority:** Medium for the current prototype; release blocker for operational reporting  
**Location:** `experiments/dashboard.html:119-122`

Changing a selector only counts the selected controls and shows a toast. KPI values, charts, tables, and alerts remain fixed sample values. The user can therefore select a narrower scope while still seeing the original totals.

**Recommendation:** Keep the static-data limitation visible in the interface, or connect every dashboard component to a shared filter state and approved data source before presenting results as operational.

### CR-03: Some export buttons do not produce an export

**Priority:** Medium  
**Locations:** `experiments/dashboard.html:88-99`, `experiments/dashboard.html:124-129`

The comparison and effectiveness panels expose export controls, but the export handler only serializes table rows. Those chart panels have no table rows, so clicking their controls shows a placeholder message and downloads no file. The batch and location table exports do have rows to serialize.

**Recommendation:** Provide an export suitable for each panel, or remove/disable chart export controls until that behavior exists. Keep the control label and resulting action consistent.

### CR-04: Projects navigation points to a missing section

**Priority:** Low  
**Locations:** `experiments/dashboard.html:41`, `experiments/dashboard.html:114-117`

The Projects link points to `#projects`, but no element has that ID. The click handler changes the active navigation styling, which can make the link appear to work even though the browser cannot navigate to a project section.

**Recommendation:** Add the intended section with `id="projects"`, or point the link to an existing destination and avoid marking an unavailable page as active.

### CR-05: Terms and privacy links have no destination

**Priority:** Low  
**Location:** `experiments/login.html:176`

The Terms of Use and Privacy Policy links reference `#terms` and `#privacy`, but the page contains no matching targets. They currently jump to an unresolved fragment.

**Recommendation:** Link to the approved policy pages, or remove the links until those pages are available.

## Production hardening note

The CSV exporter quotes fields and doubles embedded quotation marks. If sample table values are later replaced by external or user-controlled data, spreadsheet formula prefixes such as `=`, `+`, `-`, and `@` should also be neutralized before export to reduce CSV formula injection risk. This is a conditional future risk; the current page uses fixed sample data.

## Review coverage and limitations

- Inspected `experiments/dashboard.html`, `experiments/login.html`, `index.html`, and `.github/workflows/pages.yml`.
- Checked fragment links against IDs in the dashboard and login pages.
- Confirmed the Pages workflow copies HTML files from `docs/` and `experiments/` into the deployed site.
- No automated tests, browser interaction checks, or production data checks were performed.
- This report covers the committed prototype source at the reviewed snapshot. It does not certify live service behavior or production security.
