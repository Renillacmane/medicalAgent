#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Output: "text" = human-readable agent output; "stream-json" = NDJSON (default, for tooling)
# Set RALPH_OUTPUT_FORMAT=text for readable output, or leave unset for stream-json
RALPH_OUTPUT_FORMAT="${RALPH_OUTPUT_FORMAT:-stream-json}"
# Set RALPH_SHOW_FILES=1 to print changed files after each iteration (from last commit)
RALPH_SHOW_FILES="${RALPH_SHOW_FILES:-0}"
# Set RALPH_RUN_TESTS_AFTER=1 to run backend tests after each build iteration and print output (failures will be visible)
RALPH_RUN_TESTS_AFTER="${RALPH_RUN_TESTS_AFTER:-0}"

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
  echo ""
  echo "Environment (optional):"
  echo "  RALPH_OUTPUT_FORMAT — Agent output: stream-json (default) or text (readable)"
  echo "  RALPH_SHOW_FILES    — Set to 1 to print changed files after each iteration"
  echo "  RALPH_RUN_TESTS_AFTER — Set to 1 to run backend tests after each build; failures appear in output"
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

# --- Startup summary ---
echo "[ralph] Setup:"
echo "  REPO_ROOT         = $REPO_ROOT"
echo "  MODE              = $MODE"
echo "  PROMPT_FILE       = $PROMPT_FILE"
echo "  MAX_ITERATIONS    = ${MAX_ITERATIONS:-unlimited}"
echo "  RALPH_OUTPUT_FORMAT = $RALPH_OUTPUT_FORMAT"
echo "  RALPH_SHOW_FILES     = $RALPH_SHOW_FILES"
echo "  RALPH_RUN_TESTS_AFTER = $RALPH_RUN_TESTS_AFTER"
if [[ -n "${CURSOR_API_KEY:-}" ]]; then
  echo "  CURSOR_API_KEY    = (set)"
else
  echo "  CURSOR_API_KEY    = (not set)"
fi
echo "[ralph] Starting loop."
echo ""

ITERATION=0

while true; do
  ITERATION=$((ITERATION + 1))

  if [[ "$MAX_ITERATIONS" -gt 0 && "$ITERATION" -gt "$MAX_ITERATIONS" ]]; then
    echo "[ralph] Reached max iterations ($MAX_ITERATIONS). Stopping."
    break
  fi

  echo "========================================"
  echo "Ralph [$MODE] — Iteration $ITERATION"
  echo "========================================"
  echo "[ralph] Reading prompt from: $PROMPT_FILE"
  PROMPT_LINES=$(wc -l < "$PROMPT_FILE" | tr -d ' ')
  echo "[ralph] Prompt size: $PROMPT_LINES lines"
  echo "[ralph] Submitting request to cursor-agent..."
  echo ""

  if [[ "$MODE" == "plan" ]]; then
    # Planning mode: read-only (no edits)
    cat "$PROMPT_FILE" | cursor-agent --print \
      --mode plan \
      --output-format "$RALPH_OUTPUT_FORMAT" \
      --force
  else
    # Building mode: full agent capabilities (default, no --mode needed)
    cat "$PROMPT_FILE" | cursor-agent --print \
      --output-format "$RALPH_OUTPUT_FORMAT" \
      --force
  fi

  EXIT_CODE=$?

  echo ""
  echo "[ralph] Request completed (exit code: $EXIT_CODE)"

  if [[ $EXIT_CODE -ne 0 ]]; then
    echo "[ralph] Agent exited with code $EXIT_CODE. Stopping."
    exit $EXIT_CODE
  fi

  echo "[ralph] Agent finished successfully."

  # Optionally show files changed in this iteration (from the commit the agent made)
  if [[ "$RALPH_SHOW_FILES" == "1" ]] && [[ -d "$REPO_ROOT/.git" ]]; then
    if git -C "$REPO_ROOT" rev-parse HEAD >/dev/null 2>&1; then
      echo "[ralph] Files in last commit:"
      git -C "$REPO_ROOT" show --name-status --oneline HEAD | sed '1d' | sed 's/^/  /' || true
    fi
  fi

  # Optionally run backend tests after each build iteration so failures are visible in the log
  if [[ "$MODE" == "build" ]] && [[ "$RALPH_RUN_TESTS_AFTER" == "1" ]]; then
    echo "[ralph] Running backend tests (RALPH_RUN_TESTS_AFTER=1)..."
    if (cd "$REPO_ROOT/backend" && npm run test 2>&1); then
      echo "[ralph] Backend tests passed."
    else
      TEST_EXIT=$?
      echo "[ralph] WARNING: Backend tests failed (exit $TEST_EXIT). See output above for failing tests."
    fi
  fi

  echo ""
  echo "[ralph] Iteration $ITERATION complete."
  echo ""
done
