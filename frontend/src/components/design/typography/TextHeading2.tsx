/**
 * Design system: Heading 2 — section title.
 * Use for major section headings. Class: text-2xl font-semibold text-light-green-dark
 */
export default function TextHeading2({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-2xl font-semibold text-light-green-dark ${className}`.trim()}>
      {children}
    </h2>
  );
}
