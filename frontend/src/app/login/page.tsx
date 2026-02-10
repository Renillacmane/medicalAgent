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
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-xl font-semibold text-slate-800">Sign in</h1>
      <LoginForm
        onSuccess={() => {
          router.replace(redirect);
        }}
      />
      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-sky-600 hover:text-sky-700 focus:outline-none focus:underline"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="w-full max-w-sm text-slate-500">Loading…</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
