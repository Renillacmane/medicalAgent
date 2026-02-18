"use client";

import InlineLinkList from "./links/InlineLinkList";
import TextLabel from "./typography/TextLabel";

export type DesignFooterLink = {
  href: string;
  label: string;
};

const FOOTER_LINK_CLASS =
  "text-xs text-light-green-dark-grey transition-colors hover:text-light-green-primary";

type DesignFooterProps = {
  id?: string;
  title?: React.ReactNode;
  links?: DesignFooterLink[];
  /** Optional button (e.g. "About Healthia") that opens a modal; rendered with same style as links */
  onAboutClick?: () => void;
  aboutLabel?: string;
  copyright?: string;
  basePath?: string;
  /** Set false when used in app shell so no top margin; design page uses true for scroll-mt */
  withTopMargin?: boolean;
};

/**
 * Design system: footer with title (e.g. quote), links and/or About button, and copyright.
 * Use in app shell (title, onAboutClick, copyright) or design page (title, links, basePath).
 */
export default function DesignFooter({
  id,
  title = "Design Test · light-green",
  links,
  onAboutClick,
  aboutLabel = "About Healthia",
  copyright = "© 2025 Medical Agent. Design tokens from light-green healthcare UI.",
  basePath = "",
  withTopMargin = true,
}: DesignFooterProps) {
  const defaultLinks: DesignFooterLink[] =
    links ??
    (basePath
      ? [
          { href: `${basePath}/dashboard`, label: "Dashboard" },
          { href: `${basePath}/profile`, label: "Profile" },
        ]
      : []);

  const footerClass = [
    "shrink-0 border-t border-light-green-subtle/60 bg-white",
    withTopMargin ? "mt-14 scroll-mt-6" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer id={id} className={footerClass}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-light-green-dark">{title}</p>
          <div className="flex flex-wrap items-center gap-6">
            {onAboutClick && (
              <button
                type="button"
                onClick={onAboutClick}
                className={FOOTER_LINK_CLASS}
              >
                {aboutLabel}
              </button>
            )}
            {defaultLinks.length > 0 && (
              <InlineLinkList links={defaultLinks} layout="row" variant="footer" />
            )}
          </div>
        </div>
        <TextLabel className="mt-4 block text-[0.6875rem]">{copyright}</TextLabel>
      </div>
    </footer>
  );
}
