"use client";

import { useEffect, useState } from "react";

type GoToTopProps = {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Offset from bottom (e.g. for bottom nav). Default 1.5rem */
  bottomOffset?: string;
};

/**
 * Design system: floating "scroll to top" button.
 * Shows when scroll position > 200px. Uses design tokens (light-green-primary, shadow-card).
 */
export default function GoToTop({ scrollContainerRef, bottomOffset = "1.5rem" }: GoToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      setVisible(el.scrollTop > 200);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-light-green-subtle/60 bg-white text-light-green-primary shadow-card transition-all hover:bg-light-green-light hover:text-light-green-primary-dark hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-light-green-primary/50"
      style={{ bottom: bottomOffset }}
      aria-label="Scroll to top"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
