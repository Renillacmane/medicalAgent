# My Health – Medication calendar UI

## Purpose

The My Health page shows a **calendar-style view of medication reminders** so users can quickly see **on which days and at what times** they should take each medication. The calendar lives **below the profile/UserPanel area** and is implemented as a **reusable UI element** that other pages can later embed.

## Scope

- **Route / placement**
  - Appears on `/my-health` **below the profile / UserPanel block** and above the existing tabs (Vitals | Prescription | Exams).
  - Implemented as a reusable component (e.g. `MedicationCalendar`) that can be mounted on other pages in the future.

- **Data inputs**
  - Uses the existing medications and settings data from:
    - `GET /patients/medications` (see `medication-reminders.md`)
    - `GET /patients/settings` → `notificationSettings.medicationReminder`
  - Only **active** medications (`isActive === true`) within their scheduling window are shown:
    - `startDate` ≤ day ≤ `endDate` (or `endDate` is null).
  - Calendar does **not** introduce new backend endpoints; it consumes existing APIs.

- **Calendar layout**
  - Displays a **month-style grid** of days (e.g. current month), with:
    - One cell per day.
    - **Dots inside each day cell** representing **scheduled medication reminder times** for that day.
  - For each medication that has at least one reminder on a given day:
    - Render one or more dots; dots may be visually grouped by time, not by medication name.
  - The calendar should support:
    - Navigating between months (e.g. previous/next).
    - Highlighting “today”.
  - If `notificationSettings.medicationReminder` is **disabled**, the calendar still shows the schedule based on `reminderTimes`, but should surface an inline note (see acceptance criteria) so the user understands notifications may not fire.

- **Dot semantics**
  - A **dot** represents at least one reminder time on that day. At minimum encode:
    - Time of day (e.g. 08:00, 12:00, 20:00).
    - Associated medications (one or many) scheduled at or near that time.
  - Visual design:
    - Multiple dots can appear in the same day for different times.
    - If multiple medications share the same time, a **single dot** can represent that “slot”; the details panel will list all medications for that time.

- **Interaction and details panel**
  - Clicking/tapping a **day dot** opens a **details view** showing:
    - The **day and time** (e.g. “March 4, 08:00”).
    - A **list of medications** scheduled at that time, each with:
      - Medication name
      - Dosage
      - Frequency (e.g. “twice daily”)
      - Optional start/end dates (if helpful for context)
    - Any warnings based on scheduling (e.g. medication is past endDate and should not normally appear, which should not happen if filtering is correct).
  - The details view may be:
    - A popover anchored to the dot, or
    - A side panel or modal; behavior should be consistent across the app.
  - Clicking/tapping **outside** the panel or pressing Escape closes the details.

- **Reusability**
  - Calendar extraction:
    - Core calendar grid (days, navigation, highlighting today, dot placement) is implemented as a **reusable UI element** that accepts **events** via props (e.g. `{ date, time, medications[] }`).
    - The My Health page wires it up with medication data; other screens can supply different event types later (e.g. vitals reminders) without changing the calendar’s internals.

## Acceptance criteria

1. **Placement and visibility**
   - When the user opens `/my-health`, **above the Vitals/Prescription/Exams tabs** and below the profile/UserPanel, they see a **“Medication schedule” calendar** block.
   - The calendar shows the **current month** by default and highlights **today**.

2. **Data mapping to calendar dots**
   - For each active medication where today’s date is between `startDate` and `endDate` (or `endDate` is null), and for each `reminderTimes` entry:
     - The corresponding **day cell** displays at least one dot for that date.
   - Days without any scheduled reminders show **no dots**.
   - If multiple medications are scheduled for the **same day and time**, there is still at least one dot rendered; clicking that dot shows **all medications** for that time in the details view.

3. **Dot interaction**
   - When the user clicks/taps a dot:
     - A details view opens showing:
       - The **date and time** for that dot.
       - For each medication at that slot: name, dosage, frequency (and optionally start/end dates).
   - Closing the details view (via close button, backdrop click, or Escape) hides it and returns to the calendar.
   - Clicking another dot updates the details view to the newly selected date/time.

4. **Month navigation**
   - The user can move to the **previous** and **next** months using controls (buttons or arrows).
   - When navigating months:
     - Dots are recalculated for the visible month based on medications’ `startDate`, `endDate`, and `reminderTimes`.
   - A control (e.g. “Today”) brings the user back to the current month and highlights today.

5. **Behavior when medication reminders are disabled**
   - When `notificationSettings.medicationReminder` is **false**, the calendar still displays schedule dots based on medication data.
   - In this case, an inline note appears near the calendar (e.g. “Medication notifications are off. Turn them on in Settings to receive reminders.”).
   - The note disappears or updates appropriately when the user later enables medication reminders (after settings refresh).

6. **Empty and loading states**
   - While medications/settings are loading, the calendar area shows a loading indicator or skeleton, not an empty box.
   - If there are **no active medications with reminderTimes configured**, the calendar area shows an **informative empty state** (e.g. “No medications scheduled yet. Add medications or configure reminders to see them here.”) instead of a blank grid of dots.

7. **Reusability / component contract**
   - The core calendar component is implemented so that:
     - It accepts a list of **event objects** with at least date and time, and renders dots accordingly.
     - It does not hard-code medication-specific labels; medication-specific rendering is handled by the My Health integration (e.g. via a render-prop or a callback when a dot is clicked).
   - The My Health page uses this reusable calendar component, passing in medication events derived from `GET /patients/medications`.

## Out of scope

- Creating or editing medications from within the calendar; all changes still happen via existing flows (dashboard medications table, prescription dialog).
- Back-end changes to medication or settings APIs (these are already covered by `medication-reminders.md` and `notifications.md`).
- Cross-device sync or timezone handling beyond the app’s existing assumptions.

## Related specs

- `my-health-ui.md` — Overall My Health page layout and tabs.
- `medication-reminders.md` — Medication schema, scheduling, and reminders.
- `prescription-medication-dialog.md` — Medication configuration after prescription upload.
