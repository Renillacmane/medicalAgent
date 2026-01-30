"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authGet, UnauthorizedError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { PatientProfile } from "@/types/profile";
import Field from "@/components/ui/Field";
import PageLoading from "@/components/ui/PageLoading";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    authGet<PatientProfile>("/patients/profile")
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof UnauthorizedError) {
            router.replace("/login?redirect=/profile");
            return;
          }
          setError(e instanceof Error ? e.message : "Failed to load profile");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-slate-800">My profile</h1>
        <p className="mt-1 text-sm text-slate-500">Your account and health profile.</p>
        <PageLoading message="Loading profile…" className="mt-6 min-h-[8rem]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-slate-800">My profile</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold text-slate-800">My profile</h1>
        <p className="mt-2 text-sm text-slate-500">No profile data.</p>
      </div>
    );
  }

  const diet = profile.dietaryPreference;
  const objectives = profile.objectives;

  return (
    <div className="p-4">
      <h1 className="text-lg font-semibold text-slate-800">My profile</h1>
      <p className="mt-1 text-sm text-slate-500">Your account and health profile.</p>

      <dl className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <Field label="Name" value={`${profile.firstName} ${profile.lastName}`} />
        <Field label="Email" value={profile.email} />
        <Field label="Date of birth" value={formatDate(profile.dateOfBirth, "long")} />
        <Field label="Status" value={profile.isActive !== false ? "Active" : "Inactive"} />
        <Field label="Height" value={profile.height != null ? `${profile.height} cm` : undefined} />
        <Field label="Weight" value={profile.weight != null ? `${profile.weight} kg` : undefined} />
        <Field
          label="Dietary preference"
          value={
            diet
              ? [diet.type, diet.restrictions?.length ? `(${diet.restrictions.join(", ")})` : null]
                  .filter(Boolean)
                  .join(" ") || "—"
              : undefined
          }
        />
        <Field
          label="Objectives (body)"
          value={objectives?.body?.length ? objectives.body.join(", ") : undefined}
        />
        <Field
          label="Objectives (health)"
          value={objectives?.health?.length ? objectives.health.join(", ") : undefined}
        />
        <Field
          label="Objectives (mind)"
          value={objectives?.mind?.length ? objectives.mind.join(", ") : undefined}
        />
      </dl>
    </div>
  );
}
