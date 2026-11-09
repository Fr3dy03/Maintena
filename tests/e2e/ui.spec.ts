import { test, expect } from '@playwright/test';

test('operations overview renders the dispatch control room and BOT footer', async ({ page }) => {
  await page.goto('/app/overview');
  await expect(page).toHaveTitle(/Maintena|/);
  await expect(page.getByRole('heading', { name: 'Morning, Amina.' })).toBeVisible();
  await expect(page.getByText('Dispatch pulse')).toBeVisible();
  await expect(page.getByRole('img', { name: 'BOT Chain' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Bohr testnet explorer/ })).toHaveAttribute('href', 'https://scan.bohr.life');
});

test('technician can open the next assigned job from Today', async ({ page }) => {
  await page.goto('/m/today');
  await expect(page.getByRole('heading', { name: 'Your route.' })).toBeVisible();
  await expect(page.getByText('● SYNCED')).toBeVisible();
  await page.getByRole('link', { name: /Open job/ }).click();
  await expect(page).toHaveURL(/\/m\/work-orders\/1048$/);
  await expect(page.getByRole('heading', { name: 'Inverter cooling alarm' })).toBeVisible();
  await expect(page.getByText('Checklist')).toBeVisible();
});

test('technician scan screen provides a manual fallback', async ({ page }) => {
  await page.goto('/m/scan');
  await expect(page.getByRole('heading', { name: 'Scan asset' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enable camera' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Asset code' })).toBeVisible();
});

test('public asset page exposes only the requester form', async ({ page }) => {
  await page.goto('/r/demo-public-kj-042');
  await expect(page.getByRole('heading', { name: 'Report an issue' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Your name' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'What needs attention?' })).toBeVisible();
  await expect(page.getByText(/safe asset context/i)).toBeVisible();
  await expect(page.getByText(/SMA|serial|warranty|contract price/i)).toHaveCount(0);
});

test('assets and work-order navigation work', async ({ page }) => {
  await page.goto('/app/assets');
  await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();
  await page.getByRole('link', { name: 'Work orders' }).click();
  await expect(page).toHaveURL(/\/app\/work-orders$/);
  await expect(page.getByRole('heading', { name: 'Work orders' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search work orders' })).toBeVisible();
});