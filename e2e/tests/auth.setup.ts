import { expect, test } from "../fixtures";
import { authFile, password, sessionRoles, usernameOf } from "../data/users";

// Logs in once per user and saves the session. loginAs() in fixtures reuses it.
// Playwright runs this project in full before any filtered run, so the runner's RUN_USER limits it.
// shortcut: plain `npx playwright test --grep @user` (no runner) still logs in every user.
const runUser = process.env.RUN_USER;
for (const user of sessionRoles.filter(
  (r) => !runUser || runUser === "all_users" || r === runUser,
)) {
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
        ).toHaveText("Products", { timeout: 15_000 }); // performance_glitch_user logs in slowly
        await page.context().storageState({ path: authFile(user) });
      });
    },
  );
}
