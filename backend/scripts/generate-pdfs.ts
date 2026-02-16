/**
 * Generates PDF documents (lab results, prescriptions, medical reports) with configurable parameters.
 * 
 * Usage:
 *   npx ts-node scripts/generate-pdfs.ts --blood=3 --prescription=2 --report=1 --tendency=bad --date=2025-02-15
 * 
 * Parameters:
 *   --blood=N          Number of blood analysis PDFs to generate (default: 0)
 *   --prescription=N   Number of prescription PDFs to generate (default: 0)
 *   --report=N         Number of medical report PDFs to generate (default: 0)
 *   --tendency=bad|good Tendency for values: "bad" = worse lab results/stronger meds, "good" = better lab results/weaker meds (default: "good")
 *   --date=YYYY-MM-DD  Date to use for documents (default: current date)
 */

import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const OUT_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'documents');

// Lab value definitions with reference ranges
interface LabValueDef {
  name: string;
  unit: string;
  referenceRange: string;
  normalMin: number;
  normalMax: number;
  goodRange?: { min: number; max: number }; // Optimal range for "good" tendency
  badRange?: { min: number; max: number }; // Problematic range for "bad" tendency
}

const LAB_VALUES: LabValueDef[] = [
  {
    name: 'Hemoglobin',
    unit: 'g/dL',
    referenceRange: '12.0-16.0',
    normalMin: 12.0,
    normalMax: 16.0,
    goodRange: { min: 13.5, max: 15.5 },
    badRange: { min: 10.0, max: 11.5 },
  },
  {
    name: 'Glucose (fasting)',
    unit: 'mg/dL',
    referenceRange: '70-100',
    normalMin: 70,
    normalMax: 100,
    goodRange: { min: 75, max: 90 },
    badRange: { min: 105, max: 125 },
  },
  {
    name: 'Total Cholesterol',
    unit: 'mg/dL',
    referenceRange: '<200',
    normalMin: 0,
    normalMax: 200,
    goodRange: { min: 150, max: 180 },
    badRange: { min: 220, max: 280 },
  },
  {
    name: 'HDL',
    unit: 'mg/dL',
    referenceRange: '>40',
    normalMin: 40,
    normalMax: 100,
    goodRange: { min: 55, max: 75 },
    badRange: { min: 30, max: 38 },
  },
  {
    name: 'LDL',
    unit: 'mg/dL',
    referenceRange: '<100',
    normalMin: 0,
    normalMax: 100,
    goodRange: { min: 70, max: 90 },
    badRange: { min: 130, max: 180 },
  },
  {
    name: 'Triglycerides',
    unit: 'mg/dL',
    referenceRange: '<150',
    normalMin: 0,
    normalMax: 150,
    goodRange: { min: 70, max: 100 },
    badRange: { min: 180, max: 250 },
  },
  {
    name: 'Creatinine',
    unit: 'mg/dL',
    referenceRange: '0.6-1.2',
    normalMin: 0.6,
    normalMax: 1.2,
    goodRange: { min: 0.7, max: 1.0 },
    badRange: { min: 1.3, max: 1.8 },
  },
  {
    name: 'eGFR',
    unit: 'mL/min/1.73m²',
    referenceRange: '>90',
    normalMin: 90,
    normalMax: 150,
    goodRange: { min: 100, max: 120 },
    badRange: { min: 60, max: 85 },
  },
  {
    name: 'TSH',
    unit: 'mIU/L',
    referenceRange: '0.4-4.0',
    normalMin: 0.4,
    normalMax: 4.0,
    goodRange: { min: 1.0, max: 2.5 },
    badRange: { min: 4.5, max: 8.0 },
  },
  {
    name: 'Vitamin D',
    unit: 'ng/mL',
    referenceRange: '30-100',
    normalMin: 30,
    normalMax: 100,
    goodRange: { min: 40, max: 60 },
    badRange: { min: 15, max: 25 },
  },
  {
    name: 'Ferritin',
    unit: 'ng/mL',
    referenceRange: '15-200',
    normalMin: 15,
    normalMax: 200,
    goodRange: { min: 50, max: 120 },
    badRange: { min: 10, max: 14 },
  },
  {
    name: 'HbA1c',
    unit: '%',
    referenceRange: '<5.7',
    normalMin: 0,
    normalMax: 5.7,
    goodRange: { min: 4.5, max: 5.2 },
    badRange: { min: 6.0, max: 7.5 },
  },
];

// Medication definitions with related medications
interface MedicationDef {
  name: string;
  dosages: { weak: string; moderate: string; strong: string };
  frequency: string;
  duration: string;
  relatedMeds: string[]; // Related medications that might be prescribed together
}

