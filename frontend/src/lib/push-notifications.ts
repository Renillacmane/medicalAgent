"use client";

import { isNativeCapacitor, getCapacitorPlatform } from "@/lib/capacitor";
import { registerDeviceToken, unregisterDeviceToken } from "@/services/notifications.service";

let initCalled = false;

const DEVICE_TOKEN_KEY = "notification_device_token";
const DEVICE_PLATFORM_KEY = "notification_device_platform";

function navigateFromNotificationData(data: unknown): void {
  if (typeof window === "undefined") return;

  const basePath = window.location.pathname.startsWith("/pwa") ? "/pwa" : "";
  const payload = (data ?? {}) as { url?: unknown; type?: unknown; notificationType?: unknown };

  let targetUrl: string | undefined;

  if (typeof payload.url === "string" && payload.url.trim()) {
    targetUrl = payload.url.trim();
  } else {
    const type =
      (typeof payload.type === "string" && payload.type) ||
      (typeof payload.notificationType === "string" && payload.notificationType) ||
      "";
    switch (type) {
      case "daily_recommendations":
        targetUrl = "/recommendations";
        break;
      case "vitals_reminder":
        targetUrl = "/add";
        break;
      case "medication_reminder":
        targetUrl = "/dashboard";
        break;
      default:
        targetUrl = undefined;
    }
  }

  if (!targetUrl) return;

  if (/^https?:\/\//i.test(targetUrl)) {
    window.location.href = targetUrl;
  } else {
    window.location.href = `${basePath}${targetUrl.startsWith("/") ? targetUrl : `/${targetUrl}`}`;
  }
}

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

  PushNotifications.addListener("pushNotificationActionPerformed", (event) => {
    try {
      navigateFromNotificationData(event.notification?.data);
    } catch {
      // Navigation from push is best-effort; failures should not block app usage.
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

