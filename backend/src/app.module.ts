import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './infra/database/database.module';
import { PatientsModule } from './patients/patients.module';

@Module({
  imports: [
    // Loads `backend/.env` by default in Nest projects.
    // If you later run the app from a different working directory, set envFilePath explicitly.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    PatientsModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
