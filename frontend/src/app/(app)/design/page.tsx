"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import RhombusLoader from "@/components/ui/RhombusLoader";
import RhombusLoaderFlow from "@/components/ui/RhombusLoaderFlow";

export default function DesignPage() {
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "settings">("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  const triggerLoading = () => {
    setLoadingDemo(true);
    setTimeout(() => setLoadingDemo(false), 2200);
  };

  return (
    <div className="min-h-screen bg-light-green-light">
      {/* ----- Header (light-green style) ----- */}
      <header className="border-b border-light-green-subtle/50 bg-white shadow-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xl font-semibold text-light-green-primary transition-colors hover:text-light-green-primary-dark"
            >
              Design Test
            </Link>
            <nav className="hidden gap-6 sm:flex">
              <Link
                href="#buttons"
                className="text-sm font-medium text-light-green-dark-grey transition-colors hover:text-light-green-primary"
              >
                Buttons
              </Link>
              <Link
                href="#cards"
                className="text-sm font-medium text-light-green-dark-grey transition-colors hover:text-light-green-primary"
              >
                Cards
              </Link>
              <Link
                href="#table"
                className="text-sm font-medium text-light-green-dark-grey transition-colors hover:text-light-green-primary"
              >
                Table
              </Link>
              <Link
                href="#footer"
                className="text-sm font-medium text-light-green-dark-grey transition-colors hover:text-light-green-primary"
              >
                Footer
              </Link>
            </nav>
            <div className="relative sm:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg px-3 py-2 text-light-green-dark transition-colors hover:bg-light-green-subtle/50 active:bg-light-green-subtle"
                aria-expanded={menuOpen}
              >
                <span className="sr-only">Menu</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-light-green-subtle bg-white py-2 shadow-card-hover">
                  <Link href="#buttons" className="block px-4 py-2 text-sm text-light-green-dark-grey hover:bg-light-green-light hover:text-light-green-primary" onClick={() => setMenuOpen(false)}>Buttons</Link>
                  <Link href="#cards" className="block px-4 py-2 text-sm text-light-green-dark-grey hover:bg-light-green-light hover:text-light-green-primary" onClick={() => setMenuOpen(false)}>Cards</Link>
                  <Link href="#table" className="block px-4 py-2 text-sm text-light-green-dark-grey hover:bg-light-green-light hover:text-light-green-primary" onClick={() => setMenuOpen(false)}>Table</Link>
                  <Link href="#footer" className="block px-4 py-2 text-sm text-light-green-dark-grey hover:bg-light-green-light hover:text-light-green-primary" onClick={() => setMenuOpen(false)}>Footer</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* Hero / intro */}
        <section className="mb-14 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-light-green-primary">Design system</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-light-green-dark sm:text-5xl">
            Light-green components
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-light-green-dark-grey">
            Buttons, cards, tables, loading states, animations, and typography for a calm, medical-grade feel.
          </p>
        </section>

        {/* Typography */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Typography</h2>
          <div className="space-y-4 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
            <h1 className="text-3xl font-bold text-light-green-dark">Heading 1 — Trusted Health Partner</h1>
            <h2 className="text-2xl font-semibold text-light-green-dark">Heading 2 — Medical Excellence</h2>
            <h3 className="text-xl font-semibold text-light-green-dark">Heading 3 — Services</h3>
            <h4 className="text-lg font-medium text-light-green-dark">Heading 4 — Section</h4>
            <p className="text-base text-light-green-dark-grey">
              Body text: Comprehensive, compassionate care from trusted medical professionals. Sample text helps you understand how real content may look.
            </p>
            <p className="text-sm text-light-green-dark-grey">Small text — captions and secondary info.</p>
            <p className="text-xs text-light-green-light-grey">Tiny text — labels and metadata.</p>
          </div>
        </section>

        {/* Buttons */}
        <section id="buttons" className="mb-14 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Buttons</h2>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
            <button
              type="button"
              className="rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark hover:shadow-card-hover active:scale-[0.98]"
            >
              Primary
            </button>
            <button
              type="button"
              className="rounded-lg border-2 border-light-green-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-light-green-primary transition-all hover:bg-light-green-primary hover:text-white active:scale-[0.98]"
            >
              Secondary
            </button>
            <button
              type="button"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-light-green-primary underline-offset-2 transition-colors hover:underline active:text-light-green-primary-dark"
            >
              Link style
            </button>
            <button
              type="button"
              onClick={triggerLoading}
              disabled={loadingDemo}
              className="rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark disabled:opacity-80"
            >
              {loadingDemo ? "Loading…" : "Trigger loading"}
            </button>
          </div>
        </section>

        {/* Loading element */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Loading</h2>
          <div className="rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card">
            {loadingDemo ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-light-green-subtle border-t-light-green-primary" />
                <p className="text-sm text-light-green-dark-grey">Loading content…</p>
                <div className="flex w-full max-w-xs gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-2 flex-1 animate-pulse rounded bg-light-green-subtle" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-light-green-dark-grey">Click &quot;Trigger loading&quot; above to see the loading state.</p>
            )}
          </div>
        </section>

        {/* Rhombus loaders: GIF + green bounce + green flow-up */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Rhombus loaders</h2>
          <div className="grid gap-8 rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card sm:grid-cols-3">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-light-green-dark-grey">Original GIF (black rhombuses)</p>
              <Image
                src="/images/icons8-rhombus-loader-50.gif"
                alt="Rhombus loading animation"
                width={50}
                height={50}
                unoptimized
                className="h-[50px] w-[50px]"
              />
            </div>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-light-green-dark-grey">Green (bounce)</p>
              <RhombusLoader size={50} />
            </div>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm font-medium text-light-green-dark-grey">Green (circle 45°)</p>
              <RhombusLoaderFlow size={50} />
            </div>
          </div>
        </section>

        {/* Tabs (menu-like) */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Tabs / Menu</h2>
          <div className="rounded-xl border border-light-green-subtle/60 bg-white shadow-card">
            <div className="flex border-b border-light-green-subtle/60">
              {(["overview", "details", "settings"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-colors first:rounded-tl-xl last:rounded-tr-xl ${
                    activeTab === tab
                      ? "border-b-2 border-light-green-primary text-light-green-primary bg-light-green-light/50"
                      : "text-light-green-dark-grey hover:bg-light-green-light/30 hover:text-light-green-dark"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              <p className="text-light-green-dark-grey">
                Active tab: <span className="font-medium text-light-green-dark">{activeTab}</span>. Tabs change background and border on selection.
              </p>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section id="cards" className="mb-14 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Cards</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "General & Family Medicine", desc: "Comprehensive care for all ages and everyday health needs.", delay: "0ms" },
              { title: "Pediatrics", desc: "Specialized health services for infants, children, and teens.", delay: "75ms" },
              { title: "Internal Medicine", desc: "Focused adult care for chronic and complex medical conditions.", delay: "150ms" },
            ].map((card, i) => (
              <div
                key={card.title}
                className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card transition-all hover:-translate-y-0.5 hover:border-light-green-primary/30 hover:shadow-card-hover"
                style={{ animationDelay: card.delay }}
              >
                <h3 className="text-lg font-semibold text-light-green-dark">{card.title}</h3>
                <p className="mt-2 text-sm text-light-green-dark-grey">{card.desc}</p>
                <Link
                  href="#"
                  className="mt-4 inline-block text-sm font-medium text-light-green-primary transition-colors hover:text-light-green-primary-dark hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section id="table" className="mb-14 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Table</h2>
          <div className="overflow-hidden rounded-xl border border-light-green-subtle/60 bg-white shadow-card">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-light-green-subtle/80 bg-light-green-light/60">
                <tr>
                  <th className="px-4 py-3 font-semibold text-light-green-dark">Service</th>
                  <th className="px-4 py-3 font-semibold text-light-green-dark">Status</th>
                  <th className="px-4 py-3 font-semibold text-light-green-dark">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-green-subtle/40">
                {[
                  { service: "Check-up", status: "Active", note: "Routine" },
                  { service: "Lab results", status: "Pending", note: "—" },
                  { service: "Follow-up", status: "Scheduled", note: "Next week" },
                ].map((row) => (
                  <tr key={row.service} className="transition-colors hover:bg-light-green-light/40">
                    <td className="px-4 py-3 font-medium text-light-green-dark">{row.service}</td>
                    <td className="px-4 py-3 text-light-green-dark-grey">{row.status}</td>
                    <td className="px-4 py-3 text-light-green-light-grey">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Links */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Links</h2>
          <div className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
            <p className="text-light-green-dark-grey">
              <Link href="/dashboard" className="text-light-green-primary underline-offset-2 hover:underline">
                Back to Dashboard
              </Link>
              {" · "}
              <Link href="/profile" className="text-light-green-primary underline-offset-2 hover:underline">
                Profile
              </Link>
              {" · "}
              <a href="#footer" className="text-light-green-primary underline-offset-2 hover:underline">
                Jump to footer
              </a>
            </p>
          </div>
        </section>

        {/* Animated elements */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Animated elements</h2>
          <div className="flex flex-wrap gap-6 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
            <div className="h-16 w-16 rounded-lg bg-light-green-primary/20 transition-transform hover:scale-110 hover:bg-light-green-primary/30" />
            <div className="h-16 w-16 rounded-full bg-light-green-primary transition-opacity hover:opacity-80" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full bg-light-green-primary animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
            <div className="rounded-lg border-2 border-dashed border-light-green-primary/50 px-4 py-2 text-sm text-light-green-primary transition-colors hover:border-light-green-primary hover:bg-light-green-light/50">
              Hover me
            </div>
          </div>
        </section>
      </div>

      {/* ----- Footer ----- */}
      <footer id="footer" className="border-t border-light-green-subtle/60 bg-white mt-14 scroll-mt-6">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-light-green-dark">Design Test · light-green</p>
            <div className="flex gap-6">
              <Link href="/dashboard" className="text-sm text-light-green-dark-grey transition-colors hover:text-light-green-primary">Dashboard</Link>
              <Link href="/profile" className="text-sm text-light-green-dark-grey transition-colors hover:text-light-green-primary">Profile</Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-light-green-light-grey">© 2025 Medical Agent. Design tokens from light-green healthcare UI.</p>
        </div>
      </footer>
    </div>
  );
}
