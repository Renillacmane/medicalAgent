/**
 * Seed script: fake RAG data (userdocuments + documentchunks with placeholder embeddings).
 * Adds 3 documents of each type (blood_analysis, medical_report, prescription) for jane@example.com.
 * Matches docs/rag_implementation_plan.md schemas.
 *
 * Prerequisites:
 * - User jane@example.com exists (e.g. run npm run seed:jane or seed first).
 * - MongoDB Vector Search index on documentchunks.embedding (see docs/rag_setup.md).
 *
 * Run from backend: npm run seed:rag
 */

const TARGET_EMAIL = 'jane@example.com';
const DOCS_PER_TYPE = 3;

import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import mongoose from 'mongoose';

const EMBEDDING_DIMENSIONS = 1536; // OpenAI text-embedding-3-small

function getMongoUri(): string {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes('${')) {
    return mongoUri;
  }
  const dbUser = process.env.DB_USER;
  const dbPwd = process.env.DB_PWD;
  const dbName = process.env.DB_NAME;
  return `mongodb+srv://${dbUser}:${dbPwd}@nodejs.tk4ldce.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=NodeJS`;
}

/** Placeholder embedding (same dimension as index). Not from real embedding API. */
function fakeEmbedding(seed: number): number[] {
  const arr: number[] = [];
  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    arr.push(Math.sin(seed + i * 0.1) * 0.2);
  }
  return arr;
}

function seedFromUserId(userId: mongoose.Types.ObjectId, offset: number): number {
  const hex = userId.toHexString();
  let h = offset;
  for (let i = 0; i < Math.min(hex.length, 8); i++) h = (h * 31 + hex.charCodeAt(i)) | 0;
  return h;
}

const userDocumentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userExamId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserExam' },
    documentType: { type: String, required: true },
    originalFilename: { type: String, required: true },
    attachmentId: { type: String, required: true },
    extractedData: { type: mongoose.Schema.Types.Mixed, required: true },
    analysisSummary: { type: String, required: true },
    documentDate: { type: Date },
    processedAt: { type: Date, required: true },
    status: { type: String, required: true, enum: ['pending', 'processing', 'completed', 'failed'] },
    errorMessage: { type: String },
  },
  { timestamps: true, collection: 'userdocuments' },
);

const documentChunkSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    source: { type: String, required: true },
    sourceType: { type: String, required: true },
    documentType: { type: String },
    specialty: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserDocument' },
    chunkIndex: { type: Number, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'documentchunks' },
);

const userSchema = new mongoose.Schema(
  { firstName: String, lastName: String, email: String },
  { collection: 'users' },
);

const userExamSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    attachmentId: { type: String },
  },
  { timestamps: true, collection: 'userexams' },
);

const UserModel = mongoose.model('User', userSchema);
const UserDocumentModel = mongoose.model('UserDocument', userDocumentSchema);
const DocumentChunkModel = mongoose.model('DocumentChunk', documentChunkSchema);
const UserExamModel = mongoose.model('UserExam', userExamSchema);

const BLOOD_ANALYSIS_VARIANTS = [
  {
    testDate: '2025-01-15',
    labValues: [
      { name: 'Hemoglobin', value: 14.2, unit: 'g/dL', referenceRange: '12.0-16.0', status: 'normal' },
      { name: 'Glucose (fasting)', value: 102, unit: 'mg/dL', referenceRange: '70-100', status: 'high' },
      { name: 'Total Cholesterol', value: 198, unit: 'mg/dL', referenceRange: '<200', status: 'normal' },
      { name: 'HDL', value: 52, unit: 'mg/dL', referenceRange: '>40', status: 'normal' },
      { name: 'LDL', value: 118, unit: 'mg/dL', referenceRange: '<100', status: 'high' },
    ],
    findings: ['Fasting glucose slightly above reference. LDL cholesterol at upper range.'],
    recommendations: ['Consider dietary adjustments to support blood sugar and cholesterol. Repeat lipids in 6 months.'],
  },
  {
    testDate: '2024-11-20',
    labValues: [
      { name: 'Hemoglobin', value: 13.8, unit: 'g/dL', referenceRange: '12.0-16.0', status: 'normal' },
      { name: 'Glucose (fasting)', value: 95, unit: 'mg/dL', referenceRange: '70-100', status: 'normal' },
      { name: 'Creatinine', value: 0.9, unit: 'mg/dL', referenceRange: '0.6-1.2', status: 'normal' },
      { name: 'eGFR', value: 92, unit: 'mL/min/1.73m²', referenceRange: '>90', status: 'normal' },
    ],
    findings: ['Kidney function within normal limits. Blood sugar improved from previous.'],
    recommendations: ['Continue current diet. Repeat metabolic panel in 6 months.'],
  },
  {
    testDate: '2024-09-05',
    labValues: [
      { name: 'TSH', value: 2.4, unit: 'mIU/L', referenceRange: '0.4-4.0', status: 'normal' },
      { name: 'Vitamin D', value: 28, unit: 'ng/mL', referenceRange: '30-100', status: 'low' },
      { name: 'Ferritin', value: 65, unit: 'ng/mL', referenceRange: '15-150', status: 'normal' },
    ],
    findings: ['Vitamin D below optimal. Thyroid function normal.'],
    recommendations: ['Vitamin D supplementation recommended. Recheck level in 3 months.'],
  },
];

