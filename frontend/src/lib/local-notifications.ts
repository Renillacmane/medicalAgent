/**
 * Local notification scheduling driven by user notification settings.
 * Only runs in Capacitor native context; no-ops on web.
 * Used when the user toggles notification settings (NOTIF-UI-2).
 */

import { isNativeCapacitor } from "@/lib/capacitor";
import type { NotificationSettings } from "@/types/profile";

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
