/**
 * Design system: Info icon with optional text.
 * Displays an "i" in a circle using the theme green color.
 * Use for additional information, tips, or helpful context.
 */
export default function InfoIcon({
  text,
  className = "",
  iconSize = "default",
}: {
  text?: React.ReactNode;
  className?: string;
  iconSize?: "small" | "default" | "large";
}) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-5 w-5",
    large: "h-6 w-6",
  };

  const textSizeClasses = {
    small: "text-xs",
    default: "text-sm",
    large: "text-base",
  };

  return (
    <div className={`flex items-start gap-2 ${className}`.trim()}>
      <div className="flex shrink-0 items-center justify-center">
        <svg
          className={`${sizeClasses[iconSize]} text-light-green-primary`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M12 16v-4M12 8h.01"
          />
        </svg>
      </div>
      {text && (
        <div className={`${textSizeClasses[iconSize]} text-light-green-dark-grey`}>{text}</div>
      )}
    </div>
  );
}
