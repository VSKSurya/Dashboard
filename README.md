# EduTrain Training Progress Dashboard

A lightweight, responsive prototype for reviewing teacher training progress, attendance, participation, and batch health. The dashboard follows the supplied EduTrain wireframe and uses a Schoolnet-inspired education interface style.

**Live site:** [vsksurya.github.io/Dashboard](https://vsksurya.github.io/Dashboard/)

## Pages

| Page | Description |
| --- | --- |
| [Sign in](experiments/login.html) | Demo sign-in page with prefilled sample credentials. A successful sign-in opens the dashboard. |
| [Training dashboard](experiments/dashboard.html) | Sponsor overview with summary metrics, training and attendance charts, batch status, location performance, and attention alerts. |
| [Schoolnet homepage](experiments/index.html) | Education-focused homepage prototype. |
| [Social feed](experiments/instagram.html) | Standalone social feed interface experiment. |
| [Greeting page](experiments/hello.html) | Small branded greeting page. |
| [Workspace overview](docs/workspace-overview.html) | Notes on the repository and its prototypes. |
| [Workshop attendance PRD](docs/workshop-attendance-prd.html) | Product requirements for a workshop attendance experience. |
| [Teacher training dashboard PRD](docs/teacher-training-dashboard-prd.html) | Requirements for the sponsor dashboard, metrics, workflows, and launch decisions. |
| [Teacher training dashboard test cases](docs/teacher-training-dashboard-test-cases.html) | Manual acceptance cases for access, filters, metrics, exports, accessibility, and data states. |
| [Code review report](docs/code-review-report.md) | Static review findings, priorities, recommendations, and scope limitations. |

The site root opens the sign-in page. You can also go directly to the [dashboard](https://vsksurya.github.io/Dashboard/experiments/dashboard.html).

## Dashboard features

- Responsive layout with dashboard navigation and project, location, training, batch, date, and participant selectors.
- Training progress, attendance, participation, batch, and effectiveness summaries.
- Target-versus-trained, training progress, attendance trend, and teacher-versus-student charts.
- Batch status and location performance tables, plus a needs-attention list.
- CSV export for the batch and location tables.

The figures are sample data. The selectors are visual prototype controls and do not filter a live data source.

The dashboard logo is stored in `assets/Schoolnet_logo.webp` and is included in the Pages deployment.

## Run locally

The pages are standalone HTML and CSS with small amounts of browser JavaScript. No package installation or build step is required. Open `index.html` in a browser, or open a page directly, for example `experiments/dashboard.html`.

## Deploy

GitHub Pages publishes the site using [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Pushes to `main` trigger deployment; the workflow can also be started manually from the repository’s Actions tab. The workflow publishes the root landing page and the HTML files under `experiments/` and `docs/`.

## Skills and Skills Marketplace

This project used the **Schoolnet frontend** skill for the education-focused visual direction. Its guidance is checked into the repository at [`skills/schoolnet-frontend/SKILL.md`](skills/schoolnet-frontend/SKILL.md).

Codex skills are reusable instruction sets that guide development work; they do not add runtime dependencies to these pages. The repository includes the Schoolnet frontend skill, not a Skills Marketplace application or marketplace integration. Other skills can be discovered and installed separately through the skills marketplace available in your Codex environment.

## AI agent and subagent contributions

- **Primary agent:** Codex handled repository inspection, dashboard and login updates, the PRD and test-case documents, and the static code-review report.
- **Subagents:** No delegated subagent work is recorded for this repository update. The code-review report was prepared by the primary agent, not a separate subagent.
- **Skill contribution:** The Schoolnet frontend skill supplied visual guidance. A skill is an instruction set, not an AI subagent.
- **Review limits:** The code-review report covers the committed prototype source. No automated tests or production-data checks were run, and the dashboard still uses sample data and demo-only authentication.

## Demo authentication

The sign-in flow is for visual demonstration only. It checks credentials in browser-side JavaScript and does not provide real authentication, account security, or access control. Do not use it to protect private data.
