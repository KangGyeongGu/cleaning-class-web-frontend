---
globs:
  - "src/components/**"
  - "src/app/(home)/**"
  - "src/app/page.tsx"
---

# Homepage / Component Layer Rules

- `page.tsx` is composition-only: assemble section components, no logic or data fetching inline.
- Section-specific static data lives in the section component file, not in `page.tsx`.
- Each section component is responsible for its own data fetching (server component pattern).
- Define design tokens as CSS variables in `globals.css` and expose via Tailwind `@theme`.
- Minimize arbitrary Tailwind values (`[...]`); prefer named theme tokens.
- Use semantic HTML tags (`section`, `nav`, `footer`, `main`, `article`) over generic `div`.
- Prefer server actions for form submission; use `useActionState` / `useOptimistic` only when UX requires it.
- Validate all form input with Zod schemas defined in a co-located or shared `schema.ts`.
