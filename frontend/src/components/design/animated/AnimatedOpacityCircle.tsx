/**
 * Design system: Circle that changes opacity on hover.
 */
export default function AnimatedOpacityCircle({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-16 w-16 rounded-full bg-light-green-primary transition-opacity hover:opacity-80 ${className}`.trim()}
      aria-hidden
    />
  );
}
