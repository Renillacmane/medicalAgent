import { Suspense } from "react";
import AppShell from "@/components/layout/AppShell";
import PageLoading from "@/components/ui/PageLoading";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
