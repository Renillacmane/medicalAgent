/**
 * Design system: Primary button that shows loading state.
 * Use for actions that trigger async work; shows "Loading…" when loading is true.
 */
export default function ButtonLoadingTrigger({
  loading = false,
  onClick,
  children,
  loadingLabel = "Loading…",
  className = "",
  ...props
}: {
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  loadingLabel?: string;
  className?: string;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark disabled:opacity-80 ${className}`.trim()}
      {...props}
    >
      {loading ? loadingLabel : children}
    </button>
  );
}
