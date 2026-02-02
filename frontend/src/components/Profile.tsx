"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authGet, authPatch, UnauthorizedError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { PatientProfile } from "@/types/profile";
import Field from "@/components/ui/Field";
import PageLoading from "@/components/ui/PageLoading";

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
  "mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      const updated = await authPatch<PatientProfile>("/patients/profile", payload);
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">My profile</h1>
          <p className="mt-1 text-sm text-slate-500">Your account and health profile.</p>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={startEdit}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
          >
            Edit
          </button>
        ) : null}
      </div>

      {isEditing && form ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          {saveError && (
            <p className="mb-4 text-sm text-red-600" role="alert">
              {saveError}
            </p>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                First name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => updateForm({ firstName: e.target.value })}
                className={inputClass}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => updateForm({ lastName: e.target.value })}
                className={inputClass}
                placeholder="Last name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Date of birth
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateForm({ dateOfBirth: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Height (cm)
              </label>
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
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Weight (kg)
              </label>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="profile-isActive"
                checked={form.isActive}
                onChange={(e) => updateForm({ isActive: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="profile-isActive" className="text-sm text-slate-700">
                Account active
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Dietary preference (type)
              </label>
              <input
                type="text"
                value={form.dietaryType}
                onChange={(e) => updateForm({ dietaryType: e.target.value })}
                className={inputClass}
                placeholder="e.g. Vegetarian"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Dietary restrictions (comma-separated)
              </label>
              <input
                type="text"
                value={form.dietaryRestrictions}
                onChange={(e) => updateForm({ dietaryRestrictions: e.target.value })}
                className={inputClass}
                placeholder="e.g. gluten-free, dairy-free"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Objectives (body) — comma-separated
              </label>
              <input
                type="text"
                value={form.objectivesBody}
                onChange={(e) => updateForm({ objectivesBody: e.target.value })}
                className={inputClass}
                placeholder="e.g. lose weight, build muscle"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Objectives (health) — comma-separated
              </label>
              <input
                type="text"
                value={form.objectivesHealth}
                onChange={(e) => updateForm({ objectivesHealth: e.target.value })}
                className={inputClass}
                placeholder="e.g. lower blood pressure"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Objectives (mind) — comma-separated
              </label>
              <input
                type="text"
                value={form.objectivesMind}
                onChange={(e) => updateForm({ objectivesMind: e.target.value })}
                className={inputClass}
                placeholder="e.g. reduce stress, sleep better"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
}
