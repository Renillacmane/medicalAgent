import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

async function bootstrap() {
  const adapter = new FastifyAdapter();
  // CORS on adapter so preflight (OPTIONS) and PATCH are allowed from browser.
  adapter.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Use PORT from env (e.g. Render, Heroku) or default for local dev. Bind to 0.0.0.0 for PaaS.
  const port = Number(process.env.PORT) || 3911;
  await app.listen({ port, host: '0.0.0.0' });
}
bootstrap();
