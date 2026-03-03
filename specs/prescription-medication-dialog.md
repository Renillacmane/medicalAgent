# Prescription Medication Dialog

## Purpose

When a prescription PDF is uploaded and processed, the app shows a dialog for the user to review, edit, and confirm extracted medications before saving them. The dialog pre-fills data from the PDF analysis and allows the user to fine-tune dosage, frequency, reminder times, and dates.

## Scope

### Trigger

- After successful prescription upload and processing (`POST /patients/documents/upload` with `documentType: prescription`).
- The backend returns extracted medication data; the frontend opens the medication dialog.

### Dialog UI

- **Header**: "Review Medications" with the prescription filename.
- **Medication list**: Scrollable list of extracted medications, each as an editable card.
- **Add button**: "+" button to manually add more medications not detected by the parser.
- **Actions**: "Cancel" (discard changes) and "Save" (persist all medications).

### Medication card fields

| Field | Source | Editable | Default |
|-------|--------|----------|---------|
| Name | Extracted from PDF | Yes | (from PDF) |
| Dosage | Extracted from PDF | Yes | (from PDF) |
| Frequency | Extracted from PDF | Yes | (from PDF, e.g. "once daily") |
| Times per day | Inferred from frequency | Yes | 1 |
| Reminder times | Suggested based on times per day | Yes | e.g. ["08:00"] for once daily |
| Start date | Default: upload date | Yes | Today |
| End date | Inferred from duration if available | Yes | null (indefinite) or calculated |

### Inference logic

- **Times per day**: Parse frequency text:
  - "once daily" / "daily" → 1
  - "twice daily" / "BID" → 2
  - "three times daily" / "TID" → 3
  - "four times daily" / "QID" → 4
  - Otherwise → 1 (default)
- **Reminder times**: Suggest evenly spaced times based on `timesPerDay`:
  - 1 → ["08:00"]
  - 2 → ["08:00", "20:00"]
  - 3 → ["08:00", "14:00", "20:00"]
  - 4 → ["08:00", "12:00", "16:00", "20:00"]
- **End date**: If duration is extracted (e.g. "30 days"), calculate from start date.

### Save behavior

- **Existing medications**: If a medication with the same name exists for the user, update it with new data.
- **New medications**: Create new `UserMedication` records linked to the source document (`sourceDocumentId`).
- **API call**: `POST /patients/medications/batch` or individual `POST /patients/medications` calls.

## Acceptance criteria

### Dialog display

- When a prescription is uploaded and processed successfully, the medication dialog opens automatically.
- The dialog displays all medications extracted from the PDF as editable cards.
- Each card shows: name, dosage, frequency, times per day, reminder times, start date, end date.

### Field editing

- When the user edits any field, the value updates in the form state.
- When the user changes "times per day", reminder times are re-suggested (but user can override).
- When the user clears end date, it becomes null (indefinite).

### Adding medications

- When the user clicks "+", a new empty medication card is added to the list.
- The new card has default values: empty name, "once daily" frequency, today as start date.

### Scrolling

- When there are more than 3-4 medications, the list is scrollable within the dialog.
- The dialog does not exceed viewport height.

### Save

- When the user clicks "Save", all medications are persisted to the backend.
- Medications are associated with the uploaded prescription document via `sourceDocumentId`.
- If a medication with the same name already exists for the user, it is updated rather than duplicated.
- After save, the dialog closes and the user sees a success message.

### Cancel

- When the user clicks "Cancel", the dialog closes without saving.
- No medications are created or updated.
- The uploaded document remains (document upload is not reverted).

### Validation

- Name is required; save fails if any medication has an empty name.
- Start date is required.
- Reminder times must be valid "HH:mm" format.

## API requirements

### Batch medication creation

`POST /patients/medications/batch`

Request body:
```json
{
  "sourceDocumentId": "document-id",
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "once daily",
      "timesPerDay": 1,
      "reminderTimes": ["08:00"],
      "startDate": "2026-02-24",
      "endDate": null
    }
  ]
}
```

Response:
```json
{
  "created": 2,
  "updated": 1,
  "medications": [...]
}
```

## Related specs

- `notifications.md` — Notification settings and types
- `medication-reminders.md` — How medication reminders are scheduled and delivered
- `add-vitals-lab-results-api.md` — Document upload API
