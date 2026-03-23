# 청소클라쓰 프론트엔드 — AI 에이전트 시스템

본 문서는 cleaning-class-frontend 개발을 위한 AI 에이전트 시스템 설계를 정의한다.

---

## 1. 시스템 개요

본 시스템은 세 가지 설계 패러다임을 통합하여 구성한다.

### 1.1 Context Engineering

에이전트에 주입되는 컨텍스트를 4개 계층으로 분리하여 관리한다. 도메인 지식을 에이전트 정의에 넣지 않고 path-specific rules와 on-demand skills로 분리함으로써, 작업당 컨텍스트 토큰을 1/4~1/8로 절감하고 동일 에이전트가 서로 다른 도메인 작업을 수행할 수 있게 한다.

```
Layer 1: .claude/CLAUDE.md + .claude/rules/  ← 자동 로딩 (rules는 파일 접근 시 자동 주입)
Layer 2: Agent Definition (.claude/agents/) ← 에이전트 생성 시 1회 로딩
Layer 3: Skills (preload / on-demand)     ← description만 항상 로딩, 본문은 필요 시
Layer 4: Dynamic Prompt (호출 시 주입)   ← 이번 작업의 고유 정보만
```

**핵심 원칙**: 에이전트 정의에 도메인 지식을 넣지 않는다. 역할·프로세스·품질 기준만 정의한다.

### 1.2 AI 오케스트레이션

Plan → Develop → Audit 3단계 파이프라인을 **Current Session이 단일 오케스트레이터**로 직접 담당한다. 스킬 실행 시 Current Session이 Bash 명령(기계적 검증)과 Agent spawn(리프 워커)을 직접 조율한다. 리프 워커(`develop-worker`, `reviewer`, `security-reviewer`)는 하위 에이전트를 spawn하지 않는다.

### 1.3 브라우저 테스트 자동화

Microsoft 공식 `@playwright/mcp` MCP 서버를 통해 Claude Code가 실제 Chromium 브라우저를 직접 조작하여 E2E 기능 검증 및 Core Web Vitals 성능 측정을 수행한다. `browser_evaluate`로 Performance Observer API를 실행해 LCP/CLS/FCP를 측정하고, `browser_generate_playwright_test`로 조작 과정을 `.spec.ts` 파일로 자동 변환한다. `/w-browser-test`는 `/w-audit` 이후 최종 E2E 검증 단계로 로컬에서 실행된다.

---

## 2. 설계 원칙

| # | 원칙 | 내용 |
|---|------|------|
| 1 | **단계 분리** | Plan → Develop → Audit는 독립된 책임. 자동 연쇄 실행 금지 |
| 2 | **기계적 우선** | 결정론적 도구(tsc, ESLint, Semgrep)가 먼저. AI 검증은 그 위에 계층화 |
| 3 | **컨텍스트 효율** | CLAUDE.md ≤ 50줄, 에이전트 정의 ≤ 30줄. 도메인 지식은 rules/skills에 분리 |
| 4 | **최소 권한** | 각 에이전트는 역할에 필요한 도구만 허용. 리뷰어는 Write/Edit 금지 |
| 5 | **실패 시 중단** | 각 단계가 통과하지 않으면 다음 단계로 진행하지 않음 |
| 6 | **범용 에이전트** | 도메인별 전용 에이전트 대신, 범용 에이전트가 path-specific rules로 도메인 컨텍스트를 획득 |
| 7 | **구조화된 출력** | 에이전트 간 통신: 영어 JSON. 사용자 보고: 한국어 MD |
| 8 | **영어 지침** | Claude가 소비하는 모든 파일(agents, rules, skills)은 영어 작성. 토큰 2~3배 절감 |
| 9 | **자동 적용 금지** | AI 리뷰 결과는 반드시 사용자에게 보고 후 승인을 받아 적용 |
| 10 | **오케스트레이터 역할 경계** | Current Session(오케스트레이터)은 dispatch와 결과 수집만 수행. 에이전트의 작업(코드 작성, 검증 실행)을 직접 대행하지 않음. 에이전트 실패 시 재시도 또는 BLOCKED 보고 |
| 11 | **사이클 간 기억** | 반복 실패 패턴은 `known-failures.md`에 기록, 향후 plan에 주입하여 동일 실패 방지 |
| 12 | **주장이 아닌 증거** | 에이전트는 읽고 검증한 내용의 증거를 출력에 포함. 추측이 아닌 코드 근거 기반 |
| 13 | **긍정형 지침 우선** | 에이전트 지침은 "~하라"(긍정형)로 작성. "~하지 마라"(부정형)는 안전 경계만. Claude가 이미 아는 당연한 규칙은 기재하지 않음 |
| 14 | **기계적 강제 가능 = AI 체크리스트 불필요** | ESLint/tsc로 강제 가능한 규칙은 AI 리뷰 체크리스트에 넣지 않음. AI는 판단과 맥락이 필요한 것만 |

---

## 3. 에이전트 & 스킬 체계

### 3.1 에이전트 목록

| 에이전트 | 모델 | maxTurns | 도구 | 역할 |
|----------|------|----------|------|------|
| `plan-worker` | sonnet | 25 | Read, Grep, Glob, Write *(Edit/Bash 금지)* | /w-plan 전용 도메인 조사 에이전트. 요구사항·참조문서를 받아 코드베이스를 스스로 조사하고 `.claude/plans/workers/{domain}-report.json` 작성. 리프 워커 |
| `develop-worker` | sonnet | 25 | Read, Write, Edit, Grep, Glob, Bash | 승인된 plan의 Task Card 구현 + smoke 검증. `isolation: worktree`. 리프 워커 |
| `reviewer` | sonnet | 12 | Read, Grep, Glob *(Write/Edit/Bash 금지)* | 범용 리뷰어. 호출 시 동적 주입된 도메인·체크리스트로 특화 (structure/image/seo/logic). 리프 워커 |
| `security-reviewer` | **opus** | 12 | Read, Grep, Glob, Bash *(Write/Edit 금지)* | 웹 보안 전담 (Bash 필요 — Semgrep 실행). 누락 비용 높아 Opus 배정. 리프 워커 |

### 3.2 스킬 목록

| 스킬 | user-invocable | 관련 에이전트 | 역할 |
|------|----------------|--------------|------|
| `/w-plan` | ✅ | `plan-worker` | 참조문서 수집 → plan-worker 병렬 spawn → 보고서 수집 → **요구사항 분류(definite/uncertain/not_relevant)** → Task Card 분해 → **Gate 검증(구조+명세 커버리지)** → PLAN.json+PLAN.md 생성 → 사용자 승인 |
| `/w-develop` | ✅ | `develop-worker` | PLAN.json 읽기 → Task Card별 develop-worker spawn → 검증 파이프라인 실행 |
| `/w-audit` | ✅ | `reviewer`, `security-reviewer` | Phase 1 직접 실행 → Phase 2 reviewer 5개 병렬 spawn → 보고서 저장 |
| `/w-review` | ✅ | `reviewer`, `security-reviewer` | 기계적 검증 없이 AI 리뷰만 병렬 실행. 도메인 지정 가능 |
| `/w-verify` | ✅ | — | typecheck + lint + format + test + semgrep + build 순차 실행 및 결과 보고 |
| `/w-browser-test` | ✅ | — (Playwright MCP) | E2E 기능 검증 + Core Web Vitals 측정 + 리포트 생성 |
| `next-best-practices` | ❌ | — | Next.js 16 공식 가이드. 사용자 직접 호출 또는 에이전트 on-demand |
| `vercel-react-best-practices` | ❌ | — | React/Next.js 성능 패턴. 사용자 직접 호출 전용 |
| `vercel-composition-patterns` | ❌ | — | React 컴포지션 패턴 가이드. 사용자 직접 호출 전용 |
| `web-design-guidelines` | ❌ | — | 웹 인터페이스 가이드라인. 사용자 직접 호출 전용 |

