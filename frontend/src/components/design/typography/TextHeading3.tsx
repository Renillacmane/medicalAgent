/**
 * Design system: Heading 3 — subsection title.
 * Use for card titles, subsections. Class: text-xl font-semibold text-light-green-dark
 */
export default function TextHeading3({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-xl font-semibold text-light-green-dark ${className}`.trim()}>
      {children}
    </h3>
  );
}
