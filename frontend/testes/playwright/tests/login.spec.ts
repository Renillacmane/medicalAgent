import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('input#login-email')).toBeVisible();
    await expect(page.locator('input#login-password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input#login-email', 'invalid@example.com');
    await page.fill('input#login-password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    await expect(page.getByRole('paragraph').filter({ hasText: 'Invalid email or password' })).toBeVisible({
      timeout: 10000,
    });
  });

  test('should disable button while loading', async ({ page }) => {
    await page.fill('input#login-email', 'test@example.com');
    await page.fill('input#login-password', 'password123');

    // Click and immediately check button state
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Button should show loading state
    await expect(submitButton).toContainText('Signing in');
  });

  test('should require email field', async ({ page }) => {
    await page.fill('input#login-password', 'password123');
    await page.click('button[type="submit"]');

    // Form should not submit, email input should be invalid
    const emailInput = page.locator('input#login-email');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should require password field', async ({ page }) => {
    await page.fill('input#login-email', 'test@example.com');
    await page.click('button[type="submit"]');

    // Form should not submit, password input should be invalid
    const passwordInput = page.locator('input#login-password');
    await expect(passwordInput).toHaveAttribute('required', '');
  });
});
