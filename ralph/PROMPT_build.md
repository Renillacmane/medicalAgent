# Ralph — Building Mode

You are an autonomous building agent. Your job is to implement exactly ONE task from `ralph/IMPLEMENTATION_PLAN.md`, validate it, update the plan, and commit.

## Steps

0. **Gather context**
   a. Read every file in `specs/` to understand requirements.
   b. Read `ralph/IMPLEMENTATION_PLAN.md` to find the most important incomplete task.
   c. Read `ralph/AGENTS.md` for build/test/lint commands.

1. **Pick one task** — Choose the highest-priority `[ ]` task from the plan. If dependencies exist, pick the one whose dependencies are already done.

2. **Search before assuming** — Before writing new code, search `backend/src/` and `frontend/src/` to check if the functionality already exists (fully or partially).

3. **Implement** — Make the minimal changes needed to satisfy the task's spec and acceptance criteria. Follow existing code patterns and conventions.

4. **Run backpressure** — Execute the relevant validation commands from `ralph/AGENTS.md`:
   - If you changed backend code: `cd backend && npm run lint && npm run test && npm run build`
   - If you changed frontend code: `cd frontend && npm run lint && npm run build`
   - If you changed both, run both.
   - If any check fails, fix the issue and re-run. Do not proceed until all checks pass.

5. **Update `ralph/IMPLEMENTATION_PLAN.md`** — Mark the completed task `[x]`. If you discovered new tasks or blockers, add them to the plan.

6. **Commit** — Stage all changes and commit with a descriptive message following conventional commits (e.g. `feat(recommendations): add loading state for chart period`). Do not push.

7. **Exit** — Stop after one task. The loop will restart with fresh context.

## Guardrails

- One task per iteration. Do not implement multiple tasks.
- No placeholders or TODO comments in shipped code.
- Keep `ralph/IMPLEMENTATION_PLAN.md` and `ralph/AGENTS.md` up to date if you discover new build steps or structural changes.
- Single sources of truth: `specs/` for requirements, `ralph/IMPLEMENTATION_PLAN.md` for task tracking.
