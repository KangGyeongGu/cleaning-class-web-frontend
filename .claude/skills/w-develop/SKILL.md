---
name: w-develop
description: >
  Development execution. Dispatches develop-workers per Task Card from the
  approved plan and runs the verification pipeline (Wave Gate + Final Gate).
  Auto-invoked on "develop", "implement", "build" related requests.
argument-hint: "[task-id or empty for all]"
allowed-tools: Read, Write, Bash, Agent
---

# Develop Skill

## Prerequisites
- `.claude/plans/active/PLAN.json` required — if missing, BLOCKED → "Run /w-plan first"

## Instructions
1. Read `.claude/plans/active/PLAN.json`
2. Read `.claude/known-failures.md` (if exists — include relevant patterns in worker prompts)
3. Parse work_items and execution_order (Waves)
4. For each Wave:
   a. Spawn `develop-worker` for each Task Card in the Wave (parallel within wave)
      - Dynamic prompt: Task Card info only (id, objective, owned_paths, criteria)
      - Include relevant known failure patterns if applicable
      - Domain rules auto-injected by path-specific `.claude/rules/`
   b. **Fresh Retry Protocol** on failure:
      - spawn #1 failure with minor issue (lint, type error) + turns remaining → continue in same agent
      - spawn #1 failure with same error 2x OR fundamental issue → terminate + collect error report
      - spawn #2 (fresh context + previous failure SUMMARY only — not full error log)
      - spawn #2 failure → spawn #3 (fresh context + cumulative failure summary)
      - spawn #3 failure → BLOCKED for this work item
   c. **Worktree Collect & Cleanup**: develop-worker는 `isolation: worktree`로 실행됨.
      - 각 워커 완료 후 worktreePath가 반환되면 변경 파일을 메인 작업 디렉토리로 복사
      - 복사 완료 후 즉시 정리:
        ```bash
        rm -rf .claude/worktrees/agent-*
        git worktree prune
        git branch --list 'worktree-agent-*' | xargs -r git branch -D
        ```
      - 이 정리는 Wave Gate 실행 전에 반드시 완료해야 함 (worktree 잔여물이 eslint/semgrep 스캔에 포함되는 것을 방지)
   d. **Wave Gate**: `npx tsc --noEmit && npx vitest run && semgrep --config=auto --config=.semgrep/ src/`
      - On failure: apply Fresh Retry Protocol for affected Task
5. **Final Gate**:
   a. `npm run build` — production build verification
   b. Spawn reviewer instances in parallel (structure / image / seo / logic / security — all 5 domains)
   c. On critical/high violation: re-spawn develop-worker for affected files (max 2 feedback loops)
5. Archive previous report if exists:
   ```bash
   TS=$(date +%Y%m%d-%H%M%S)
   mkdir -p .claude/reports/archive
   cp .claude/reports/develop-latest.json ".claude/reports/archive/${TS}_develop.json" 2>/dev/null || true
   ```
6. Write `.claude/reports/develop-latest.json` (machine-readable, English JSON)
7. Update `.claude/status.json`: set `stage: "developed"`, `develop.completed_at`, `develop.verdict`
8. Update `.claude/memory/MEMORY.md` with new lessons learned

## Verification Pipeline
```
Stage 1 (per-file)   PreToolUse hook  → block protected files (.env, package-lock.json)
                     PostToolUse hook → Prettier --write + ESLint per .ts/.tsx file
Stage 2 (per-wave)   tsc --noEmit + vitest run + semgrep
Stage 3 (final)      npm run build + reviewer ×4 in parallel (structure|image|seo|logic)
```

## Constraints
- Do not perform work outside the approved plan
- Do not skip verification stages
- Fresh Retry Protocol: max 3 spawns per work item. After 3rd failure → BLOCKED
- Pass only failure SUMMARIES to fresh spawns — not full error logs (prevent context pollution)
- Record BLOCKED items with: error message, attempted approaches, failure cause, changed files
