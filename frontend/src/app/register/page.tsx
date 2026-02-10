"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import RegisterForm from "@/pages/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-xl font-semibold text-slate-800">Create account</h1>
        <p className="mb-6 text-sm text-slate-500">
          Sign up and add your profile so we can personalize your recommendations.
        </p>
        <RegisterForm
          onSuccess={() => {
            router.replace("/dashboard");
          }}
        />
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-sky-600 hover:text-sky-700 focus:outline-none focus:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
