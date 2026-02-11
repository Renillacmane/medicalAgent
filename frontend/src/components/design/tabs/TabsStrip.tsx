/**
 * Design system: Card wrapper for a tab strip and optional content panel.
 */
export default function TabsStrip({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-light-green-subtle/60 bg-white shadow-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}
