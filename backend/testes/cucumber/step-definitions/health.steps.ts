import assert from 'node:assert';
import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import type { ApiWorld } from '../support/world';

Given('the request body is:', function (this: ApiWorld, docString: string) {
  this.requestBody = JSON.parse(docString);
});

When('I send a GET request to {string}', async function (this: ApiWorld, path: string) {
  this.response = await request(this.app.getHttpServer()).get(path);
});

When('I send a POST request to {string}', async function (this: ApiWorld, path: string) {
  this.response = await request(this.app.getHttpServer())
    .post(path)
    .send(this.requestBody as string);
});

Then('the response status should be {int}', function (this: ApiWorld, status: number) {
  assert.strictEqual(this.response?.status, status);
});

Then('the response body should contain {string}', function (this: ApiWorld, text: string) {
  const body = JSON.stringify(this.response?.body ?? {});
  assert(body.includes(text), `Expected body to contain "${text}"`);
});

Then('the response status should be in the 2XX to 3XX range', function (this: ApiWorld) {
  const status = this.response?.status ?? 0;
  assert(status >= 200 && status <= 399, `Expected status 200-399, got ${status}`);
});
