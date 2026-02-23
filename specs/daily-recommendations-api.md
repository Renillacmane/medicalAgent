# Daily recommendations API

## Purpose

The backend exposes an endpoint that returns the current user's daily recommendations (nutrition, exercise, lifestyle, alerts) based on their profile and vitals, optionally enriched with RAG context.

## Scope

- **Endpoint**: `GET /recommendations/daily` (or equivalent; auth required).
- **Inputs**: Authenticated user (from JWT/session); optional query params (e.g. `includeRag`).
- **Output**: Structured response with summary and per-category recommendations.
- **Behavior**: Uses patient snapshot, optional RAG retrieval, system prompt builder, and LLM to generate recommendations; respects safety rules (non-critical only, no diagnosis).

## Acceptance criteria

- When the user is authenticated, the endpoint returns 200 and a body with at least: summary, recommendations (nutrition, exercise, lifestyle, alerts).
- When the user is not authenticated, the endpoint returns 401.
- Recommendations are generated using the configured LLM and current patient snapshot; no diagnosis or critical medical advice.
- When RAG is enabled, relevant chunks are retrieved and injected into the prompt; response remains valid JSON.
- An easier more specific recomendation in the "The little Right Thing", based on the the vitals that are on the frontier of health limits, and the suggestion should prime to maintain of traverse to healthy bounds. (e.g. patient is on the verge of dropping one unit of weight after several weightins with a tendency to drowp 71, 70.8, 70.4, 70.0 is is about to reach 69.0 is the IMC calculation is about to drop to a lower category, suggest maybe 2 very small things so the tendency continues (like add 2 minutes to your walk or remove 1/4 piece of some food item)). Update the prompt that already exists for the vitals but request a new field "right thing" with this suggestion

## Out of scope

- Frontend display (see `daily-recommendations-ui.md`).
- PDF ingestion and RAG indexing (separate specs).
