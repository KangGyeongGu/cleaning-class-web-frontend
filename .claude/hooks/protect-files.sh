#!/bin/bash
# PreToolUse hook — block writes to sensitive/generated files
# Exit 2 = block the tool call with error message

FILE="$CLAUDE_TOOL_ARG_FILE_PATH"
if [ -z "$FILE" ]; then exit 0; fi

PROTECTED=(
  ".env"
  ".env.local"
  ".env.production"
  ".env.development"
  "package-lock.json"
  "tsconfig.json"
)

for pattern in "${PROTECTED[@]}"; do
  if [[ "$FILE" == *"$pattern" ]]; then
    echo "BLOCKED: '$FILE' is a protected file. Modify manually if intentional." >&2
    exit 2
  fi
done
