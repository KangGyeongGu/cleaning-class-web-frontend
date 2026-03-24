---
globs:
  - "src/app/admin/**"
  - "src/shared/actions/**"
  - "src/shared/lib/**"
---

# Admin / Data Layer Rules

- Use `@supabase/ssr` (not `@supabase/supabase-js` directly) for Next.js App Router compatibility.
- Server components use `createServerClient`; client components use `createBrowserClient`.
- All data mutations go through server actions in `src/shared/actions/` — never call Supabase from client directly.
- Validate all server action inputs with Zod schemas before touching the database.
- Admin routes must verify authentication at the top of every server component and server action.
- `nodemailer` is Node.js runtime only — use in server actions, never in edge routes.
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for client; service role key server-only.
- Never expose service role key to the client bundle.
- RLS must be enabled on all tables; anon key access should be read-only where possible.