const MEDICATIONS: MedicationDef[] = [
  {
    name: 'Atorvastatin',
    dosages: { weak: '10 mg', moderate: '20 mg', strong: '40 mg' },
    frequency: 'once daily at bedtime',
    duration: 'Ongoing',
    relatedMeds: ['Vitamin D3', 'Aspirin'],
  },
  {
    name: 'Metformin',
    dosages: { weak: '500 mg', moderate: '1000 mg', strong: '2000 mg' },
    frequency: 'twice daily with meals',
    duration: 'Ongoing',
    relatedMeds: ['Glipizide', 'Vitamin B12'],
  },
  {
    name: 'Lisinopril',
    dosages: { weak: '5 mg', moderate: '10 mg', strong: '20 mg' },
    frequency: 'once daily',
    duration: 'Ongoing',
    relatedMeds: ['Hydrochlorothiazide', 'Amlodipine'],
  },
  {
    name: 'Vitamin D3',
    dosages: { weak: '1000 IU', moderate: '2000 IU', strong: '5000 IU' },
    frequency: 'once daily',
    duration: '3 months',
    relatedMeds: ['Calcium', 'Multivitamin'],
  },
  {
    name: 'Levothyroxine',
    dosages: { weak: '25 mcg', moderate: '50 mcg', strong: '100 mcg' },
    frequency: 'once daily on empty stomach',
    duration: 'Ongoing',
    relatedMeds: ['Selenium', 'Vitamin B12'],
  },
  {
    name: 'Omeprazole',
    dosages: { weak: '20 mg', moderate: '40 mg', strong: '40 mg twice daily' },
    frequency: 'once daily before breakfast',
    duration: '4-8 weeks',
    relatedMeds: ['Calcium', 'Vitamin B12'],
  },
  {
    name: 'Sertraline',
    dosages: { weak: '25 mg', moderate: '50 mg', strong: '100 mg' },
    frequency: 'once daily',
    duration: 'Ongoing',
    relatedMeds: ['Trazodone', 'Melatonin'],
  },
  {
    name: 'Amlodipine',
    dosages: { weak: '2.5 mg', moderate: '5 mg', strong: '10 mg' },
    frequency: 'once daily',
    duration: 'Ongoing',
    relatedMeds: ['Lisinopril', 'Hydrochlorothiazide'],
  },
];

