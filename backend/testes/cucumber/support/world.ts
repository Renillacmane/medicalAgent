import { setWorldConstructor } from '@cucumber/cucumber';
import type { INestApplication } from '@nestjs/common';
import type { Response } from 'supertest';

export interface ApiWorld {
  app: INestApplication;
  response: Response | null;
  requestBody: unknown;
}

class AppWorld implements ApiWorld {
  app!: INestApplication;
  response: Response | null = null;
  requestBody: unknown = undefined;
}

setWorldConstructor(AppWorld);
