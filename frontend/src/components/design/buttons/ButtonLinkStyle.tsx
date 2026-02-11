/**
 * Design system: Link-style button — text only, underline on hover.
 * Use for tertiary actions or when button looks like a link.
 */
export default function ButtonLinkStyle({
  children,
  className = "",
  type = "button",
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-light-green-primary underline-offset-2 transition-colors hover:underline active:text-light-green-primary-dark ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
