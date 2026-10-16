---
name: training-tracker-style
description: Build or update training-management pages to match the supplied Training Tracker HTML, Bootstrap, and jQuery stylesheet. Use when a task references the Training Tracker template or its navy, ivory, and blue-gray dashboard style; use the Schoolnet frontend skill for the separate Schoolnet homepage direction.
metadata:
  short-description: Apply the Training Tracker dashboard style
---

# Training Tracker interface style

Use this skill when a requested page should follow the Training Tracker stylesheet supplied with `Training-Tracker-HTML5-Bootstrap-jQuery-v4.4`. Treat the supplied CSS and the existing page as the design reference. Adapt only the requested surface and preserve its existing HTML, Bootstrap, jQuery, and asset conventions.

## Visual profile

The stylesheet uses a calm, compact dashboard palette. These values are taken from its CSS variables and are starting points for matching pages, not formal brand specifications:

```css
:root {
  --navy: #17365d;
  --blue: #275d8c;
  --orange: #f58220;
  --ink: #243244;
  --muted: #66758a;
  --line: #dbe4ee;
  --surface: #f5f8fb;
  --ivory: #fbfaf6;
  --green: #216656;
}
```

- Use a light blue-gray page surface, dark ink, and system sans-serif text. The reference body uses about `14px` text with `1.55` line height.
- Use navy for headings, active navigation, and primary buttons. Use blue for links and utility accents, orange for emphasis or keyboard focus, and green for positive status.
- Keep the sidebar warm ivory, the top header white, and data panels white with fine blue-gray borders. Panels use gently rounded corners, usually around `12px`, with generous but controlled padding.
- Give KPIs a clear label, prominent navy value, and secondary context. Reserve accent borders and colors for status or hierarchy rather than decorating every card.

## Page structure and components

- On desktop, use a fixed left navigation rail about `238px` wide and offset the workspace by the same amount. Keep navigation labels readable and the active item clearly filled in navy.
- Put page context and actions in a white horizontal header. Below it, use a page heading and compact toolbar, then filters, KPI cards, charts, and tables in a clear hierarchy.
- Use responsive CSS Grid for KPI cards and dashboard panels. The reference changes four KPI columns to two around `1100px`, then collapses split layouts around tablet widths.
- Use bordered white `.panel` surfaces, `.kpi` cards, `.table-wrap` for horizontal table overflow, and `.empty` states where the existing stylesheet provides those classes. Reuse existing classes instead of making near-duplicates.
- Keep state labels explicit in text. Use the palette to reinforce states, not as the only way to distinguish success, warning, or error.

## Responsive and accessible behavior

- Follow the source's responsive breakpoints as guidance: around `1100px` for denser grids, `760px` for collapsing the sidebar and header, and `650px` for narrow content forms. Adjust to the page's real content rather than applying breakpoints mechanically.
- At narrow widths, hide or turn the sidebar into a usable slide-out navigation, remove the desktop workspace offset, stack page actions, and reduce panel padding. Keep tables readable with a scroll container rather than compressing every column.
- Preserve a visible keyboard focus indicator. The stylesheet uses a `3px` orange outline with offset; maintain equivalent visibility against each component's background.
- Keep a keyboard-accessible skip link, semantic landmarks and headings, labeled form controls, and meaningful alternative text for non-decorative images.
- Respect reduced motion and retain readable contrast when applying status colors.

## Implementation guidance

- Inspect the target page and its linked CSS first. The provided `style.css` contains global selectors as well as several page-specific sections, so scope new selectors to a page or component and avoid adding broad rules that could change unrelated screens.
- Keep Bootstrap and jQuery if they are already part of the requested page. Do not migrate the template to another framework, replace its layout, or introduce a new dependency just to reproduce its style.
- Reuse existing CSS variables, components, and assets. If a page has no linked copy of the reference stylesheet, implement only the required style tokens and components instead of pasting the full template stylesheet into it.
- The supplied stylesheet contains later component sections as well as its initial Training Tracker rules. Prefer the actual selectors present in the target page over assumptions based on the filename's version suffix.
