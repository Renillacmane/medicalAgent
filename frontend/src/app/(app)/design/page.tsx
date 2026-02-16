"use client";

import Image from "next/image";
import { useState } from "react";
import RhombusLoader from "@/components/ui/RhombusLoader";
import RhombusLoaderFlow from "@/components/ui/RhombusLoaderFlow";
import { useBasePath } from "@/lib/base-path";
import {
  AnimatedDashedButton,
  AnimatedElementsCard,
  AnimatedOpacityCircle,
  AnimatedScaleBox,
  ButtonLinkStyle,
  ButtonLoadingTrigger,
  ButtonPrimary,
  ButtonSecondary,
  CardGrid,
  ContentCard,
  DataTable,
  DesignFooter,
  DesignHeader,
  InfoIcon,
  InlineLinkList,
  LinksCard,
  LoadingIdleMessage,
  LoadingPulse,
  LoadingSectionCard,
  RhombusLoaderShowcaseCard,
  RhombusLoaderShowcaseItem,
  TableCard,
  TabsPanel,
  TabsStrip,
  TabsTab,
  TextBody,
  TextCaption,
  TextHeading1,
  TextHeading2,
  TextHeading3,
  TextHeading4,
  TextLabel,
} from "@/components/design";
import type { DesignCardItem, DesignTableRow } from "@/components/design";

export default function DesignPage() {
  const basePath = useBasePath();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "settings">("overview");

  const triggerLoading = () => {
    setLoadingDemo(true);
    setTimeout(() => setLoadingDemo(false), 2200);
  };

  const tabs = ["overview", "details", "settings"] as const;
  const links = [
    { href: `${basePath}/dashboard`, label: "Back to Dashboard" },
    { href: `${basePath}/profile`, label: "Profile" },
    { href: "#footer", label: "Jump to footer" },
  ];
  const cards: DesignCardItem[] = [
    { title: "General & Family Medicine", desc: "Comprehensive care for all ages and everyday health needs.", href: "#", linkLabel: "Learn more →" },
    { title: "Pediatrics", desc: "Specialized health services for infants, children, and teens.", href: "#", linkLabel: "Learn more →" },
    { title: "Internal Medicine", desc: "Focused adult care for chronic and complex medical conditions.", href: "#", linkLabel: "Learn more →" },
  ];
  const tableRows: DesignTableRow[] = [
    { service: "Check-up", status: "Active", note: "Routine" },
    { service: "Lab results", status: "Pending", note: "—" },
    { service: "Follow-up", status: "Scheduled", note: "Next week" },
  ];

  return (
    <div className="min-h-screen bg-light-green-light">
      <DesignHeader title="Design Test" titleHref={`${basePath}/dashboard`} />

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
            <TextHeading1>Heading 1 — Trusted Health Partner</TextHeading1>
            <TextHeading2>Heading 2 — Medical Excellence</TextHeading2>
            <TextHeading3>Heading 3 — Services</TextHeading3>
            <TextHeading4>Heading 4 — Section</TextHeading4>
            <TextBody>
              Body text: Comprehensive, compassionate care from trusted medical professionals. Sample text helps you understand how real content may look.
            </TextBody>
            <TextCaption>Small text — captions and secondary info.</TextCaption>
            <TextLabel>Tiny text — labels and metadata.</TextLabel>
          </div>
        </section>

        {/* Buttons */}
        <section id="buttons" className="mb-14 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Buttons</h2>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
            <ButtonPrimary>Primary</ButtonPrimary>
            <ButtonSecondary>Secondary</ButtonSecondary>
            <ButtonLinkStyle>Link style</ButtonLinkStyle>
            <ButtonLoadingTrigger loading={loadingDemo} onClick={triggerLoading}>
              Trigger loading
            </ButtonLoadingTrigger>
          </div>
        </section>

        {/* Loading */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Loading</h2>
          <LoadingSectionCard>
            {loadingDemo ? (
              <LoadingPulse message="Loading content…" />
            ) : (
              <LoadingIdleMessage>
                Click &quot;Trigger loading&quot; above to see the loading state.
              </LoadingIdleMessage>
            )}
          </LoadingSectionCard>
        </section>

        {/* Rhombus loaders */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Rhombus loaders</h2>
          <RhombusLoaderShowcaseCard>
            <RhombusLoaderShowcaseItem label="Original GIF (black rhombuses)">
              <Image
                src="/images/icons8-rhombus-loader-50.gif"
                alt="Rhombus loading animation"
                width={50}
                height={50}
                unoptimized
                className="h-[50px] w-[50px]"
              />
            </RhombusLoaderShowcaseItem>
            <RhombusLoaderShowcaseItem label="Green (bounce)">
              <RhombusLoader size={50} />
            </RhombusLoaderShowcaseItem>
            <RhombusLoaderShowcaseItem label="Green (circle 45°)">
              <RhombusLoaderFlow size={50} />
            </RhombusLoaderShowcaseItem>
          </RhombusLoaderShowcaseCard>
        </section>

        {/* Tabs / Menu */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Tabs / Menu</h2>
          <TabsStrip>
            <div className="flex border-b border-light-green-subtle/60">
              {tabs.map((tab) => (
                <TabsTab
                  key={tab}
                  active={activeTab === tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                >
                  {tab}
                </TabsTab>
              ))}
            </div>
            <TabsPanel>
              <p className="text-light-green-dark-grey">
                Active tab: <span className="font-medium text-light-green-dark">{activeTab}</span>. Tabs change background and border on selection.
              </p>
            </TabsPanel>
          </TabsStrip>
        </section>

        {/* Cards */}
        <section id="cards" className="mb-14 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Cards</h2>
          <CardGrid>
            {cards.map((card) => (
              <ContentCard key={card.title} {...card} />
            ))}
          </CardGrid>
        </section>

        {/* Table */}
        <section id="table" className="mb-14 scroll-mt-6">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Table</h2>
          <TableCard>
            <DataTable rows={tableRows} />
          </TableCard>
        </section>

        {/* Links */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Links</h2>
          <LinksCard>
            <InlineLinkList links={links} />
          </LinksCard>
        </section>

        {/* Info Icon */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Info Icon</h2>
          <div className="space-y-4 rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
            <InfoIcon text="Additional information or helpful context can be displayed here." />
            <InfoIcon text="Small size info icon" iconSize="small" />
            <InfoIcon text="Default size info icon" iconSize="default" />
            <InfoIcon text="Large size info icon" iconSize="large" />
            <InfoIcon />
          </div>
        </section>

        {/* Animated elements */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-semibold text-light-green-dark">Animated elements</h2>
          <AnimatedElementsCard>
            <AnimatedScaleBox />
            <AnimatedOpacityCircle />
            <LoadingPulse />
            <AnimatedDashedButton>Hover me</AnimatedDashedButton>
          </AnimatedElementsCard>
        </section>
      </div>

      <DesignFooter id="footer" basePath={basePath} />
    </div>
  );
}
