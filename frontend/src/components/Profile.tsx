"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { UnauthorizedError } from "@/lib/api";
import { getProfile, updateProfile } from "@/services/patients.service";
import { formatDate } from "@/lib/format";
import type { PatientProfile } from "@/types/profile";
import { LoadingPulse } from "@/components/design";
import Field from "@/components/ui/Field";

type EditForm = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  isActive: boolean;
  dietaryType: string;
  dietaryRestrictions: string;
  objectivesBody: string;
  objectivesHealth: string;
  objectivesMind: string;
};

function profileToEditForm(p: PatientProfile): EditForm {
  const dob =
    typeof p.dateOfBirth === "string" && p.dateOfBirth.includes("T")
      ? p.dateOfBirth.slice(0, 10)
      : p.dateOfBirth?.slice?.(0, 10) ?? "";
  return {
    firstName: p.firstName ?? "",
    lastName: p.lastName ?? "",
    dateOfBirth: dob,
    height: p.height != null ? String(p.height) : "",
    weight: p.weight != null ? String(p.weight) : "",
    isActive: p.isActive !== false,
    dietaryType: p.dietaryPreference?.type ?? "",
    dietaryRestrictions: (p.dietaryPreference?.restrictions ?? []).join(", "),
    objectivesBody: (p.objectives?.body ?? []).join(", "),
    objectivesHealth: (p.objectives?.health ?? []).join(", "),
    objectivesMind: (p.objectives?.mind ?? []).join(", "),
  };
}

function editFormToPayload(form: EditForm): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  if (firstName) payload.firstName = firstName;
  if (lastName) payload.lastName = lastName;
  if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
  payload.isActive = form.isActive;

  const height = form.height.trim() ? Number(form.height) : NaN;
  const weight = form.weight.trim() ? Number(form.weight) : NaN;
  if (!Number.isNaN(height)) payload.height = height;
  if (!Number.isNaN(weight)) payload.weight = weight;

  const restrictions = form.dietaryRestrictions
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (form.dietaryType.trim() || restrictions.length > 0) {
    payload.dietaryPreference = {
      type: form.dietaryType.trim() || undefined,
      restrictions,
    };
  }

  const body = form.objectivesBody.split(",").map((s) => s.trim()).filter(Boolean);
  const health = form.objectivesHealth.split(",").map((s) => s.trim()).filter(Boolean);
  const mind = form.objectivesMind.split(",").map((s) => s.trim()).filter(Boolean);
  payload.objectives = { body, health, mind };

  return payload;
}

const inputClass =
  "mt-1 block w-full rounded-lg border border-light-green-subtle/80 bg-white px-3 py-2 text-light-green-dark shadow-sm transition-colors focus:border-light-green-primary focus:outline-none focus:ring-2 focus:ring-light-green-primary/30";

