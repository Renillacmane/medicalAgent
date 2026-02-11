/**
 * Design system: Grid card for showcasing rhombus loader variants.
 * Use with RhombusLoaderShowcaseItem (label + loader) per column.
 */
export default function RhombusLoaderShowcaseCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-8 rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card sm:grid-cols-3 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
