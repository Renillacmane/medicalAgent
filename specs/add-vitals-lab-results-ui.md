# Add vitals and lab results UI

## Purpose

The Add page is the single entry point where the user chooses what type of health data to add (vitals, prescriptions, or lab results/exams). Each choice leads to a dedicated form: manual vitals entry, prescription PDF upload, or lab results PDF upload. The page exists so the user can record vitals and attach documents (prescriptions and lab results) in one place, with a consistent layout and navigation.

## Scope

- **Route**: `/add` (or as defined in nav-config).
- **Add page**: Title “Add”, short description, and a type selector with three options: Vitals, Prescriptions, Exams (lab results). Vitals and Prescriptions are available; Exams can be “Coming soon” until the lab-results backend is ready.
- **Vitals form**: Date (required), heart rate, blood pressure (systolic / diastolic), weight, height, sleep hours, stress (1–10), SpO₂, blood glucose. Save submits to `POST /patients/vitals`. Offline: queue for sync and show “saved offline” state; “Add another” resets the form.
- **Prescription form**: Single file input (PDF only, e.g. max 10MB). Upload via `uploadDocument` with `documentType: "prescription"`. Loading, error, and success states; Back returns to type selector.
- **Lab results (Exams) form**: Same pattern as prescription — PDF upload, `documentType: "lab_result"` (or equivalent once API supports it). Reuse the same upload UX and client method (e.g. `uploadDocument`) so behavior matches prescriptions; only the label and documentType change. Loading, error, and success states; Back returns to type selector.
- **Navigation**: From each form, “Back” (or “Back to type”) returns to the Add type selector without leaving `/add`.

## Acceptance criteria

- When the user opens `/add`, they see the type selector (Vitals, Prescriptions, Exams) and can choose an available option.
- When the user selects Vitals, they see the vitals form with all fields listed above; required date; optional numeric fields; submit saves via API or queues offline and shows success or error.
- When the user selects Prescriptions, they see the prescription PDF upload form; selecting a PDF and submitting uploads via the document API and shows loading then success or error.
- **Lab results can be submitted from a PDF**: When the user selects Exams (lab results), they see a form that accepts a PDF upload. The flow matches the prescription implementation: same upload mechanism (e.g. `uploadDocument`), same UX (file input, size/type hints, loading, error, success), and the same or generalized backend pipeline. Prefer reusing the existing document-upload component or service and passing a different `documentType`; if the UI is currently prescription-only, extend it to support lab results (e.g. documentType and copy) or factor shared pieces (file input, validation, submit, feedback) so both prescription and lab results use them.
- When an upload fails (e.g. network or server error), an error message is shown and the user can retry.
- When the user taps Back (or “Back to type”), they return to the Add type selector.
- Exams option is visible; it can be disabled with “Coming soon” until the lab-results API is implemented, then enabled with the same PDF-upload flow as above.

## Out of scope

- Backend contract and document processing (see `add-vitals-lab-results-api.md`).
- Profile editing, dashboard, or recommendations (other specs).
