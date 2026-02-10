"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/pages/LoginForm";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const raw = searchParams?.get("redirect") ?? "/dashboard";
  const redirect =
    raw.startsWith("/") && !raw.includes("//") ? raw : "/dashboard";

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-light-green-dark">Sign in</h1>
        <p className="text-light-green-dark-grey">
          Welcome back to your health journey
        </p>
      </div>
      
      <div className="rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card">
        <LoginForm
          onSuccess={() => {
            router.replace(redirect);
          }}
        />
      </div>
      
      <p className="mt-6 text-center text-sm text-light-green-dark-grey">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-light-green-primary transition-colors hover:text-light-green-primary-dark hover:underline focus:outline-none"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-light-green-light">
      <div className="mx-auto w-full max-w-sm flex-1 flex-col items-center justify-center p-6 flex">
        <Suspense fallback={<div className="w-full max-w-sm text-light-green-dark-grey">Loading…</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </main>
  );
}
