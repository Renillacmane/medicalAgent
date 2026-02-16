/**
 * Canonical loading UI from the design system: three staggered pulse dots
 * (rounded-full bg-light-green-primary animate-pulse) with optional message.
 * Use for in-page loading states instead of spinners (except where spinners are kept).
 */
export default function LoadingPulse({
  message,
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={
        className || "flex flex-col items-center justify-center gap-4"
      }
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex gap-2" aria-hidden>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-light-green-primary animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm text-light-green-dark-grey">{message}</p>
      )}
    </div>
  );
}