> **참조 스킬 전략 결정** (2026-03-23): 긴 베스트 프랙티스 체크리스트를 AI 리뷰어에 주입하면 준수율이 오히려 하락한다 (연구 근거: 1-shot 이후 예시 추가 시 성능 감소). 패턴 매칭 가능한 규칙은 ESLint로 이미 기계적 강제 중. 참조 스킬은 AI 리뷰 체크리스트로 사용하지 않고, **사용자가 설계 판단 시 on-demand로 참조**하는 용도로만 유지한다.

### 3.3 네이밍 규칙 및 이유

**에이전트 (`*-worker`, `reviewer`, `security-reviewer`)**

- `-worker` 접미사: Plan/Develop/Audit 파이프라인 단계를 담당하는 내부 에이전트임을 표시
- `reviewer` 단수: 도메인(structure/image/seo/logic)에 관계없이 단일 정의를 공유하는 범용 재사용 에이전트임을 표시. 호출 시 dynamic prompt로 특화
- `security-reviewer`: `reviewer`와 별도 정의가 필요한 이유가 명확함(Bash 도구 필요). 접미사로 리뷰어 패밀리임을 표시

**스킬 (`w-*`, `*-best-practices`, `*-guidelines`)**

- `w-` 접두사 (workflow): Claude Code 내장 명령어와의 충돌 방지. `/plan`은 Plan Mode 진입, `/review`는 deprecated 내장 명령에 해당하여 의도치 않게 내장 동작이 실행됨. `w-`로 명시적으로 워크플로우 스킬임을 표시
- 참조 스킬(`next-best-practices` 등): `user-invocable: false`. 에이전트 `skills:` preload 또는 명시적 호출 전용이므로 접두사 불필요. 내용이 명확한 명사형 명명

---

## 4. Context Engineering

