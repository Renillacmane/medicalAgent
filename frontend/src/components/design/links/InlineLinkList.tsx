import InlineLink from "./InlineLink";

export type DesignLinkItem = {
  href: string;
  label: string;
};

type InlineLinkListProps = {
  links: DesignLinkItem[];
  separator?: string;
  /** "inline" = single line with separator; "row" = flex gap-6 (e.g. footer) */
  layout?: "inline" | "row";
  variant?: "default" | "footer";
  className?: string;
};

/**
 * Design system: list of links. Uses InlineLink for each item.
 * - layout "inline": one line with separator (default).
 * - layout "row": flex gap-6 for footer-style layout.
 */
export default function InlineLinkList({
  links,
  separator = " · ",
  layout = "inline",
  variant = "default",
  className = "",
}: InlineLinkListProps) {
  if (links.length === 0) return null;

  if (links.length === 1) {
    return (
      <span className={className || (layout === "inline" ? "text-light-green-dark-grey" : "")}>
        <InlineLink href={links[0].href} label={links[0].label} variant={variant} />
      </span>
    );
  }

  if (layout === "row") {
    return (
      <div className={`flex gap-6 ${className}`.trim()}>
        {links.map((link) => (
          <InlineLink key={`${link.href}-${link.label}`} href={link.href} label={link.label} variant={variant} />
        ))}
      </div>
    );
  }

  return (
    <p className={className || "text-light-green-dark-grey"}>
      {links.map((link, i) => (
        <span key={`${link.href}-${link.label}`}>
          <InlineLink href={link.href} label={link.label} variant={variant} />
          {i < links.length - 1 && separator}
        </span>
      ))}
    </p>
  );
}
