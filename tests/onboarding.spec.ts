import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  const BASE_URL = 'http://localhost:5173';

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    await page.goto(`${BASE_URL}/landing`);
  });

  test('Guardian registration via manual search and clubber wizard', async ({ page }) => {
    // Click Get Started to open Auth Modal
    await page.getByRole('button', { name: /Get Started/i }).first().click();
    
    // Switch to Register tab
    await page.getByRole('tab', { name: /Register/i }).click();

    // Select Country in Club Selector
    // The top bar has one, and the selector has one. We want the one in the form.
    const countryTrigger = page.locator('button').filter({ hasText: 'Country' }).first();
    await countryTrigger.click();
    await page.getByRole('option', { name: /Tanzania/i }).click();

    // Select Region
    const regionTrigger = page.locator('button').filter({ hasText: 'Region' }).first();
    await regionTrigger.click();
    await page.getByRole('option', { name: /Arusha/i }).click();

    // Select Club
    // Use locator with text since getByRole might be ambiguous or failing on the name
    const clubTrigger = page.locator('button').filter({ hasText: /Select your club/i });
    await clubTrigger.click();
    
    // The club list is in a Command component
    await page.getByRole('option', { name: /Test Club Arusha/i }).click();

    // Verify club is selected
    await expect(page.locator('text=Selected Club:')).toBeVisible();

    // Choose Guardian Role
    await page.locator('label').filter({ hasText: 'Guardian' }).click();

    // Fill Details
    const email = `test-guardian-${Date.now()}@example.com`;
    await page.fill('input[placeholder="John Doe"]', 'Test Guardian');
    await page.fill('input[placeholder="+255..."]', '+255123456789');
    await page.fill('input[placeholder="email@example.com"]', email);
    
    // There are 2 password fields
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill('Password123!');
    await passwordFields.nth(1).fill('Password123!');

    // Register
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Post-registration: Should see Clubber Wizard (Onboarding Modal)
    await expect(page.locator('h3:has-text("Add your first clubber")')).toBeVisible({ timeout: 15000 });

    // Add Clubber
    await page.fill('input[name="firstName"]', 'Little');
    await page.fill('input[name="lastName"]', 'Clubber');
    await page.getByRole('button', { name: 'Register Clubber' }).click();

    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('Leader registration with Join Code and Pending status', async ({ page }) => {
    await page.getByRole('button', { name: /Get Started/i }).first().click();
    await page.getByRole('tab', { name: /Register/i }).click();

    // Use a join code (we seeded AW1234)
    await page.fill('input[placeholder*="Club Code"]', 'AW1234');
    await page.getByRole('button', { name: 'Join' }).click();

    // Verify club is selected
    await expect(page.locator('text=Selected Club:')).toBeVisible();

    await page.locator('label').filter({ hasText: 'Leader' }).click();
    
    // Fill basic details
    const email = `test-leader-${Date.now()}@example.com`;
    await page.fill('input[placeholder="John Doe"]', 'Test Leader');
    await page.fill('input[placeholder="email@example.com"]', email);
    
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill('Password123!');
    await passwordFields.nth(1).fill('Password123!');

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should see Pending Status screen
    await expect(page.locator('h3:has-text("Registration Received!")')).toBeVisible({ timeout: 15000 });
    
    await page.getByRole('button', { name: 'Got it, thanks!' }).click();
    
    // Should refresh and show dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
