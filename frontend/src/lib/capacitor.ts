/**
 * Capacitor runtime helpers.
 * Use these when you need to branch behavior for native (iOS/Android) vs web/PWA.
 * @see https://capacitorjs.com/docs
 *
 * Capacitor does not have a config for "start URL". It always loads the root of webDir
 * (our Next.js "out/" → index.html = the "/" route). We show dashboard at "/" when
 * native by detecting the platform here and rendering different content in app/page.tsx.
 */

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
    androidBridge?: { postMessage: (data: string) => void };
    webkit?: { messageHandlers?: { bridge?: unknown } };
  }
}

/** True when running inside a Capacitor native app (iOS or Android), false in browser/PWA. */
export function isNativeCapacitor(): boolean {
  if (typeof window === "undefined") return false;
  // Prefer Capacitor set by the native bridge (injected before our app runs)
  if (window.Capacitor?.isNativePlatform?.()) return true;
  // Fallback: detect native WebView by bridge presence (same checks @capacitor/core uses)
  if (window.androidBridge) return true;
  if (window.webkit?.messageHandlers?.bridge) return true;
  return false;
}

/** Platform string: 'ios' | 'android' | 'web'. */
export function getCapacitorPlatform(): string {
  if (typeof window === "undefined") return "web";
  if (window.Capacitor?.getPlatform?.()) return window.Capacitor.getPlatform();
  if (window.androidBridge) return "android";
  if (window.webkit?.messageHandlers?.bridge) return "ios";
  return "web";
}
