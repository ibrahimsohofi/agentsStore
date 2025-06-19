import { test, expect } from '@playwright/test';

test('homepage has title and navigation', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/AgentStore/);

  // Check for main heading
  await expect(page.getByRole('heading', { name: /The Marketplace for AI Agents/ })).toBeVisible();

  // Check navigation elements
  await expect(page.getByText('Browse Agents')).toBeVisible();
  await expect(page.getByText('Sell')).toBeVisible();
});

test('can navigate to marketplace', async ({ page }) => {
  await page.goto('/');

  // Click the marketplace link
  await page.getByText('Browse Agents').click();

  // Should navigate to marketplace
  await expect(page).toHaveURL('/marketplace');
});
