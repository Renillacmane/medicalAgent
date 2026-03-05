# Medication Reminders

## Purpose

Users receive notifications to take their scheduled medications at configured times. Reminders are based on medication data (dosage, frequency, start/end dates) and are only active when the user enables medication notifications.

## Scope

### Medication schema requirements

The `UserMedication` schema must support reminder scheduling:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Medication name (required) |
| `dosage` | string | e.g. "10mg" |
| `frequency` | string | Human-readable, e.g. "twice daily" |
| `timesPerDay` | number | Numeric frequency for scheduling (e.g. 1, 2, 3) |
| `reminderTimes` | string[] | Array of times in "HH:mm" format, e.g. ["08:00", "20:00"] |
| `startDate` | Date | When to start reminders |
| `endDate` | Date or null | When to stop reminders (null = indefinite) |
| `isActive` | boolean | Whether medication is currently being taken |
| `sourceDocumentId` | ObjectId | Reference to the prescription document (if from upload) |

### Backend

- **Medications API**: Existing `UserMedication` schema with new fields for reminder scheduling.
- **CRUD**: 
  - `GET /patients/medications` — list user's medications
  - `POST /patients/medications` — add medication manually
  - `PATCH /patients/medications/:id` — update medication (including reminder times)
  - `DELETE /patients/medications/:id` — remove medication

### Frontend

- **Dashboard medications table**: Display active medications with name, dosage, frequency, and next reminder time.
- **Medication editing**: Edit reminder times, start/end dates from dashboard or after prescription upload.
- **Local notification scheduling**: When medication reminders are enabled in settings, schedule local notifications for each medication based on `reminderTimes`.

### Notification behavior

- Notifications only fire if:
  1. User has `notificationSettings.medicationReminder` enabled
  2. Medication `isActive` is true
  3. Current date is between `startDate` and `endDate` (or `endDate` is null)
- Notification text: "Time to take [name] ([dosage])"
- Tapping notification opens the app to dashboard/medications section.

## Acceptance criteria

### Medication data

- When a medication is created (manually or from prescription), it includes `timesPerDay` and `reminderTimes` fields.
- When `reminderTimes` is empty or not set, no reminders are scheduled for that medication.
- When `endDate` is reached, reminders for that medication stop.

### Dashboard medications table

- When the user views the dashboard, a "Current Medications" section displays active medications.
- Each row shows: medication name, dosage, frequency, and status (active/inactive).
- User can tap a medication to edit its reminder settings.
- When the user opens the medication edit dialog from the dashboard, the dialog includes, at the end of its content, a **read-only "Original prescription text" section** (when available) that shows the raw medication line(s) as they appeared in the source prescription. This uses the medication's `sourceDocumentId` to look up the corresponding `UserDocument.extractedData` and display the original text so the user can confirm that the extracted structured fields match what was written on the prescription.

### Reminder scheduling

- When medication reminders are enabled in settings and a medication has `reminderTimes` configured, local notifications are scheduled.
- When the user updates `reminderTimes`, existing notifications are cancelled and new ones are scheduled.
- When the user disables medication reminders in settings, all medication notifications are cancelled.

### Notification delivery

- When a scheduled reminder time arrives, a notification fires with the medication name and dosage.
- When the user taps the notification, the app opens to the medications section.

## Schema changes

### UserMedication (`user-medication.schema.ts`)

Add fields:

```typescript
@Prop({ type: Number, default: 1 })
timesPerDay?: number;

@Prop({ type: [String], default: [] })
reminderTimes?: string[]; // ["08:00", "20:00"]

@Prop({ type: Types.ObjectId, ref: 'UserDocument' })
sourceDocumentId?: Types.ObjectId;
```

## Related specs

- `notifications.md` — Overall notification settings and types
- `prescription-medication-dialog.md` — UI for configuring medications after prescription upload
