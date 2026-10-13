---
name: schoolnet-frontend
description: Build or update frontend interfaces that should follow the Schoolnet India visual style shown in the supplied homepage reference.
metadata:
  short-description: Follow Schoolnet India’s frontend style
---

# Schoolnet frontend style

Use this skill when implementing or revising frontend pages that should follow the Schoolnet India website reference. Keep the existing application's framework, assets, and component conventions, and apply the visual guidance to the requested page rather than rebuilding unrelated areas.

## Brand and visual language

- Keep the experience bright, education-focused, and spacious. The reference uses an almost-white (`#f8f9fa`) canvas, dark charcoal text, and broad content margins.
- Treat Schoolnet green (approximately `#08a653`) as the primary brand and action color. Use it for emphasized words and filled, softly rounded buttons. Use clear medium blue (approximately `#087bd1`) for announcement strips, statistic figures, and restrained utility accents.
- Use a strong geometric sans-serif for headings and interface text; Poppins is a close match if the project has no established font. Hero headings are very bold, large, and tightly spaced. Body copy is regular weight with comfortable line height.
- The logo is a distinctive black serif wordmark with a small warm-colored mark and a widely tracked uppercase tagline. Use the supplied logo asset when available; do not recreate it with ordinary text if the real asset exists.
- Keep corners gently rounded and effects restrained. Make classroom/product photography a prominent part of the composition. Use mint or cream section backgrounds and yellow accents only where relevant to the content.

### Useful starting tokens

These are visual estimates from a screenshot, not official brand specifications. Prefer repository brand tokens or supplied assets when available.

```css
:root {
  --schoolnet-green: #08a653;
  --schoolnet-blue: #087bd1;
  --schoolnet-ink: #202124;
  --schoolnet-muted: #69727c;
  --schoolnet-canvas: #f8f9fa;
}
```

## Page composition

- The desktop header is a generous white/off-white horizontal band: logo on the left, muted gray navigation across the right, and a prominent green partner action. Keep navigation evenly spaced and vertically centered. On smaller screens, collapse or wrap navigation cleanly rather than shrinking it to unreadable text.
- A full-width blue announcement ticker can sit directly below the header. Use white, legible text and keep the strip short.
- The hero is a two-column composition: large multi-line heading and supporting copy on the left; a large rounded classroom or product image on the right. Highlight one phrase in green, include a green primary action, then show impact stats in a horizontal row with blue numerals and smaller muted labels.
- Keep the main content width centered with generous gutters. Subsequent areas can use titled feature sections, partner logos, maps, editorial cards, testimonials, social posts, and awards as evidence. Separate these with whitespace or very light tinted backgrounds; avoid turning every section into a dense grid.
- Product features pair concise copy and a green action with a screenshot or photo. On desktop, alternate text and media alignment where it improves rhythm; on mobile, stack them without squeezing text.
- Finish with a practical footer containing the logo, grouped navigation, social links, and contact/support details when available.

## Implementation guidance

- First inspect the existing app and reuse its layout, components, assets, and styling approach. Do not replace the stack or introduce a design system solely to apply this visual direction.
- Prefer real supplied product imagery and logos over approximations. Preserve their aspect ratios and use meaningful alt text; use decorative treatment only for decorative images.
- Keep navigation, actions, and cards usable by keyboard and touch. Use semantic landmarks and headings, visible focus states, sufficient contrast, and responsive layouts.
- Use fluid spacing and responsive grids rather than fixed screenshot-sized dimensions. Check that buttons remain easy to tap, text stays readable, and imagery does not overflow at narrow widths.
- Treat the color values and font suggestions as approximations from screenshots. If the repository contains official brand assets, tokens, or an established site stylesheet, use those as the source of truth.
