import { expect, test } from '../fixtures';
import { authFile, password, usernameOf } from '../data/users';

// Logs in once per user and saves the session. loginAs() in fixtures reuses it.
// The tags keep this project inside --grep @smoke and --grep @regression runs.
for (const user of ['standard_user', 'problem_user'] as const) {
  test(`save the logged in session [${user}] @smoke @regression`, async ({ page, login, inventory }) => {
    await test.step(`Given ${user} is on the login page`, () => login.goto());
    await test.step(`When ${user} logs in with valid credentials`, () => login.signIn(usernameOf(user), password()));
    await test.step('Then the products page is shown and the session is saved', async () => {
      await expect(inventory.title, `${user} reaches the products page`).toHaveText('Products');
      await page.context().storageState({ path: authFile(user) });
    });
  });
}
