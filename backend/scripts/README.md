# Scripts

This directory contains utility scripts for seeding data and generating test documents.

## Seed fake data

Inserts 10 users (password: **fakedata**), 5 vitals and 5 medications per user, no exams.

**Prerequisites:** `.env` in the backend root with MongoDB connection (e.g. `MONGODB_URI` or `DB_USER`, `DB_PWD`, `DB_NAME`).

**Run from backend directory:**

```bash
npm run seed
```

Or:

```bash
npx ts-node scripts/seed-fake-data.ts
```

**Login:** Use any seeded user email (e.g. `alice.smith@example.com`) with password `fakedata` to test auth.

**Idempotency:** If a user with the same email already exists, that user is skipped and their `_id` is reused for vitals/medications. Re-running the script will add vitals/medications again for existing users (duplicates). For a clean seed, drop the `users`, `uservitals`, and `usermedications` collections first.

---

## Seed Jane vitals

Inserts randomized vitals for the user `jane@example.com`. Creates the user if it doesn't exist (password: **fakedata**).

**Prerequisites:** `.env` in the backend root with MongoDB connection.

**Run from backend directory:**

```bash
npm run seed:jane
```

Or:

```bash
npx ts-node scripts/seed-jane-vitals.ts
```

**Details:** Generates randomized vitals with varying subsets of optional fields. BMI is computed automatically. Ranges: HR 79–89, BP 115–140/80–95, weight 83–88, sleep 5–9, SpO2 95–97, glucose 105–120.

---

## Seed RAG data

Adds fake RAG data (userdocuments + documentchunks with placeholder embeddings) for `jane@example.com`. Adds 3 documents of each type (blood_analysis, medical_report, prescription).

**Prerequisites:**
- User `jane@example.com` exists (e.g. run `npm run seed:jane` or `npm run seed` first)
- MongoDB Vector Search index on `documentchunks.embedding` (see `docs/rag_setup.md`)

**Run from backend directory:**

```bash
npm run seed:rag
```

Or:

```bash
npx ts-node scripts/seed-rag-data.ts
```

**Note:** Uses placeholder embeddings (not from real embedding API). For production RAG, use actual embedding service.

---

## Generate seed PDFs (static)

Generates static placeholder PDFs for seed data (prescriptions, lab results, medical reports). Writes to `frontend/public/documents/` so they can be served and downloaded.

**Run from backend directory:**

```bash
npm run seed:pdfs
```

Or:

```bash
npx ts-node scripts/generate-seed-pdfs.ts
```

**Output:** Creates fixed PDFs with predefined content:
- 3 prescription PDFs (Vitamin D, Atorvastatin + Vitamin D, Vitamin D)
- 3 lab result PDFs (January 2025, November 2024, September 2024)
- 3 medical report PDFs (Annual check-up, Follow-up lipids, Physical exam)

---

## Generate PDFs (dynamic)

Generates PDF documents (lab results, prescriptions, medical reports) with configurable parameters. Supports randomized values and tendency-based generation.

**Run from backend directory:**

```bash
npm run generate:pdfs -- --blood=3 --prescription=2 --report=1 --tendency=bad --date=2025-02-15
```

Or:

```bash
npx ts-node scripts/generate-pdfs.ts --blood=3 --prescription=2 --report=1 --tendency=bad
```

### Parameters

- `--blood=N` - Number of blood analysis PDFs to generate (default: 0)
- `--prescription=N` - Number of prescription PDFs to generate (default: 0)
- `--report=N` - Number of medical report PDFs to generate (default: 0)
- `--tendency=bad|good` - Tendency for values:
  - `bad`: Worse lab results (high/low values outside normal range), stronger medication dosages
  - `good`: Better lab results (optimal ranges), weaker medication dosages
  - Default: `good`
- `--date=YYYY-MM-DD` - Date to use for documents (default: current date)

### Examples

```bash
# Generate 3 lab results, 2 prescriptions, 1 report with "bad" tendency
npm run generate:pdfs -- --blood=3 --prescription=2 --report=1 --tendency=bad

# Generate with specific date
npm run generate:pdfs -- --blood=2 --prescription=1 --date=2025-02-15 --tendency=good

# Generate only lab results with current date
npm run generate:pdfs -- --blood=5 --tendency=bad

# Generate prescriptions and reports
npm run generate:pdfs -- --prescription=3 --report=2
```

### Features

- **Randomized lab values**: Generates realistic lab values for 12 common tests (Hemoglobin, Glucose, Cholesterol, HDL, LDL, Triglycerides, Creatinine, eGFR, TSH, Vitamin D, Ferritin, HbA1c)
- **Related medications**: Prescriptions can include related medications (e.g., Atorvastatin + Vitamin D3)
- **Tendency-based generation**: 
  - `bad` tendency produces worse lab results and stronger medication dosages
  - `good` tendency produces optimal lab results and weaker medication dosages
- **Date handling**: Uses current date by default, or accepts a specific date via `--date` parameter

### Output

PDFs are generated in `frontend/public/documents/` with filenames like:
- `lab_results_2025_02_15_1234.pdf`
- `rx_2025_02_15_5678.pdf`
- `report_2025_02_15_9012.pdf`

Each PDF includes appropriate formatting and medical terminology matching the document type.
