/**
 * Design system: Label / tiny text — labels, metadata.
 * Use for form labels, metadata, fine print. Class: text-xs text-light-green-light-grey
 */
export default function TextLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-light-green-light-grey ${className}`.trim()}>
      {children}
    </p>
  );
}
