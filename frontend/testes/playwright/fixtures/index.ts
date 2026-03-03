import { test as base } from '@playwright/test';

// Extend base test with custom fixtures if needed
export const test = base.extend({
  // Example: authenticated page fixture
  // authenticatedPage: async ({ page }, use) => {
  //   await page.goto('/login');
  //   await page.fill('[name="email"]', 'test@example.com');
  //   await page.fill('[name="password"]', 'password123');
  //   await page.click('button[type="submit"]');
  //   await page.waitForURL('/dashboard');
  //   await use(page);
  // },
});

export { expect } from '@playwright/test';
