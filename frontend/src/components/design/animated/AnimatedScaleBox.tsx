/**
 * Design system: Box that scales on hover (scale-110, bg opacity change).
 */
export default function AnimatedScaleBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-16 w-16 rounded-lg bg-light-green-primary/20 transition-transform hover:scale-110 hover:bg-light-green-primary/30 ${className}`.trim()}
      aria-hidden
    />
  );
}
