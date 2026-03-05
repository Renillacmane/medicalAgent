# Notifications

## Purpose

The app sends push and local notifications to remind users about health actions: daily recommendations, vitals entry reminders, and scheduled medication reminders. Notifications are configurable per-type in user settings.

## Scope

### Notification types

| Type | Description | Default | Trigger |
|------|-------------|---------|---------|
| Daily recommendations | Remind user to check daily health recommendations | **Disabled** | Scheduled daily (e.g. 8:00 AM) |
| Add vitals reminder | Remind user to log their daily vitals | **Enabled** | Scheduled daily (e.g. 9:00 AM) |
| Medication reminder | Remind user to take scheduled pills | **Disabled** | Per-medication schedule (see `medication-reminders.md`) |

### Backend

- **Device registration**: `POST /notifications/register` — authenticated user submits device token (FCM/APNs) or web push subscription; backend stores it associated with user.
- **Unregister**: `DELETE /notifications/register` — removes a device token or subscription.
- **User notification settings**: Stored in user document (see schema updates below).
- **Settings API**: `GET /users/settings` and `PATCH /users/settings` — retrieve and update notification preferences.
- **Trigger push**: Internal service that sends push notifications based on schedules and user preferences.

### Frontend (Capacitor — iOS/Android)

- Install `@capacitor/push-notifications` and `@capacitor/local-notifications`.
- On app launch (authenticated), request notification permission and register with APNs/FCM.
- Send device token to backend via `/notifications/register`.
- Handle incoming push: display notification and deep-link to appropriate page on tap.
- Schedule local notifications for reminders based on user settings.

### Frontend (PWA — Web)

- Use Web Push API (`PushManager.subscribe()`) with VAPID keys.
- On opt-in, send subscription object to backend via `/notifications/register`.
- Service worker handles `push` event and displays notification.
- On notification click, open appropriate page.

### Settings UI

- **Location**: Profile/Settings page.
- **Controls**: Toggle for each notification type (daily recommendations, vitals reminder, medication reminder).
- **Persistence**: Changes call `PATCH /users/settings` and update local state.

### Recommendations page notification bubble

- When notifications are not fully configured, show a small info bubble on the recommendations page.
- Bubble text: "Enable notifications to get daily reminders" with a link to Settings.
- Dismissable; once dismissed, don't show again for the session.

## Acceptance criteria

### Permission and registration

- When the user opens the app on iOS/Android and is authenticated, the app requests notification permission; if granted, it registers the device token with the backend.
- When the user denies notification permission, the app handles gracefully (no crash, shows info in settings that notifications are disabled at OS level).
- When the user logs out, the device token is unregistered from the backend.

### Notification settings

- When the user opens Settings, they see toggles for: Daily recommendations (off by default), Add vitals reminder (on by default), Medication reminder (off by default).
- When the user toggles a notification type, the setting is persisted to the backend and local notifications are rescheduled accordingly.
- When notification permission is denied at OS level, toggles are disabled with explanation text.

### Daily recommendations notification

- When enabled and the scheduled time arrives, a local notification fires: "Your daily recommendations are ready".
- When the user taps the notification, the app opens to `/recommendations`.
- Default schedule: 8:00 AM local time (configurable in future iteration).

### Add vitals reminder notification

- When enabled and the scheduled time arrives, a local notification fires: "Time to log your vitals".
- When the user taps the notification, the app opens to `/add`.
- Default schedule: 9:00 AM local time (configurable in future iteration).
- **One reminder per day**: The vitals reminder is delivered **at most once per calendar day** per user.
- **Catch-up on next login (web)**:
  - If the user did **not receive or act on** the scheduled vitals reminder (e.g. app was closed at 9:00), then **on the next authenticated web session** (PWA) a **non-modal bubble** appears reminding them to log vitals.
  - The bubble can appear on a relevant page (e.g. `/add` or dashboard) with copy such as "You haven't logged vitals today. Tap here to add them." and a link/action to open the vitals form.
  - Once shown for a given day and dismissed or acted upon, the bubble does **not** reappear again that day.

### Medication reminder notification

- When enabled and a medication has reminder times configured, local notifications fire at each scheduled time.
- Notification text: "Time to take [Medication Name] ([Dosage])".
- When the user taps the notification, the app opens to `/dashboard` (medications section) or a dedicated medications page.
- See `medication-reminders.md` for detailed medication scheduling spec.

### Recommendations page bubble

- When the user visits `/recommendations` and has not enabled daily recommendations notifications, a dismissable info bubble appears.
- Bubble contains text and a link to Settings.
- When dismissed, the bubble does not reappear for the current session.

## Out of scope

- Email or SMS notifications.
- Per-notification-type time customization UI (future iteration).
- Server-triggered push for recommendations (local notifications only for now).

## Schema updates required

### User schema (`user.schema.ts`)

Add `notificationSettings` field:

```typescript
export class NotificationSettings {
  dailyRecommendations?: boolean; // default: false
  vitalsReminder?: boolean;       // default: true
  medicationReminder?: boolean;   // default: false
}

// In User class:
@Prop({ type: Object, default: { dailyRecommendations: false, vitalsReminder: true, medicationReminder: false } })
notificationSettings?: NotificationSettings;
```

### Related specs

- `medication-reminders.md` — Medication scheduling and reminder logic
- `prescription-medication-dialog.md` — UI for editing medications from prescription upload
