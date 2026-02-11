"use client";

import { useSearchParams } from "next/navigation";
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
 * True when the app is running inside the widget iframe (or was opened with ?widget=1).
 * Used to hide header/footer and show a minimal layout.
 * Persists in sessionStorage so client-side nav inside the iframe keeps widget mode.
 */
export function useWidgetMode(): boolean {
  const searchParams = useSearchParams();
  const [isWidget, setIsWidget] = useState(getInitialWidgetMode);

  const paramWidget = searchParams?.get("widget") === "1";
  const inIframe =
    typeof window !== "undefined" && window.self !== window.top;

  useEffect(() => {
    const widget = paramWidget || inIframe || getInitialWidgetMode();
    if (paramWidget || inIframe) {
      sessionStorage.setItem(WIDGET_STORAGE_KEY, "1");
    }
    setIsWidget(widget);
  }, [paramWidget, inIframe]);

  return isWidget;
}
