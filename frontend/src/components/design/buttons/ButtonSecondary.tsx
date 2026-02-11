/**
 * Design system: Secondary button — outline, secondary actions.
 * Class: border-2 border-light-green-primary, transparent bg, hover fill.
 */
export default function ButtonSecondary({
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
      className={`rounded-lg border-2 border-light-green-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-light-green-primary transition-all hover:bg-light-green-primary hover:text-white active:scale-[0.98] disabled:opacity-80 ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
