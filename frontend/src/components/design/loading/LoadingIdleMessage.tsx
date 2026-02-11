/**
 * Design system: Centered idle message for loading sections.
 * Shown when not loading (e.g. "Click 'Trigger loading' above to see the loading state.").
 */
export default function LoadingIdleMessage({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-center text-light-green-dark-grey ${className}`.trim()}
    >
      {children}
    </p>
  );
}
