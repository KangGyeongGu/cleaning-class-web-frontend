---
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Architecture Rules (applies to all src)

- Dependency direction: `app → components → shared`. Never import upward (shared must not import from components or app).
- `app/*` files handle routing and page composition only — no business logic, no heavy data transforms.
- Minimize `"use client"` scope — apply only to the smallest unit that needs state or browser events.
- Name client-boundary files `*.client.tsx` when extracting from a server component.
- Use `@/` path aliases for all cross-directory imports — no relative `../` across directories.
- Keep dependencies local — do not add external packages without explicit approval.
- `strict: true` is mandatory. Never use `any`; use `unknown` with type guards.
- Explicitly type component props, event handlers, and return values of public functions.
- Write comments in Korean. Use declarative style explaining intent and reason, not implementation details.
