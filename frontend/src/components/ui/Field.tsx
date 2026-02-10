/**
 * Definition list field for profile and other read-only key/value blocks.
 * variant "lightGreen" uses the design system palette (light-green-*).
 */
export default function Field({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: React.ReactNode;
  variant?: "default" | "lightGreen";
}) {
  const isLightGreen = variant === "lightGreen";
  return (
    <div
      className={
        isLightGreen
          ? "border-b border-light-green-subtle/40 py-3 last:border-0"
          : "border-b border-slate-100 py-3 last:border-0"
      }
    >
      <dt
        className={
          isLightGreen
            ? "text-xs font-medium uppercase tracking-wide text-light-green-dark-grey"
            : "text-xs font-medium uppercase tracking-wide text-slate-500"
        }
      >
        {label}
      </dt>
      <dd
        className={
          isLightGreen ? "mt-0.5 text-light-green-dark" : "mt-0.5 text-slate-800"
        }
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}
