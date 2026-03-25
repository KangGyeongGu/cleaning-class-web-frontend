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

### Step 0 — Initialization and Reference Document Collection
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

### Step 1 — Determine Relevant Domains and Spawn Parallel plan-workers
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

### Step 2 — Collect Reports and Classify Requirements
Read all spawned worker report files from `.claude/plans/workers/`.

**Validation before synthesis**: If `audit-latest.json` was in `reference_files`, verify that every item in its `open_findings` appears in at least one worker report. If any carry-forward item is missing from all worker reports, add it directly to the work_items as-is — omission is not permitted.

**Requirement Classification Review**: Review each finding's `relevance` classification from workers:
- `definite` items → MUST become work items. Cannot be excluded (only user can exclude).
- `uncertain` items → MUST have an explicit include/exclude decision + reason in `scope_decisions`.
- `not_relevant` items → May be ignored.

**Deduplication**: If the same issue appears in multiple worker reports, merge into one Task Card (keep the more specific description). Track the source domains in the `source` field.

**Task Card decomposition** — each Task Card:
- `id`: `TASK-{DOMAIN}-NNN` (e.g., TASK-SEC-001)
- `objective`: single responsibility — split if a Task Card spans multiple domains
- `owned_paths`: file path list, no overlap between Task Cards
- `depends_on`: id reference list
- `complexity`: low | medium | high
- `criteria`: completion criteria (verifiable items). Max 5. Prefer ≤ 3 changed files.
- `status`: "pending"
- `source`: "structure | image | seo | logic | security | requirements | carry_forward"

**Priority ordering within each Wave**:
1. `error` / `high` / `critical` severity items
2. `medium` / `warning` items
3. `low` / `info` items

Wave rule: items with no `depends_on` or depending only on items within the same Wave are placed in the same Wave.

### Step 2.5 — Gate Verification (self-check)

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

### Step 3 — Save Artifacts
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

**`.claude/plans/active/PLAN.md`** — Korean summary for user review:
- Objective, carry-forward count (`carry_forward_count`)
- In-scope / out-of-scope
- **Highlight excluded items from scope_decisions** — request user review
- Task Card summary (id, objective, owned_paths, criteria, source)
- Execution order (Wave-based)
- Risks, completion criteria

### Step 4 — Await User Approval
Present PLAN.md to the user and request approval.
- Highlight excluded items from scope_decisions for user review
- User may also remove definite items (final authority on scope exclusion)

On approval: update `.claude/status.json` with `stage: "planned"`, `approved_at`.

## Constraints
- Step 1 MUST spawn all plan-workers in a single message (no sequential spawning)
- Current Session does NOT explore the codebase in Step 1
- Current Session does NOT inject checklists into plan-workers — domain knowledge is in the worker definition
- All `open_findings` from `audit-latest.json` must be included — arbitrary exclusion prohibited
- No implementation — planning only
- No source file modifications
- No overlapping owned_paths between Task Cards
