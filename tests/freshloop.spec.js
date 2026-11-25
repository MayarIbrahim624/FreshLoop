const { test, expect } = require('@playwright/test');

function localDateOffset(offset) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function addFood(page, {
  name = 'Banana',
  quantity = '5',
  unit = 'pieces',
  expiryOffset = 3,
  category = 'fruit'
} = {}) {
  await page.locator('#name').fill(name);
  await page.locator('#quantity').fill(quantity);
  await page.locator('#unit').selectOption(unit);
  await page.locator('#cat').selectOption(category);
  await page.locator('#exp').fill(localDateOffset(expiryOffset));
  await page.locator('#form button[type="submit"]').click();
  await expect(page.locator('#items')).toContainText(name);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('adds a food item with its quantity and unit', async ({ page }) => {
  await addFood(page);
  const item = page.locator('.item').filter({ hasText: 'Banana' });
  await expect(item).toContainText('5 pieces remaining');
});

test('partial consumption decreases the remaining quantity', async ({ page }) => {
  await addFood(page);
  page.once('dialog', dialog => dialog.accept('2'));
  await page.locator('.item').filter({ hasText: 'Banana' }).getByRole('button', { name: /Use some/i }).click();
  await expect(page.locator('.item').filter({ hasText: 'Banana' })).toContainText('3 pieces remaining');
});

test('fully consuming the remaining quantity removes the item and increments rescued count', async ({ page }) => {
  await addFood(page, { quantity: '2' });
  page.once('dialog', dialog => dialog.accept('2'));
  await page.locator('.item').filter({ hasText: 'Banana' }).getByRole('button', { name: /Use some/i }).click();
  await expect(page.locator('.item')).toHaveCount(0);
  await expect(page.locator('#sSaved')).toHaveText('1');
});

test('items expiring today appear in smart reminders', async ({ page }) => {
  await addFood(page, { name: 'Tomato', expiryOffset: 0 });
  await expect(page.locator('#reminders')).toBeVisible();
  await expect(page.locator('#reminderList')).toContainText('Tomato');
  await expect(page.locator('#reminderList')).toContainText('Expires today');
});

test('expired food is shown for safety review and not as a normal rescue suggestion', async ({ page }) => {
  await addFood(page, { name: 'Expired Milk', category: 'dairy', expiryOffset: -1 });
  await expect(page.locator('#rescue')).toContainText('Safety review');
  await expect(page.locator('#rescue')).toContainText('Expired Milk');
  await expect(page.locator('#rescue')).not.toContainText('Use these first');
});

test('expired food is excluded from the copied rescue plan', async ({ page }) => {
  await addFood(page, { name: 'Expired Milk', category: 'dairy', expiryOffset: -1 });
  await page.locator('#planBtn').click();
  await expect(page.locator('#toast')).toContainText('No unexpired items need a rescue plan');
});

test('inventory is retained after reloading the page', async ({ page }) => {
  await addFood(page, { name: 'Apple', quantity: '4', expiryOffset: 4 });
  await page.reload();
  await expect(page.locator('#items')).toContainText('Apple');
  await expect(page.locator('.item').filter({ hasText: 'Apple' })).toContainText('4 pieces remaining');
});

test('reminder View item action navigates to the matching inventory item', async ({ page }) => {
  await addFood(page, { name: 'Urgent Tomato', expiryOffset: 0 });
  await page.locator('#reminderList').getByRole('button', { name: 'View item' }).click();
  await expect(page.locator('#filters .chip.on')).toHaveAttribute('data-f', 'all');
  const itemId = await page.locator('.item').getAttribute('id');
  await expect(page.locator(`#${itemId}`)).toBeVisible();
});
