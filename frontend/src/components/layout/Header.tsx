"use client";

import InstallButton from "@/components/pwa/InstallButton";

type HeaderProps = {
  onClose?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export default function Header({ onClose, onBack, showBack }: HeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-light-green-subtle/50 bg-white px-1 py-2 shadow-card">
      <div className="flex min-w-0 items-center gap-2">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded-lg p-1.5 text-light-green-dark-grey transition-colors hover:bg-light-green-light/50 hover:text-light-green-primary"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="truncate text-lg font-semibold text-light-green-primary">Healthia</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <InstallButton />
        {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-light-green-dark-grey transition-colors hover:bg-light-green-light/50 hover:text-light-green-primary"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        )}
      </div>
    </header>
  );
}
