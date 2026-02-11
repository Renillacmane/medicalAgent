import Link from "next/link";

export type DesignLinkItem = {
  href: string;
  label: string;
};

/**
 * Design system: Inline list of links (primary color, underline on hover).
 * Uses Next Link for internal hrefs and <a> for hash/anchor links.
 */
export default function InlineLinkList({
  links,
  separator = " · ",
  className = "",
}: {
  links: DesignLinkItem[];
  separator?: string;
  className?: string;
}) {
  return (
    <p className={className || "text-light-green-dark-grey"}>
      {links.map((link, i) => (
        <span key={link.href + link.label}>
          {link.href.startsWith("#") ? (
            <a href={link.href} className="text-light-green-primary underline-offset-2 hover:underline">
              {link.label}
            </a>
          ) : (
            <Link href={link.href} className="text-light-green-primary underline-offset-2 hover:underline">
              {link.label}
            </Link>
          )}
          {i < links.length - 1 && separator}
        </span>
      ))}
    </p>
  );
}
