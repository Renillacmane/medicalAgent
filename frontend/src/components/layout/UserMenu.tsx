"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { authGet } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { clearAuthToken } from "@/lib/pwa/offline-store";
import type { PatientProfile } from "@/types/profile";

function getInitials(profile: PatientProfile | null): string {
  if (!profile) return "?";
  const first = (profile.firstName ?? "").trim().slice(0, 1);
  const last = (profile.lastName ?? "").trim().slice(0, 1);
  if (first || last) return (first + last).toUpperCase() || "?";
  if ((profile.email ?? "").trim()) return profile.email!.trim().slice(0, 1).toUpperCase();
  return "?";
}

function getDisplayName(profile: PatientProfile | null): string {
  if (!profile) return "Account";
  const first = (profile.firstName ?? "").trim();
  const last = (profile.lastName ?? "").trim();
  if (first || last) return [first, last].filter(Boolean).join(" ");
  return profile.email?.trim() ?? "Account";
}

type UserMenuProps = {
  /** When true, menu is inside mobile sheet so use full width / compact style if needed */
  variant?: "desktop" | "mobile";
};

export default function UserMenu({ variant = "desktop" }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = useBasePath();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    authGet<PatientProfile>("/patients/profile")
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const handleSignOut = () => {
    setOpen(false);
    clearToken();
    clearAuthToken().catch(() => {});
    router.replace(`${basePath}/login?redirect=${encodeURIComponent(pathname || basePath + "/dashboard")}`);
  };

  const profileHref = basePath + "/profile";
  const isProfileActive = pathname === profileHref;

  if (loading && variant === "desktop") {
    return (
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-light-green-subtle/60" aria-hidden />
    );
  }

  const initials = getInitials(profile);
  const displayName = getDisplayName(profile);

  if (variant === "mobile") {
    return (
      <div className="border-t border-light-green-subtle/50 pt-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-light-green-primary/15 text-sm font-semibold text-light-green-primary"
            aria-hidden
          >
            {initials}
          </div>
          <span className="truncate text-sm font-medium text-light-green-dark">{displayName}</span>
        </div>
        <Link
          href={profileHref}
          onClick={() => setOpen(false)}
          className={`block px-4 py-2 text-sm transition-colors hover:bg-light-green-light ${
            isProfileActive ? "font-medium text-light-green-primary" : "text-light-green-dark-grey hover:text-light-green-primary"
          }`}
        >
          My profile
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="block w-full px-4 py-2 text-left text-sm text-light-green-dark-grey transition-colors hover:bg-light-green-light hover:text-light-green-primary"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 text-left transition-colors hover:bg-light-green-light/70 focus:outline-none focus:ring-2 focus:ring-light-green-primary/50"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-light-green-primary/15 text-sm font-semibold text-light-green-primary"
          aria-hidden
        >
          {initials}
        </div>
        <span className="hidden max-w-[120px] truncate text-sm font-medium text-light-green-dark sm:block">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-light-green-dark-grey transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-light-green-subtle bg-white py-1 shadow-card-hover"
          role="menu"
        >
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            role="menuitem"
            className={`block px-4 py-2.5 text-sm transition-colors hover:bg-light-green-light ${
              isProfileActive ? "font-medium text-light-green-primary" : "text-light-green-dark-grey hover:text-light-green-primary"
            }`}
          >
            My profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm text-light-green-dark-grey transition-colors hover:bg-light-green-light hover:text-light-green-primary"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
