/**
 * Design system: Dashed-border box with hover styles (border fill, bg).
 */
export default function AnimatedDashedButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border-2 border-dashed border-light-green-primary/50 px-4 py-2 text-sm text-light-green-primary transition-colors hover:border-light-green-primary hover:bg-light-green-light/50 ${className}`.trim()}
      role="presentation"
    >
      {children}
    </div>
  );
}
