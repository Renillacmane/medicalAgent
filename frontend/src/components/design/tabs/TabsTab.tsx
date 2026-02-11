/**
 * Design system: Single tab button in a tab strip (active/inactive styles).
 */
export default function TabsTab({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 text-sm font-medium capitalize transition-colors first:rounded-tl-xl last:rounded-tr-xl ${
        active
          ? "border-b-2 border-light-green-primary bg-light-green-light/50 text-light-green-primary"
          : "text-light-green-dark-grey hover:bg-light-green-light/30 hover:text-light-green-dark"
      } ${className}`.trim()}
    >
      {children}
    </button>
  );
}
