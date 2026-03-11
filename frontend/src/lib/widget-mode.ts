"use client";

import { useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const WIDGET_STORAGE_KEY = "healthia-widget-mode";

function getInitialWidgetMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.self !== window.top ||
    sessionStorage.getItem(WIDGET_STORAGE_KEY) === "1"
  );
}

/**
 * True when the app is in widget context (iframe or opened with ?widget=1).
 * Used only for widget display: hide header/footer/install, show minimal chrome.
 * Persists in sessionStorage so client-side nav inside the iframe keeps widget mode.
 *
 * Cleared when: PWA standalone, or navigating to /pwa/* outside an iframe.
 */
export function useIsWidget(): boolean {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isWidget, setIsWidget] = useState(getInitialWidgetMode);

  const paramWidget = searchParams?.get("widget") === "1";
  const inIframe =
    typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => {
    // Check if we're in PWA standalone mode - if so, clear widget mode
    const isStandalone = typeof window !== "undefined" && 
      (window.matchMedia("(display-mode: standalone)").matches ||
       window.matchMedia("(display-mode: minimal-ui)").matches ||
       window.matchMedia("(display-mode: fullscreen)").matches);
    
    // If in standalone PWA, we're not in widget mode
    if (isStandalone) {
      sessionStorage.removeItem(WIDGET_STORAGE_KEY);
      setIsWidget(false);
      return;
    }

    // If we're navigating to a PWA scope URL (/pwa/*) and NOT in an iframe, clear widget mode
    // This handles the case where "Open app" link was clicked from the widget
    const isPwaScope = pathname?.startsWith("/pwa/") ?? false;
    if (isPwaScope && !inIframe && !paramWidget) {
      sessionStorage.removeItem(WIDGET_STORAGE_KEY);
      setIsWidget(false);
      return;
    }

    const widget = paramWidget || inIframe || getInitialWidgetMode();
    if (paramWidget || inIframe) {
      sessionStorage.setItem(WIDGET_STORAGE_KEY, "1");
    }
    setIsWidget(widget);
  }, [paramWidget, inIframe, pathname]);

  return isWidget;
}

/** @deprecated Use useIsWidget() instead. */
export const useWidgetMode = useIsWidget;
