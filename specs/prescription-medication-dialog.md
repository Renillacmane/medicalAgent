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

### Medication card fields & layout

To reduce visual overload, each medication is shown as a **compact card** that groups related information and keeps labels and values as close together as possible.

| Field | Source | Editable | Default | Layout notes |
|-------|--------|----------|---------|--------------|
| Name | Extracted from PDF | Yes | (from PDF) | Shown prominently at top-left of card. |
| Dosage | Extracted from PDF | Yes | (from PDF) | Shown inline with label (e.g. `Dosage: 10mg`) next to or just under the name on larger screens. |
| Frequency | Extracted from PDF | Yes | (from PDF, e.g. "once daily") | Shown inline with label (e.g. `Frequency: once daily`) near dosage. |
| Times per day | Inferred from frequency | Yes | 1 | Shown as a small inline control with label and numeric value on the same row. |
| Reminder times | Suggested based on times per day | Yes | e.g. ["08:00"] for once daily | Shown as compact, inline text or chips (e.g. `Reminders: 08:00, 20:00`). |
| Start date | Default: upload date | Yes | Today | Date inputs appear in a lower row; labels and values are aligned horizontally where space allows. |
| End date | Inferred from duration if available | Yes | null (indefinite) or calculated | Same row as start date when viewport width permits. |
| Picture placeholder | None yet (future) | No | Empty placeholder | Small square/rounded placeholder (e.g. pill bottle silhouette) on the left side of the card. |
| “Show more” link | None yet (future) | No | Hidden | Text link/button (e.g. “Show more”) that will, in the future, open richer medication info from an external medications provider. For now it can be non-functional or show a simple tooltip/placeholder. |

Layout guidelines:

- Use the existing **design system** primitives where possible (e.g. card styles from `frontend/src/components/design/cards`, consistent button/link styles).
- On desktop:
  - Place the **picture placeholder** on the far left.
  - To its right, place **name**, **dosage**, and **frequency** on a single, compact row where labels and values are inline (e.g. `Dosage: 10mg · Frequency: twice daily`).
  - Below, show scheduling fields (times per day, reminder times, start/end dates) in 1–2 compact rows.
- On mobile:
  - Keep the same information but allow wrapping to multiple lines; labels and values should still be visually paired (label immediately before or above value).
  - Picture placeholder may stack above or beside the text, as long as the card remains visually compact.

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
- **Duration extraction**:
  - The prescription extraction step should attempt to extract a **human-readable duration** per medication (e.g. "30 days", "3 months", "4-8 weeks", "Ongoing").
  - Duration is stored in the extracted medications array as `duration?: string`.
- **End date from duration**:
  - When building the medication dialog, if a medication has a `duration` string and no explicit end date:
    - Use **today** (upload date) as the **start date**.
    - Parse duration strings like `"30 days"`, `"3 months"`, `"4 weeks"` into a number of days or months and **calculate `endDate` = startDate + duration** (rounded to whole days).
    - For open-ended durations like `"Ongoing"`, leave `endDate` as `null` and still set `startDate` to today.
  - The user can still override both start and end dates in the dialog.

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
