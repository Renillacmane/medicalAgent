"use client";

import { useState } from "react";
import AboutModal from "./AboutModal";
import AppNav from "./AppNav";
import Footer from "./Footer";
import Header from "./Header";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [aboutOpen, setAboutOpen] = useState(false);
  // AppShell doesn't own modal state if we want it controlled from layout; for simplicity we keep it here
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        <Footer onAboutClick={() => setAboutOpen(true)} />
        <AppNav />
      </div>
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}
