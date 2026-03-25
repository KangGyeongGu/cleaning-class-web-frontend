---
name: w-audit
description: >
  Comprehensive audit/verification. Runs mechanical checks (ESLint, Prettier,
  tsc, vitest, semgrep, build) then AI semantic reviews (structure, image, seo, logic, security).
  Auto-invoked on "audit", "verify all", "full review" related requests.
allowed-tools: Bash, Agent, Read, Write
---

# Audit Skill

## Instructions

### Phase 0 — Initialization
Archive previous reports:
```bash
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p .claude/reports/archive
cp .claude/reports/audit-latest.json ".claude/reports/archive/${TS}_audit.json" 2>/dev/null || true
cp .claude/reports/audit-latest.md   ".claude/reports/archive/${TS}_audit.md"   2>/dev/null || true
```

### Phase 1 — Mechanical Verification (direct execution)
Run the following commands sequentially. If any fails, stop immediately and report to user.

1. `npx eslint .`
2. `npx prettier --check 'src/**/*.{ts,tsx}'`
3. `npx tsc --noEmit`
4. `npx vitest run`
5. `semgrep --config=auto --config=.semgrep/ src/` (skip if semgrep not installed)
6. `npm run build`

**Phase 1 failure blocks Phase 2 entry.**

### Phase 2 — Semantic Review (parallel reviewer spawn)
After Phase 1 passes entirely, spawn all 5 agents below in a **single message**.
Do NOT use `run_in_background` — all results must be collected before Phase 3 to ensure data integrity.

**reviewer instance 1 — domain: structure**
```
target_paths: src/
checklist:
  1. Dependency direction violations: app → components → shared (no reverse imports)
  2. Business logic or data fetching in page.tsx / layout.tsx
  3. Unnecessary "use client" proliferation — smallest required unit only
  4. `any` type — use `unknown` with type guards instead
  5. Missing @/ absolute path aliases
  6. Non-semantic HTML (div overuse instead of section, nav, footer, main)
  7. Excessive Tailwind arbitrary values — prefer @theme tokens
  8. Form validation not using Zod schema + server actions
```

**reviewer instance 2 — domain: image**
```
target_paths: src/, next.config.*
checklist:
  1. <img> tags not replaced with next/image
  2. fill mode missing a positioned parent container
  3. Images without aspect-ratio or explicit container height (CLS risk)
  4. Missing sizes attribute on responsive images
  5. priority (preload) used outside of LCP images
  6. Overly broad remotePatterns — missing pathname or search constraints
  7. images.domains used instead of remotePatterns
  8. formats or qualities not explicitly configured in next.config
  9. Icon assets using <img> or next/image instead of inline SVG / icon library
```

**reviewer instance 3 — domain: seo**
```
target_paths: src/app/, src/shared/lib/
checklist:
  1. app/robots.ts and app/sitemap.ts existence and correctness
  2. JSON-LD structured data present (LocalBusiness schema)
  3. JSON-LD generated via shared/lib/json-ld.ts and injected in page/layout
  4. One h1 per page rule
  5. Heading hierarchy order (h1→h2→h3, no skipping levels)
  6. Semantic tag usage (section, nav, footer, main) over generic div
  7. title.template pattern: '%s | 청소클라쓰'
  8. Description metadata ≤ 150 characters
  9. Open Graph / Twitter Card metadata present
  10. No heading role replaced by styled div
```

**reviewer instance 4 — domain: logic**
```
target_paths: src/shared/, src/app/
checklist:
  1. Server actions — missing error handling or no try/catch around DB calls
  2. Data transformation in shared/lib — edge cases (null, undefined, empty array)
  3. Async functions without await — floating promises
  4. Supabase query results unchecked for .error before using .data
  5. Pagination / range queries — off-by-one errors
  6. Date/time handling — timezone assumptions or missing locale
  7. Form submission — no loading/disabled state during async operation
  8. Client-side data fetching — no error boundary or fallback UI
```

**instance 5 — domain: security**
```
target_paths: src/
checklist:
  1. XSS — dangerouslySetInnerHTML with user-controlled data (check if data is DB/user-derived)
  2. Open redirect — redirect URLs constructed from user input without validation
  3. File upload — missing extension/MIME allowlist on server side
  4. Missing server-side file size/count limits on uploads
  5. HTML injection in email templates — user inputs not HTML-escaped before template interpolation
  6. JSON.stringify in <script> tags — </script> sequence not escaped (use \u003c)
  7. Sensitive env vars (without NEXT_PUBLIC_) accessed in client components
  8. Missing auth checks on protected server actions or routes
  9. SQL/NoSQL injection — raw query construction with user input
  10. JSON.parse without try-catch on user-supplied data
```

### Phase 3 — Aggregation and Report
1. Collect all reviewer results
2. Deduplicate findings (keep the more specific one)
3. Sort by severity: critical > high > medium > low > info
4. Save `.claude/reports/audit-latest.json` (English JSON)
5. Save `.claude/reports/audit-latest.md` (Korean — verdict summary, findings by severity, fix priority)
6. Update `.claude/status.json`: set `stage: "audited"`, `audit.verdict`, `audit.open_findings`

### Phase 4 — Final Report
Present audit-latest.md contents to the user.
- Do NOT auto-fix any findings — audit is inspection only
- If verdict is PASS, recommend running `/w-browser-test` for final E2E verification
- If verdict is FAIL, present findings and await user decision on next steps

## Constraints
- Phase 2 runs only after Phase 1 passes entirely
- Audit is read-only inspection — no code modifications, no develop-worker spawning
- Report all findings to user and stop. Fixing is the user's responsibility (via /w-develop or manual)
