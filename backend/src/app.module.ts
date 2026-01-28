import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './common/health/health.module';
import { DatabaseModule } from './infra/database/database.module';

@Module({
  imports: [
    // Loads `backend/.env` by default in Nest projects.
    // If you later run the app from a different working directory, set envFilePath explicitly.
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
