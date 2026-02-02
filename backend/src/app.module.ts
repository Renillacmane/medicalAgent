import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './infra/database/database.module';
import { PatientsModule } from './patients/patients.module';

// Resolve .env from project root (parent of dist/ when compiled), so it works regardless of cwd.
const projectRoot = join(__dirname, '..');
const envFiles = [join(projectRoot, '.env.local'), join(projectRoot, '.env')];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFiles,
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
