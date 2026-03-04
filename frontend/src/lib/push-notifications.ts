"use client";

import { isNativeCapacitor, getCapacitorPlatform } from "@/lib/capacitor";
import { registerDeviceToken, unregisterDeviceToken } from "@/services/notifications.service";

let initCalled = false;

const DEVICE_TOKEN_KEY = "notification_device_token";
const DEVICE_PLATFORM_KEY = "notification_device_platform";

export async function initNativePushNotifications(): Promise<void> {
  if (initCalled) return;
  initCalled = true;

  if (typeof window === "undefined" || !isNativeCapacitor()) {
    return;
  }

  const { PushNotifications } = await import("@capacitor/push-notifications");

  let permission = await PushNotifications.checkPermissions();
  if (permission.receive !== "granted") {
    permission = await PushNotifications.requestPermissions();
  }

  if (permission.receive !== "granted") {
    return;
  }

  PushNotifications.register();

  PushNotifications.addListener("registration", async (token) => {
    const platform = getCapacitorPlatform();
    if (platform === "web") {
      return;
    }

    const normalizedPlatform = platform === "ios" ? "ios" : "android";

    try {
      await registerDeviceToken(token.value, normalizedPlatform);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(DEVICE_TOKEN_KEY, token.value);
          window.localStorage.setItem(DEVICE_PLATFORM_KEY, normalizedPlatform);
        } catch {
          // Ignore storage errors; registration already succeeded.
        }
      }
    } catch {
      // Best-effort; failures should not break the app.
    }
  });
}

export async function unregisterPushNotificationsOnLogout(): Promise<void> {
  if (typeof window === "undefined" || !isNativeCapacitor()) {
    return;
  }

  const deviceToken = window.localStorage.getItem(DEVICE_TOKEN_KEY);
  const platform = window.localStorage.getItem(DEVICE_PLATFORM_KEY) as "ios" | "android" | "web" | null;

  if (!deviceToken) {
    return;
  }

  try {
    await unregisterDeviceToken(deviceToken, platform ?? undefined);
  } catch {
    // Best-effort; logout should continue even if this fails.
  }

  try {
    window.localStorage.removeItem(DEVICE_TOKEN_KEY);
    window.localStorage.removeItem(DEVICE_PLATFORM_KEY);
  } catch {
    // Ignore storage cleanup errors.
  }
}

