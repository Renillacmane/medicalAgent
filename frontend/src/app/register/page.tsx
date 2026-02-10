"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import RegisterForm from "@/pages/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen bg-light-green-light">
      <div className="mx-auto w-full max-w-md flex-1 flex-col items-center justify-center p-6 flex">
        <div className="w-full">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-light-green-dark">Create account</h1>
            <p className="text-light-green-dark-grey">
              Sign up and add your profile so we can personalize your recommendations.
            </p>
          </div>
          
          <div className="rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card">
            <RegisterForm
              onSuccess={() => {
                router.replace("/dashboard");
              }}
            />
          </div>
          
          <p className="mt-6 text-center text-sm text-light-green-dark-grey">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-light-green-primary transition-colors hover:text-light-green-primary-dark hover:underline focus:outline-none"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
