import { test, expect } from '@playwright/test';
import users from './fixtures/users.json';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

for (const user of users) {
  test(`login + dashboard test for ${user.email}`, async ({ page }) => {
    await page.goto('https://preview--gamanam-user-portal.lovable.app/');

    await page.getByPlaceholder('Email').fill(user.email);
    await page.getByPlaceholder('Password').fill(user.password);
    await page.getByRole('button', { name: /continue journey/i }).click();

    if (user.valid) {
      // Step 1: Wait for dashboard to load
      const allLocators = page.locator('p.text-2xl.font-bold.text-slate-900');
      await page.waitForFunction(() => {
        const texts = Array.from(document.querySelectorAll('p.text-2xl.font-bold.text-slate-900')).map(p => p.textContent?.trim() || '');
        return texts.some(text => /^\d[\d,]*$/.test(text));
      }, null, { timeout: 10000 });

      // Step 2: Extract number-looking text
      const allText = await allLocators.allTextContents();
      console.log(`🕵️ Raw dashboard text for ${user.email}:`, allText);

      const numberText = allText.find(text => text.replace(/,/g, '').match(/^\d+$/));
      const flightCount = numberText ? parseInt(numberText.replace(/,/g, '')) : NaN;

      if (isNaN(flightCount)) {
        throw new Error(`❌ Couldn't parse a valid dashboard count from: [${allText.join(', ')}]`);
      }

      // Step 3: Supabase actual count
      const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw new Error(`❌ Supabase auth error for ${user.email}: ${listError.message}`);
      }

      const authUser = userList.users.find(u => u.email === user.email);
      if (!authUser) {
        throw new Error(`❌ No auth user found for ${user.email}`);
      }

      const { count, error: countError } = await supabase
        .from('flights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id);

      if (countError) {
        throw new Error(`❌ Error fetching flight count for ${user.email}: ${countError.message}`);
      }

      console.log(`✅ Supabase count for ${user.email}:`, count);
      console.log(`🧾 Dashboard count for ${user.email}:`, flightCount);
      expect(flightCount).toBe(count);
    } else {
      // For invalid users, expect login to fail
      const loginFailed = page.locator('text=/invalid|incorrect|credentials/i').first();
      await expect(loginFailed).toBeVisible({ timeout: 10000 });


      const stillOnLogin = page.url().includes('/');
      expect(stillOnLogin).toBe(true);
    }
  });
}

test.afterAll(() => {
  console.log('✅ All dashboard tests completed.');
});

