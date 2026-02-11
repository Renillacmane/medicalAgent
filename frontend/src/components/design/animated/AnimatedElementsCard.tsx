/**
 * Design system: Flex wrapper for animated element demos (gap-6, flex-wrap).
 */
export default function AnimatedElementsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap gap-6 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}
