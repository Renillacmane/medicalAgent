/**
 * Generates placeholder PDFs for seed data (prescriptions, lab results, medical reports).
 * Writes to frontend/public/documents/ so they can be served and downloaded from My Health.
 * Run from backend: npx ts-node scripts/generate-seed-pdfs.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const OUT_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'documents');

function wrapLines(text: string, maxChars: number): string[] {
  const lines: string[] = [];
  const words = text.split(/\s+/);
  let line = '';
  for (const w of words) {
    if (line.length + w.length + 1 <= maxChars) line += (line ? ' ' : '') + w;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function drawPageText(
  page: { getSize: () => { width: number; height: number }; drawText: (t: string, opts: object) => void },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  font: any,
  lines: string[],
  options: { fontSize?: number; yStart?: number; lineHeight?: number } = {}
) {
  const { width, height } = page.getSize();
  const fontSize = options.fontSize ?? 11;
  const lineHeight = options.lineHeight ?? 14;
  let y = options.yStart ?? height - 50;
  for (const line of lines) {
    if (y < 50) break;
    page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  }
}

async function createPrescriptionPdfs() {
  const docs: { filename: string; title: string; lines: string[] }[] = [
    {
      filename: 'rx_vitamin_d_jan2025.pdf',
      title: 'Prescription - January 2025',
      lines: [
        'PRESCRIPTION',
        'Date: January 10, 2025',
        'Physician: Dr. Sarah Chen',
        '',
        'Medication: Vitamin D3',
        'Dosage: 2000 IU once daily',
        'Duration: 3 months',
        '',
        'Instructions: Take with a meal for better absorption.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
    {
      filename: 'rx_statin_vitd_nov2024.pdf',
      title: 'Prescription - November 2024',
      lines: [
        'PRESCRIPTION',
        'Date: November 18, 2024',
        'Physician: Dr. James Wong',
        '',
        '1. Atorvastatin 10 mg',
        '   Once daily at bedtime. Duration: Ongoing.',
        '',
        '2. Vitamin D3 2000 IU',
        '   Once daily. Duration: 3 months.',
        '',
        'Instructions: Take statin at night. Vitamin D with food.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
    {
      filename: 'rx_vitamin_d_aug2024.pdf',
      title: 'Prescription - August 2024',
      lines: [
        'PRESCRIPTION',
        'Date: August 22, 2024',
        'Physician: Dr. Sarah Chen',
        '',
        'Medication: Vitamin D3',
        'Dosage: 2000 IU once daily',
        'Duration: 3 months',
        '',
        'Instructions: Take with breakfast or lunch.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
  ];

  for (const doc of docs) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    page.drawText(doc.title, { x: 50, y: height - 30, size: 16, font, color: rgb(0, 0, 0) });
    const allLines = doc.lines.flatMap((t) => wrapLines(t, 70));
    await drawPageText(page, font, allLines, { yStart: height - 55, fontSize: 11 });
    const bytes = await pdfDoc.save();
    const outPath = path.join(OUT_DIR, doc.filename);
    fs.writeFileSync(outPath, bytes);
    console.log('Written:', outPath);
  }
}

async function createLabPdfs() {
  const docs: { filename: string; title: string; lines: string[] }[] = [
    {
      filename: 'lab_results_jan2025.pdf',
      title: 'Lab Results - January 2025',
      lines: [
        'LABORATORY RESULTS',
        'Test Date: January 15, 2025',
        '',
        'Hemoglobin: 14.2 g/dL (ref 12.0-16.0) - Normal',
        'Glucose (fasting): 102 mg/dL (ref 70-100) - Slightly elevated',
        'Total Cholesterol: 198 mg/dL (ref <200) - Normal',
        'HDL: 52 mg/dL (ref >40) - Normal',
        'LDL: 118 mg/dL (ref <100) - High',
        '',
        'Findings: Fasting glucose slightly above reference. LDL at upper range.',
        'Recommendations: Consider dietary adjustments. Repeat lipids in 6 months.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
    {
      filename: 'lab_metabolic_nov2024.pdf',
      title: 'Metabolic Panel - November 2024',
      lines: [
        'LABORATORY RESULTS',
        'Test Date: November 20, 2024',
        '',
        'Hemoglobin: 13.8 g/dL (ref 12.0-16.0) - Normal',
        'Glucose (fasting): 95 mg/dL (ref 70-100) - Normal',
        'Creatinine: 0.9 mg/dL (ref 0.6-1.2) - Normal',
        'eGFR: 92 mL/min/1.73m² (ref >90) - Normal',
        '',
        'Findings: Kidney function within normal limits. Blood sugar improved.',
        'Recommendations: Continue current diet. Repeat metabolic panel in 6 months.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
    {
      filename: 'lab_thyroid_vitd_sep2024.pdf',
      title: 'Thyroid & Vitamin D - September 2024',
      lines: [
        'LABORATORY RESULTS',
        'Test Date: September 5, 2024',
        '',
        'TSH: 2.4 mIU/L - Normal',
        'Vitamin D: 28 ng/mL - Low',
        'Ferritin: 65 ng/mL - Normal',
        '',
        'Findings: Vitamin D below optimal. Thyroid function normal.',
        'Recommendations: Vitamin D supplementation. Recheck in 3 months.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
  ];

  for (const doc of docs) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    page.drawText(doc.title, { x: 50, y: height - 30, size: 16, font, color: rgb(0, 0, 0) });
    const allLines = doc.lines.flatMap((t) => wrapLines(t, 70));
    await drawPageText(page, font, allLines, { yStart: height - 55, fontSize: 11 });
    const bytes = await pdfDoc.save();
    const outPath = path.join(OUT_DIR, doc.filename);
    fs.writeFileSync(outPath, bytes);
    console.log('Written:', outPath);
  }
}

async function createReportPdfs() {
  const docs: { filename: string; title: string; lines: string[] }[] = [
    {
      filename: 'annual_checkup_jan2025.pdf',
      title: 'Annual Check-up - January 2025',
      lines: [
        'MEDICAL REPORT',
        'Date: January 10, 2025',
        'Physician: Dr. Sarah Chen - General practice',
        '',
        'Chief complaint: Annual check-up and fatigue',
        'Diagnosis: Vitamin D insufficiency, Mild stress-related sleep disturbance',
        '',
        'Findings: Blood pressure within normal limits. Weight stable. Poor sleep and low energy reported.',
        'Recommendations: Increase outdoor activity. Vitamin D supplement. Improve sleep hygiene.',
        'Medications: Vitamin D3 2000 IU once daily',
        'Follow-up: Recheck in 3 months.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
    {
      filename: 'followup_lipids_nov2024.pdf',
      title: 'Follow-up Lipids - November 2024',
      lines: [
        'MEDICAL REPORT',
        'Date: November 18, 2024',
        'Physician: Dr. James Wong - Internal medicine',
        '',
        'Chief complaint: Follow-up on lipids and fatigue',
        'Diagnosis: Dyslipidemia (mild), Fatigue improved with vitamin D',
        '',
        'Findings: Lipids improved with diet. Vitamin D level rising. Sleep still variable.',
        'Recommendations: Continue statin. Maintain vitamin D. Consider sleep diary.',
        'Medications: Atorvastatin 10mg, Vitamin D3 2000 IU',
        'Follow-up: Labs in 6 months.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
    {
      filename: 'physical_aug2024.pdf',
      title: 'Physical Exam - August 2024',
      lines: [
        'MEDICAL REPORT',
        'Date: August 22, 2024',
        'Physician: Dr. Sarah Chen - General practice',
        '',
        'Chief complaint: Annual physical',
        'Diagnosis: Vitamin D insufficiency, Otherwise well',
        '',
        'Findings: Routine exam unremarkable. Low vitamin D on screening.',
        'Recommendations: Start vitamin D supplement. Increase dietary calcium.',
        'Follow-up: Recheck vitamin D in 3 months.',
        '',
        '---',
        'This is a placeholder document for seed data.',
      ],
    },
  ];

  for (const doc of docs) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { height } = page.getSize();
    page.drawText(doc.title, { x: 50, y: height - 30, size: 16, font, color: rgb(0, 0, 0) });
    const allLines = doc.lines.flatMap((t) => wrapLines(t, 70));
    await drawPageText(page, font, allLines, { yStart: height - 55, fontSize: 11 });
    const bytes = await pdfDoc.save();
    const outPath = path.join(OUT_DIR, doc.filename);
    fs.writeFileSync(outPath, bytes);
    console.log('Written:', outPath);
  }
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log('Created directory:', OUT_DIR);
  }
  await createPrescriptionPdfs();
  await createLabPdfs();
  await createReportPdfs();
  console.log('Done. PDFs are in frontend/public/documents/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