### 4.1 4계층 컨텍스트 주입 모델

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 1: .claude/CLAUDE.md + .claude/rules/                │
│  항상 로딩 (rules는 해당 경로 파일 접근 시 자동 주입)           │
│  토큰: ~2K (.claude/CLAUDE.md) + ~0.5K/규칙 (path-specific) │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: Agent Definition (.claude/agents/*.md)            │
│  에이전트 생성 시 1회 로딩 — 역할, 프로세스, 품질 기준만        │
│  토큰: ~1K (~30줄, 도메인 지식 미포함)                         │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: Skills                                             │
│  description만 항상 로딩, 본문은 preload/호출 시 로딩           │
│  토큰: ~2-5K (필요한 스킬만 선택적)                            │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: Dynamic Prompt (호출 시 주입)                       │
│  이번 작업의 고유 정보만 — objective, owned_paths, criteria    │
│  토큰: ~0.3-0.5K                                             │
└──────────────────────────────────────────────────────────────┘
```

**동일 `develop-worker`가 서로 다른 경로 작업 시 다른 규칙이 자동 로딩되는 예시**:

```
TASK-H-001 (Hero)     dynamic: "owned_paths: src/components/Hero.tsx"
                      → rules/components.md 자동 주입 (motion, @theme tokens)
                      → rules/architecture.md 자동 주입

TASK-A-001 (Admin)    dynamic: "owned_paths: src/app/admin/reviews/..."
                      → rules/admin.md 자동 주입 (Supabase Auth, Zod, RLS)
                      → rules/architecture.md 자동 주입

TASK-I-001 (Image)    dynamic: "owned_paths: src/components/Hero.tsx"
                      → rules/image-policy.md 자동 주입 (next/image, CLS, sizes)
                      → rules/architecture.md 자동 주입
```

### 4.2 Rules 파일 형식 (강제 규격)

```yaml
---
globs:
  - "src/app/**/*.ts"   # 이 경로 파일 접근 시 자동 주입
---

# [Rule Name]
- Rule written in English imperative form
- ...
```

현재 정의된 rules:

| 파일 | 적용 경로 | 주요 규칙 |
|------|-----------|-----------|
| `architecture.md` | `src/**/*.{ts,tsx}` | 단방향 의존(app→components→shared), `any` 금지, `@/` alias 강제 |
| `components.md` | `src/components/**`, `src/app/page.tsx` | section 데이터 co-location, "use client" 최소화, @theme 토큰 |
| `admin.md` | `src/app/admin/**`, `src/shared/actions/**` | Supabase Auth 보호, server actions 우선, Zod + RLS 필수 |
| `image-policy.md` | `src/**/*.tsx`, `next.config.*` | next/image 강제, CLS 방지, sizes 필수, priority LCP 전용 |
| `seo-policy.md` | `src/app/**/*.{ts,tsx}`, `src/shared/lib/**` | robots/sitemap 필수, JSON-LD, h1 단일, title.template |
| `shared.md` | `src/shared/**` | app/components 의존 금지, Supabase client 위치, server actions 위치 |
| `testing.md` | `__tests__/**`, `src/**/*.test.{ts,tsx}` | Vitest+jsdom, AAA 패턴, MSW 통합, 에러 경로 테스트 필수 |

### 4.3 Skills 파일 형식 (강제 규격)

```yaml
---
name: skill-name                      # 필수. 소문자 kebab-case
description: >                        # 필수. 트리거 키워드 포함
  Description. Auto-invoked on "..."
user-invocable: true | false          # false: agent skills: [] preload 또는 명시 호출 전용
argument-hint: "[argument]"           # user-invocable: true + 인수 있을 때
allowed-tools: Read, Bash             # 사용할 도구 제한
disable-model-invocation: true        # 오케스트레이션 전용 (자체 응답 생성 없음)
---
```

### 4.4 Dynamic Prompt 원칙

호출 시 전달하는 prompt에는 **이번 작업만의 고유 정보**만 포함한다. 도메인 규칙은 path-specific rules가 자동 주입하므로 중복 기재하지 않는다.

```
# 올바른 예 — task-specific 정보만
Implement the following task:
- Task: TASK-H-001
- Objective: Connect Hero CTA button to contact form scroll
- Owned Paths: src/components/Hero.tsx
- Acceptance Criteria:
  1. CTA click smooth-scrolls to ContactForm section
  2. First input field focused after scroll

# 잘못된 예 — rules 중복 기재 (토큰 낭비)
... "use client" only on minimum scope ...   ← rules/architecture.md가 자동 주입
... motion/react requires "use client" ...   ← 중복
... Use @theme tokens ...                    ← rules/components.md가 자동 주입
```

---

## 5. 오케스트레이션 체계

### 5.1 전체 파이프라인

```
사용자 요구사항
      │
      ▼
  ┌─────────┐
  │ /w-plan │  (Current Session 오케스트레이션)
  └────┬────┘  ├─► plan-worker × N 병렬 spawn — 요구사항 + 참조문서 전달
       │        │    각 worker: 코드베이스 자율 조사 → {domain}-report.json 작성
       │        ├─► Current Session: 보고서 종합 + 요구사항 분류(definite/uncertain/not_relevant)
       │        ├─► Task Card 분해 + scope_decisions 기록
       │        ├─► Gate 1 (구조적 완전성) + Gate 2 (명세 커버리지) 자기 검증
       │        └─► known-failures.md 대조
       │ 사용자 승인 (scope_decisions의 exclude 항목 별도 표시)
       ▼
  ┌──────────┐
  │/w-develop│  (Current Session 오케스트레이션)
  └────┬─────┘  ├─► develop-worker × N (Task Card별)
       │         │    Fresh Retry Protocol (최대 3 spawn / work item)
       │         │    Stage 1: PreToolUse hook (보호 파일 차단)
       │         │    Stage 1: PostToolUse hook (Prettier + ESLint per file)
       │         │    Stage 2: Wave Gate (tsc + vitest + semgrep)
       │         └─► Final Gate: build + reviewer ×4 + security-reviewer (병렬)
       ▼
  ┌─────────┐
  │ /w-audit│  (Current Session 오케스트레이션)
  └────┬────┘  ├─ Phase 1: Bash 직접 실행 (eslint, prettier, tsc, vitest, semgrep, build)
       │        ├─► Phase 2: reviewer ×4 + security-reviewer (병렬) ──► audit-latest.json+.md
       │        └─► Phase 3: 사이클 간 학습 → known-failures.md 업데이트
       ▼
  Verdict: PASS / NEEDS_WORK / BLOCKED
```

`/w-audit` 통과 후 `/w-browser-test`를 실행하여 실제 브라우저 동작(E2E)과 Core Web Vitals 성능을 최종 검증한다.

### 5.2 /w-audit 오케스트레이션 상세

Current Session이 직접 실행한다.

```
/w-audit (Current Session)
│
├── Phase 1: Mechanical (Bash 직접 실행, 순차)
│   ├─ npx eslint .
│   ├─ npx prettier --check 'src/**/*.{ts,tsx}'
│   ├─ npx tsc --noEmit
│   ├─ npx vitest run          ← 실패 시 Phase 2 진행하지 않음
│   ├─ npm run security:semgrep
│   └─ npm run build
│
└── Phase 2: Semantic (Agent spawn, 병렬)
    ├─► reviewer ← domain: structure (의존성 방향, "use client", any, 시맨틱 HTML)
    ├─► reviewer ← domain: image (next/image, CLS, sizes, remotePatterns)
    ├─► reviewer ← domain: seo (robots, JSON-LD, h1, heading 계층, OG)
    ├─► reviewer ← domain: logic (서버 액션 오류 처리, 엣지 케이스, 비동기 패턴)
    └─► security-reviewer (XSS, 서버 액션 인가, RLS 우회, 시크릿 노출)

    ↓ Phase 3: Aggregation
    verdict + open_findings[] → audit-latest.json + audit-latest.md

    ↓ Phase 4: Cross-Cycle Learning
    BLOCKED 또는 반복 발견 → known-failures.md에 패턴 기록
```

### 5.3 단계간 컨텍스트 전달

| From → To | 파일 | 포맷 | 주요 필드 |
|-----------|------|------|-----------|
| Plan → Develop | `.claude/plans/active/PLAN.json` | 영어 JSON | `work_items[]`, `execution_order`, `approved_at` |
| Plan → User | `.claude/plans/active/PLAN.md` | 한국어 MD | Task Cards 요약, 사용자 승인용 |
| Develop → Audit | `.claude/reports/develop-latest.json` + git diff | 영어 JSON | `files_changed[]`, `smoke_check`, `tasks_done` |
| Audit → User | `.claude/reports/audit-latest.md` | 한국어 MD | verdict, severity별 findings, 수정 우선순위 |
| 브라우저 테스트 | `.claude/reports/browser-test-latest.json` | 영어 JSON | `e2e_results[]`, `web_vitals`, `verdict` |
| Audit → 다음 사이클 | `.claude/known-failures.md` | 영어 MD | 반복 실패 패턴, 방지 방법 |
| 파이프라인 상태 | `.claude/status.json` | 영어 JSON | `current_run_id`, `stage`, 각 단계 요약 |

에이전트 간 통신은 영어 JSON으로 파싱 가능성과 토큰 효율을 확보한다.
사용자 보고(`audit-latest.md`, `browser-test-latest.md`)만 한국어로 생성한다.

### 5.4 아티팩트 JSON 스키마

#### `PLAN.json`

```json
{
  "run_id": "YYYYMMDD-HHmmss",
  "created_at": "ISO8601",
  "objective": "string",
  "work_items": [
    {
      "id": "TASK-{DOMAIN}-NNN",
      "objective": "string",
      "owned_paths": ["src/..."],
      "depends_on": [],
      "complexity": "low | medium | high",
      "criteria": ["string"],
      "status": "pending | in_progress | done | skipped"
    }
  ],
  "execution_order": "TASK-001 → [TASK-002, TASK-003] → TASK-004",
  "risks": ["string"],
  "spec_coverage": {
    "requirements_mapped": [
      { "source": "report/domain", "requirement": "...", "relevance": "definite", "covered_by": "TASK-X-001" }
    ],
    "scope_decisions": [
      { "source": "report/domain", "requirement": "...", "relevance": "uncertain",
        "decision": "include | exclude", "covered_by": "TASK-X-001 | null", "reason": "..." }
    ],
    "known_failures_checked": ["F001"]
  },
  "approved_at": "ISO8601 | null"
}
```

#### `develop-latest.json`

```json
{
  "run_id": "string",
  "completed_at": "ISO8601",
  "tasks_done": ["TASK-H-001"],
  "tasks_skipped": [],
  "files_changed": [{ "path": "src/...", "op": "created | modified | deleted" }],
  "smoke_check": "pass | fail",
  "notes": "string"
}
```

#### `audit-latest.json`

```json
{
  "run_id": "string",
  "audited_at": "ISO8601",
  "phase1": {
    "eslint": "pass | fail",
    "format": "pass | fail",
    "typecheck": "pass | fail",
    "test": "pass | fail",
    "semgrep": "pass | fail",
    "build": "pass | fail"
  },
  "phase2": {
    "structure": "pass | skipped",
    "image": "pass | skipped",
    "seo": "pass | skipped",
    "logic": "pass | skipped",
    "security": "pass | skipped"
  },
  "verdict": "PASS | NEEDS_WORK | BLOCKED",
  "open_findings": [
    {
      "id": "F1",
      "severity": "critical | high | medium | low | info",
      "reviewer": "structure | image | seo | logic | security",
      "file": "src/...",
      "line": 42,
      "issue": "string",
      "fix": "string"
    }
  ]
}
```

#### `browser-test-latest.json`

```json
{
  "run_id": "string",
  "tested_at": "ISO8601",
  "base_url": "http://localhost:3000",
  "e2e_results": [
    {
      "scenario": "string",
      "status": "pass | fail",
      "error": "string | null"
    }
  ],
  "web_vitals": {
    "lcp_ms": 0,
    "cls": 0,
    "fcp_ms": 0,
    "ttfb_ms": 0
  },
  "lighthouse_scores": {
    "performance": 0,
    "accessibility": 0,
    "best_practices": 0,
    "seo": 0
  },
  "verdict": "PASS | NEEDS_WORK | BLOCKED",
  "notes": "string"
}
```

#### `status.json`

```json
{
  "current_run_id": "string",
  "stage": "planned | developed | audited",
  "plan": { "file": ".claude/plans/active/PLAN.json", "approved_at": "ISO8601 | null" },
  "develop": { "file": ".claude/reports/develop-latest.json", "completed_at": "ISO8601 | null", "verdict": "pass | fail | null" },
  "audit": { "json_file": ".claude/reports/audit-latest.json", "md_file": ".claude/reports/audit-latest.md", "completed_at": "ISO8601 | null", "verdict": "PASS | NEEDS_WORK | BLOCKED | null", "open_findings": "number | null" },
  "browser_test": { "file": ".claude/reports/browser-test-latest.json", "completed_at": "ISO8601 | null", "verdict": "PASS | NEEDS_WORK | BLOCKED | null" }
}
```

---

## 6. 에이전트 정의 명세

### 6.1 Agent frontmatter 강제 규격

```yaml
---
name: agent-name                 # 필수. 소문자 kebab-case
description: >                   # 필수. Claude가 spawn 여부 판단에 사용. 호출자 명시 권장
  One-line summary. Invoked by X.
tools: Read, Grep, Glob, Bash    # 필수. 최소 권한만 허용
disallowedTools: Write, Edit     # 명시적 차단이 필요한 경우 (리뷰어 등)
model: sonnet | opus | haiku     # 필수. 단축 alias 사용 (full model ID 금지)
maxTurns: 15                     # 필수. 역할 기준 최솟값 설정
permissionMode: acceptEdits | default  # 파일 수정 에이전트는 acceptEdits
---
```

> **`maxTurns` 설정 근거**: 각 턴마다 컨텍스트가 누적되므로 Claude Max 5x 플랜 기준 과도한 루프는 토큰 소비 급증. 에이전트별 실제 필요 턴 기준으로 최솟값 설정.

### 6.2 에이전트별 핵심 설계 사항

| 에이전트 | 특수 설정 | 설계 이유 |
|----------|-----------|-----------|
| `plan-worker` | `disallowedTools: Edit, Bash` | Write 허용 (JSON 보고서 파일 작성 필요). 소스 파일 편집 불필요 |
| `develop-worker` | `isolation: worktree`, `permissionMode: acceptEdits` | worktree 격리로 메인 브랜치 오염 방지. npm install 선행. 도메인 규칙은 path-specific rules 자동 주입 |
| `reviewer` | `disallowedTools: Write, Edit, Bash` | 리뷰어가 파일을 수정하는 실수 원천 차단 |
| `security-reviewer` | `tools: Bash` 포함, `disallowedTools: Write, Edit` | Semgrep CLI 실행 필요. reviewer와 별도 정의 유지 이유 |

### 6.3 Plan-Worker 인스턴스화 패턴

`plan-worker`는 `/w-plan` Step 1에서 단일 메시지로 관련 도메인 수만큼 동시 spawn된다. 각 인스턴스는 독립된 컨텍스트에서 병렬 실행된다.

Current Session은 사용자 요구사항을 분석하여 **관련 도메인만** 선택하고, 각 worker에게 **도메인 + 사용자 요구사항 원문 + 참조 문서 경로만** 전달한다. 체크리스트나 조사 방법은 전달하지 않는다 — plan-worker가 자체 도메인 지식으로 조사를 수행한다.

```
/w-plan Step 1 병렬 dispatch (요구사항에 따라 필요한 도메인만 선택):

# 예: 보안 취약점 수정 + 신규 기능 구현 요청일 경우
plan-worker ← "domain: logic\nobjective: [요구사항 원문]\nreference_files: [audit-latest.json, ...]"
plan-worker ← "domain: security\nobjective: [요구사항 원문]\nreference_files: [...]"
plan-worker ← "domain: requirements\nobjective: [요구사항 원문]\nreference_files: [...]"
# structure/image/seo는 이 요구사항과 무관하면 spawn 안 함
```

각 worker는 참조 문서를 먼저 읽고, 코드베이스를 자율 조사한 뒤, `.claude/plans/workers/{domain}-report.json`을 작성한다.

Current Session은 모든 보고서를 읽은 뒤 Task Cards로 합성한다. `audit-latest.json`의 `open_findings`가 어느 보고서에도 포함되지 않은 경우, Current Session이 직접 work_items에 추가한다 (누락 불가).

### 6.3.1 요구사항 분류 체계

plan-worker 보고서의 각 요구사항은 relevance를 분류한다. 오케스트레이터(Current Session)는 이 분류를 기반으로 work item을 결정한다.

| 분류 | 판단 기준 | 오케스트레이터의 의무 |
|------|----------|-------------------|
| `definite` | 목표에 직접 언급 / 목표 달성에 필수 / 사용자가 scope에 명시 | **반드시** work item으로 변환. 제외 불가 (사용자만 가능) |
| `uncertain` | 직접 언급 안 됨 / 변경의 부수 영향 가능 / 인접 모듈 제약 | **반드시** include/exclude 결정 + 근거를 `scope_decisions[]`에 기록 |
| `not_relevant` | 목표와 무관 / 영향 경로 없음 | 무시 가능 |

**분류 품질 검증**: plan-worker는 출력 전 다음을 확인한다:
- 3개 분류 레벨이 모두 사용되었는가 — uncertain이 0건이면 분류를 재검토
- definite로 분류된 항목이 실제로 목표 달성에 필수인가

### 6.3.2 Gate 검증 (오케스트레이터 자기 검증)

오케스트레이터는 plan 작성 후 다음 Gate를 통과해야 사용자에게 제시한다.

**Gate 1 — 구조적 완전성**:
- 모든 work item에 objective, owned_paths, criteria 존재
- DAG 유효성 (순환 없음), owned_paths 겹침 없음
- work item 크기: criteria 5개 이하, 변경 파일 3개 이하 권장

**Gate 2 — 명세 커버리지** (기계적 강제):
- Step 1: definite 전수 대조 — 보고서의 definite 항목이 모두 `requirements_mapped`에 존재
- Step 2: uncertain 결정 확인 — uncertain 전부에 include/exclude + reason 존재
- Step 3: `known_failures_checked` 비어있지 않음 (known-failures.md 존재 시)

Gate 실패: 오케스트레이터가 자체 수정 후 재검증.

**사용자 제시 시**:
- work items 목록 + scope_decisions에서 exclude 항목을 별도 표시 → 사용자 검토 요청
- 사용자가 definite 항목도 직접 제거 가능 (scope 제외 최종 권한은 사용자)

### 6.4 Reviewer 인스턴스화 패턴

`reviewer`는 단일 에이전트 정의를 여러 도메인에 재사용한다. 도메인별 체크리스트는 호출자(`/w-audit`, `/w-review` — Current Session)가 dynamic prompt로 주입한다.

```
/w-audit Phase 2 병렬 dispatch (Current Session → leaf workers):

reviewer ← "domain: structure\nchecklist:\n  1. Dependency direction violations..."
reviewer ← "domain: image\nchecklist:\n  1. <img> tags not replaced with next/image..."
reviewer ← "domain: seo\nchecklist:\n  1. app/robots.ts and app/sitemap.ts..."
reviewer ← "domain: logic\nchecklist:\n  1. Server actions — missing error handling..."
security-reviewer ← (자체 체크리스트 적용 — dynamic prompt 불필요)
```

각 인스턴스는 독립된 컨텍스트에서 병렬 실행된다.

---

## 7. 스킬 정의 명세

### 7.1 Skill frontmatter 강제 규격

```yaml
---
name: skill-name                      # 필수. 소문자 kebab-case (w- 접두사: workflow)
description: >                        # 필수. 트리거 키워드 포함 ("Auto-invoked on ...")
  Description with trigger keywords.
user-invocable: true | false          # false: agent skills: [] preload / 명시 호출 전용
argument-hint: "[argument]"           # user-invocable: true + 인수 있을 때
allowed-tools: Read, Bash             # 사용할 도구 제한
disable-model-invocation: true        # 오케스트레이션 전용 (자체 응답 생성 없음)
---
```

### 7.2 스킬별 핵심 설계 사항

| 스킬 | Current Session 역할 | 설계 이유 |
|------|---------------------|-----------|
| `/w-plan` | 참조문서 수집 + plan-worker 병렬 spawn + 보고서 수집 + **요구사항 분류** + Task Card 합성 + **Gate 검증** + **known-failures 대조** + 승인 대기 | 조사는 plan-worker 위임. 분류·계획·검증은 오케스트레이터 직접 수행. definite 전수 매핑 + uncertain 전수 결정 강제 |
| `/w-develop` | Wave 오케스트레이션 + **Fresh Retry Protocol** + Gate 실행 | PLAN.json → develop-worker × N → 실패 시 최대 3 spawn → reviewer ×4 직접 관리 |
| `/w-audit` | Phase 1 Bash 직접 실행 + Phase 2 spawn | 단일 오케스트레이터. 중간 worker 없음 |
| `/w-review` | reviewer 병렬 spawn + 결과 집계 | 기계적 검증 없이 AI 리뷰만 |
| `/w-verify` | Bash 명령 순차 실행 + 결과 보고 | 기계적 검증만 |
| `/w-browser-test` | Playwright MCP 조작 + 결과 해석 | E2E + Core Web Vitals 측정 |
| 참조 스킬 | — | `user-invocable: false`. 에이전트 preload 또는 명시적 호출 전용 |

---

## 8. 기계적 검증 도구

### 8.1 도구 현황 (2026-03-23 기준)

| 도구 | 상태 | 목적 | 실행 시점 |
|------|------|------|-----------|
| TypeScript `tsc --noEmit` (strict) | ✅ 동작 | 전체 타입 검사 | hooks, `/w-verify`, `/w-audit` Phase 1 |
| ESLint v9 (flat config) | ✅ 동작 | 코드 품질 + Next.js + 의존성 방향 | hooks(PostToolUse), `/w-verify`, `/w-audit` Phase 1 |
| ├ eslint-config-next | ✅ | Next.js 규칙, Core Web Vitals | |
| ├ eslint-plugin-boundaries | ✅ | app→components→shared 단방향 강제 | |
| ├ @eslint-react/eslint-plugin | ✅ | React/JSX 규칙, "use client" 스코프 | |
| ├ eslint-plugin-no-relative-import-paths | ✅ | `@/` alias 강제 | |
| ├ @vitest/eslint-plugin | ✅ | trivial assertion 탐지 (expect-expect, no-conditional-expect) | |
| └ jsx-a11y | ✅ | 접근성 규칙 (alt-text, heading, label 등) | |
| Prettier + prettier-plugin-tailwindcss | ✅ 동작 | 코드 포맷팅 + Tailwind 클래스 정렬 | hooks(PostToolUse), `/w-verify` |
| Vitest + jsdom | ✅ 동작 | 단위/구조 테스트 (8 tests) | develop smoke, `/w-verify`, `/w-audit` Phase 1 |
| Playwright | ✅ 설정 | E2E 테스트 (2 specs) | `/w-browser-test` |
| eslint-plugin-better-tailwindcss | ✅ 동작 | Tailwind v4 클래스 검증 (unknown, conflicting, duplicate) | hooks(PostToolUse), `/w-verify`, `/w-audit` Phase 1 |
| Semgrep (1.156.0) + 커스텀 14규칙 | ✅ 동작 | 보안 + 코드 품질 정적 분석 | `/w-verify`, `/w-audit` Phase 1 |
| Commitlint + Husky | ✅ 동작 | Conventional Commits 강제 | git commit |
| `npm run build` | ✅ 동작 | Next.js 프로덕션 빌드 검증 | Final Gate, `/w-verify`, `/w-audit` Phase 1 |

### 8.2 Semgrep 커스텀 규칙 (`.semgrep/`)

프로젝트 보안 표면 분석을 기반으로 3개 카테고리 14개 규칙을 구축했다.

| 파일 | 카테고리 | 규칙 수 | 주요 탐지 대상 |
|------|----------|---------|---------------|
| `next-server-actions.yaml` | Server Action 안전성 | 4 | auth 누락, JSON.parse 미보호, DB 에러 노출, Supabase 에러 미체크 |
| `next-security.yaml` | 웹 보안 | 6 | dangerouslySetInnerHTML, 오픈 리다이렉트, 하드코딩 시크릿, 비공개 env 클라이언트 노출, 이메일 템플릿/헤더 인젝션 |
| `next-quality.yaml` | 코드 품질 | 4 | `<img>` 태그, console.log, 파일 업로드 검증 누락, FormData Zod 미검증 |

공식 레지스트리 `p/typescript` 규칙도 함께 실행한다.

### 8.3 Tailwind CSS v4 검증 전략

`eslint-plugin-better-tailwindcss`로 v4 완전 지원을 확보했다.

**기계적 검증 범위**:
- ✅ **알 수 없는 클래스 탐지**: `no-unknown-classes` — 존재하지 않는 Tailwind 유틸리티 감지
- ✅ **모순 클래스 탐지**: `no-conflicting-classes` — 상충하는 클래스 조합 감지
- ✅ **중복 클래스**: `no-duplicate-classes` — 동일 클래스 반복 감지
- ✅ **불필요한 공백**: `no-unnecessary-whitespace` — className 내 불필요한 공백
- ✅ **클래스 정렬**: `prettier-plugin-tailwindcss` (Tailwind Labs 공식, v4 호환)

> 실제 탐지 예: `max-w-8xl` (미존재 클래스), `scrollbar-hide` (비표준) — ESLint warn으로 즉시 확인.

### 8.4 npm 스크립트

```json
{
  "typecheck": "tsc --noEmit",
  "lint": "eslint",
  "lint:fix": "eslint --fix",
  "format": "prettier --write 'src/**/*.{ts,tsx}'",
  "format:check": "prettier --check 'src/**/*.{ts,tsx}'",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "security:semgrep": "semgrep --config .semgrep/ --config p/typescript src/ --no-git-ignore --error",
  "verify": "npm run typecheck && npm run lint && npm run format:check && npm run test && npm run security:semgrep && npm run build"
}
```

---

## 9. 검증 계층 설계

### 9.1 검증 레이어

```
Layer 1 — 즉시, 자동 (Hooks)
├── PreToolUse(Edit|Write): 보호 파일 차단 (.env, package-lock.json, tsconfig.json)
└── PostToolUse(Edit|Write): Prettier 자동 포맷팅 + ESLint 검사 (.ts/.tsx)

Layer 2 — 명시적 실행, 결정론적
├── tsc --noEmit
├── ESLint (boundaries + react + a11y + @vitest/eslint-plugin + better-tailwindcss)
├── Prettier --check (+ prettier-plugin-tailwindcss 클래스 정렬)
├── Vitest + jsdom
├── Semgrep (커스텀 14규칙 + p/typescript)
└── npm run build

Layer 3 — 명시적 실행, 의미론적 (AI)
├── reviewer (structure): 의존성 방향, "use client" 범위, any 타입, 시맨틱 HTML
├── reviewer (image): next/image 미전환, CLS 위험, sizes/priority 정책
├── reviewer (seo): robots/sitemap, JSON-LD, 헤딩 계층, 메타데이터
├── reviewer (logic): 서버 액션 오류 처리, 엣지 케이스, 비동기 패턴
└── security-reviewer: XSS, 서버 액션 인가 누락, RLS 우회, 시크릿 노출

Layer 4 — 명시적 실행, 브라우저 (기능 + 성능)
├── Playwright .spec.ts: 결정론적 E2E 회귀 테스트 (CI)
├── Playwright MCP: 탐색적 E2E + 테스트 스캐폴딩 생성 (ad-hoc)
└── browser_evaluate: Core Web Vitals 측정 (LCP, CLS, FCP)
```

### 9.2 역할 경계

| 관심사 | 기계적 도구 | AI 리뷰어 |
|--------|-------------|-----------|
| 코드 스타일/포맷 | ESLint, Prettier | 검토하지 않음 |
| 타입 안전성 | tsc --noEmit | 검토하지 않음 |
| trivial assertion | @vitest/eslint-plugin | 검토하지 않음 |
| 알려진 보안 패턴 | Semgrep (커스텀 + p/typescript) | security-reviewer (커스텀 위협 시나리오) |
| 의존성 방향 | ESLint boundaries | reviewer/structure (심층 분석) |
| 컴포넌트 설계 | — | reviewer/structure |
| 이미지 최적화 | — | reviewer/image |
| SEO 규칙 | — | reviewer/seo |
| 로직 정확성 / 엣지 케이스 | — | reviewer/logic |
| 웹 보안 취약점 | Semgrep (DIHH, env, redirect, injection) | security-reviewer (인가 로직, RLS 우회) |
| E2E 회귀 테스트 | Playwright .spec.ts (CI) | — |
| E2E 탐색적 테스트 | Playwright MCP (ad-hoc) | — |
| Core Web Vitals | browser_evaluate (Performance API) | — |
| 빌드 성공 | npm run build | — |

---

## 10. 브라우저 테스트 자동화

### 10.1 테스트 전략 포지셔닝

| 용도 | 방식 | 비고 |
|------|------|------|
| **회귀 테스트** (핵심 플로우) | `__tests__/e2e/*.spec.ts` → CI | 결정론적, 반복 가능. 실패 시 배포 차단 |
| **탐색적 테스트** (신규 기능 검증) | Playwright MCP (ad-hoc) | 비결정론적이지만 빠른 피드백. 발견 후 .spec.ts로 승격 |
| **테스트 스캐폴딩** | MCP → .spec.ts 초안 생성 → 수동 보강 | MCP가 탐색한 흐름을 코드로 변환 |
| **Core Web Vitals** | `browser_evaluate` (Performance API) | 단일 실행. 정밀 측정은 Lighthouse CI 권장 |

> **MCP 단독 테스트의 한계**: 비결정론적(같은 프롬프트 → 다른 결과), 토큰 4배 오버헤드, 회귀 보장 불가. 따라서 MCP는 발견 도구이지 회귀 방지 도구가 아니다.

### 10.2 @playwright/mcp 도구 체계

`@playwright/mcp`는 Microsoft 공식 MCP 서버로, Claude Code가 `browser_*` 도구를 통해 실제 Chromium 브라우저를 직접 조작한다.

**Snapshot 모드 (기본값, 권장)**

접근성 트리(DOM 구조) 기반으로 동작. 비전 모델 불필요, 토큰 효율 높음. 표준 HTML/React 컴포넌트 기반인 이 프로젝트에 적합.

| 도구 | 기능 |
|------|------|
| `browser_navigate` | URL 이동 |
| `browser_click` / `browser_fill` / `browser_type` | 요소 조작 |
| `browser_snapshot` | 접근성 트리 스냅샷 (DOM 구조 분석) |
| `browser_take_screenshot` | 시각적 스크린샷 |
| `browser_evaluate` | JavaScript 실행 (Performance API 접근 가능) |
| `browser_wait` | 텍스트 출현/사라짐 대기 |
| `browser_generate_playwright_test` | 조작 과정을 `.spec.ts`로 자동 변환 |

**프로젝트 등록 (`.mcp.json`)**:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--browser", "chromium",
        "--caps", "testing,network,devtools"
      ]
    }
  }
}
```

등록 명령: `claude mcp add playwright --scope project -- npx @playwright/mcp@latest --headless`

### 10.3 /w-browser-test 스킬 설계

3단계 파이프라인으로 구성한다:

```
Phase 1 — E2E 기능 검증 (Playwright MCP)
  browser_navigate로 주요 페이지 순회:
  - 홈페이지: 히어로 섹션 렌더링, 서비스 목록 로딩
  - 견적문의: 폼 입력 → 제출 플로우 검증
  - 관리자: 미인증 접근 시 리다이렉트 확인
  - 전체 페이지: 404/500 오류 없음 확인

Phase 2 — Core Web Vitals 측정 (browser_evaluate)
  Performance Observer API 실행:
  - LCP, CLS, FCP, TTFB 수집
  - 임계값 초과 시 경고 리포트 생성

Phase 3 — 리포트 생성
  결과를 .claude/reports/browser-test-latest.json 저장
  .claude/reports/browser-test-latest.md (한국어) 생성
```

### 10.4 Core Web Vitals 목표값

| 지표 | 양호 | 개선 필요 | 불량 | 검사 방법 |
|------|------|-----------|------|-----------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5~4.0s | > 4.0s | browser_evaluate + Lighthouse |
| INP (Interaction to Next Paint) | ≤ 200ms | 200~500ms | > 500ms | Lighthouse |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1~0.25 | > 0.25 | browser_evaluate + Lighthouse |
| FCP (First Contentful Paint) | ≤ 1.8s | 1.8~3.0s | > 3.0s | browser_evaluate + Lighthouse |

### 10.5 Lighthouse CI 통합

PR마다 성능 회귀를 자동 감지한다. `lighthouserc.json`으로 임계값을 설정하고 GitHub Actions에 통합한다.

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000", "http://localhost:3000/services"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "first-contentful-paint": ["warn", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "interactive": ["warn", {"maxNumericValue": 3500}]
      }
    }
  }
}
```

### 10.6 파이프라인 통합 위치

```
/w-plan → /w-develop → /w-audit → /w-browser-test
                           │              │
                        코드 검증      최종 E2E + 성능
                        (정적 분석,    (Playwright 기능 검증
                         AI 리뷰)      Lighthouse Core Web Vitals)
```

`/w-audit`는 코드 정확성을 검증하고, `/w-browser-test`는 실제 브라우저 환경에서 사용자 관점의 동작과 성능을 최종 검증한다. 두 단계는 서로 다른 것을 보는 보완 관계다.

---

## 11. 테스트 전략

### 11.1 테스트 피라미드

```
          ┌──────────────┐
          │   Browser    │  Playwright E2E + Lighthouse CI (/w-browser-test)
          │   Testing    │
         ─┴──────────────┴─
        ┌──────────────────┐
        │ Semantic Review  │  AI 리뷰 에이전트 (audit Phase 2)
       ─┴──────────────────┴─
      ┌──────────────────────┐
      │  HTTP Integration    │  MSW + Vitest (Supabase API 경계)
     ─┴──────────────────────┴─
    ┌──────────────────────────┐
    │      Unit Tests          │  Vitest (components, shared/lib, server actions)
   ─┴──────────────────────────┴─
  ┌────────────────────────────────┐
  │       Static Analysis          │  tsc, ESLint(@vitest), Prettier, Semgrep
  └────────────────────────────────┘
```

### 11.2 계층별 개요

| Tier | 범위 | 도구 | 실행 시점 |
|------|------|------|-----------|
| Static Analysis | 타입, 스타일, Tailwind 클래스, 보안 패턴, trivial assertion | tsc, ESLint(+better-tailwindcss, +@vitest), Prettier, Semgrep(14규칙) | 매 편집 후 |
| Unit Test | shared/lib, server actions, 컴포넌트 | Vitest + jsdom | 매 변경 후 |
| HTTP Integration | Supabase API 전체 사이클 | MSW + Vitest | /w-verify, /w-audit |
| Semantic Review | 아키텍처, 로직, 보안, SEO, 이미지 | AI 리뷰 에이전트 | /w-audit Phase 2 |
| Browser Testing | E2E 기능 검증, Core Web Vitals | Playwright MCP + Lighthouse | /w-browser-test (최종 단계) |

### 11.3 테스트 우선순위

| 모듈 | 중요도 | 근거 |
|------|--------|------|
| `src/shared/actions/` | 최고 | 서버 액션은 데이터 변형 경계. 오류 시 데이터 무결성 훼손 |
| `src/shared/lib/` (Supabase client) | 최고 | Auth + API 통신 오류 시 모든 기능 중단 |
| `src/components/` (forms) | 높음 | 사용자 입력 검증, 오류 처리 |
| `src/app/admin/` | 높음 | CRUD 작업, 인증 보호 |
| `src/components/` (display) | 중간 | 주로 표현 컴포넌트, 리스크 낮음 |

---

## 12. Hooks 설정

```jsonc
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/protect-files.sh" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/lint-format-check.sh" }]
      }
    ]
  }
}
```

| Hook | 트리거 | 동작 | 목적 |
|------|--------|------|------|
| PreToolUse (Edit\|Write) | 파일 쓰기 전 | `.env*`, `package-lock.json`, `tsconfig.json` 차단 (exit 2) | 보호 파일 보호 |
| PostToolUse (Edit\|Write) | 파일 쓰기 후 | `.ts/.tsx`에 Prettier --write 후 ESLint --quiet | 자동 포맷팅 + 즉시 lint |

**Hook 최소화 원칙**: Hook은 매 도구 호출마다 실행된다. tsc, vitest, semgrep, build 등 무거운 검증은 Hook이 아닌 스킬(`/w-verify`, `/w-audit`)로 명시적으로 실행한다.

---

## 13. Worktree 운영 주의사항

`develop-worker`는 `isolation: worktree`로 실행되어 메인 브랜치 오염을 방지한다.

### 13.1 커밋 선행 필수

`isolation: worktree`는 **마지막 커밋 시점의 파일**을 복사한다. 에이전트 정의, 스킬, CLAUDE.md, rules 등을 수정한 후 커밋하지 않으면 worktree의 worker는 **이전 버전의 설정으로 실행**된다.

### 13.2 .gitignore 설계

`.claude/` 내 핵심 설정 파일(agents, rules, skills, hooks, settings.json)은 git에 추적되어야 한다. 런타임 산출물만 무시한다:

```
# 추적: agents/, rules/, skills/, hooks/, settings.json, CLAUDE.md
# 무시: worktrees/, plans/, reports/, memory/, known-failures.md, status.json
```

### 13.3 vitest 안전 설정

- `exclude`에 `.claude/worktrees/**` 포함 필수 — 미포함 시 worktree 내 테스트 중복 탐색으로 OOM
- `testTimeout: 10000` 설정 — worker가 생성한 테스트의 무한 루프 방지

### 13.4 SubagentStart hook

`settings.json`에 `SubagentStart` hook으로 `npm install` 자동 실행 — worktree에는 `node_modules/`가 없으므로 필수.

### 13.5 메모리 제약

각 서브에이전트 프로세스는 수 GB 메모리를 점유한다. **3개 이상 동시 spawn 시** 시스템 메모리 제약을 고려해야 한다.

---

## 14. 디렉터리 구조

```
cleaning-class-frontend/
├── .claude/
│   ├── settings.json              # hooks, permissions 설정
│   ├── rules/
│   │   ├── architecture.md        # src/**/*.{ts,tsx}
│   │   ├── components.md          # src/components/**, src/app/page.tsx
│   │   ├── admin.md               # src/app/admin/**, src/shared/actions/**
│   │   ├── image-policy.md        # src/**/*.tsx, next.config.*
│   │   ├── seo-policy.md          # src/app/**/*.{ts,tsx}, src/shared/lib/**
│   │   ├── shared.md              # src/shared/**
│   │   └── testing.md             # __tests__/**, src/**/*.test.{ts,tsx}
│   ├── agents/
│   │   ├── plan-worker.md         # /w-plan 전용 조사 에이전트 (도메인별 자율 조사 → JSON 보고서 작성)
│   │   ├── develop-worker.md
│   │   ├── reviewer.md            # structure/image/seo/logic 공용 (dynamic prompt)
│   │   └── security-reviewer.md   # Bash 필요 (Semgrep 실행)
│   ├── skills/
│   │   ├── w-plan/SKILL.md
│   │   ├── w-develop/SKILL.md
│   │   ├── w-audit/SKILL.md
│   │   ├── w-review/SKILL.md
│   │   ├── w-verify/SKILL.md
│   │   ├── w-browser-test/SKILL.md
│   │   ├── next-best-practices/   # on-demand 참조 스킬
│   │   ├── vercel-react-best-practices/
│   │   ├── vercel-composition-patterns/
│   │   └── web-design-guidelines/
│   ├── hooks/
│   │   ├── protect-files.sh       # PreToolUse: 보호 파일 차단
│   │   └── lint-format-check.sh   # PostToolUse: Prettier + ESLint
│   ├── CLAUDE.md                  # 프로젝트 컨텍스트 (≤50줄)
│   ├── memory/
│   │   └── MEMORY.md              # 통합 프로젝트 메모리
│   ├── plans/
│   │   ├── active/
│   │   │   ├── PLAN.json          # 기계 판독용 (develop-worker가 읽음)
│   │   │   └── PLAN.md            # 사용자 확인용 (한국어)
│   │   ├── workers/               # plan-worker 도메인별 조사 보고서 ({domain}-report.json)
│   │   └── archive/               # YYYYMMDD-HHmmss/
│   ├── known-failures.md          # 사이클 간 학습: 반복 실패 패턴 기록
│   └── reports/
│       ├── develop-latest.json
│       ├── audit-latest.json
│       ├── audit-latest.md
│       ├── browser-test-latest.json
│       ├── browser-test-latest.md
│       └── archive/
├── .mcp.json                      # Playwright MCP 프로젝트 스코프 등록
├── .prettierrc.json               # Prettier + prettier-plugin-tailwindcss 설정
├── .semgrep/
│   ├── next-server-actions.yaml   # Server Action 안전성 규칙 (4)
│   ├── next-security.yaml         # 웹 보안 규칙 (6)
│   └── next-quality.yaml          # 코드 품질 규칙 (4)
├── lighthouserc.json              # Lighthouse CI 설정
├── .claude/status.json            # 파이프라인 상태 트래커
├── __tests__/
│   ├── architecture/              # 의존성 방향 구조 테스트
│   ├── image/                     # next/image 정책 테스트
│   ├── seo/                       # 헤딩 계층 구조 테스트
│   └── e2e/                       # Playwright E2E 스펙 (.spec.ts)
├── agent-system.md                # 본 문서
└── src/
    ├── app/
    ├── components/
    └── shared/
```

---

## 15. 메모리 시스템

`.claude/memory/` 디렉토리에 타입별 개별 파일 + `MEMORY.md` 인덱스 방식을 사용한다 (Claude Code auto memory 시스템).

| 타입 | 용도 | 예시 |
|------|------|------|
| `user` | 사용자 역할, 선호, 지식 수준 | 역할, 기술 스택 경험 |
| `feedback` | 사용자 교정/확인 사항 | "커밋 전 반드시 확인", "Pretendard CDN 유지" |
| `project` | 진행 중 작업, 목표, 일정 | 마감일, 기능 동결 |
| `reference` | 외부 시스템 포인터 | Linear 프로젝트, Slack 채널 |

`MEMORY.md`는 인덱스 전용 — 200줄 이하 유지. 메모리 본문은 개별 `.md` 파일에 저장.

---

## 16. Fresh Retry Protocol

develop-worker 실패 시 자동 재시도 체계. 서브에이전트는 `/clear`를 호출할 수 없으므로, 새 서브에이전트 spawn으로 구조적 fresh context를 보장한다.

```
spawn #1 실패
  ├── 사소한 수정 (lint, type error): 같은 에이전트에서 계속 (턴 여유 시)
  └── 2회 동일 실패 또는 근본적 오류:
      → spawn #1 종료 + 에러 상세 보고
      → spawn #2 (fresh context + 이전 실패 요약만 전달)
      → spawn #2 실패 → spawn #3 (fresh context + 누적 실패 요약)
      → spawn #3 실패 → BLOCKED 보고
```

**내부 수정 vs 종료 기준**:

| 계속 | 종료 (smoke_check: fail 보고) |
|------|------------------------------|
| 사소한 수정 (lint, type error) + 1-2턴 해결 + 턴 여유 | 동일 유형 에러 2회 이상 실패 |
| | 남은 턴 5턴 미만 |
| | 구현 접근법 자체의 근본적 문제 |

종료 보고에 포함: 에러 메시지 전문, 시도한 접근법, 실패 원인, 변경 파일 목록.

실패 정보는 **요약**으로만 다음 spawn에 전달하여 컨텍스트 오염을 방지한다.

---

## 17. 사이클 간 학습

### 16.1 메커니즘

```
Cycle N: audit에서 반복 패턴 발견 → known-failures.md에 추가
Cycle N+1: 오케스트레이터가 계획 수립 시 읽기 → 패턴 대비 자기 검증
```

### 16.2 known-failures.md 형식

```markdown
# Known Failure Patterns

## F001 — [패턴 이름]
- **Cycle**: [발견 사이클 run_id]
- **Pattern**: [무엇이 발생했는가]
- **Root Cause**: [왜 발생했는가]
- **Prevention**: [어떻게 방지하는가]
- **Recurrence**: 0
```

### 16.3 승격 규칙

| 조건 | 조치 |
|------|------|
| 3회 이상 재발 | `.claude/rules/` 또는 CLAUDE.md로 승격 |
| 프로젝트 전체 보편적 | CLAUDE.md에 추가 |
| 특정 경로 한정 | 해당 rules 파일에 추가 |

---

## 18. 운영 규칙

1. Plan → Develop → Audit 각 단계는 순차 실행이며 **자동 연쇄 실행하지 않는다**.
2. 사용자 승인 없이 plan 범위 외 변경을 수행하지 않는다.
3. Audit 실패 시 동일 단계에서 수정 후 재실행한다. 다음 단계로 진행하지 않는다.
4. 서브에이전트 nested spawn은 금지한다. 리프 워커(`develop-worker`, `reviewer`, `security-reviewer`)는 하위 에이전트를 spawn하지 않는다.
5. 모든 코드 변경 후 최소 `/w-verify` 실행을 보장한다.
6. AI 리뷰 결과의 자동 적용은 금지한다. 반드시 사용자에게 보고 후 승인을 받는다.
7. `critical` severity 발견 시 즉시 보고하고 사용자 결정을 기다린다.
8. 보호 파일(`.env*`, `package-lock.json`, `tsconfig.json`)은 에이전트가 수정하지 않는다. 수동 수정만 허용한다.
9. 오케스트레이터(Current Session)는 dispatch와 결과 수집만 수행한다. 에이전트의 작업(코드 작성, 리뷰 실행)을 직접 대행하지 않는다.
10. definite 항목은 plan에서 제외 불가하다. scope 제외 최종 권한은 사용자에게만 있다.
11. develop-worker 실패 시 Fresh Retry Protocol을 따른다. 동일 work item에서 최대 3 spawn, 그 후 BLOCKED 보고.
12. BLOCKED 또는 반복 실패 패턴은 `known-failures.md`에 기록하고, 3회 재발 시 rules/CLAUDE.md로 승격한다.

---

## 19. 구현 로드맵

### Phase 0: 기반 구축 (완료)
- [x] ESLint v9 flat config (boundaries, react, a11y, no-relative-import-paths)
- [x] TypeScript strict mode
- [x] Vitest + jsdom + 구조 테스트 (8 tests)
- [x] `.claude/` 전체 구조 (settings.json, hooks, agents, skills, rules)
- [x] CLAUDE.md ≤ 50줄
- [x] Commitlint + Husky

### Phase 1: 검증 도구 강화 (완료 — 2026-03-23)
- [x] Prettier + prettier-plugin-tailwindcss 설치 및 설정
- [x] @vitest/eslint-plugin 설치 및 ESLint 통합
- [x] npm 스크립트 정비 (typecheck, format, format:check, test, verify)
- [x] Vitest environment node→jsdom 전환
- [x] 레거시 디렉토리 정리 (reports/{audit,dev,plan}/, archive/legacy/)
- [x] 아카이빙 패턴 통일 (모든 스킬 cp 사용, workers/ 클린업 추가)

### Phase 2: 브라우저 테스트 + CI (완료)
- [x] `.mcp.json` + Playwright MCP 등록
- [x] `/w-browser-test` 스킬 + 아카이빙 로직
- [x] Playwright E2E 스펙 (`__tests__/e2e/home.spec.ts`, `admin-auth.spec.ts`)
- [x] `lighthouserc.json` Core Web Vitals 임계값

### Phase 3: v2 오케스트레이션 개편 (완료 — 2026-03-23)
- [x] 요구사항 분류 체계 (definite/uncertain/not_relevant)
- [x] Gate 검증 (구조적 완전성 + 명세 커버리지)
- [x] Fresh Retry Protocol (최대 3 spawn)
- [x] 사이클 간 학습 (known-failures.md + 승격 규칙)
- [x] 설계 원칙 추가 (#10~14)

### Phase 4: 기계적 검증 완성 (완료 — 2026-03-23)
- [x] Semgrep 설치 (brew) + 커스텀 14규칙 3파일 구축
- [x] eslint-plugin-better-tailwindcss 도입 (v4 완전 호환)
- [x] npm run security:semgrep 스크립트 + verify 통합

### 미완료 / 보류
- [ ] V8 coverage 70% 임계치 설정
- [ ] Core Web Vitals 베이스라인 측정
