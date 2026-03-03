/**
 * Local notification scheduling driven by user notification settings.
 * Only runs in Capacitor native context; no-ops on web.
 * Used when the user toggles notification settings (NOTIF-UI-2).
 * Medication reminders (MED-UI-4) are scheduled from Dashboard when medications and settings are loaded.
 */

import { isNativeCapacitor } from "@/lib/capacitor";
import type { NotificationSettings } from "@/types/profile";
import type { Medication } from "@/types/health";

const HHMM_REGEX = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function parseHHmm(time: string): { hour: number; minute: number } | null {
  const m = time.trim().match(HHMM_REGEX);
  if (!m) return null;
  return { hour: parseInt(m[1], 10), minute: parseInt(m[2], 10) };
}

function isMedicationInDateRange(
  startDate?: string,
  endDate?: string | null
): boolean {
  const today = new Date();
  const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (startDate) {
    const start = new Date(startDate);
    const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    if (todayTime < startTime) return false;
  }
  if (endDate != null && endDate !== "") {
    const end = new Date(endDate);
    const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    if (todayTime > endTime) return false;
  }
  return true;
}

export const NOTIFICATION_IDS = {
  dailyRecommendations: 1,
  vitalsReminder: 2,
  /** Medication notifications use IDs >= MEDICATION_ID_FLOOR (see medication-reminders / MED-UI-4). */
  medicationIdFloor: 1000,
} as const;

const DAILY_REC_HOUR = 8;
const DAILY_REC_MINUTE = 0;
const VITALS_HOUR = 9;
const VITALS_MINUTE = 0;

/**
 * Reschedule local notifications to match the given settings.
 * - Daily recommendations: if enabled, schedule daily at 8:00; else cancel.
 * - Vitals reminder: if enabled, schedule daily at 9:00; else cancel.
 * - Medication reminder: if disabled, cancel all medication notifications (id >= 1000).
 * Does nothing when not running in a Capacitor native app.
 */
export async function rescheduleFromSettings(
  settings: NotificationSettings
): Promise<void> {
  if (typeof window === "undefined" || !isNativeCapacitor()) {
    return;
  }

  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );

  const status = await LocalNotifications.checkPermissions();
  if (status.display !== "granted") {
    const request = await LocalNotifications.requestPermissions();
    if (request.display !== "granted") {
      return;
    }
  }

  const toCancel: { id: number }[] = [];

  if (settings.dailyRecommendations) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_IDS.dailyRecommendations,
          title: "Daily recommendations",
          body: "Your daily recommendations are ready",
          schedule: {
            on: { hour: DAILY_REC_HOUR, minute: DAILY_REC_MINUTE },
          },
        },
      ],
    });
  } else {
    toCancel.push({ id: NOTIFICATION_IDS.dailyRecommendations });
  }

  if (settings.vitalsReminder) {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_IDS.vitalsReminder,
          title: "Vitals reminder",
          body: "Time to log your vitals",
          schedule: {
            on: { hour: VITALS_HOUR, minute: VITALS_MINUTE },
          },
        },
      ],
    });
  } else {
    toCancel.push({ id: NOTIFICATION_IDS.vitalsReminder });
  }

  if (!settings.medicationReminder) {
    const pending = await LocalNotifications.getPending();
    const medicationIds =
      pending.notifications
        ?.filter((n) => n.id >= NOTIFICATION_IDS.medicationIdFloor)
        .map((n) => ({ id: n.id })) ?? [];
    toCancel.push(...medicationIds);
  }

  if (toCancel.length > 0) {
    await LocalNotifications.cancel({ notifications: toCancel });
  }
}

/**
 * Schedule local notifications for each active medication that has reminderTimes,
 * when medication reminders are enabled in settings. Respects startDate/endDate
 * so reminders stop after endDate. Call from Dashboard when medications and
 * settings are loaded (MED-UI-4).
 */
export async function scheduleMedicationReminders(
  medications: Medication[],
  settings: NotificationSettings
): Promise<void> {
  if (typeof window === "undefined" || !isNativeCapacitor()) {
    return;
  }
  if (!settings.medicationReminder) {
    return;
  }

  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );

  const status = await LocalNotifications.checkPermissions();
  if (status.display !== "granted") {
    const request = await LocalNotifications.requestPermissions();
    if (request.display !== "granted") {
      return;
    }
  }

  const toCancel = await LocalNotifications.getPending();
  const medicationIds =
    toCancel.notifications
      ?.filter((n) => n.id >= NOTIFICATION_IDS.medicationIdFloor)
      .map((n) => ({ id: n.id })) ?? [];
  if (medicationIds.length > 0) {
    await LocalNotifications.cancel({ notifications: medicationIds });
  }

  const notifications: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { on: { hour: number; minute: number } };
  }> = [];
  let nextId = NOTIFICATION_IDS.medicationIdFloor;

  const eligible = medications.filter(
    (m) =>
      m.isActive &&
      Array.isArray(m.reminderTimes) &&
      m.reminderTimes.length > 0 &&
      isMedicationInDateRange(m.startDate, m.endDate)
  );

  for (const med of eligible) {
    const dosage = med.dosage?.trim() ? med.dosage : "—";
    const body = `Time to take ${med.name} (${dosage})`;
    for (const timeStr of med.reminderTimes ?? []) {
      const parsed = parseHHmm(timeStr);
      if (!parsed) continue;
      if (nextId > 2_147_483_647) break;
      notifications.push({
        id: nextId++,
        title: "Medication reminder",
        body,
        schedule: { on: { hour: parsed.hour, minute: parsed.minute } },
      });
    }
  }

  if (notifications.length === 0) return;

  await LocalNotifications.schedule({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      schedule: n.schedule,
    })),
  });
}
