export type FrequencyInferenceResult = {
  timesPerDay: number;
  reminderTimes: string[];
};

const DEFAULT_TIMES_PER_DAY = 1;
const DEFAULT_REMINDER_TIMES: Record<number, string[]> = {
  1: ["08:00"],
  2: ["08:00", "20:00"],
  3: ["08:00", "14:00", "20:00"],
  4: ["08:00", "12:00", "16:00", "20:00"],
};

function normalizeFrequency(frequency?: string): string {
  return frequency?.trim().toLowerCase() ?? "";
}

export function inferTimesPerDay(frequency?: string): number {
  const normalized = normalizeFrequency(frequency);

  if (!normalized) return DEFAULT_TIMES_PER_DAY;

  if (
    normalized.includes("once daily") ||
    normalized === "daily" ||
    normalized === "qd" ||
    normalized.includes("once a day")
  ) {
    return 1;
  }

  if (
    normalized.includes("twice daily") ||
    normalized.includes("twice a day") ||
    normalized.includes("bid") ||
    normalized.includes("2x")
  ) {
    return 2;
  }

  if (
    normalized.includes("three times daily") ||
    normalized.includes("three times a day") ||
    normalized.includes("tid") ||
    normalized.includes("3x")
  ) {
    return 3;
  }

  if (
    normalized.includes("four times daily") ||
    normalized.includes("four times a day") ||
    normalized.includes("qid") ||
    normalized.includes("4x")
  ) {
    return 4;
  }

  return DEFAULT_TIMES_PER_DAY;
}

export function suggestReminderTimes(timesPerDay: number): string[] {
  const clamped = Math.max(1, Math.min(timesPerDay || DEFAULT_TIMES_PER_DAY, 4));
  return DEFAULT_REMINDER_TIMES[clamped] ?? DEFAULT_REMINDER_TIMES[DEFAULT_TIMES_PER_DAY];
}

export type ScheduleInferenceInput = {
  frequency?: string;
  startDate?: string | Date;
  durationText?: string;
};

export type ScheduleInferenceResult = FrequencyInferenceResult & {
  endDate: string | null;
};

function parseDurationInDays(durationText?: string): number | null {
  if (!durationText) return null;

  const normalized = durationText.trim().toLowerCase();

  const dayMatch = normalized.match(/(\d+)\s*(day|days|d)\b/);
  if (dayMatch) {
    return Number.parseInt(dayMatch[1], 10);
  }

  const weekMatch = normalized.match(/(\d+)\s*(week|weeks|w)\b/);
  if (weekMatch) {
    return Number.parseInt(weekMatch[1], 10) * 7;
  }

  return null;
}

function toIsoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function inferMedicationSchedule(input: ScheduleInferenceInput): ScheduleInferenceResult {
  const timesPerDay = inferTimesPerDay(input.frequency);
  const reminderTimes = suggestReminderTimes(timesPerDay);

  let endDate: string | null = null;

  const durationDays = parseDurationInDays(input.durationText);
  if (durationDays && durationDays > 0) {
    const start =
      input.startDate instanceof Date ? input.startDate : new Date(input.startDate ?? Date.now());
    const end = new Date(start.getTime());
    end.setDate(end.getDate() + durationDays);
    endDate = toIsoDateOnly(end);
  }

  return {
    timesPerDay,
    reminderTimes,
    endDate,
  };
}

