"use client";

type FooterProps = {
  onAboutClick?: () => void;
};

export default function Footer({ onAboutClick }: FooterProps) {
  return (
    <footer className="shrink-0 border-t border-slate-200 px-1 py-2">
      <button
        type="button"
        onClick={onAboutClick}
        className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-slate-700 hover:decoration-slate-500"
      >
        About Healthia
      </button>
    </footer>
  );
}