export default function Profile() {
  const router = useRouter();
  const basePath = useBasePath();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((e) => {
        if (!cancelled) {
          if (e instanceof UnauthorizedError) {
            router.replace(`${basePath}/login?redirect=${encodeURIComponent(basePath + "/profile")}`);
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
  }, [router, basePath]);

  const startEdit = () => {
    if (profile) {
      setForm(profileToEditForm(profile));
      setIsEditing(true);
      setSaveError(null);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setForm(null);
    setSaveError(null);
  };

  const updateForm = (updates: Partial<EditForm>) => {
    setForm((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const saveProfile = async () => {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    try {
      const payload = editFormToPayload(form);
      const updated = await updateProfile(payload);
      setProfile(updated);
      setIsEditing(false);
      setForm(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-green-light px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-light-green-dark">My profile</h1>
          <p className="mt-1 text-sm text-light-green-dark-grey">Your account and health profile.</p>
          <div className="mt-8 rounded-xl border border-light-green-subtle/60 bg-white p-8 shadow-card">
            <LoadingPulse message="Loading profile…" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light-green-light px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-light-green-dark">My profile</h1>
          <p className="mt-2 text-sm text-red-600" role="alert">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-light-green-light px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold text-light-green-dark">My profile</h1>
          <p className="mt-2 text-sm text-light-green-dark-grey">No profile data.</p>
        </div>
      </div>
    );
  }

  const diet = profile.dietaryPreference;
  const objectives = profile.objectives;

  return (
    <div className="min-h-screen bg-light-green-light px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-light-green-dark">My profile</h1>
            <p className="mt-1 text-sm text-light-green-dark-grey">Your account and health profile.</p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={startEdit}
              className="rounded-lg border-2 border-light-green-primary bg-transparent px-4 py-2.5 text-sm font-semibold text-light-green-primary transition-all hover:bg-light-green-primary hover:text-white active:scale-[0.98]"
            >
              Edit
            </button>
          ) : null}
        </div>

        {isEditing && form ? (
          <div className="mt-8 space-y-8">
            {saveError && (
              <p className="text-sm text-red-600" role="alert">
                {saveError}
              </p>
            )}
            {/* Account */}
            <div className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-light-green-dark-grey">Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">First name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => updateForm({ firstName: e.target.value })}
                    className={inputClass}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Last name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => updateForm({ lastName: e.target.value })}
                    className={inputClass}
                    placeholder="Last name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Date of birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateForm({ dateOfBirth: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="profile-isActive"
                    checked={form.isActive}
                    onChange={(e) => updateForm({ isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-light-green-subtle text-light-green-primary focus:ring-light-green-primary"
                  />
                  <label htmlFor="profile-isActive" className="text-sm text-light-green-dark">Account active</label>
                </div>
              </div>
            </div>
            {/* Vitals & preferences */}
            <div className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-light-green-dark-grey">Vitals & preferences</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Height (cm)</label>
                  <input
                    type="number"
                    min={50}
                    max={250}
                    value={form.height}
                    onChange={(e) => updateForm({ height: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 170"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Weight (kg)</label>
                  <input
                    type="number"
                    min={20}
                    max={300}
                    value={form.weight}
                    onChange={(e) => updateForm({ weight: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Dietary preference (type)</label>
                  <input
                    type="text"
                    value={form.dietaryType}
                    onChange={(e) => updateForm({ dietaryType: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Vegetarian"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Dietary restrictions (comma-separated)</label>
                  <input
                    type="text"
                    value={form.dietaryRestrictions}
                    onChange={(e) => updateForm({ dietaryRestrictions: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. gluten-free, dairy-free"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Objectives (body) — comma-separated</label>
                  <input
                    type="text"
                    value={form.objectivesBody}
                    onChange={(e) => updateForm({ objectivesBody: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. lose weight, build muscle"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Objectives (health) — comma-separated</label>
                  <input
                    type="text"
                    value={form.objectivesHealth}
                    onChange={(e) => updateForm({ objectivesHealth: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. lower blood pressure"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-light-green-dark-grey">Objectives (mind) — comma-separated</label>
                  <input
                    type="text"
                    value={form.objectivesMind}
                    onChange={(e) => updateForm({ objectivesMind: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. reduce stress, sleep better"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="rounded-lg bg-light-green-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-light-green-primary-dark hover:shadow-card-hover active:scale-[0.98] disabled:opacity-70"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-lg border-2 border-light-green-primary bg-transparent px-5 py-2.5 text-sm font-semibold text-light-green-primary transition-all hover:bg-light-green-primary hover:text-white active:scale-[0.98] disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Account */}
          <section className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card transition-all hover:shadow-card-hover">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-light-green-dark-grey">Account</h2>
            <dl className="divide-y-0">
              <Field variant="lightGreen" label="Name" value={`${profile.firstName} ${profile.lastName}`} />
              <Field variant="lightGreen" label="Email" value={profile.email} />
              <Field variant="lightGreen" label="Date of birth" value={formatDate(profile.dateOfBirth, "long")} />
              <Field variant="lightGreen" label="Status" value={profile.isActive !== false ? "Active" : "Inactive"} />
            </dl>
          </section>
          {/* Vitals and user data */}
          <section className="rounded-xl border border-light-green-subtle/60 bg-white p-6 shadow-card transition-all hover:shadow-card-hover">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-light-green-dark-grey">Vitals & preferences</h2>
            <dl className="divide-y-0">
              <Field variant="lightGreen" label="Height" value={profile.height != null ? `${profile.height} cm` : undefined} />
              <Field variant="lightGreen" label="Weight" value={profile.weight != null ? `${profile.weight} kg` : undefined} />
              <Field
                variant="lightGreen"
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
                variant="lightGreen"
                label="Objectives (body)"
                value={objectives?.body?.length ? objectives.body.join(", ") : undefined}
              />
              <Field
                variant="lightGreen"
                label="Objectives (health)"
                value={objectives?.health?.length ? objectives.health.join(", ") : undefined}
              />
              <Field
                variant="lightGreen"
                label="Objectives (mind)"
                value={objectives?.mind?.length ? objectives.mind.join(", ") : undefined}
              />
            </dl>
          </section>
        </div>
      )}
      </div>
    </div>
  );
}
