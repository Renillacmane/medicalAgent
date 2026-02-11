/**
 * Design system: Content panel below the tab strip (p-6).
 */
export default function TabsPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`.trim()}>{children}</div>;
}
