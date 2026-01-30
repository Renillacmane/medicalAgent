"use client";

import Spinner from "./Spinner";

/**
 * Shared loading state: spinner + optional message.
 * Use in Dashboard/Profile when loading, and in loading.tsx so route-level
 * and in-page loading use the same UI (no duplicate markup).
 */
export default function PageLoading({
  message = "Loading…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "flex min-h-[12rem] flex-col items-center justify-center gap-3 p-4"
      }
    >
      <Spinner />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
