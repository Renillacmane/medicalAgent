import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';
import type { ApiWorld } from './world';

// Allow app.init() to complete (e.g. MongoDB connection). Increase if your DB is slow.
setDefaultTimeout(30_000);

Before(async function (this: ApiWorld) {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  this.app = moduleFixture.createNestApplication();
  await this.app.init();
});

After(async function (this: ApiWorld) {
  if (this.app) {
    await this.app.close();
  }
});
