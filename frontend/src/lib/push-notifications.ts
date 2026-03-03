"use client";

import { isNativeCapacitor, getCapacitorPlatform } from "@/lib/capacitor";
import { registerDeviceToken } from "@/services/notifications.service";

let initCalled = false;

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
    try {
      await registerDeviceToken(token.value, platform === "ios" ? "ios" : "android");
    } catch {
      // Best-effort; failures should not break the app.
    }
  });
}

