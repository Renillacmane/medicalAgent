import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  UserVital,
  UserVitalSchema,
  UserMedication,
  UserMedicationSchema,
  UserExam,
  UserExamSchema,
} from './schemas';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserVital.name, schema: UserVitalSchema },
      { name: UserMedication.name, schema: UserMedicationSchema },
      { name: UserExam.name, schema: UserExamSchema },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [MongooseModule, PatientsService],
})
export class PatientsModule {}
