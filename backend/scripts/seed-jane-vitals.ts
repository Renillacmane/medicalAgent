/**
 * Seed vitals for patient jane@example.com.
 * - Randomized vitals; each row uses a varying subset of optional fields.
 * - BMI computed with same formula as PatientsService: weight / (height/100)², rounded to 1 decimal.
 * - Ranges: HR 79–89, BP 115–140/80–95, weight 83–88, sleep 5–9, SpO2 95–97, glucose 105–120.
 * Run from backend: npx ts-node scripts/seed-jane-vitals.ts
 */
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const JANE_EMAIL = 'jane@example.com';
const JANE_PASSWORD = 'fakedata';
const JANE_HEIGHT_CM = 165; // used for BMI when weight is present

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

// Same formula as PatientsService.computeBmi
function computeBmi(weightKg: number, heightCm: number): number {
  if (!heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randFloat(min: number, max: number, decimals = 1): number {
  const v = min + Math.random() * (max - min);
  return Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    height: Number,
    weight: Number,
    dietaryPreference: { type: Object },
    objectives: { type: Object },
  },
  { timestamps: true, collection: 'users' },
);

const userVitalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    heartRate: Number,
    bloodPressure: { systolic: Number, diastolic: Number },
    weight: Number,
    sleepHours: Number,
    stressPerception: Number,
    bmi: Number,
    bloodOxygen: Number,
    bloodGlucose: Number,
  },
  { timestamps: true, collection: 'uservitals' },
);

const UserModel = mongoose.model('User', userSchema);
const UserVitalModel = mongoose.model('UserVital', userVitalSchema);

const RANGES = {
  heartRate: { min: 79, max: 89 },
  bloodPressure: { systolic: { min: 115, max: 140 }, diastolic: { min: 80, max: 95 } },
  weight: { min: 83, max: 88 },
  sleepHours: { min: 5, max: 9 },
  stressPerception: { min: 1, max: 10 },
  bloodOxygen: { min: 95, max: 97 },
  bloodGlucose: { min: 105, max: 120 },
};

// Which optional fields to include for a row (vary so rows don't all look the same)
const FIELD_SETS: (keyof typeof RANGES)[][] = [
  ['heartRate', 'bloodPressure', 'weight', 'sleepHours', 'stressPerception', 'bloodOxygen', 'bloodGlucose'],
  ['heartRate', 'bloodPressure', 'weight', 'sleepHours', 'bloodOxygen', 'bloodGlucose'],
  ['heartRate', 'weight', 'sleepHours', 'stressPerception', 'bloodGlucose'],
  ['bloodPressure', 'weight', 'sleepHours', 'bloodOxygen'],
  ['heartRate', 'bloodPressure', 'sleepHours', 'stressPerception', 'bloodOxygen', 'bloodGlucose'],
  ['heartRate', 'weight', 'stressPerception', 'bloodGlucose'],
  ['bloodPressure', 'weight', 'sleepHours', 'bloodOxygen', 'bloodGlucose'],
  ['heartRate', 'bloodPressure', 'weight', 'sleepHours', 'bloodGlucose'],
  ['heartRate', 'sleepHours', 'stressPerception', 'bloodOxygen'],
  ['weight', 'sleepHours', 'bloodOxygen', 'bloodGlucose'],
  ['heartRate', 'bloodPressure', 'weight', 'stressPerception', 'bloodOxygen'],
  ['heartRate', 'bloodPressure', 'sleepHours', 'bloodGlucose'],
];

async function seed(): Promise<void> {
  const uri = getMongoUri();
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let jane = await UserModel.findOne({ email: JANE_EMAIL }).exec();
  if (!jane) {
    const passwordHash = await bcrypt.hash(JANE_PASSWORD, SALT_ROUNDS);
    jane = await UserModel.create({
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: new Date('1988-05-20'),
      email: JANE_EMAIL,
      passwordHash,
      isActive: true,
      height: JANE_HEIGHT_CM,
      weight: 85,
    });
    console.log(`Created user: ${JANE_EMAIL}`);
  } else {
    console.log(`Found user: ${JANE_EMAIL}`);
  }

  const userId = jane._id as mongoose.Types.ObjectId;
  const heightCm = (jane as { height?: number }).height ?? JANE_HEIGHT_CM;

  const now = new Date();
  const numVitals = 14;

  for (let v = 0; v < numVitals; v++) {
    const date = new Date(now);
    date.setDate(date.getDate() - v);
    date.setHours(8, 0, 0, 0);

    const fieldSet = FIELD_SETS[v % FIELD_SETS.length];
    const doc: Record<string, unknown> = {
      userId,
      date,
    };

    if (fieldSet.includes('heartRate')) {
      doc.heartRate = randInt(RANGES.heartRate.min, RANGES.heartRate.max);
    }
    if (fieldSet.includes('bloodPressure')) {
      doc.bloodPressure = {
        systolic: randInt(RANGES.bloodPressure.systolic.min, RANGES.bloodPressure.systolic.max),
        diastolic: randInt(RANGES.bloodPressure.diastolic.min, RANGES.bloodPressure.diastolic.max),
      };
    }
    if (fieldSet.includes('weight')) {
      const weight = randFloat(RANGES.weight.min, RANGES.weight.max);
      doc.weight = weight;
      doc.bmi = computeBmi(weight, heightCm);
    }
    if (fieldSet.includes('sleepHours')) {
      doc.sleepHours = randFloat(RANGES.sleepHours.min, RANGES.sleepHours.max);
    }
    if (fieldSet.includes('stressPerception')) {
      doc.stressPerception = randInt(RANGES.stressPerception.min, RANGES.stressPerception.max);
    }
    if (fieldSet.includes('bloodOxygen')) {
      doc.bloodOxygen = randInt(RANGES.bloodOxygen.min, RANGES.bloodOxygen.max);
    }
    if (fieldSet.includes('bloodGlucose')) {
      doc.bloodGlucose = randInt(RANGES.bloodGlucose.min, RANGES.bloodGlucose.max);
    }

    await UserVitalModel.create(doc);
  }

  console.log(`Created ${numVitals} vitals for ${JANE_EMAIL} (varied optional fields, ranges as specified).`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
