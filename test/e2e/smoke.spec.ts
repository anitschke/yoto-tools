import { test, expect } from '@playwright/test';

test('homepage loads and renders title', async ({ page }) => {
  const target = process.env.TARGET_URL || 'http://localhost:5173';
  await page.goto(target);
  await expect(page).toHaveTitle(/Yoto Tools/i);
});
