import { isNativeCapacitor } from "@/lib/capacitor";

function getPublicVapidKey(): string | null {
  const key = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  if (!key || typeof key !== "string" || !key.trim()) {
    if (typeof window !== "undefined") {
      console.warn(
        "[WebPush] NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY is not set; web push subscription is disabled.",
      );
    }
    return null;
  }
  return key.trim();
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  if (typeof window === "undefined") {
    return new Uint8Array();
  }

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPush(): Promise<PushSubscription | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return null;
  }

  if (isNativeCapacitor()) {
    return null;
  }

  const vapidKey = getPublicVapidKey();
  if (!vapidKey) {
    return null;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      return existing;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as unknown as ArrayBuffer,
    });

    return subscription;
  } catch (error) {
    console.warn("[WebPush] Failed to subscribe to push notifications:", error);
    return null;
  }
}

