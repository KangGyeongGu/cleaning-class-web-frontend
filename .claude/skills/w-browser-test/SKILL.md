---
name: w-browser-test
description: >
  /w-audit 이후 최종 E2E 검증 단계. Playwright MCP(browser_* 도구)로 실제 Chromium
  브라우저를 조작하여 기능 검증 + Core Web Vitals 측정 + 리포트 생성.
  실행 중인 서버(localhost:3000)가 필요하다.
  Auto-invoked on "브라우저 테스트", "E2E", "성능 측정", "web vitals" related requests.
argument-hint: "[url: http://localhost:3000]"
allowed-tools: Bash
---

# Browser Test Skill

## Position in Pipeline
`/w-audit` 통과 후 실행하는 최종 E2E 검증 단계다.
```
/w-plan → /w-develop → /w-audit → /w-browser-test ← 지금 여기
```

## Instructions

### Phase 0 — 초기화 및 아카이빙
Archive previous reports:
```bash
TS=$(date +%Y%m%d-%H%M%S)
mkdir -p .claude/reports/archive
cp .claude/reports/browser-test-latest.json ".claude/reports/archive/${TS}_browser-test.json" 2>/dev/null || true
cp .claude/reports/browser-test-latest.md   ".claude/reports/archive/${TS}_browser-test.md"   2>/dev/null || true
```

### Phase 0.5 — Playwright CLI 스펙 테스트 (결정론적)
`__tests__/e2e/` 의 spec 파일을 실행한다. 빌드 + 서버 기동을 자동 처리한다.

```bash
npm run test:e2e
```

실패 시 즉시 중단하고 결과를 보고한다. 통과 시 Phase 1로 진행.

### Phase 1 — E2E 기능 검증 (Playwright MCP)
> 서버 확인: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` → 200이 아니면 `npm run build && npm start &` 로 기동 후 진행.

아래 시나리오를 순서대로 실행한다. 각 단계에서 `browser_navigate` → `browser_snapshot` → 결과 기록.

**1-1. 홈페이지 렌더링**
- `browser_navigate` → `http://localhost:3000`
- `browser_snapshot` → 히어로 섹션 텍스트 존재 확인
- `browser_snapshot` → 서비스 목록 카드 렌더링 확인
- `browser_snapshot` → 404/500 오류 텍스트 없음 확인

**1-2. 서비스 페이지**
- `browser_navigate` → `http://localhost:3000/services` (존재하는 경우)
- 페이지 정상 렌더링 확인

**1-3. 견적문의 폼 플로우**
- `browser_navigate` → 견적문의 섹션 또는 페이지
- `browser_fill` → 이름, 연락처, 메시지 필드 입력
- 제출 버튼 활성화 상태 확인 (클릭은 선택 사항 — 실제 이메일 발송 방지)

**1-4. 관리자 접근 제어**
- `browser_navigate` → `http://localhost:3000/admin`
- 미인증 상태에서 로그인 페이지 또는 리다이렉트 확인

**1-5. 스크린샷 저장**
- 각 주요 페이지 `browser_take_screenshot` → `.claude/reports/screenshots/` 저장

### Phase 2 — Core Web Vitals 측정 (browser_evaluate)

홈페이지(`/`)에서 Performance Observer API를 실행하여 지표를 수집한다.

```javascript
// LCP 측정
new Promise(resolve => {
  new PerformanceObserver(list => {
    const entries = list.getEntries();
    resolve(entries[entries.length - 1].startTime);
  }).observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => resolve(null), 5000);
})
```

```javascript
// CLS 측정
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
// FCP 측정
performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null
```

**임계값 평가**:

| 지표 | 양호 | 경고 | 불량 |
|------|------|------|------|
| LCP  | ≤ 2500ms | ≤ 4000ms | > 4000ms |
| CLS  | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| FCP  | ≤ 1800ms | ≤ 3000ms | > 3000ms |

### Phase 3 — 리포트 생성

결과를 두 파일로 저장한다:

**`.claude/reports/browser-test-latest.json`** (영문 기계가독 형식):
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

**`.claude/reports/browser-test-latest.md`** (한국어 사용자 리포트):
```markdown
# 브라우저 테스트 결과 — YYYY-MM-DD

## 종합 결과: PASS | FAIL

## E2E 기능 검증
| 시나리오 | 결과 | 비고 |
|----------|------|------|
| 홈페이지 렌더링 | ✅ pass | ... |
...

## Core Web Vitals
| 지표 | 측정값 | 평가 |
|------|--------|------|
| LCP  | Nms | ✅ 양호 |
...

## 권장 조치
(불량/경고 지표에 대한 권장 조치)
```

## Constraints
- 견적문의 폼 실제 제출 금지 (실제 이메일 발송 방지)
- 스크린샷은 `.claude/reports/screenshots/` 에만 저장
- 결과 해석 후 사용자에게 요약 보고. 자동 수정 금지
