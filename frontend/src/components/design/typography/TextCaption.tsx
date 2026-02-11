/**
 * Design system: Caption / small text — secondary info, captions.
 * Use for supporting text, captions, dates. Class: text-sm text-light-green-dark-grey
 */
export default function TextCaption({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-light-green-dark-grey ${className}`.trim()}>
      {children}
    </p>
  );
}
