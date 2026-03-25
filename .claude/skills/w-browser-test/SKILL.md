---
name: w-browser-test
description: >
  Final E2E verification after /w-audit. Uses Playwright MCP (browser_* tools) to
  drive a real Chromium browser for functional testing + Core Web Vitals measurement
  + report generation. Requires a running server (localhost:3000).
  Auto-invoked on "browser test", "E2E", "performance measurement", "web vitals" related requests.
argument-hint: "[url: http://localhost:3000]"
allowed-tools: Bash
---

# Browser Test Skill

## Position in Pipeline
Final E2E verification step after `/w-audit` passes.
```
/w-plan → /w-develop → /w-audit → /w-browser-test ← you are here
```

## Instructions

### Phase 0 — Initialization and Archiving
Archive previous reports:
```bash
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p .claude/reports/archive
cp .claude/reports/browser-test-latest.json ".claude/reports/archive/${TS}_browser-test.json" 2>/dev/null || true
cp .claude/reports/browser-test-latest.md   ".claude/reports/archive/${TS}_browser-test.md"   2>/dev/null || true
```

### Phase 0.5 — Playwright CLI Spec Tests (deterministic)
Run spec files in `__tests__/e2e/`. Build + server startup are handled automatically.

```bash
npm run test:e2e
```

On failure: stop immediately and report results. On pass: proceed to Phase 1.

### Phase 1 — E2E Functional Verification (Playwright MCP)
> Server check: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` → if not 200, run `npm run build && npm start &` then proceed.

Execute the following scenarios in order. For each step: `browser_navigate` → `browser_snapshot` → record result.

**1-1. Homepage Rendering**
- `browser_navigate` → `http://localhost:3000`
- `browser_snapshot` → verify hero section text exists
- `browser_snapshot` → verify service list cards render
- `browser_snapshot` → confirm no 404/500 error text

**1-2. Service Page**
- `browser_navigate` → `http://localhost:3000/services` (if exists)
- Verify page renders correctly

**1-3. Contact Form Flow**
- `browser_navigate` → contact/quote section or page
- `browser_fill` → name, phone, message fields
- Verify submit button is enabled (click is optional — prevent actual email send)

**1-4. Admin Access Control**
- `browser_navigate` → `http://localhost:3000/admin`
- Verify unauthenticated state shows login page or redirect

**1-5. Screenshot Capture**
- `browser_take_screenshot` for each major page → save to `.claude/reports/screenshots/`

### Phase 2 — Core Web Vitals Measurement (browser_evaluate)

Run Performance Observer API on the homepage (`/`) to collect metrics.

```javascript
// LCP measurement
new Promise(resolve => {
  new PerformanceObserver(list => {
    const entries = list.getEntries();
    resolve(entries[entries.length - 1].startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => resolve(null), 5000);
})
```

```javascript
// CLS measurement
new Promise(resolve => {
  let clsValue = 0;
  new PerformanceObserver(list => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) clsValue += entry.value;
    }
    resolve(clsValue);
  }).observe({ type: 'layout-shift', buffered: true });
  setTimeout(() => resolve(clsValue), 5000);
})
```

```javascript
// FCP measurement
performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null
```

**Threshold evaluation**:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP    | ≤ 2500ms | ≤ 4000ms | > 4000ms |
| CLS    | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| FCP    | ≤ 1800ms | ≤ 3000ms | > 3000ms |

### Phase 3 — Report Generation

Save results to two files:

**`.claude/reports/browser-test-latest.json`** (English, machine-readable):
```json
{
  "timestamp": "ISO8601",
  "baseUrl": "http://localhost:3000",
  "e2e": {
    "scenarios": [
      {"name": "homepage", "status": "pass|fail", "notes": "..."}
    ],
    "passed": 0,
    "failed": 0
  },
  "webVitals": {
    "lcp": {"value": 0, "unit": "ms", "rating": "good|needs-improvement|poor"},
    "cls": {"value": 0, "unit": "", "rating": "good|needs-improvement|poor"},
    "fcp": {"value": 0, "unit": "ms", "rating": "good|needs-improvement|poor"}
  },
  "verdict": "pass|fail"
}
```

**`.claude/reports/browser-test-latest.md`** (Korean, user report):
```markdown
# Browser Test Results — YYYY-MM-DD

## Overall Verdict: PASS | FAIL

## E2E Functional Verification
| Scenario | Result | Notes |
|----------|--------|-------|
| Homepage rendering | ✅ pass | ... |
...

## Core Web Vitals
| Metric | Value | Rating |
|--------|-------|--------|
| LCP    | Nms   | ✅ good |
...

## Recommended Actions
(Recommended actions for poor/needs-improvement metrics)
```

## Constraints
- Do NOT actually submit the contact form (prevent real email sends)
- Save screenshots only to `.claude/reports/screenshots/`
- Interpret results and summarize to user. No automatic fixes.
