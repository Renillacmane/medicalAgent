"use client";

type HeaderProps = {
  onClose?: () => void;
  onBack?: () => void;
  showBack?: boolean;
};

export default function Header({ onClose, onBack, showBack }: HeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-1 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {showBack && onBack && (
          <button
            type="button"
            onClick={onBack}
            className="shrink-0 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="truncate text-lg font-semibold text-slate-800">Healthia</h1>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </header>
  );
}
