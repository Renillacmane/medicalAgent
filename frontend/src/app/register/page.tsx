"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBasePath } from "@/lib/base-path";
import RegisterForm from "@/pages/RegisterForm";

export default function RegisterPage() {
  const router = useRouter();
  const basePath = useBasePath();

  return (
    <div className="flex min-h-screen flex-col bg-light-green-light">
      {/* Header */}
      <header className="border-b border-light-green-subtle/50 bg-white shadow-card">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-light-green-primary transition-colors hover:text-light-green-primary-dark">
              Healthia
            </h1>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6">
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
                  router.replace(`${basePath}/dashboard`);
                }}
              />
            </div>
            
            <p className="mt-6 text-center text-sm text-light-green-dark-grey">
              Already have an account?{" "}
              <Link
                href={`${basePath}/login`}
                className="font-medium text-light-green-primary transition-colors hover:text-light-green-primary-dark hover:underline focus:outline-none"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-light-green-subtle/60 bg-white mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-light-green-dark">Healthia · Medical Agent</p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-light-green-dark-grey transition-colors hover:text-light-green-primary">Privacy</a>
              <a href="#" className="text-sm text-light-green-dark-grey transition-colors hover:text-light-green-primary">Terms</a>
            </div>
          </div>
          <p className="mt-4 text-xs text-light-green-light-grey">© 2025 Medical Agent. Your trusted health companion.</p>
        </div>
      </footer>
    </div>
  );
}
