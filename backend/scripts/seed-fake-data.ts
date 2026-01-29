/**
 * Seed script: 10 users (password "fakedata"), 5 vitals and 5 medications per user, no exams.
 * Run from backend: npm run seed
 */
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const FAKE_PASSWORD = 'fakedata';

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

const userMedicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    activeSubstance: String,
    purpose: String,
    startDate: Date,
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'usermedications' },
);

const UserModel = mongoose.model('User', userSchema);
const UserVitalModel = mongoose.model('UserVital', userVitalSchema);
const UserMedicationModel = mongoose.model('UserMedication', userMedicationSchema);

const FAKE_USERS = [
  { firstName: 'Alice', lastName: 'Smith', email: 'alice.smith@example.com', dob: new Date('1985-03-12'), height: 165, weight: 62 },
  { firstName: 'Bob', lastName: 'Jones', email: 'bob.jones@example.com', dob: new Date('1990-07-22'), height: 178, weight: 82 },
  { firstName: 'Carol', lastName: 'Williams', email: 'carol.williams@example.com', dob: new Date('1988-11-05'), height: 162, weight: 58 },
  { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com', dob: new Date('1975-01-30'), height: 182, weight: 88 },
  { firstName: 'Eva', lastName: 'Davis', email: 'eva.davis@example.com', dob: new Date('1992-09-14'), height: 170, weight: 65 },
  { firstName: 'Frank', lastName: 'Miller', email: 'frank.miller@example.com', dob: new Date('1980-06-08'), height: 175, weight: 75 },
  { firstName: 'Grace', lastName: 'Wilson', email: 'grace.wilson@example.com', dob: new Date('1995-04-25'), height: 168, weight: 60 },
  { firstName: 'Henry', lastName: 'Taylor', email: 'henry.taylor@example.com', dob: new Date('1972-12-01'), height: 180, weight: 85 },
  { firstName: 'Iris', lastName: 'Anderson', email: 'iris.anderson@example.com', dob: new Date('1987-08-18'), height: 163, weight: 55 },
  { firstName: 'Jack', lastName: 'Thomas', email: 'jack.thomas@example.com', dob: new Date('1993-02-28'), height: 176, weight: 72 },
];

const MEDICATION_NAMES = [
  { name: 'Metformin', dosage: '500mg', frequency: 'twice daily', activeSubstance: 'Metformin', purpose: 'Blood glucose' },
  { name: 'Lisinopril', dosage: '10mg', frequency: 'once daily', activeSubstance: 'Lisinopril', purpose: 'Blood pressure' },
  { name: 'Atorvastatin', dosage: '20mg', frequency: 'once daily', activeSubstance: 'Atorvastatin', purpose: 'Cholesterol' },
  { name: 'Omeprazole', dosage: '20mg', frequency: 'once daily', activeSubstance: 'Omeprazole', purpose: 'Acid reflux' },
  { name: 'Vitamin D3', dosage: '2000 IU', frequency: 'once daily', activeSubstance: 'Cholecalciferol', purpose: 'Supplement' },
];

async function seed(): Promise<void> {
  const uri = getMongoUri();
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash(FAKE_PASSWORD, SALT_ROUNDS);

  const userIds: mongoose.Types.ObjectId[] = [];
  for (const u of FAKE_USERS) {
    const existing = await UserModel.findOne({ email: u.email }).exec();
    if (existing) {
      console.log(`User ${u.email} already exists, skipping`);
      userIds.push(existing._id as mongoose.Types.ObjectId);
      continue;
    }
    const user = await UserModel.create({
      firstName: u.firstName,
      lastName: u.lastName,
      dateOfBirth: u.dob,
      email: u.email,
      passwordHash,
      isActive: true,
      height: u.height,
      weight: u.weight,
    });
    userIds.push(user._id as mongoose.Types.ObjectId);
    console.log(`Created user: ${u.email}`);
  }

  const now = new Date();
  for (let i = 0; i < userIds.length; i++) {
    const userId = userIds[i];
    const baseWeight = FAKE_USERS[i].weight;

    for (let v = 0; v < 5; v++) {
      const date = new Date(now);
      date.setDate(date.getDate() - v * 2);
      const weightVar = baseWeight + (Math.random() * 4 - 2);
      const bmi = baseWeight && FAKE_USERS[i].height ? Math.round((weightVar / ((FAKE_USERS[i].height! / 100) ** 2)) * 10) / 10 : undefined;
      await UserVitalModel.create({
        userId,
        date,
        heartRate: 60 + Math.floor(Math.random() * 30),
        bloodPressure: { systolic: 110 + Math.floor(Math.random() * 20), diastolic: 70 + Math.floor(Math.random() * 10) },
        weight: Math.round(weightVar * 10) / 10,
        sleepHours: 5 + Math.random() * 4,
        stressPerception: 1 + Math.floor(Math.random() * 9),
        bmi,
        bloodOxygen: 95 + Math.floor(Math.random() * 5),
        bloodGlucose: 80 + Math.floor(Math.random() * 40),
      });
    }
    console.log(`Created 5 vitals for user index ${i}`);

    for (let m = 0; m < 5; m++) {
      const med = MEDICATION_NAMES[m];
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - (m + 1) * 2);
      await UserMedicationModel.create({
        userId,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        activeSubstance: med.activeSubstance,
        purpose: med.purpose,
        startDate,
        endDate: null,
        isActive: true,
      });
    }
    console.log(`Created 5 medications for user index ${i}`);
  }

  console.log('Seed complete: 10 users, 5 vitals and 5 medications each, no exams.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
