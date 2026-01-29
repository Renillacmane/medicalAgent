# Data model (MongoDB collections)

Base structure for the AI Medical Agent. Collections use **references** (`userId`) for relations; profile/preferences are embedded in User where bounded.

---

## Users (`users`)

Identity and profile. One document per user.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `firstName` | string | yes | |
| `lastName` | string | yes | |
| `dateOfBirth` | Date | yes | |
| `email` | string | yes | unique, lowercase |
| `passwordHash` | string | yes | bcrypt, not returned in API |
| `isActive` | boolean | yes | default true |
| `height` | number | no | cm |
| `weight` | number | no | kg (current snapshot; history in UserVitals) |
| `dietaryPreference` | object | no | e.g. `{ type: string, restrictions?: string[] }` |
| `objectives` | object | no | **Embedded**: `{ body?: string[], health?: string[], mind?: string[] }` |
| `createdAt` | Date | auto | timestamps |
| `updatedAt` | Date | auto | timestamps |

**Indexes:** `email` (unique).

---

## UserVitals (`uservitals`)

Time-series health readings. One document per reading/day per user. Referenced by `userId`.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `userId` | ObjectId | yes | ref to `users._id` |
| `date` | Date | yes | day or timestamp of reading |
| `heartRate` | number | no | bpm |
| `bloodPressure` | object | no | `{ systolic: number, diastolic: number }` |
| `weight` | number | no | kg |
| `sleepHours` | number | no | |
| `stressPerception` | number | no | e.g. 1–10 scale |
| `bmi` | number | no | |
| `bloodOxygen` | number | no | SpO2 % |
| `bloodGlucose` | number | no | mg/dL or mmol/L |
| `createdAt` | Date | auto | timestamps |
| `updatedAt` | Date | auto | timestamps |

**Indexes:** `userId`, `userId + date` (for range queries).

---

## UserMedications (`usermedications`)

Medications per user. One document per medication (current or historical). Referenced by `userId`.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `userId` | ObjectId | yes | ref to `users._id` |
| `name` | string | yes | |
| `dosage` | string | no | e.g. "10mg" |
| `frequency` | string | no | e.g. "once daily" |
| `activeSubstance` | string | no | |
| `purpose` | string | no | |
| `startDate` | Date | no | |
| `endDate` | Date | no | null = still active |
| `isActive` | boolean | no | default true |
| `createdAt` | Date | auto | timestamps |
| `updatedAt` | Date | auto | timestamps |

**Indexes:** `userId`.

---

## UserExams (`userexams`)

Exams / reports per user. One document per exam. Referenced by `userId`; `attachmentId` points to file storage.

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `userId` | ObjectId | yes | ref to `users._id` |
| `name` | string | yes | e.g. "Annual check-up" |
| `date` | Date | yes | |
| `attachmentId` | ObjectId / string | no | ref to attachment or storage key |
| `createdAt` | Date | auto | timestamps |
| `updatedAt` | Date | auto | timestamps |

**Indexes:** `userId`, `userId + date`.

---

## Relations summary

- **Users**: no refs to other collections; profile/objectives embedded.
- **UserVitals**, **UserMedications**, **UserExams**: each has `userId` (ObjectId) referencing `users._id`.
- **UserExams**: `attachmentId` references attachment storage (TBD).

---

## Seed script (fake data)

Backend script inserts fake data for development:

- **Location:** `backend/scripts/seed-fake-data.ts`
- **Run:** From backend directory: `npm run seed`
- **Data:** 10 users (password `fakedata`), 5 vitals and 5 medications per user, no exams.
- **Details:** See `backend/scripts/README.md`.
