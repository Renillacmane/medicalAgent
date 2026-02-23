#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="${1:-}"
MAX_ITERATIONS="${2:-0}"
API_KEY_ARG="${3:-}"

if [[ -n "$API_KEY_ARG" ]]; then
  export CURSOR_API_KEY="$API_KEY_ARG"
  echo "Using CURSOR_API_KEY from argument"
fi

if [[ "$MODE" != "plan" && "$MODE" != "build" ]]; then
  echo "Usage: $0 <plan|build> [max_iterations] [cursor_api_key]"
  echo ""
  echo "  plan   — Gap analysis only; updates IMPLEMENTATION_PLAN.md (no code changes)"
  echo "  build  — Implements one task per iteration, validates, and commits"
  echo ""
  echo "  max_iterations — Optional. 0 = unlimited (default)"
  echo "  cursor_api_key — Optional. Pass Cursor API key if not in env (e.g. from .zshrc)"
  exit 1
fi

if [[ "$MODE" == "plan" ]]; then
  PROMPT_FILE="$SCRIPT_DIR/PROMPT_plan.md"
else
  PROMPT_FILE="$SCRIPT_DIR/PROMPT_build.md"
fi

if [[ ! -f "$PROMPT_FILE" ]]; then
  echo "Error: Prompt file not found: $PROMPT_FILE"
  exit 1
fi

echo "Prompt file: $PROMPT_FILE"

ITERATION=0

while true; do
  ITERATION=$((ITERATION + 1))

  if [[ "$MAX_ITERATIONS" -gt 0 && "$ITERATION" -gt "$MAX_ITERATIONS" ]]; then
    echo "Reached max iterations ($MAX_ITERATIONS). Stopping."
    break
  fi

  echo "========================================"
  echo "Ralph [$MODE] — Iteration $ITERATION"
  echo "========================================"

  if [[ "$MODE" == "plan" ]]; then
    # Planning mode: read-only (no edits)
    cat "$PROMPT_FILE" | cursor-agent --print \
      --mode plan \
      --output-format stream-json \
      --force
  else
    # Building mode: full agent capabilities (default, no --mode needed)
    cat "$PROMPT_FILE" | cursor-agent --print \
      --output-format stream-json \
      --force
  fi

  EXIT_CODE=$?

  if [[ $EXIT_CODE -ne 0 ]]; then
    echo "Agent exited with code $EXIT_CODE. Stopping."
    exit $EXIT_CODE
  fi

  echo ""
  echo "Iteration $ITERATION complete."
  echo ""
done
