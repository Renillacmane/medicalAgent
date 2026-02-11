import Link from "next/link";

export type DesignCardItem = {
  title: string;
  desc: string;
  href?: string;
  linkLabel?: string;
};

/**
 * Design system: Single content card (title, description, optional link).
 */
export default function ContentCard({
  title,
  desc,
  href,
  linkLabel,
  className = "",
}: DesignCardItem & { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-light-green-primary/30 hover:shadow-card-hover ${className}`.trim()}
    >
      <h3 className="text-lg font-semibold text-light-green-dark">{title}</h3>
      <p className="mt-2 text-sm text-light-green-dark-grey">{desc}</p>
      {href != null && linkLabel && (
        <Link
          href={href}
          className="mt-4 inline-block text-sm font-medium text-light-green-primary transition-colors hover:text-light-green-primary-dark hover:underline"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
