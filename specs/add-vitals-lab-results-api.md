# Add vitals and lab results API

## Purpose

The backend exposes endpoints so the user can submit health data from the Add flow: manual vitals entry and document uploads (prescriptions and lab results). Document uploads accept PDFs and process them through a shared pipeline (parse, store, type-specific extraction).

## Scope

- **Vitals**: `POST /patients/vitals` — authenticated user submits one vital reading (date required; heart rate, blood pressure, weight, height, sleep, stress, SpO₂, blood glucose optional).
- **Document upload**: `POST /patients/documents/upload` — multipart form with `file` (PDF) and `documentType` (`prescription` | `lab_result`). PDF is parsed, stored, and processed according to type.
- **Document list**: `GET /patients/documents` — optional `documentType` filter; returns user’s uploaded documents and status.

## Acceptance criteria

- When the user is authenticated, `POST /patients/vitals` accepts a valid payload (date + optional fields) and returns 201 with the created vital; invalid payload returns 400.
- When the user is not authenticated, vitals and document upload return 401.
- Document upload accepts only `application/pdf`; other types return 400.
- Prescription upload: existing behavior unchanged (PDF → parse → store → `processPrescription` → extracted data and summary).
- **Lab results upload**: Lab results can be submitted by uploading a PDF. The implementation must follow the same pattern as prescriptions: use the existing document upload pipeline (multipart upload, PDF parsing, file storage, document record creation). Prefer generalizing shared logic (e.g. PDF parsing, file storage, document status handling) into common methods and adding type-specific extraction (e.g. `processLabResults`) rather than duplicating code; if the prescription implementation is tightly coupled, extend it to support `documentType` and add a lab-results processor that reuses the same entry point and helpers.
- When `documentType` is `lab_result`, the backend accepts the upload, parses the PDF, stores the file, creates a document record, and runs lab-results extraction (and optionally summary); response includes document id and status (e.g. processing / completed).
- Document upload returns a consistent response shape: `{ id, status, message }` (and optional fields as needed).

## Out of scope

- Add page UI and navigation (see `add-vitals-lab-results-ui.md`).
- RAG ingestion of document content (separate spec).
