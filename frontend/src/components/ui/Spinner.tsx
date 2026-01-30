/**
 * Shared loading spinner. Use in pages (Dashboard, Profile) and in loading.tsx
 * so route-level and in-page loading states look the same.
 */
export default function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 ${className ?? ""}`}
      role="status"
      aria-label="Loading"
    />
  );
}
