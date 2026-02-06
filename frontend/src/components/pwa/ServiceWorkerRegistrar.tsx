"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/register-sw";

/**
 * Client component that registers the service worker on mount.
 * Rendered once in the root layout; no visible UI.
 */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
