import Link from "next/link";

export type DesignFooterLink = {
  href: string;
  label: string;
};

type DesignFooterProps = {
  id?: string;
  title?: string;
  links?: DesignFooterLink[];
  copyright?: string;
  basePath?: string;
};

/**
 * Design system: footer with title, links, and copyright.
 * Reference by name: DesignFooter
 */
export default function DesignFooter({
  id,
  title = "Design Test · light-green",
  links,
  copyright = "© 2025 Medical Agent. Design tokens from light-green healthcare UI.",
  basePath = "",
}: DesignFooterProps) {
  const defaultLinks: DesignFooterLink[] = [
    { href: `${basePath}/dashboard`, label: "Dashboard" },
    { href: `${basePath}/profile`, label: "Profile" },
  ];
  const resolvedLinks = links ?? defaultLinks;

  return (
    <footer id={id} className="border-t border-light-green-subtle/60 bg-white mt-14 scroll-mt-6">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-light-green-dark">{title}</p>
          <div className="flex gap-6">
            {resolvedLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-sm text-light-green-dark-grey transition-colors hover:text-light-green-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-light-green-light-grey">{copyright}</p>
      </div>
    </footer>
  );
}
