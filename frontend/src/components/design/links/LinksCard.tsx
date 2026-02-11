/**
 * Design system: Card wrapper for inline link lists.
 */
export default function LinksCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}
