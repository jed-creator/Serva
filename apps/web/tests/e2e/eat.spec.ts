import { test, expect } from '@playwright/test';

/**
 * Eat module smoke — landing page for food delivery, grocery, and
 * dine-in booking. Must render an "Eat" heading so the route group is
 * reachable.
 */
test('eat landing page renders', async ({ page }) => {
  await page.goto('/eat');
  await expect(page.getByRole('heading', { name: /Eat/i })).toBeVisible();
});
