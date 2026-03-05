"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBasePath } from "@/lib/base-path";
import { UnauthorizedError } from "@/lib/api";
import { getProfile, getVitals, getExams, getDocuments, getMedications } from "@/services/patients.service";
import { formatDate } from "@/lib/format";
import { getDailyVitals } from "@/lib/daily-vitals";
import type { Vital } from "@/types/vital";
import type { PatientProfile } from "@/types/profile";
import type { Exam, Medication } from "@/types/health";
import type { UserHealthDocument } from "@/types/health";
import type { PrescriptionExtractedData } from "@/types/health";
import UserPanel from "@/components/health/UserPanel";
import MedicationCalendar, { type CalendarEvent } from "@/components/health/MedicationCalendar";
import CalendarSlotDetailsModal, { type CalendarSlot } from "@/components/health/CalendarSlotDetailsModal";
import PdfPreviewModal from "@/components/health/PdfPreviewModal";
import RhombusLoader from "@/components/ui/RhombusLoader";

/** Build YYYY-MM-DD for a given date (local date, no TZ shift). */
function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Map active medications with startDate/endDate and reminderTimes to calendar events for a date range. */
function medicationsToCalendarEvents(
  medications: Medication[],
  rangeStart: Date,
  rangeEnd: Date
): CalendarEvent[] {
  const active = medications.filter(
    (m) => m.isActive && Array.isArray(m.reminderTimes) && m.reminderTimes.length > 0
  );
  if (active.length === 0) return [];

  const bySlot = new Map<string, Medication[]>();
  const add = (dateKey: string, time: string, med: Medication) => {
    const key = `${dateKey}|${time}`;
    if (!bySlot.has(key)) bySlot.set(key, []);
    const arr = bySlot.get(key)!;
    if (!arr.some((x) => x.id === med.id)) arr.push(med);
  };

  for (let d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
    const dateKey = toDateKey(d);
    for (const med of active) {
      const start = med.startDate ?? "";
      const end = med.endDate ?? null;
      if (start && dateKey < start) continue;
      if (end != null && end !== "" && dateKey > end) continue;
      for (const time of med.reminderTimes!) {
        add(dateKey, time, med);
      }
    }
  }

  const events: CalendarEvent[] = [];
  bySlot.forEach((meds, key) => {
    const [date, time] = key.split("|");
    events.push({ date, time, medications: meds });
  });
  return events;
}

type TabId = "vitals" | "prescription" | "exams";

const NO_DATA_MSG = "No data in this section yet. Add entries from the Add page or upload documents when available.";