const MEDICAL_REPORT_VARIANTS = [
  {
    reportDate: '2025-01-10',
    doctorName: 'Dr. Sarah Chen',
    specialty: 'General practice',
    chiefComplaint: 'Annual check-up and fatigue',
    diagnosis: ['Vitamin D insufficiency', 'Mild stress-related sleep disturbance'],
    findings: ['Blood pressure within normal limits. Weight stable. Patient reports poor sleep and low energy.'],
    recommendations: ['Increase outdoor activity. Consider vitamin D supplement. Improve sleep hygiene.'],
    medications: ['Vitamin D3 2000 IU once daily'],
    followUp: 'Recheck in 3 months.',
  },
  {
    reportDate: '2024-11-18',
    doctorName: 'Dr. James Wong',
    specialty: 'Internal medicine',
    chiefComplaint: 'Follow-up on lipids and fatigue',
    diagnosis: ['Dyslipidemia (mild)', 'Fatigue, improved with vitamin D'],
    findings: ['Lipids improved with diet. Vitamin D level rising. Sleep still variable.'],
    recommendations: ['Continue statin as prescribed. Maintain vitamin D. Consider sleep diary.'],
    medications: ['Atorvastatin 10mg', 'Vitamin D3 2000 IU'],
    followUp: 'Labs in 6 months.',
  },
  {
    reportDate: '2024-08-22',
    doctorName: 'Dr. Sarah Chen',
    specialty: 'General practice',
    chiefComplaint: 'Annual physical',
    diagnosis: ['Vitamin D insufficiency', 'Otherwise well'],
    findings: ['Routine exam unremarkable. Low vitamin D on screening.'],
    recommendations: ['Start vitamin D supplement. Increase dietary calcium.'],
    medications: [],
    followUp: 'Recheck vitamin D in 3 months.',
  },
];

const PRESCRIPTION_VARIANTS = [
  {
    prescriptionDate: '2025-01-10',
    doctorName: 'Dr. Sarah Chen',
    medications: [
      { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'once daily', duration: '3 months' },
    ],
    instructions: 'Take with a meal for better absorption.',
  },
  {
    prescriptionDate: '2024-11-18',
    doctorName: 'Dr. James Wong',
    medications: [
      { name: 'Atorvastatin', dosage: '10 mg', frequency: 'once daily at bedtime', duration: 'Ongoing' },
      { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'once daily', duration: '3 months' },
    ],
    instructions: 'Take statin at night. Vitamin D with food.',
  },
  {
    prescriptionDate: '2024-08-22',
    doctorName: 'Dr. Sarah Chen',
    medications: [
      { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'once daily', duration: '3 months' },
    ],
    instructions: 'Take with breakfast or lunch.',
  },
];

const BLOOD_CHUNKS_TEMPLATES = [
  [
    'Complete blood count and metabolic panel. Hemoglobin 14.2 g/dL (normal). Fasting glucose 102 mg/dL (slightly elevated).',
    'Lipid panel: Total cholesterol 198, HDL 52, LDL 118. LDL at upper range. Consider lifestyle and repeat in 6 months.',
  ],
  [
    'Metabolic panel and kidney function. Fasting glucose 95 mg/dL (normal). Creatinine 0.9, eGFR 92. Kidney function within normal limits.',
    'Blood sugar improved from previous draw. Continue current diet. Repeat in 6 months.',
  ],
  [
    'Thyroid and vitamins: TSH 2.4 (normal). Vitamin D 28 ng/mL (low). Ferritin 65 (normal).',
    'Vitamin D supplementation recommended. Recheck level in 3 months.',
  ],
];

