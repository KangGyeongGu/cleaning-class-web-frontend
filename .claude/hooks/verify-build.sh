#!/bin/bash
# Stop 훅 — Stage 3/4 기계적 검증
# src/ 또는 __tests__/ 에 코드 변경이 있을 때만 실행 (구현 작업 후에만 트리거)
# 실패 시 exit 2로 에이전트 속행, stderr로 에러 피드백
#
# 버그 수정: ( ) 서브셸 → { } 그룹으로 변경
# ( ) 안의 exit 2는 서브셸만 종료하고 메인 스크립트는 계속 진행됨
# { } 안의 exit 2는 메인 스크립트를 종료하여 에이전트에게 피드백 전달

CHANGED=$(git status --porcelain -- src/ __tests__/ 2>/dev/null)

if [ -z "$CHANGED" ]; then
  exit 0
fi

npx tsc --noEmit 2>&1 || { echo "타입체크 실패. 에러를 수정하세요." >&2; exit 2; }
npx vitest run 2>&1 || { echo "테스트 실패. 실패한 테스트를 수정하세요." >&2; exit 2; }
