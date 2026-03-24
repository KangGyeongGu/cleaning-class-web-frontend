---
name: w-verify
description: >
  Mechanical verification only. Runs eslint, prettier, tsc, vitest, semgrep,
  build sequentially and reports results. Does not run AI reviewers.
  Auto-invoked on "verify", "check", "run tests" related requests.
allowed-tools: Bash
---

# Verify Skill

## Instructions
Run the following commands sequentially and report results:

1. `npx eslint .` — ESLint code quality check
2. `npx prettier --check 'src/**/*.{ts,tsx}'` — Prettier format check
3. `npx tsc --noEmit` — TypeScript type checking
4. `npx vitest run` — Vitest unit/structural tests
5. `semgrep --config=auto --config=.semgrep/ src/` — Semgrep security scan (skip if semgrep not installed)
6. `npm run build` — Next.js production build

## Output Format
```
Verify Result
- eslint:     pass|fail (N errors, N warnings)
- format:     pass|fail
- typecheck:  pass|fail
- test:       pass|fail (N passed, N failed, coverage: N%)
- semgrep:    pass|fail (N findings)
- build:      pass|fail
- Overall:    PASS|FAIL
```

If any step fails, report the error details and stop.
Do NOT auto-fix. Report findings to the user.
