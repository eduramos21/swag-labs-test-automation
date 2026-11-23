import { expect, test } from "../fixtures";
import { authFile, password, sessionRoles, usernameOf } from "../data/users";

// Logs in once per user and saves the session. loginAs() in fixtures reuses it.
// Playwright runs this project in full before any filtered run, so only the user tag is needed.
for (const user of sessionRoles) {
  test(
    `save the logged in session [${user}]`,
    { tag: `@${user}` },
    async ({ page, login, inventory }) => {
      await test.step(`Given ${user} is on the login page`, () => login.goto());
      await test.step(`When ${user} logs in with valid credentials`, () =>
        login.signIn(usernameOf(user), password()));
      await test.step("Then the products page is shown and the session is saved", async () => {
        await expect(
          inventory.title,
          `${user} reaches the products page`,
        ).toHaveText("Products");
        await page.context().storageState({ path: authFile(user) });
      });
    },
  );
}
