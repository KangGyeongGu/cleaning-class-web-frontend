---
globs:
  - "src/**/*.tsx"
  - "next.config.*"
---

# Image Policy Rules

- Always use `next/image` (`<Image>`) — never bare `<img>` tags.
- Reserve image space to prevent CLS: use `aspect-ratio` CSS or explicit container height.
- `fill` mode requires a positioned parent (`position: relative` with explicit dimensions).
- Always include `sizes` attribute on responsive images to avoid oversized downloads.
- Use `priority` (preload) only on the above-the-fold LCP image — not on other images.
- `next.config` `remotePatterns`: scope as narrowly as possible — always include `pathname`; never use bare wildcard `hostname` without path constraints.
- Do not use deprecated `images.domains`; use `remotePatterns` only.
- Define `images.qualities` as an explicit allowlist (e.g. `[75, 85, 100]`).
- Prefer inline SVGs or icon libraries over image files for icons.
- Minimize infinite CSS animations on images to avoid paint thrashing.
