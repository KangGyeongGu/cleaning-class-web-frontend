---
globs:
  - "src/app/admin/**"
  - "src/shared/actions/**"
  - "src/shared/lib/**"
---

# Admin / Data Layer Rules

## Authentication & Authorization Policy

Admin authentication uses a 4-layer defense model. Each layer has a specific role:

| Layer | Location | Purpose | Required |
|-------|----------|---------|----------|
| 1. Middleware | `middleware.ts` | Fast redirect for unauthenticated requests (Edge Runtime) | Yes |
| 2. Layout | `app/admin/layout.tsx` | Server-side auth gate via `getUser()` — applies to ALL admin routes automatically | Yes |
| 3. Server Action | `shared/actions/*.ts` | Per-action auth — defends against direct POST calls bypassing middleware/layout | Yes |
| 4. Supabase RLS | Database | Row-level access control based on JWT role | Yes |

### Key rules:
- `app/admin/layout.tsx` MUST call `await getUser()` — this single call protects every admin page. Individual `page.tsx` files do NOT need `getUser()`.
- Every server action in `shared/actions/` MUST call `await getUser()` at the top — server actions are HTTP POST endpoints that can be called directly, bypassing middleware and layout.
- NEVER remove `getUser()` from `admin/layout.tsx` or server actions.
- New admin pages are automatically protected by the layout — no additional auth code needed in `page.tsx`.

## Data Layer Rules

- Use `@supabase/ssr` (not `@supabase/supabase-js` directly) for Next.js App Router compatibility.
- Server components use `createServerClient`; client components use `createBrowserClient`.
- All data mutations go through server actions in `src/shared/actions/` — never call Supabase from client directly.
- Validate all server action inputs with Zod schemas before touching the database.
- `nodemailer` is Node.js runtime only — use in server actions, never in edge routes.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for client; service role key server-only.
- Never expose service role key to the client bundle.
- RLS must be enabled on all tables; anon key access should be read-only where possible.
