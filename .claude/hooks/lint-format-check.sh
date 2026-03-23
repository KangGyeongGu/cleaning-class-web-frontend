#!/bin/bash
# PostToolUse hook — Edit/Write 후 .ts/.tsx 파일에만 Prettier 자동 포맷 + ESLint 검사
FILE="$CLAUDE_TOOL_ARG_FILE_PATH"
if [ -n "$FILE" ] && echo "$FILE" | grep -qE '\.(ts|tsx)$'; then
  npx prettier --write "$FILE" 2>/dev/null
  npx eslint --quiet "$FILE" 2>&1
fi
