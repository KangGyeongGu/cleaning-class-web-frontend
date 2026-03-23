#!/bin/bash
# PostToolUse hook — Edit/Write 후 .ts/.tsx 파일에 Prettier + ESLint 강제
# exit 0: 통과 / exit 2: 문제 발견 → stderr가 에이전트에 피드백으로 전달
FILE="$CLAUDE_TOOL_ARG_FILE_PATH"
if [ -z "$FILE" ] || ! echo "$FILE" | grep -qE '\.(ts|tsx)$'; then
  exit 0
fi

# 1. Prettier 자동 포맷 (--write로 즉시 수정)
npx prettier --write "$FILE" 2>/dev/null

# 2. ESLint 검사 (error + warning 모두 보고)
#    --max-warnings 0: warning도 실패로 처리 → 에이전트가 수정하도록 강제
LINT_OUTPUT=$(npx eslint --max-warnings 0 "$FILE" 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ] && [ -n "$LINT_OUTPUT" ]; then
  echo "ESLint violations in $FILE — fix all errors and warnings before proceeding:" >&2
  echo "$LINT_OUTPUT" >&2
  exit 2
fi

exit 0
