---
name: w-review
description: >
  Standalone semantic review. Spawns reviewer instances in parallel without
  running the full mechanical verification pipeline. Use when you want quick
  AI review of code quality, architecture, images, SEO, or security.
  Auto-invoked on "review", "review code", "check quality" related requests.
argument-hint: "[domain: all|structure|image|seo|logic|security]"
allowed-tools: Bash
---

# Review Skill

## Instructions
1. Determine which domains to review from $ARGUMENTS (default: all)
2. Spawn reviewer instances in parallel based on requested domains:

   **structure** — `reviewer` with domain: structure checklist
   → target_paths: src/

   **image** — `reviewer` with domain: image checklist
   → target_paths: src/, next.config.*

   **seo** — `reviewer` with domain: seo checklist
   → target_paths: src/app/, src/shared/lib/

   **logic** — `reviewer` with domain: logic checklist
   → target_paths: src/shared/, src/app/

   **security** — `security-reviewer`
   → target_paths: src/

   (See audit-worker.md for full checklists per domain)

3. Collect and aggregate findings:
   - Deduplicate overlapping findings (keep most specific)
   - Rank by severity: critical > high > medium > low > info
4. Present findings to the user grouped by severity
5. Do NOT auto-fix. Report all findings and await user decision.

## Constraints
- Do NOT run mechanical verification (use /w-verify for that)
- Do NOT auto-apply fixes
- Report `critical` findings immediately before completing the full review
