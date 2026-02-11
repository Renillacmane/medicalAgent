/**
 * Design system: Single item in a rhombus loader showcase (label + loader content).
 */
export default function RhombusLoaderShowcaseItem({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-4 ${className}`.trim()}
    >
      <p className="text-sm font-medium text-light-green-dark-grey">{label}</p>
      {children}
    </div>
  );
}
