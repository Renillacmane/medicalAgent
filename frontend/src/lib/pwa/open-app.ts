/**
 * Utility functions for opening the PWA app.
 */

/**
 * Gets the target window for opening links.
 * If in an iframe, returns parent/top window; otherwise returns current window.
 * Handles cross-origin iframe security restrictions safely.
 */
export function getTargetWindow(): Window {
  let targetWindow: Window = window;
  try {
    const top = window.top;
    if (top && top !== window.self) {
      targetWindow = top;
    }
  } catch (e) {
    // Cross-origin iframe: can't access window.top, try window.parent
    try {
      const parent = window.parent;
      if (parent && parent !== window.self) {
        targetWindow = parent;
      }
    } catch (e2) {
      // Fallback to current window
      targetWindow = window;
    }
  }
  return targetWindow;
}

/**
 * Opens the PWA app at the specified URL.
 * Uses window.open() with _blank to create a new top-level browsing context,
 * which allows Chrome's PWA link capturing to intercept and open the installed PWA.
 *
 * @param url - The URL to open (default: "/pwa/dashboard")
 */
export function openApp(url: string = "/pwa/dashboard"): void {
  const targetWindow = getTargetWindow();
  targetWindow.open(url, "_blank", "noopener,noreferrer");
}
