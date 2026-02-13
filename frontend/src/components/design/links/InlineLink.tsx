import Link from "next/link";

import type { DesignLinkItem } from "./InlineLinkList";

const VARIANT_CLASSES = {
  default: "text-light-green-primary underline-offset-2 hover:underline",
  footer: "text-sm text-light-green-dark-grey transition-colors hover:text-light-green-primary",
} as const;

type InlineLinkProps = DesignLinkItem & {
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
};

/**
 * Design system: single inline link. Uses Next Link for internal hrefs, <a> for hash/anchor.
 * Use directly for one link, or via InlineLinkList for multiple.
 */
export default function InlineLink({ href, label, variant = "default", className = "" }: InlineLinkProps) {
  const classes = `${VARIANT_CLASSES[variant]} ${className}`.trim();

  if (href.startsWith("#")) {
    return (
      <a href={href} className={classes}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}
