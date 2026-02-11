/**
 * Design system: Primary button — filled, main actions.
 * Class: rounded-lg bg-light-green-primary, white text, shadow, hover/active states.
 */
export default function ButtonPrimary({
  children,
  className = "",
  type = "button",
  disabled,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark hover:shadow-card-hover active:scale-[0.98] disabled:opacity-80 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