const DOCTORS = [
  { name: 'Dr. Sarah Chen', specialty: 'General practice' },
  { name: 'Dr. James Wong', specialty: 'Internal medicine' },
  { name: 'Dr. Maria Rodriguez', specialty: 'Endocrinology' },
  { name: 'Dr. Robert Kim', specialty: 'Cardiology' },
  { name: 'Dr. Emily Johnson', specialty: 'Family medicine' },
];

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
  const { height } = page.getSize();
  const fontSize = options.fontSize ?? 11;
  const lineHeight = options.lineHeight ?? 14;
  let y = options.yStart ?? height - 55;
  for (const line of lines) {
    if (y < 50) break;
    page.drawText(line, { x: 50, y, size: fontSize, font, color: rgb(0, 0, 0) });
    y -= lineHeight;
  }
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function formatDate(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function formatDateShort(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function generateLabValue(lab: LabValueDef, tendency: 'good' | 'bad'): { value: number; status: 'normal' | 'high' | 'low' } {
  let value: number;
  let status: 'normal' | 'high' | 'low';

  if (tendency === 'good') {
    // Prefer values in the good range, but sometimes use normal range
    if (lab.goodRange && Math.random() > 0.2) {
      value = randomFloat(lab.goodRange.min, lab.goodRange.max);
      status = 'normal';
    } else {
      value = randomFloat(lab.normalMin, lab.normalMax);
      status = 'normal';
    }
  } else {
    // Bad tendency: mix of high/low values outside normal range
    const rand = Math.random();
    if (lab.badRange) {
      if (rand < 0.5) {
        // Low value
        value = randomFloat(lab.badRange.min, lab.normalMin - 0.1);
        status = 'low';
      } else {
        // High value
        value = randomFloat(lab.normalMax + 0.1, lab.badRange.max);
        status = 'high';
      }
    } else {
      // For ranges without badRange, use edge of normal range
      if (rand < 0.5) {
        value = randomFloat(lab.normalMin, lab.normalMin + (lab.normalMax - lab.normalMin) * 0.2);
        status = lab.normalMin === 0 ? 'high' : 'low';
      } else {
        value = randomFloat(lab.normalMax - (lab.normalMax - lab.normalMin) * 0.2, lab.normalMax);
        status = 'high';
      }
    }
  }

  return { value, status };
}

function generateLabResults(date: Date, tendency: 'good' | 'bad'): { filename: string; lines: string[] } {
  const numTests = randomInt(4, 8);
  const selectedLabs: LabValueDef[] = [];
  const usedIndices = new Set<number>();

  while (selectedLabs.length < numTests) {
    const idx = randomInt(0, LAB_VALUES.length - 1);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selectedLabs.push(LAB_VALUES[idx]);
    }
  }

  const labResults: string[] = [];
  const findings: string[] = [];
  const recommendations: string[] = [];

  for (const lab of selectedLabs) {
    const { value, status } = generateLabValue(lab, tendency);
    const valueStr = lab.unit.includes('%') ? value.toFixed(1) : value.toFixed(lab.unit.includes('mIU') ? 1 : 1);
    const statusText = status === 'normal' ? 'Normal' : status === 'high' ? 'High' : 'Low';
    labResults.push(`${lab.name}: ${valueStr} ${lab.unit} (ref ${lab.referenceRange}) - ${statusText}`);

    if (status !== 'normal') {
      findings.push(`${lab.name} is ${status}`);
    }
  }

  if (findings.length === 0) {
    findings.push('All values within normal limits');
    recommendations.push('Continue current lifestyle and diet');
  } else {
    if (tendency === 'bad') {
      recommendations.push('Consider dietary adjustments');
      recommendations.push('Follow up with healthcare provider');
      recommendations.push('Repeat labs in 3-6 months');
    } else {
      recommendations.push('Continue current management');
      recommendations.push('Repeat labs in 6-12 months');
    }
  }

  const dateStr = formatDate(date);
  const filename = `lab_results_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${randomInt(1000, 9999)}.pdf`;

  return {
    filename,
    lines: [
      'LABORATORY RESULTS',
      `Test Date: ${dateStr}`,
      '',
      ...labResults,
      '',
      `Findings: ${findings.join('. ')}.`,
      `Recommendations: ${recommendations.join('. ')}.`,
    ],
  };
}

function generatePrescription(date: Date, tendency: 'good' | 'bad'): { filename: string; lines: string[] } {
  const numMeds = randomInt(1, 3);
  const selectedMeds: MedicationDef[] = [];
  const usedIndices = new Set<number>();

  while (selectedMeds.length < numMeds) {
    const idx = randomInt(0, MEDICATIONS.length - 1);
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      selectedMeds.push(MEDICATIONS[idx]);
    }
  }

  const medications: string[] = [];
  const instructions: string[] = [];

  for (const med of selectedMeds) {
    const dosageKey = tendency === 'bad' ? 'strong' : tendency === 'good' ? 'weak' : 'moderate';
    const dosage = med.dosages[dosageKey];
    medications.push(`${med.name} ${dosage}`);
    medications.push(`   ${med.frequency}. Duration: ${med.duration}.`);

    // Sometimes add related medication
    if (Math.random() > 0.6 && med.relatedMeds.length > 0) {
      const relatedMed = randomChoice(med.relatedMeds);
      const relatedMedDef = MEDICATIONS.find((m) => m.name === relatedMed);
      if (relatedMedDef) {
        const relatedDosageKey = tendency === 'bad' ? 'strong' : 'weak';
        const relatedDosage = relatedMedDef.dosages[relatedDosageKey];
        medications.push(`${relatedMed} ${relatedDosage}`);
        medications.push(`   ${relatedMedDef.frequency}. Duration: ${relatedMedDef.duration}.`);
      }
    }
  }

  if (tendency === 'bad') {
    instructions.push('Take medications as prescribed. Monitor for side effects.');
    instructions.push('Follow up in 2-4 weeks.');
  } else {
    instructions.push('Take medications as prescribed.');
    instructions.push('Continue current regimen.');
  }

  const doctor = randomChoice(DOCTORS);
  const dateStr = formatDate(date);
  const filename = `rx_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${randomInt(1000, 9999)}.pdf`;

  return {
    filename,
    lines: [
      'PRESCRIPTION',
      `Date: ${dateStr}`,
      `Physician: ${doctor.name}`,
      '',
      ...medications.map((m, i) => (i === 0 || medications[i - 1].startsWith('   ') ? m : `${i}. ${m}`)),
      '',
      `Instructions: ${instructions.join(' ')}`,
    ],
  };
}

