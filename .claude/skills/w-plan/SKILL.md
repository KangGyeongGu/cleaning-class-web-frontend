---
name: w-plan
description: >
  Task planning. Spawns parallel plan-worker agents per domain — workers receive
  user requirements and reference documents, independently investigate the codebase,
  and write JSON reports. Current Session synthesizes reports into Task Cards.
  Auto-invoked on "plan", "design", "decompose" related requests.
argument-hint: "[objective]"
allowed-tools: Read, Bash, Write, Agent
---

# Plan Skill

## Instructions

### Step 0 — 초기화 및 참조 문서 수집
1. Read `.claude/CLAUDE.md` for project rules and tech stack.
2. Read `agent-system.md` for system design reference.
3. Read `.claude/known-failures.md` (if exists — failure patterns to check against during planning).
4. Collect `reference_files` — files to pass to every plan-worker:
   - `.claude/reports/audit-latest.json` (if exists — workers must carry forward all `open_findings`)
   - Any spec files, requirements docs, or design references the user mentioned
   - `README.md` (project overview)
5. Archive existing active plan (if any):
   ```bash
   TS=$(date +%Y%m%d-%H%M%S)
   mkdir -p ".claude/plans/archive/${TS}"
   cp .claude/plans/active/PLAN.json ".claude/plans/archive/${TS}/PLAN.json" 2>/dev/null || true
   cp .claude/plans/active/PLAN.md   ".claude/plans/archive/${TS}/PLAN.md"   2>/dev/null || true
   rm -f .claude/plans/workers/*-report.json 2>/dev/null || true
   mkdir -p .claude/plans/active
   mkdir -p .claude/plans/workers
   ```

### Step 1 — 관련 도메인 판단 및 병렬 plan-worker 조사
Based on the user's objective and `reference_files`, determine which domains are relevant. Spawn only the relevant `plan-worker` agents.

**Available domains and when to spawn**:
| domain | spawn when |
|--------|-----------|
| `structure` | architectural changes, new components, refactoring, dependency issues |
| `image` | any page/component changes that affect images or media |
| `seo` | metadata, page structure, routing, or content changes |
| `logic` | server actions, DB calls, async patterns, form handling |
| `security` | file upload, auth, user input handling, email, env vars |
| `requirements` | new features, objective has spec/design docs to analyze |

If `audit-latest.json` has `open_findings` in a domain not otherwise relevant, include that domain's worker to handle carry-forward items.

Spawn selected workers in a **single message** (parallel). Do NOT explore the codebase yourself.

Pass to each worker:
- `domain`: the domain it is responsible for
- `objective`: the user's full requirements text (verbatim)
- `reference_files`: the list collected in Step 0

Each worker independently investigates its domain and writes its report to `.claude/plans/workers/{domain}-report.json`.

Wait for all spawned workers to complete before proceeding.

### Step 2 — 보고서 수집 및 요구사항 분류
Read all spawned worker report files from `.claude/plans/workers/`.

**Validation before synthesis**: If `audit-latest.json` was in `reference_files`, verify that every item in its `open_findings` appears in at least one worker report. If any carry-forward item is missing from all worker reports, add it directly to the work_items as-is — omission is not permitted.

**Requirement Classification Review**: Review each finding's `relevance` classification from workers:
- `definite` items → MUST become work items. Cannot be excluded (only user can exclude).
- `uncertain` items → MUST have an explicit include/exclude decision + reason in `scope_decisions`.
- `not_relevant` items → May be ignored.

**Deduplication**: If the same issue appears in multiple worker reports, merge into one Task Card (keep the more specific description). Track the source domains in the `source` field.

**Task Card 분해** — each Task Card:
- `id`: `TASK-{DOMAIN}-NNN` (예: TASK-SEC-001)
- `objective`: 단일 책임 — 한 Task Card가 여러 도메인에 걸치면 분리
- `owned_paths`: 파일 경로 목록, Task Card 간 중복 없음
- `depends_on`: id 참조 목록
- `complexity`: low | medium | high
- `criteria`: 완료 기준 (검증 가능한 항목). 5개 이하. 변경 파일 3개 이하 권장.
- `status`: "pending"
- `source`: "structure | image | seo | logic | security | requirements | carry_forward"

**Priority ordering within each Wave**:
1. `error` / `high` / `critical` severity items
2. `medium` / `warning` items
3. `low` / `info` items

Wave 규칙: `depends_on`이 없거나 같은 Wave 내 Task만 의존하는 경우 동일 Wave에 배치.

### Step 2.5 — Gate 검증 (자기 검증)

Before writing output, verify the plan passes both gates:

**Gate 1 — Structural Completeness**:
- Every work item has: objective, owned_paths, criteria
- DAG validity: no circular dependencies
- No overlapping owned_paths between work items
- Work item size: criteria ≤ 5, changed files ≤ 3 recommended

**Gate 2 — Spec Coverage** (mechanical enforcement):
- Step 1: Every `definite` finding across all worker reports appears in `requirements_mapped`
- Step 2: Every `uncertain` finding has an include/exclude decision + reason in `scope_decisions`
- Step 3: If `.claude/known-failures.md` exists, `known_failures_checked` is non-empty

On Gate failure: fix the plan and re-verify. Do not proceed to Step 3 until both gates pass.

### Step 3 — 산출물 저장
**`.claude/plans/active/PLAN.json`**:
```json
{
  "run_id": "YYYYMMDD-HHmmss",
  "created_at": "ISO8601",
  "objective": "string",
  "carry_forward_count": 0,
  "work_items": [
    {
      "id": "TASK-{DOMAIN}-NNN",
      "objective": "string",
      "owned_paths": ["src/..."],
      "depends_on": [],
      "complexity": "low | medium | high",
      "criteria": ["string"],
      "status": "pending",
      "source": "string"
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
  "approved_at": null
}
```

**`.claude/plans/active/PLAN.md`** — 사용자 검토용 한국어 요약:
- 목표, 이월 항목 수 (`carry_forward_count`)
- 범위 / 비범위
- **scope_decisions의 exclude 항목을 별도 표시** → 사용자 검토 요청
- Task Card 요약 (id, objective, owned_paths, criteria, source)
- 실행 순서 (Wave 기반)
- 리스크, 완료 기준

### Step 4 — 사용자 승인 대기
PLAN.md를 사용자에게 제시하고 승인을 요청한다.
- scope_decisions에서 exclude된 항목을 별도 표시하여 사용자 검토 요청
- 사용자가 definite 항목도 직접 제거 가능 (scope 제외 최종 권한)

승인 시: `.claude/status.json`의 `stage: "planned"`, `approved_at` 갱신.

## Constraints
- Step 1은 반드시 단일 메시지에서 모든 plan-worker를 병렬 spawn (순차 spawn 금지)
- Current Session은 Step 1에서 코드베이스를 직접 탐색하지 않는다
- Current Session은 plan-worker에게 체크리스트를 주입하지 않는다 — 도메인 지식은 plan-worker가 보유
- `audit-latest.json`의 `open_findings`는 전량 포함 필수 — 임의 제외 금지
- 구현 시작 금지
- 소스 파일 수정 금지
- owned_paths 중복 금지
