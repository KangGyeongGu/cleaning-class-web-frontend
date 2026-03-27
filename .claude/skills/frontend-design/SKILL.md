---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code that avoids generic AI aesthetics. Use when the user asks to build web components, pages, artifacts, posters, or applications, or when any design skill requires project context.
user-invocable: false
license: Apache 2.0. Based on Anthropic's frontend-design skill. See NOTICE.md for attribution.
---

This skill guides creation of production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with attention to detail and intentional design choices.

## Context Gathering Protocol

Design skills produce generic output without project context. You MUST have confirmed design context before doing any design work.

**Required context** — every design skill needs at minimum:
- **Target audience**: Who uses this product and in what context?
- **Use cases**: What jobs are they trying to get done?
- **Brand personality/tone**: How should the interface feel?

**Gathering order:**
1. **Check current instructions (instant)**: If your loaded instructions already contain a **Design Context** section, proceed immediately.
2. **Check .claude/rules/design-context.md (fast)**: If not in instructions, read `.claude/rules/design-context.md` from the project root. If it exists and contains the required context, proceed.
3. **Run teach-impeccable (REQUIRED)**: If neither source has context, you MUST run /teach-impeccable NOW before doing anything else.

---

## Design Direction

**CRITICAL**: This project follows a **trust-driven minimalist** direction. Read `.claude/rules/design-context.md` for the full design context. Key principles:

- **Purpose**: Local cleaning service landing page targeting Korean homeowners
- **Tone**: Professional, trustworthy, clean — NOT bold, experimental, or flashy
- **Differentiation**: Quality through restraint — generous whitespace, precise typography, content-first photography

Implement working code that is:
- Production-grade and functional
- Clean, professional, and trustworthy
- Cohesive with the existing monochromatic slate aesthetic
- Meticulously refined in spacing, typography, and subtle details

## Project-Specific Rules (override generic guidelines)

These rules take precedence over the generic guidelines below:

- **Font**: Pretendard Variable only. Do NOT suggest font changes or pairing. The font is loaded via CDN inline and must not be modified.
- **Colors**: Monochromatic slate palette (slate-900/600/400 on white). No accent colors, no gradients. The absence of color is intentional.
- **Layout**: Centered symmetric layouts with predictable grids. Asymmetry is NOT desired for this project.
- **Motion**: CSS-only animations (transform + opacity). No JavaScript motion libraries. No bounce/elastic easing. Smooth deceleration only.
- **Theme**: Light mode only. Do NOT suggest dark mode.
- **Cards**: Service cards use grayscale→color hover effect. Maintain this pattern.

---

## Frontend Aesthetics Guidelines

### Typography
> *Consult [typography reference](reference/typography.md) for scales, pairing, and loading strategies.*

Maintain the established Pretendard type scale. Vary font weights (light/medium/bold/black) to create clear visual hierarchy.

**DO**: Use the existing modular type scale with consistent sizing
**DO**: Vary font weights and sizes to create clear visual hierarchy
**DO**: Use tracking-tighter for display text, tracking-widest for uppercase labels
**DON'T**: Suggest alternative fonts — Pretendard is the project font
**DON'T**: Use monospace typography
**DON'T**: Put large icons with rounded corners above headings

### Color & Theme
> *Consult [color reference](reference/color-and-contrast.md) for OKLCH, palettes, and dark mode.*

Maintain the monochromatic slate palette. Use oklch for any new color definitions.

**DO**: Use oklch and CSS custom properties for maintainable colors
**DO**: Keep neutrals tinted toward the existing slate hue
**DON'T**: Introduce accent colors or gradients — the slate palette is the brand
**DON'T**: Use the AI color palette: cyan-on-dark, purple-to-blue gradients, neon accents
**DON'T**: Use gradient text for "impact"
**DON'T**: Suggest dark mode

### Layout & Space
> *Consult [spatial reference](reference/spatial-design.md) for grids, rhythm, and container queries.*

Create visual rhythm through varied section spacing. Maintain centered, symmetric layouts.

**DO**: Create visual rhythm through varied spacing — tight groupings, generous separations
**DO**: Use Tailwind spacing scale consistently (no arbitrary values)
**DO**: Maintain centered container layouts (max-w-5xl, max-w-7xl)
**DON'T**: Wrap everything in cards — not everything needs a container
**DON'T**: Nest cards inside cards
**DON'T**: Use identical card grids with icon + heading + text, repeated endlessly
**DON'T**: Use the same spacing everywhere — without rhythm, layouts feel monotonous

### Visual Details
**DO**: Use intentional, purposeful decorative elements that reinforce professionalism
**DON'T**: Use glassmorphism — blur effects, glass cards, glow borders
**DON'T**: Use rounded elements with thick colored border on one side
**DON'T**: Use sparklines as decoration
**DON'T**: Use rounded rectangles with generic drop shadows
**DON'T**: Use modals unless there's truly no better alternative

### Motion
> *Consult [motion reference](reference/motion-design.md) for timing, easing, and reduced motion.*

Focus on high-impact moments: staggered page-load reveals and smooth hover transitions.

**DO**: Use CSS-only animations for above-fold elements (slideUp, fadeInScale)
**DO**: Use IntersectionObserver for below-fold entry animations
**DO**: Use exponential easing (ease-out) for natural deceleration
**DO**: Respect prefers-reduced-motion
**DON'T**: Animate layout properties (width, height, padding, margin) — use transform and opacity only
**DON'T**: Use bounce or elastic easing
**DON'T**: Import JavaScript animation libraries (framer-motion, GSAP, etc.)

### Interaction
> *Consult [interaction reference](reference/interaction-design.md) for forms, focus, and loading patterns.*

**DO**: Use progressive disclosure where appropriate
**DO**: Design empty states that teach the interface
**DO**: Maintain the existing hover patterns (grayscale→color, translate-y lift, scale-x fill)
**DON'T**: Repeat the same information
**DON'T**: Make every button primary — use ghost buttons, text links, secondary styles

### Responsive
> *Consult [responsive reference](reference/responsive-design.md) for mobile-first, fluid design, and container queries.*

**DO**: Design mobile-first (Tailwind breakpoints: md:768px, lg:1024px)
**DO**: Adapt the interface for different contexts — don't just shrink it
**DON'T**: Hide critical functionality on mobile

### UX Writing
> *Consult [ux-writing reference](reference/ux-writing.md) for labels, errors, and empty states.*

**DO**: Write in clear, direct Korean
**DO**: Make every word earn its place
**DON'T**: Repeat information users can already see
**DON'T**: Use English when Korean is expected

---

## The AI Slop Test

**Critical quality check**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

Review the DON'T guidelines above — they are the fingerprints of AI-generated work.

---

## Implementation Principles

This project follows **refined minimalism**. Implementation should prioritize:
- Restraint and precision over visual complexity
- Consistent spacing and typography over "creative" layout experiments
- Performance (CSS-only animations, optimized images) over visual effects
- Existing patterns (grayscale hover, staggered reveals, slate palette) over novel approaches

When in doubt, do less. A clean, well-spaced layout with strong typography is always better than a busy one with many effects.