function generateMedicalReport(date: Date, tendency: 'good' | 'bad'): { filename: string; lines: string[] } {
  const doctor = randomChoice(DOCTORS);
  const dateStr = formatDate(date);

  const complaints = [
    'Annual check-up',
    'Follow-up visit',
    'Routine physical examination',
    'Fatigue and low energy',
    'Follow-up on previous concerns',
  ];
  const chiefComplaint = randomChoice(complaints);

  const diagnoses: string[] = [];
  const findings: string[] = [];
  const recommendations: string[] = [];
  const medications: string[] = [];

  if (tendency === 'bad') {
    diagnoses.push('Dyslipidemia (mild)');
    diagnoses.push('Vitamin D insufficiency');
    findings.push('Blood pressure slightly elevated');
    findings.push('Lab values show some abnormalities');
    findings.push('Weight stable but could improve');
    recommendations.push('Dietary modifications recommended');
    recommendations.push('Increase physical activity');
    recommendations.push('Consider medication adjustments');
    medications.push('Atorvastatin 20 mg');
    medications.push('Vitamin D3 5000 IU');
  } else {
    diagnoses.push('Overall health good');
    diagnoses.push('Minor improvements noted');
    findings.push('Blood pressure within normal limits');
    findings.push('Lab values improving');
    findings.push('Weight stable');
    recommendations.push('Continue current lifestyle');
    recommendations.push('Maintain healthy diet');
    recommendations.push('Regular follow-up recommended');
    medications.push('Vitamin D3 2000 IU');
  }

  const filename = `report_${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}_${randomInt(1000, 9999)}.pdf`;

  return {
    filename,
    lines: [
      'MEDICAL REPORT',
      `Date: ${dateStr}`,
      `Physician: ${doctor.name} - ${doctor.specialty}`,
      '',
      `Chief complaint: ${chiefComplaint}`,
      `Diagnosis: ${diagnoses.join(', ')}`,
      '',
      `Findings: ${findings.join('. ')}.`,
      `Recommendations: ${recommendations.join('. ')}.`,
      `Medications: ${medications.join(', ')}`,
      `Follow-up: ${tendency === 'bad' ? 'Recheck in 3 months' : 'Recheck in 6 months'}.`,
    ],
  };
}

async function createPdf(filename: string, title: string, lines: string[]): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  page.drawText(title, { x: 50, y: height - 30, size: 16, font, color: rgb(0, 0, 0) });
  const allLines = lines.flatMap((t) => wrapLines(t, 70));
  await drawPageText(page, font, allLines, { yStart: height - 55, fontSize: 11 });
  const bytes = await pdfDoc.save();
  const outPath = path.join(OUT_DIR, filename);
  fs.writeFileSync(outPath, bytes);
  console.log('Generated:', filename);
}

function parseArgs(): {
  blood: number;
  prescription: number;
  report: number;
  tendency: 'good' | 'bad';
  date: Date;
} {
  const args = process.argv.slice(2);
  let blood = 0;
  let prescription = 0;
  let report = 0;
  let tendency: 'good' | 'bad' = 'good';
  let date = new Date();

  for (const arg of args) {
    if (arg.startsWith('--blood=')) {
      blood = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--prescription=')) {
      prescription = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--report=')) {
      report = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--tendency=')) {
      const t = arg.split('=')[1].toLowerCase();
      tendency = t === 'bad' ? 'bad' : 'good';
    } else if (arg.startsWith('--date=')) {
      const dateStr = arg.split('=')[1];
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
  }

  return { blood, prescription, report, tendency, date };
}

async function main() {
  const { blood, prescription, report, tendency, date } = parseArgs();

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log('Created directory:', OUT_DIR);
  }

  console.log(`\nGenerating PDFs with tendency: ${tendency}`);
  console.log(`Date: ${formatDate(date)}\n`);

  // Generate blood analysis PDFs
  for (let i = 0; i < blood; i++) {
    const doc = generateLabResults(date, tendency);
    await createPdf(doc.filename, `Lab Results - ${formatDateShort(date)}`, doc.lines);
  }

  // Generate prescription PDFs
  for (let i = 0; i < prescription; i++) {
    const doc = generatePrescription(date, tendency);
    await createPdf(doc.filename, `Prescription - ${formatDateShort(date)}`, doc.lines);
  }

  // Generate medical report PDFs
  for (let i = 0; i < report; i++) {
    const doc = generateMedicalReport(date, tendency);
    await createPdf(doc.filename, `Medical Report - ${formatDateShort(date)}`, doc.lines);
  }

  console.log(`\nDone! Generated ${blood + prescription + report} PDF(s) in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
