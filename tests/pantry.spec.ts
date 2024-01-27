import { test, expect } from '@playwright/test';

test.afterEach(async ({ page }) => {
  await page.goto('/__tests/delete-user?email=test@example.com');
});

test('Should redirect actor to login page if they are not logged in', async ({
  page,
}) => {
  await page.goto('/app/pantry');
  await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
});

test('Typical user flow', async ({ page }) => {
  await page.goto(
    '/__tests/login?email=test@example.com&firstName=Test&lastName=Example',
  );
  await page.goto('/app/pantry');

  // user creates a shelf
  await page.getByRole('button', { name: /create shelf/i }).click();

  // change the shelf name
  const shelfNameInput = page.getByRole('textbox', { name: /shelf name/i });
  // create a new name for the shelf - 'Dairy'
  await shelfNameInput.fill('Dairy');

  // add item to new shelf
  const newItemInput = page.getByPlaceholder(/new item/i);
  // simulate user typing in the new ingredient and then pressing Enter
  await newItemInput.type('Milk');
  await newItemInput.press('Enter');
  await newItemInput.type('Cheese');
  await newItemInput.press('Enter');
  await newItemInput.type('Butter');
  await newItemInput.press('Enter');

  // Change page and come back to /app/pantry
  await page.goto('/app/recipes');
  await page.goto('/app/pantry');

  // Expect shelf name to be Dairy
  expect(await shelfNameInput.inputValue()).toBe('Dairy');

  // Expect Milk, Cheese, and Butter to exist on the page
  expect(page.getByText('Milk')).toBeVisible();
  expect(page.getByText('Cheese')).toBeVisible();
  expect(page.getByText('Butter')).toBeVisible();

  await page.getByRole('button', { name: /Delete Milk/i }).click();
  expect(page.getByText('Milk')).not.toBeVisible();

  // add a dialog listener
  page.on('dialog', (dialog) => dialog.accept());
  // delete shelf
  await page.getByRole('button', { name: /delete shelf/i }).click();
  // shelf should no longer exist on the page
  expect(shelfNameInput).not.toBeVisible();
});
