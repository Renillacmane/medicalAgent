# Daily recommendations UI

## Purpose

The recommendations page shows the user's daily recommendations (nutrition, exercise, lifestyle, alerts) and related vitals charts. The user can switch chart period and refetch by category.

## Scope

- **Route**: `/recommendations` (or as defined in nav-config).
- **Data**: Daily recommendations from API; vitals for charts (e.g. last 7 / 15 / 30 days).
- **UI**: Summary, category-wise blocks, charts with period selector, loading and error states.

## Acceptance criteria

- When recommendations are loading, a loading indicator is shown (no blank content).
- When the user changes chart period (7 / 15 / 30 days), chart data updates and a loading state is shown until new data is loaded.
- When an error occurs (e.g. API failure), an error message is shown and the user can retry.
- Recommendations are displayed in the four categories (nutrition, exercise, lifestyle, alerts); each category shows at least a heading and list of items or empty state.

## Out of scope

- Backend API contract (see `daily-recommendations-api.md`).
- Auth and profile editing (covered by other specs).
