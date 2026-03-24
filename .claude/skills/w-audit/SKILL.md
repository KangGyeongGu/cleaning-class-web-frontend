---
name: w-audit
description: >
  Comprehensive audit/verification. Runs mechanical checks (ESLint, Prettier,
  tsc, vitest, semgrep, build) then AI semantic reviews (structure, image, seo, logic, security).
  Auto-invoked on "audit", "verify all", "full review" related requests.
allowed-tools: Bash, Agent
---

# Audit Skill

## Instructions

### Phase 0 — 초기화
Archive previous reports:
```bash
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p .claude/reports/archive
cp .claude/reports/audit-latest.json ".claude/reports/archive/${TS}_audit.json" 2>/dev/null || true
cp .claude/reports/audit-latest.md   ".claude/reports/archive/${TS}_audit.md"   2>/dev/null || true
```

### Phase 1 — 기계적 검증 (직접 실행)
아래 명령을 순서대로 실행한다. 하나라도 실패하면 즉시 중단하고 사용자에게 보고한다.

1. `npx eslint .`
2. `npx prettier --check 'src/**/*.{ts,tsx}'`
3. `npx tsc --noEmit`
4. `npx vitest run`
5. `semgrep --config=auto --config=.semgrep/ src/` (미설치 시 skip)
6. `npm run build`

**Phase 1 실패 시 Phase 2 진입 금지.**

### Phase 2 — 시맨틱 리뷰 (reviewer 병렬 spawn)
Phase 1 전체 통과 후, 아래 5개 에이전트를 **단일 메시지에 동시에** spawn한다.
`run_in_background` 사용 금지 — 모든 결과를 수신한 뒤 Phase 3로 진행해야 데이터 정합성이 보장된다.

**reviewer 인스턴스 1 — domain: structure**
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

**reviewer 인스턴스 2 — domain: image**
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

**reviewer 인스턴스 3 — domain: seo**
```
target_paths: src/app/, src/shared/lib/
checklist:
  1. app/robots.ts and app/sitemap.ts existence and correctness
  2. JSON-LD structured data present (LocalBusiness schema for 청소클라쓰)
  3. JSON-LD generated via shared/lib/json-ld.ts and injected in page/layout
  4. One h1 per page rule
  5. Heading hierarchy order (h1→h2→h3, no skipping levels)
  6. Semantic tag usage (section, nav, footer, main) over generic div
  7. title.template pattern: '%s | 청소클라쓰'
  8. Description metadata ≤ 150 characters
  9. Open Graph / Twitter Card metadata present
  10. No heading role replaced by styled div
```

**reviewer 인스턴스 4 — domain: logic**
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

**인스턴스 5 — domain: security**
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

### Phase 3 — 집계 및 리포트
1. 모든 리뷰어 결과 수집
2. 중복 findings 제거 (더 구체적인 쪽 유지)
3. severity 순 정렬: critical > high > medium > low > info
4. `.claude/reports/audit-latest.json` 저장 (영문 JSON)
5. `.claude/reports/audit-latest.md` 저장 (한국어 — verdict 요약, severity별 findings, 수정 우선순위)
6. `.claude/status.json` 갱신: `stage: "audited"`, `audit.verdict`, `audit.open_findings`

### Phase 4 — 수정 루프 (verdict FAIL 시)
verdict가 FAIL이고 `error` / `high` / `medium` severity findings가 존재하면 수정 루프를 실행한다.
**최대 3회 반복. 반복 횟수는 루프 시작 전 카운터로 추적한다.**

**루프 1회 순서**:
1. open_findings를 영향 파일 기준으로 그룹핑
2. 그룹별로 `develop-worker`를 **단일 메시지에서 병렬** spawn
   - 전달 내용: 해당 파일에서 수정해야 할 findings 목록 (issue + suggestion)
   - 플랜 범위 외 신규 작업 금지 — findings 수정만
3. Wave Gate 실행: `npx tsc --noEmit && npx vitest run`
   - 실패 시 해당 파일 develop-worker 재spawn (최대 1회 재시도)
4. Phase 1 재실행 (eslint, prettier, tsc, vitest, build)
   - Phase 1 실패 시 루프 중단, 현재 상태로 최종 보고
5. Phase 2 재실행 (리뷰어 병렬 spawn)
6. Phase 3 재실행 (집계 및 보고서 갱신)
7. verdict PASS이면 루프 종료. FAIL이면 다음 반복 진행.

최대 3회 이후에도 FAIL이면 잔여 findings를 보고서에 기록하고 사용자에게 제시한 뒤 종료한다.

### Phase 5 — 사이클 간 학습
BLOCKED verdict 또는 동일 패턴이 반복 발견된 경우:
1. `.claude/known-failures.md` 읽기 (없으면 생성)
2. 새 패턴을 다음 형식으로 추가:
   ```markdown
   ## F{NNN} — [패턴 이름]
   - **Cycle**: [현재 run_id]
   - **Pattern**: [무엇이 발생했는가]
   - **Root Cause**: [왜 발생했는가]
   - **Prevention**: [어떻게 방지하는가]
   - **Recurrence**: 0
   ```
3. 기존 패턴과 일치하면 `Recurrence` 카운트 증가
4. Recurrence ≥ 3이면 사용자에게 `.claude/rules/` 또는 CLAUDE.md 승격을 제안

### Phase 6 — 최종 보고
audit-latest.md 내용을 사용자에게 제시한다.
verdict가 PASS이면 `/w-browser-test`를 실행하여 최종 E2E 기능 검증 및 Core Web Vitals 측정을 수행할 것을 안내한다.

## Constraints
- Phase 2는 Phase 1 전체 통과 후에만 실행
- Phase 4 수정 루프에서 develop-worker는 findings 수정만 수행 — 범위 외 작업 금지
- Phase 4 루프는 최대 3회. 초과 시 강제 종료 후 잔여 findings 보고
- Phase 5 사이클 간 학습은 BLOCKED 또는 반복 패턴 발견 시에만 실행
