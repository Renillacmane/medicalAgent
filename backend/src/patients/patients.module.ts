import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { LlmModule } from '../llm/llm.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import {
  UserVital,
  UserVitalSchema,
  UserMedication,
  UserMedicationSchema,
  UserExam,
  UserExamSchema,
  UserDocument,
  UserDocumentSchema,
} from './schemas';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { DocumentProcessorService } from './services/document-processor.service';

@Module({
  imports: [
    AuthModule,
    LlmModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserVital.name, schema: UserVitalSchema },
      { name: UserMedication.name, schema: UserMedicationSchema },
      { name: UserExam.name, schema: UserExamSchema },
      { name: UserDocument.name, schema: UserDocumentSchema },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService, DocumentProcessorService],
  exports: [MongooseModule, PatientsService],
})
export class PatientsModule {}
