"use client";

/**
 * Green rhombus loader matching the design page primary color (#0d9488).
 * Mimics the three-rhombus wave animation from icons8-rhombus-loader.
 */
export default function RhombusLoader({ className = "", size = 50 }: { className?: string; size?: number }) {
  const s = size;
  const small = s * 0.32;
  const large = s * 0.4;
  return (
    <div
      className={`flex items-end justify-center gap-1 ${className}`}
      style={{ minHeight: s, gap: s * 0.06 }}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="text-light-green-primary motion-safe:animate-rhombus-bounce flex-shrink-0"
        style={{ width: small, height: small, animationDelay: "0ms" }}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 0L12 8L8 16L4 8L8 0Z" />
      </svg>
      <svg
        className="text-light-green-primary motion-safe:animate-rhombus-bounce flex-shrink-0"
        style={{ width: large, height: large, animationDelay: "150ms" }}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 0L12 8L8 16L4 8L8 0Z" />
      </svg>
      <svg
        className="text-light-green-primary motion-safe:animate-rhombus-bounce flex-shrink-0"
        style={{ width: small, height: small, animationDelay: "300ms" }}
        viewBox="0 0 16 16"
        fill="currentColor"
      >
        <path d="M8 0L12 8L8 16L4 8L8 0Z" />
      </svg>
    </div>
  );
}
