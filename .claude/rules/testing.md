---
globs:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "tests/**"
  - "__tests__/**"
---

# Testing Rules

- Use Vitest with jsdom environment for unit and component tests.
- Each test tests ONE behavior — descriptive name: "should [behavior] when [condition]".
- Follow Arrange → Act → Assert pattern.
- Mock external dependencies (Supabase, nodemailer, next/navigation) — never call real APIs in unit tests.
- Use MSW (Mock Service Worker) for HTTP integration tests against Supabase API boundary.
- Test error paths, not just happy paths — cover null/undefined, rejected promises, validation failures.
- Coverage thresholds: statements 80%, branches 75%, functions 80%.
- Server actions in `src/shared/actions/` are highest priority test targets.
- Do not test implementation details — test observable behavior only.
