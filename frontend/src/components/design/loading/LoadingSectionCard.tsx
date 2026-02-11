/**
 * Design system: Card wrapper for loading sections.
 * Use with LoadingPulse (loading state) or LoadingIdleMessage (idle state).
 */
export default function LoadingSectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}
