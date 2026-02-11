"use client";

type FooterProps = {
  onAboutClick?: () => void;
};

export default function Footer({ onAboutClick }: FooterProps) {
  return (
    <footer className="shrink-0 border-t border-light-green-subtle/60 bg-white px-1 py-2">
      <button
        type="button"
        onClick={onAboutClick}
        className="text-sm text-light-green-dark-grey underline decoration-light-green-subtle underline-offset-2 transition-colors hover:text-light-green-primary hover:decoration-light-green-primary/50"
      >
        About Healthia
      </button>
    </footer>
  );
}
