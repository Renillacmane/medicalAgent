/**
 * Design system: Body text — main paragraph content.
 * Use for paragraphs and main copy. Class: text-base text-light-green-dark-grey
 */
export default function TextBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-base text-light-green-dark-grey ${className}`.trim()}>
      {children}
    </p>
  );
}
