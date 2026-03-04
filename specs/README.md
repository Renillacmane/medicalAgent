# What are specs?

In the Ralph Wiggum loop, **specs** are the **source of truth** for what the product should do. They are written **before** planning and building, and they drive both.

## Role in the loop

- **Phase 1 (Requirements)**: You and the LLM turn project ideas into **Jobs to Be Done (JTBD)** and then into **one spec per topic of concern**.
- **Phase 2 (Planning)**: The agent compares `specs/*` to the codebase and produces `ralph/IMPLEMENTATION_PLAN.md` (gap analysis).
- **Phase 3 (Building)**: The agent implements tasks from the plan; “done” means the code satisfies the spec and backpressure (tests, lint, build) passes.

So: **specs describe *what*; the plan and the code describe *how* (and what’s left to do).**

---

## One topic per spec

Each file in `specs/` should cover **one topic of concern**—one cohesive slice of behavior or one area of the product.

**Topic scope test**: Can you describe it in **one sentence without “and”**?

- ✅ “The recommendations page displays daily recommendations and vitals charts.” → one topic.
- ❌ “The user system handles authentication, profiles, and billing.” → three topics (auth, profiles, billing).

If you need “and” to say what it does, split it into multiple specs.

---

## What to put in a spec

Each spec is a markdown file (e.g. `specs/daily-recommendations-ui.md`) and should include:

1. **Purpose** — Why this exists; the one-sentence description of the topic.
2. **Scope** — What’s in (routes, data, UI, APIs) and, if useful, what’s out.
3. **Acceptance criteria** — Observable outcomes that define “done”:
   - User-visible or system-observable behavior.
   - Good format: “When X, then Y” (e.g. “When the user changes chart period, a loading state is shown until data is loaded”).
   - These can later be turned into test requirements in the implementation plan.

You can add **constraints**, **out-of-scope**, or **references** (e.g. to `docs/`) if they help.

---

## Examples for this project

| JTBD | Topic of concern | Spec file |
|------|------------------|-----------|
| User sees daily recommendations | API that returns daily recommendations | `daily-recommendations-api.md` |
| User sees daily recommendations | Recommendations page and charts | `daily-recommendations-ui.md` |
| User sees daily recommendations | Loading and error behavior | `recommendations-error-loading.md` |

See the example spec files in this folder (or in `docs/ralph-wiggum-loop.md`) for the exact structure.

---

## Who writes specs?

- **Phase 1** is a **conversation**: you and the LLM define JTBD, split topics, and the LLM drafts each `specs/*.md`. You can refine them.
- Specs can be updated later if the agent or you discover gaps (e.g. during planning or building); keep them as the single source of truth.

---

## Summary

- **Specs** = one markdown file per topic of concern; they define *what* the product should do.
- **One topic per spec**; describe it in one sentence without “and.”
- **Content**: Purpose, scope, acceptance criteria (and optionally constraints / out-of-scope).
- They feed **planning** (gap analysis) and **building** (implementation and “done” checks).
