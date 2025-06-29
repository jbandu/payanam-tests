// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import users from './fixtures/users.json';

for (const user of users) {
  test(`${user.valid ? '✅ Valid' : '❌ Invalid'} login for ${user.email}`, async ({ page }) => {
    await page.goto('https://preview--gamanam-user-portal.lovable.app/');

    // Fill form
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: 'Login' }).click();

    if (user.valid) {
      // Wait for dashboard
      await page.waitForURL('**/home', { timeout: 10000 });
      await expect(page.getByText('Your Journey Remembered')).toBeVisible();

      // Logout
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    } else {
      // Invalid login expected to show error
      await expect(page.getByText(/invalid|wrong|incorrect/i)).toBeVisible();
    }
  });
}

