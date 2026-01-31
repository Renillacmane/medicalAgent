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
    // Load .env and .env.local (relative to cwd); keys become process.env.PORT, process.env.JWT_SECRET, etc.
    // .env.local is loaded after .env so it can override values.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
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
