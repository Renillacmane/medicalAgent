"use client";

/**
 * Green rhombus loader moving along a circular path tilted 45° (diagonal orbit).
 * Three rhombuses chase each other around the circle with staggered timing.
 */
export default function RhombusLoaderFlow({ className = "", size = 50 }: { className?: string; size?: number }) {
  const s = size;
  const rhombusSize = s * 0.36;
  const containerSize = s + 24;
  return (
    <div
      className={`relative overflow-visible ${className}`}
      style={{ width: containerSize, height: containerSize }}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-light-green-primary motion-safe:animate-rhombus-circle-45"
          style={{
            width: rhombusSize,
            height: rhombusSize,
            animationDelay: `${i * 0.55}s`,
          }}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 0L12 8L8 16L4 8L8 0Z" />
        </svg>
      ))}
    </div>
  );
}
