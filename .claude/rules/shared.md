---
globs:
  - "src/shared/**"
---

# Shared Layer Rules

- `shared/` must not import from `app/` or `components/` — it is the lowest dependency layer.
- Supabase client factories (`createClient`, `createBrowserClient`) live in `shared/lib/supabase/`.
- Server actions live in `shared/actions/` — one file per domain (service.ts, review.ts, contact.ts, etc.).
- Zod validation schemas live in `shared/lib/schema.ts`.
- Utility functions (formatting, helpers) live in `shared/lib/`.
- Database types live in `shared/types/database.ts` — generated from Supabase, do not hand-edit.
- All exported functions must have explicit TypeScript return types.