const REPORT_CHUNKS_TEMPLATES = [
  [
    'Annual check-up with Dr. Chen. Chief complaint: fatigue. Diagnosis: Vitamin D insufficiency, mild stress-related sleep disturbance.',
    'Recommendations: increase outdoor activity, vitamin D3 2000 IU daily, improve sleep hygiene. Recheck in 3 months.',
  ],
  [
    'Follow-up with Dr. Wong. Lipids improved. Vitamin D level rising. Sleep still variable.',
    'Continue statin and vitamin D. Consider sleep diary. Labs in 6 months.',
  ],
  [
    'Annual physical with Dr. Chen. Routine exam unremarkable. Low vitamin D on screening.',
    'Start vitamin D supplement. Increase dietary calcium. Recheck vitamin D in 3 months.',
  ],
];

const RX_CHUNKS_TEMPLATES = [
  'Prescription: Vitamin D3 2000 IU once daily, 3 months. Take with a meal for better absorption. Dr. Sarah Chen.',
  'Prescription: Atorvastatin 10 mg at bedtime, ongoing; Vitamin D3 2000 IU once daily, 3 months. Dr. James Wong.',
  'Prescription: Vitamin D3 2000 IU once daily, 3 months. Take with breakfast or lunch. Dr. Sarah Chen.',
];

const BLOOD_FILENAMES = ['lab_results_jan2025.pdf', 'lab_metabolic_nov2024.pdf', 'lab_thyroid_vitd_sep2024.pdf'];
const BLOOD_EXAM_NAMES = ['Lab results (CBC & metabolic)', 'Metabolic & kidney panel', 'Thyroid & vitamin D'];
const REPORT_FILENAMES = ['annual_checkup_jan2025.pdf', 'followup_lipids_nov2024.pdf', 'physical_aug2024.pdf'];
const RX_FILENAMES = ['rx_vitamin_d_jan2025.pdf', 'rx_statin_vitd_nov2024.pdf', 'rx_vitamin_d_aug2024.pdf'];
const BLOOD_DATES = ['2025-01-15', '2024-11-20', '2024-09-05'];
const REPORT_DATES = ['2025-01-10', '2024-11-18', '2024-08-22'];
const RX_DATES = ['2025-01-10', '2024-11-18', '2024-08-22'];
const SUMMARIES_BLOOD = [
  'Blood panel shows slightly elevated fasting glucose and LDL. Hemoglobin and HDL within range. Follow dietary and recheck recommendations.',
  'Metabolic and kidney panel within normal limits. Blood sugar improved. Repeat in 6 months.',
  'Vitamin D low; thyroid and ferritin normal. Supplementation recommended; recheck in 3 months.',
];
const SUMMARIES_REPORT = [
  'Annual check-up. Vitamin D insufficiency and mild sleep issues. Recommendations: vitamin D supplement, sleep hygiene, follow-up in 3 months.',
  'Follow-up: lipids improved, vitamin D rising. Continue statin and vitamin D. Sleep diary suggested.',
  'Annual physical. Low vitamin D; otherwise well. Start vitamin D and recheck in 3 months.',
];
const SUMMARIES_RX = [
  'Prescription for Vitamin D3 2000 IU once daily for 3 months. Take with a meal.',
  'Prescription for Atorvastatin 10 mg at bedtime and Vitamin D3 2000 IU daily. Take vitamin D with food.',
  'Prescription for Vitamin D3 2000 IU once daily for 3 months. Take with breakfast or lunch.',
];

const KNOWLEDGE_CHUNKS = [
  {
    content: 'Nutrition guidelines for blood sugar management: prefer low glycemic index foods, regular meals, and fiber-rich vegetables. Limit added sugars and refined carbohydrates.',
    source: 'Nutrition guidelines v1',
    sourceType: 'guideline',
    specialty: 'nutrition',
  },
  {
    content: 'Cardiovascular wellness: aim for 150 minutes of moderate aerobic activity per week. Monitor blood pressure and cholesterol. Reduce sodium intake.',
    source: 'Cardiology wellness guide',
    sourceType: 'specialty',
    specialty: 'cardiology',
  },
  {
    content: 'Sleep hygiene recommendations: consistent sleep schedule, limit screens before bed, avoid caffeine after 2pm, keep bedroom cool and dark.',
    source: 'Lifestyle guidelines',
    sourceType: 'guideline',
    specialty: 'lifestyle',
  },
];

