"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/pages/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams.get("redirect") ?? "/dashboard";
  const redirect =
    raw.startsWith("/") && !raw.includes("//") ? raw : "/dashboard";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold text-slate-800">Sign in</h1>
        <LoginForm
          onSuccess={() => {
            router.replace(redirect);
          }}
        />
      </div>
    </main>
  );
}
