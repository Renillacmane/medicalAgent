"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { UnauthorizedError } from "@/lib/api";
import { getProfile, getVitals, getExams, getDocuments } from "@/services/patients.service";
import { formatDate } from "@/lib/format";
import { getDailyVitals } from "@/lib/daily-vitals";
import type { Vital } from "@/types/vital";
import type { PatientProfile } from "@/types/profile";
import type { Exam } from "@/types/health";
import type { UserHealthDocument } from "@/types/health";
import type { PrescriptionExtractedData } from "@/types/health";
import UserPanel from "@/components/health/UserPanel";
import RhombusLoader from "@/components/ui/RhombusLoader";

type TabId = "vitals" | "prescription" | "exams";

const NO_DATA_MSG = "No data in this section yet. Add entries from the Add page or upload documents when available.";

export default function MyHealthPage() {
  const router = useRouter();
  const basePath = useBasePath();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [prescriptions, setPrescriptions] = useState<UserHealthDocument[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("vitals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProfile().catch((e) => { if (e instanceof UnauthorizedError) throw e; return null; }),
      getVitals({ limit: 100 }).catch((e) => { if (e instanceof UnauthorizedError) throw e; return []; }),
      getExams().catch((e) => { if (e instanceof UnauthorizedError) throw e; return []; }),
      getDocuments("prescription").catch((e) => {
        if (e instanceof UnauthorizedError) throw e;
        return [];
      }),
    ])
      .then(([prof, vits, ex, docs]) => {
        if (cancelled) return;
        if (prof) setProfile(prof);
        if (Array.isArray(vits)) setVitals(vits);
        if (Array.isArray(ex)) setExams(ex);
        if (Array.isArray(docs)) setPrescriptions(docs);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof UnauthorizedError) {
          router.replace(`${basePath}/login?redirect=${encodeURIComponent(basePath + "/my-health")}`);
          return;
        }
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [router, basePath]);

  if (error) {
    return (
      <div className="p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const dailyVitals = getDailyVitals(vitals, 7);

  const tabs: { id: TabId; label: string }[] = [
    { id: "vitals", label: "Vitals" },
    { id: "prescription", label: "Prescription" },
    { id: "exams", label: "Exams" },
  ];

  const hasPdfPath = (attachmentId: string) => attachmentId.startsWith("/");

  return (
    <div className="min-h-screen bg-light-green-light pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold text-light-green-dark">My Health</h1>
        <p className="mt-1 text-sm text-light-green-dark-grey">
          Your vitals, prescriptions, and exams in one place.
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <UserPanel profile={profile} vitals={vitals} dailyVitals={dailyVitals} />

          <main className="min-w-0 flex-1">
            <div className="rounded-xl border border-light-green-subtle/60 bg-white shadow-card overflow-hidden">
              <div className="flex border-b border-light-green-subtle/40">
                {tabs.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === id
                        ? "bg-light-green-subtle/30 text-light-green-dark border-b-2 border-light-green-primary"
                        : "text-light-green-dark-grey hover:bg-light-green-subtle/20"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 py-10">
                    <RhombusLoader size={44} />
                    <span className="text-sm text-light-green-dark-grey">Loading…</span>
                  </div>
                ) : activeTab === "vitals" ? (
                  vitals.length === 0 ? (
                    <p className="text-sm text-light-green-dark-grey py-4">{NO_DATA_MSG}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-light-green-subtle/60 text-light-green-dark-grey">
                            <th className="py-2 pr-4 font-medium">Date</th>
                            <th className="py-2 pr-4 font-medium">Heart rate</th>
                            <th className="py-2 pr-4 font-medium">Blood pressure</th>
                            <th className="py-2 pr-4 font-medium">Weight</th>
                            <th className="py-2 pr-4 font-medium">BMI</th>
                            <th className="py-2 pr-4 font-medium">Sleep (h)</th>
                            <th className="py-2 font-medium">SpO₂</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vitals.map((v) => (
                            <tr key={v.id ?? v.date} className="border-b border-light-green-subtle/30">
                              <td className="py-2 pr-4 text-light-green-dark">{formatDate(v.date, "short")}</td>
                              <td className="py-2 pr-4">{v.heartRate != null ? `${v.heartRate} bpm` : "—"}</td>
                              <td className="py-2 pr-4">
                                {v.bloodPressure?.systolic != null && v.bloodPressure?.diastolic != null
                                  ? `${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}`
                                  : "—"}
                              </td>
                              <td className="py-2 pr-4">{v.weight != null ? `${v.weight} kg` : "—"}</td>
                              <td className="py-2 pr-4">{v.bmi != null ? v.bmi.toFixed(1) : "—"}</td>
                              <td className="py-2 pr-4">{v.sleepHours != null ? v.sleepHours : "—"}</td>
                              <td className="py-2">{v.bloodOxygen != null ? `${v.bloodOxygen}%` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : activeTab === "prescription" ? (
                  prescriptions.length === 0 ? (
                    <p className="text-sm text-light-green-dark-grey py-4">{NO_DATA_MSG}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="border-b border-light-green-subtle/60 text-light-green-dark-grey">
                            <th className="py-2 pr-4 font-medium">Date</th>
                            <th className="py-2 pr-4 font-medium">Doctor</th>
                            <th className="py-2 pr-4 font-medium">Medications</th>
                            <th className="py-2 font-medium">PDF</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prescriptions.map((doc) => {
                            const data = doc.extractedData as PrescriptionExtractedData;
                            const date = data?.prescriptionDate ?? doc.documentDate ?? doc.processedAt;
                            const doctor = data?.doctorName ?? "—";
                            const meds = data?.medications?.map((m) => `${m.name} ${m.dosage} ${m.frequency}`).join("; ") ?? "—";
                            const pdfUrl = hasPdfPath(doc.attachmentId) ? `${basePath}${doc.attachmentId}` : null;
                            return (
                              <tr key={doc.id} className="border-b border-light-green-subtle/30">
                                <td className="py-2 pr-4 text-light-green-dark">{date ? formatDate(String(date), "short") : "—"}</td>
                                <td className="py-2 pr-4">{doctor}</td>
                                <td className="py-2 pr-4 max-w-xs truncate" title={meds}>{meds}</td>
                                <td className="py-2">
                                  {pdfUrl ? (
                                    <a
                                      href={pdfUrl}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-light-green-primary hover:underline"
                                    >
                                      Download
                                    </a>
                                  ) : (
                                    <span className="text-light-green-light-grey">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : exams.length === 0 ? (
                  <p className="text-sm text-light-green-dark-grey py-4">{NO_DATA_MSG}</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="border-b border-light-green-subtle/60 text-light-green-dark-grey">
                          <th className="py-2 pr-4 font-medium">Name</th>
                          <th className="py-2 pr-4 font-medium">Date</th>
                          <th className="py-2 font-medium">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exams.map((exam) => {
                          const pdfUrl = exam.attachmentId && hasPdfPath(exam.attachmentId)
                            ? `${basePath}${exam.attachmentId}`
                            : null;
                          return (
                            <tr key={exam.id} className="border-b border-light-green-subtle/30">
                              <td className="py-2 pr-4 text-light-green-dark">{exam.name}</td>
                              <td className="py-2 pr-4">{formatDate(exam.date, "short")}</td>
                              <td className="py-2">
                                {pdfUrl ? (
                                  <a
                                    href={pdfUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-light-green-primary hover:underline"
                                  >
                                    Download
                                  </a>
                                ) : (
                                  <span className="text-light-green-light-grey">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
