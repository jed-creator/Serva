import { test, expect } from '@playwright/test';

/**
 * Smoke tests — make sure the core public routes render without errors.
 * These run against the dev server.
 */

test.describe('Public routes', () => {
  test('landing page loads and shows Serva brand', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Serva/);
    await expect(page.getByText('Serva').first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Get started free' }),
    ).toBeVisible();
  });

  test('login page renders email + password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Sign in' }),
    ).toBeVisible();
  });

  test('signup page renders all required fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel('First name')).toBeVisible();
    await expect(page.getByLabel('Last name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('forgot-password page renders email field', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Send reset link/i }),
    ).toBeVisible();
  });
});

test.describe('Auth gating', () => {
  test('unauthenticated /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated /admin redirects to /login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('unauthenticated /dashboard/business redirects to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard/business');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('API endpoints', () => {
  test('stripe webhook rejects unsigned requests', async ({ request }) => {
    const res = await request.post('/api/stripe/webhook');
    expect(res.status()).toBe(400);
  });

  test('cron endpoint returns something for GET', async ({ request }) => {
    // Without CRON_SECRET set this should run (empty result) or 200 JSON
    const res = await request.get('/api/cron/send-reminders');
    expect([200, 401, 500]).toContain(res.status());
  });
});
