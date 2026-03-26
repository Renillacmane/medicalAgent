"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useBasePath } from "@/lib/base-path";
import { useIsNativeCapacitor } from "@/lib/capacitor/use-is-native-capacitor";
import { todayISO } from "@/lib/format";
import {
  vitalsCatchUpDismissedKey,
  markVitalsCatchUpDismissedForToday,
  isVitalsCatchUpDismissedForDate,
} from "@/lib/vitals-catchup-bubble";
import { getSettings, getVitals } from "@/services/patients.service";
import { UnauthorizedError } from "@/lib/api";
import type { Vital } from "@/types/vital";
import NotificationBubble from "./NotificationBubble";

function hasVitalsForToday(vitals: Vital[], todayStr: string): boolean {
  return vitals.some((v) => (v.date ?? "").slice(0, 10) === todayStr);
}

export default function VitalsCatchUpBubble() {
  const basePath = useBasePath();
  const isNative = useIsNativeCapacitor();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isNative === true) {
      setChecked(true);
      return;
    }
    if (isNative !== false) return;

    let cancelled = false;
    const todayStr = todayISO();

    if (typeof window !== "undefined" && isVitalsCatchUpDismissedForDate(todayStr)) {
      setChecked(true);
      return;
    }

    Promise.all([getSettings(), getVitals({ limit: 100 })])
      .then(([settings, vitals]) => {
        if (cancelled) return;
        const vitalsReminder = settings.notificationSettings?.vitalsReminder ?? true;
        const hasToday = Array.isArray(vitals) && hasVitalsForToday(vitals, todayStr);
        const dismissed =
          typeof window !== "undefined" &&
          window.sessionStorage.getItem(vitalsCatchUpDismissedKey(todayStr)) === "true";
        if (vitalsReminder && !hasToday && !dismissed) {
          setShow(true);
        }
      })
      .catch((e) => {
        if (e instanceof UnauthorizedError) return;
        // Best-effort: do not show bubble on error
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isNative]);

  const handleDismiss = () => {
    setShow(false);
    markVitalsCatchUpDismissedForToday();
  };

  const handleTapToAdd = () => {
    markVitalsCatchUpDismissedForToday();
    setShow(false);
  };

  if (!checked || !show) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <NotificationBubble className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-light-green-dark">
            You haven&apos;t logged vitals today. Tap here to add them.
          </p>
          <Link
            href={`${basePath}/add`}
            onClick={handleTapToAdd}
            className="mt-2 inline-flex text-xs font-semibold text-light-green-primary underline underline-offset-2 hover:text-light-green-primary-dark"
          >
            Add vitals
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="ml-2 inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-medium text-light-green-light-grey hover:text-light-green-dark-grey"
          aria-label="Dismiss"
        >
          Dismiss
        </button>
      </NotificationBubble>
    </div>
  );
}
