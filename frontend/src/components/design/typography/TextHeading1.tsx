/**
 * Design system: Heading 1 — page title.
 * Use for main page titles. Class: text-3xl font-bold text-light-green-dark
 */
export default function TextHeading1({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 className={`text-3xl font-bold text-light-green-dark ${className}`.trim()}>
      {children}
    </h1>
  );
}
