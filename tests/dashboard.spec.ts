import { test, expect } from '@playwright/test';
import { supabase } from './utils/supabase';
import fs from 'fs';

test.use({ timeout: 60000 }); // extend default timeout to 60s

test('dashboard shows correct total flights count', async ({ page }) => {
  // Step 1: Query Supabase for flight count
  const { count, error } = await supabase
    .from('flights')
    .select('*', { count: 'exact', head: true });

  console.log('✅ Supabase count result:', count);
  console.error('🔴 Supabase error object:', error);

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  // Step 2: Go to login page and wait for form
  await page.goto('https://preview--gamanam-user-portal.lovable.app/');
await page.locator('input[placeholder="Email"]').waitFor({ state: 'visible', timeout: 10000 });
await page.fill('input[placeholder="Email"]', 'jbandu2@gmail.com');
await page.fill('input[type="password"]', 'Memphis123');


  // Step 3: Fill login form
  await page.click('button:has-text("Continue Journey")');

await page.waitForTimeout(5000);  // ⏳ wait for login animation / redirect
await page.waitForURL('**/home', { timeout: 15000 }); // ✅ wait for final redirect

const html = await page.content();
fs.writeFileSync('home-page.html', html);

  await page.waitForURL('**/home', { timeout: 15000 });

  // Step 4: Extract and verify flight count
  const flightCountText = await page.textContent('p.text-2xl.font-bold.text-slate-900');
  const flightCount = Number(flightCountText?.trim());
  console.log('🧾 Dashboard count:', flightCount);

  expect(flightCount).toBe(count);

  // Step 5: Logout (if needed)
  const logoutButton = page.locator('button:has-text("Logout")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
});

