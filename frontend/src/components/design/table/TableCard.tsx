/**
 * Design system: Card wrapper for tables (overflow, rounded border).
 */
export default function TableCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-light-green-subtle/60 bg-white shadow-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}