export default function MyHealthPage() {
  const router = useRouter();
  const basePath = useBasePath();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [labResults, setLabResults] = useState<UserHealthDocument[]>([]);
  const [prescriptions, setPrescriptions] = useState<UserHealthDocument[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("vitals");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProfile().catch((e) => { if (e instanceof UnauthorizedError) throw e; return null; }),
      getVitals({ limit: 100 }).catch((e) => { if (e instanceof UnauthorizedError) throw e; return []; }),
      getExams().catch((e) => { if (e instanceof UnauthorizedError) throw e; return []; }),
      getDocuments("lab_result").catch((e) => {
        if (e instanceof UnauthorizedError) throw e;
        return [];
      }),
      getDocuments("prescription").catch((e) => {
        if (e instanceof UnauthorizedError) throw e;
        return [];
      }),
      getMedications().catch((e) => { if (e instanceof UnauthorizedError) throw e; return []; }),
    ])
      .then(([prof, vits, ex, labDocs, prescDocs, meds]) => {
        if (cancelled) return;
        if (prof) setProfile(prof);
        if (Array.isArray(vits)) setVitals(vits);
        if (Array.isArray(ex)) setExams(ex);
        if (Array.isArray(labDocs)) setLabResults(labDocs);
        if (Array.isArray(prescDocs)) setPrescriptions(prescDocs);
        if (Array.isArray(meds)) setMedications(meds);
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

  const calendarEvents = useMemo(() => {
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    end.setMonth(11);
    end.setDate(31);
    end.setHours(23, 59, 59, 999);
    return medicationsToCalendarEvents(medications, start, end);
  }, [medications]);

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

  // Exams tab: legacy UserExam records + lab result documents (from uploads)
  const examsFromDocs: Exam[] = labResults.map((doc) => ({
    id: doc.id,
    name: doc.originalFilename || "Lab results",
    date: doc.documentDate ?? doc.processedAt ?? "",
    attachmentId: doc.attachmentId,
  }));
  const examsCombined: Exam[] = [...examsFromDocs, ...exams].sort((a, b) => {
    const dA = new Date(a.date).getTime();
    const dB = new Date(b.date).getTime();
    return dB - dA;
  });

  /** Medications sorted by start date descending; fallback to createdAt */
  const medicationsByStartDate = [...medications].sort((a, b) => {
    const dateA = a.startDate || a.createdAt || "";
    const dateB = b.startDate || b.createdAt || "";
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <div className="min-h-screen bg-light-green-light pb-20">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold text-light-green-dark">My Health</h1>
        <p className="mt-1 text-sm text-light-green-dark-grey">
          Your vitals, prescriptions, and exams in one place.
        </p>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
          <UserPanel profile={profile} vitals={vitals} dailyVitals={dailyVitals} />

          <main className="min-w-0 flex-1 flex flex-col gap-6">
            <MedicationCalendar
              events={calendarEvents}
              onSlotClick={(slot) =>
                setSelectedSlot({
                  date: slot.date,
                  time: slot.time,
                  medications: slot.medications as Medication[],
                })
              }
            />
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
                  <div className="space-y-6">
                    <section>
                      <h2 className="text-sm font-medium text-light-green-dark mb-2">Prescription documents</h2>
                      {prescriptions.length === 0 ? (
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
                                        <span className="flex items-center gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setPreviewUrl(pdfUrl)}
                                            className="text-light-green-primary hover:text-light-green-dark transition-colors"
                                            aria-label="Preview PDF"
                                            title="Preview"
                                          >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                          </button>
                                          <a
                                            href={pdfUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-light-green-primary hover:text-light-green-dark transition-colors"
                                            aria-label="Download PDF"
                                            title="Download"
                                          >
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                                            </svg>
                                          </a>
                                        </span>
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
                    </section>
                    <section>
                      <h2 className="text-sm font-medium text-light-green-dark mb-2">Medications</h2>
                      {medicationsByStartDate.length === 0 ? (
                        <p className="text-sm text-light-green-dark-grey py-4">{NO_DATA_MSG}</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead>
                              <tr className="border-b border-light-green-subtle/60 text-light-green-dark-grey">
                                <th className="py-2 pr-4 font-medium">Name</th>
                                <th className="py-2 pr-4 font-medium">Dosage</th>
                                <th className="py-2 pr-4 font-medium">Frequency</th>
                                <th className="py-2 pr-4 font-medium">Status</th>
                                <th className="py-2 pr-4 font-medium">Start date</th>
                                <th className="py-2 pr-4 font-medium">End date</th>
                                <th className="py-2 font-medium">Origin</th>
                              </tr>
                            </thead>
                            <tbody>
                              {medicationsByStartDate.map((m) => (
                                <tr key={m.id} className="border-b border-light-green-subtle/30">
                                  <td className="py-2 pr-4 text-light-green-dark">{m.name}</td>
                                  <td className="py-2 pr-4">{m.dosage ?? "—"}</td>
                                  <td className="py-2 pr-4">{m.frequency ?? "—"}</td>
                                  <td className="py-2 pr-4">{m.isActive ? "Active" : "Inactive"}</td>
                                  <td className="py-2 pr-4">{m.startDate ? formatDate(m.startDate, "short") : "—"}</td>
                                  <td className="py-2 pr-4">{m.endDate ? formatDate(m.endDate, "short") : "—"}</td>
                                  <td className="py-2">{m.sourceDocumentId ? "From prescription" : "Manual"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </section>
                  </div>
                ) : examsCombined.length === 0 ? (
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
                        {examsCombined.map((exam) => {
                          const pdfUrl = exam.attachmentId && hasPdfPath(exam.attachmentId)
                            ? `${basePath}${exam.attachmentId}`
                            : null;
                          return (
                            <tr key={exam.id} className="border-b border-light-green-subtle/30">
                              <td className="py-2 pr-4 text-light-green-dark">{exam.name}</td>
                              <td className="py-2 pr-4">{formatDate(exam.date, "short")}</td>
                              <td className="py-2">
                                {pdfUrl ? (
                                  <span className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewUrl(pdfUrl)}
                                      className="text-light-green-primary hover:text-light-green-dark transition-colors"
                                      aria-label="Preview PDF"
                                      title="Preview"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                    <a
                                      href={pdfUrl}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-light-green-primary hover:text-light-green-dark transition-colors"
                                      aria-label="Download PDF"
                                      title="Download"
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                                      </svg>
                                    </a>
                                  </span>
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

      <CalendarSlotDetailsModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} />
      <PdfPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
    </div>
  );
}
