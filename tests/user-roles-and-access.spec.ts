import { test, expect } from '@playwright/test';

test.describe('User Roles and Access Control', () => {
  const BASE_URL = 'http://localhost:5173';

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    await page.goto(`${BASE_URL}/landing`);
    // Clear any existing auth
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Guardian registration and My Clubbers access', async ({ page }) => {
    // Click Get Started to open Auth Modal
    await page.getByRole('button', { name: /Get Started/i }).first().click();
    
    // Switch to Register tab
    await page.getByRole('tab', { name: /Register/i }).click();

    // Choose Guardian Role
    await page.locator('label').filter({ hasText: 'Guardian' }).click();

    // Use join code to find club (same as leader test)
    await page.getByRole('button', { name: /Enter Club Registration #/i }).click();
    await page.fill('input[placeholder*="Registration #"]', 'AW1234');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Wait for the details form to appear (indicates successful club selection)
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();

    // Fill registration details
    const email = `test-guardian-${Date.now()}@example.com`;
    await page.fill('input[placeholder="John Doe"]', 'Test Guardian');
    await page.fill('input[placeholder="+255..."]', '+255123456789');
    await page.fill('input[placeholder="email@example.com"]', email);
    
    // Fill passwords
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill('Password123!');
    await passwordFields.nth(1).fill('Password123!');

    // Register
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should be on dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Verify Guardian role is shown
    await expect(page.getByText(/Guardian/i)).toBeVisible();
    await expect(page.getByText(/My Family/i)).toBeVisible();
    
    // Open sidebar by clicking the hamburger menu (first button in header)
    await page.locator('header button').first().click();
    
    // Verify "My Clubbers" link is visible in sidebar
    await expect(page.getByText(/My Clubbers/i)).toBeVisible();
  });

  test('Leader registration with Pending status', async ({ page }) => {
    await page.getByRole('button', { name: /Get Started/i }).first().click();
    await page.getByRole('tab', { name: /Register/i }).click();

    // Choose Leader Role
    await page.locator('label').filter({ hasText: 'Leader' }).click();

    // Click "Enter Club Registration #"
    await page.getByRole('button', { name: /Enter Club Registration #/i }).click();
    
    // Enter registration code
    await page.fill('input[placeholder*="Registration #"]', 'AW1234');
    await page.getByRole('button', { name: 'Search', exact: true }).click();

    // Verify club is selected and we're on details page
    await expect(page.getByText(/Test Club Arusha/i)).toBeVisible();

    // Fill basic details
    const email = `test-leader-${Date.now()}@example.com`;
    await page.fill('input[placeholder="John Doe"]', 'Test Leader');
    await page.fill('input[placeholder="email@example.com"]', email);
    
    const passwordFields = page.locator('input[type="password"]');
    await passwordFields.nth(0).fill('Password123!');
    await passwordFields.nth(1).fill('Password123!');

    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should be on dashboard with pending status
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Verify pending leader message is shown
    await expect(page.getByText(/Leader Approval Pending/i)).toBeVisible();
    await expect(page.getByText(/Your request to join as a leader is being reviewed/i)).toBeVisible();
  });

});
