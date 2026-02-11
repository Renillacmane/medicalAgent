/**
 * Design system: Grid layout for content cards (sm:2 lg:3 cols).
 */
export default function CardGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
