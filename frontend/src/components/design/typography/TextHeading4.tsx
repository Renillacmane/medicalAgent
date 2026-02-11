/**
 * Design system: Heading 4 — small section or list heading.
 * Use for small section titles, list headers. Class: text-lg font-medium text-light-green-dark
 */
export default function TextHeading4({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h4 className={`text-lg font-medium text-light-green-dark ${className}`.trim()}>
      {children}
    </h4>
  );
}
