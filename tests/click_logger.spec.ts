import { test, expect } from '@playwright/test';
import users from './fixtures/click_users.json';

const baseUrl = 'https://preview--gamanam-user-portal.lovable.app';
const user = users.find(u => u.valid); // Use the first valid user

test.describe('Click logger derived interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: /continue journey/i }).click();

    // Wait for dashboard or authenticated page
    await expect(page).toHaveURL(/(dashboard|home|flightdata|analytics)/, { timeout: 10000 });
  });

  test('Click on "STATS"', async ({ page }) => {
    await page.goto(`${baseUrl}/flightdata`);
    await page.getByRole('button', { name: /STATS/i }).click();
  });

  test('Click on "MAPS"', async ({ page }) => {
    await page.goto(`${baseUrl}/analytics`);
    await page.getByRole('button', { name: /MAPS/i }).click();
  });

   test('Click on "LOGOUT"', async ({ page }) => {
    await page.goto(`${baseUrl}/home`);
    await page.getByRole('button', { name: /LOGOUT/i }).click();
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== testInfo.expectedStatus) {
      console.error(`❌ Test failed at URL: ${page.url()}`);
      await page.screenshot({ path: `errors/${testInfo.title.replace(/\s+/g, '_')}.png`, fullPage: true });
    }
  });
});

