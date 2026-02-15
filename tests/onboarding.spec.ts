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

    // Choose Guardian Role
    await page.locator('label').filter({ hasText: 'Guardian' }).click();

    // Select Club
    // Use locator with text since getByRole might be ambiguous or failing on the name
    await page.getByRole('button', { name: /Search for my Club/i }).click();

    // Select Country - Look for the trigger within the browse section
    await page.getByRole('button', { name: 'Country' }).click();
    await page.getByRole('option', { name: 'Tanzania', exact: true }).click();

    // Select Region
    await page.getByRole('button', { name: 'Region' }).click();
    await page.getByRole('option', { name: 'Arusha', exact: true }).click();

    // Select specific club from combobox
    await page.getByRole('button', { name: /Select your club/i }).click();
    await page.getByRole('option', { name: /Test Club Arusha/i }).click();

    // Verify club is selected (ClubSelector shows "Selected Club" in a label)
    await expect(page.getByText(/Selected Club/i)).toBeVisible();

    // Verify club name specifically (Test Club Arusha)
    await expect(page.getByText(/Test Club Arusha/i)).toBeVisible();

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

    await page.locator('label').filter({ hasText: 'Leader' }).click();

    // Use a join code (we seeded AW1234)
    await page.getByRole('button', { name: /Enter Club Registration #/i }).click();
    await page.fill('input[placeholder*="Registration #"]', 'AW1234');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Verify club is selected (AW1234 registration)
    await expect(page.getByText(/Selected Club/i)).toBeVisible();

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