async function seed(): Promise<void> {
  const uri = getMongoUri();
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const user = await UserModel.findOne({ email: TARGET_EMAIL }).lean().exec();
  if (!user) {
    console.log(`User ${TARGET_EMAIL} not found. Run npm run seed:jane (or seed) first to create Jane.`);
    await mongoose.disconnect();
    return;
  }

  const userId = user._id as mongoose.Types.ObjectId;
  const now = new Date();

  for (let n = 0; n < DOCS_PER_TYPE; n++) {
    const bloodDoc = await UserDocumentModel.create({
      userId,
      documentType: 'blood_analysis',
      originalFilename: BLOOD_FILENAMES[n],
      attachmentId: `/documents/${BLOOD_FILENAMES[n]}`,
      extractedData: BLOOD_ANALYSIS_VARIANTS[n],
      analysisSummary: SUMMARIES_BLOOD[n],
      documentDate: new Date(BLOOD_DATES[n]),
      processedAt: now,
      status: 'completed',
    });
    const chunksBlood = BLOOD_CHUNKS_TEMPLATES[n];
    for (let i = 0; i < chunksBlood.length; i++) {
      await DocumentChunkModel.create({
        content: chunksBlood[i],
        embedding: fakeEmbedding(seedFromUserId(userId, 100 + n * 10 + i)),
        source: BLOOD_FILENAMES[n],
        sourceType: 'user-doc',
        documentType: 'blood_analysis',
        userId,
        documentId: bloodDoc._id,
        chunkIndex: i,
      });
    }
    console.log(`Created blood_analysis ${n + 1}/${DOCS_PER_TYPE}: ${BLOOD_FILENAMES[n]} (${chunksBlood.length} chunks)`);
  }

  for (let n = 0; n < DOCS_PER_TYPE; n++) {
    const reportDoc = await UserDocumentModel.create({
      userId,
      documentType: 'medical_report',
      originalFilename: REPORT_FILENAMES[n],
      attachmentId: `/documents/${REPORT_FILENAMES[n]}`,
      extractedData: MEDICAL_REPORT_VARIANTS[n],
      analysisSummary: SUMMARIES_REPORT[n],
      documentDate: new Date(REPORT_DATES[n]),
      processedAt: now,
      status: 'completed',
    });
    const chunksReport = REPORT_CHUNKS_TEMPLATES[n];
    for (let i = 0; i < chunksReport.length; i++) {
      await DocumentChunkModel.create({
        content: chunksReport[i],
        embedding: fakeEmbedding(seedFromUserId(userId, 200 + n * 10 + i)),
        source: REPORT_FILENAMES[n],
        sourceType: 'user-doc',
        documentType: 'medical_report',
        userId,
        documentId: reportDoc._id,
        chunkIndex: i,
      });
    }
    console.log(`Created medical_report ${n + 1}/${DOCS_PER_TYPE}: ${REPORT_FILENAMES[n]} (${chunksReport.length} chunks)`);
  }

  for (let n = 0; n < DOCS_PER_TYPE; n++) {
    const rxDoc = await UserDocumentModel.create({
      userId,
      documentType: 'prescription',
      originalFilename: RX_FILENAMES[n],
      attachmentId: `/documents/${RX_FILENAMES[n]}`,
      extractedData: PRESCRIPTION_VARIANTS[n],
      analysisSummary: SUMMARIES_RX[n],
      documentDate: new Date(RX_DATES[n]),
      processedAt: now,
      status: 'completed',
    });
    const contentRx = RX_CHUNKS_TEMPLATES[n];
    await DocumentChunkModel.create({
      content: contentRx,
      embedding: fakeEmbedding(seedFromUserId(userId, 300 + n)),
      source: RX_FILENAMES[n],
      sourceType: 'user-doc',
      documentType: 'prescription',
      userId,
      documentId: rxDoc._id,
      chunkIndex: 0,
    });
    console.log(`Created prescription ${n + 1}/${DOCS_PER_TYPE}: ${RX_FILENAMES[n]} (1 chunk)`);
  }

  for (let n = 0; n < DOCS_PER_TYPE; n++) {
    await UserExamModel.create({
      userId,
      name: BLOOD_EXAM_NAMES[n],
      date: new Date(BLOOD_DATES[n]),
      attachmentId: `/documents/${BLOOD_FILENAMES[n]}`,
    });
    console.log(`Created exam ${n + 1}/${DOCS_PER_TYPE}: ${BLOOD_EXAM_NAMES[n]} (${BLOOD_FILENAMES[n]})`);
  }

  for (let i = 0; i < KNOWLEDGE_CHUNKS.length; i++) {
    const k = KNOWLEDGE_CHUNKS[i];
    await DocumentChunkModel.create({
      content: k.content,
      embedding: fakeEmbedding(5000 + i),
      source: k.source,
      sourceType: k.sourceType,
      specialty: k.specialty,
      chunkIndex: i,
    });
  }
  console.log(`Created ${KNOWLEDGE_CHUNKS.length} knowledge-base chunks (no userId).`);

  console.log(`RAG seed complete for ${TARGET_EMAIL}: ${DOCS_PER_TYPE} blood_analysis, ${DOCS_PER_TYPE} medical_report, ${DOCS_PER_TYPE} prescription, ${DOCS_PER_TYPE} exams.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
