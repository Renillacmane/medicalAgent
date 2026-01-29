import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enables CORS for local dev and for embedding (widget / PWA / app).
  app.enableCors({ origin: true, credentials: true });

  await app.listen({ port: Number(process.env.PORT) || 3911, host: '0.0.0.0' });
}
bootstrap();
