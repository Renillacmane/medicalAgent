import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserVital,
  UserVitalSchema,
  UserMedication,
  UserMedicationSchema,
  UserExam,
  UserExamSchema,
} from './schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserVital.name, schema: UserVitalSchema },
      { name: UserMedication.name, schema: UserMedicationSchema },
      { name: UserExam.name, schema: UserExamSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PatientsModule {}
