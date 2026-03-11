"use client";

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const QUOTE = '"Big Things Happen When You Do the Little Things Right" — Don Gabor';
const COPYRIGHT = "© 2026 Medical Agent. Your trusted health companion.";

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-slate-900/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-healthia-title"
        className="fixed left-1/2 top-1/2 z-[61] w-[min(340px,calc(100vw-2rem)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <h2 id="about-healthia-title" className="mb-3 text-lg font-semibold text-slate-800">
          About Healthia
        </h2>
        <p className="mb-4 text-sm text-slate-600 leading-relaxed">
          Healthia is your personal health companion. It helps you track vitals, medications, and
          daily check-ins, and delivers gentle, non-critical recommendations to support your
          wellbeing. Quick access to your dashboard, add new entries, and manage your profile from
          anywhere.
        </p>
        <p className="mb-4 text-sm font-medium text-slate-700 italic">
          {QUOTE}
        </p>
        <p className="mb-4 text-xs text-slate-500">
          {COPYRIGHT}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Close
        </button>
      </div>
    </>
  );
}
