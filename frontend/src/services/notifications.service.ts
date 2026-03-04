import { authPost, authDelete } from "@/lib/api";
import { getCapacitorPlatform } from "@/lib/capacitor";

type NotificationPlatform = "ios" | "android" | "web";

type RegisterNotificationPayload = {
  platform: NotificationPlatform;
  deviceToken?: string;
  webPushSubscription?: Record<string, unknown>;
};

export async function registerDeviceToken(
  deviceToken: string,
  platformOverride?: NotificationPlatform,
): Promise<{ success: boolean }> {
  const platform = platformOverride ?? (getCapacitorPlatform() as NotificationPlatform);
  return authPost<{ success: boolean }>("/notifications/register", {
    platform,
    deviceToken,
  } satisfies RegisterNotificationPayload);
}

export async function registerWebPushSubscription(
  subscription: PushSubscription,
): Promise<{ success: boolean }> {
  const platform: NotificationPlatform = "web";

  return authPost<{ success: boolean }>("/notifications/register", {
    platform,
    webPushSubscription: subscription.toJSON() as Record<string, unknown>,
  } satisfies RegisterNotificationPayload);
}

export async function unregisterDeviceToken(
  deviceToken: string,
  platformOverride?: NotificationPlatform,
): Promise<{ success: boolean }> {
  const platform = platformOverride ?? (getCapacitorPlatform() as NotificationPlatform);
  return authDelete<{ success: boolean }>("/notifications/register", {
    platform,
    deviceToken,
  } satisfies RegisterNotificationPayload);
}

