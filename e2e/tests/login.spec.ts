import { expect, test } from "../fixtures";
import { password, sessionRoles, usernameOf, type Role } from "../data/users";

test.describe("login: valid, locked out and invalid credentials", () => {
  for (const user of sessionRoles) {
    test(
      `a valid user logs in [${user}]`,
      { tag: ["@smoke", `@${user}`] },
      async ({ login, inventory }) => {
        await test.step(`Given ${user} is on the login page`, () =>
          login.goto());
        await test.step(`When ${user} logs in with valid credentials`, () =>
          login.signIn(usernameOf(user), password()));
        await test.step(`Then ${user} sees the products page`, () =>
          expect(inventory.title, "products page title").toHaveText(
            "Products",
          ));
      },
    );
  }

  test(
    "a locked out user cannot log in [locked_out_user]",
    { tag: ["@smoke", "@locked_out_user", "@OBS-01"] },
    async ({ login, inventory }) => {
      const user: Role = "locked_out_user";

      await test.step(`Given ${user} is on the login page`, () => login.goto());
      await test.step(`When ${user} logs in with valid credentials`, () =>
        login.signIn(usernameOf(user), password()));
      await test.step("Then the locked out message is shown", () =>
        expect(login.error, "locked out message").toHaveText(
          "Epic sadface: Sorry, this user has been locked out.",
        ));
      await test.step(`And ${user} cannot access the products page`, async () => {
        await inventory.goto();
        await expect(
          login.submit,
          "redirected back to the login form",
        ).toBeVisible();
      });
    },
  );

  // Neither row needs a saved session; they run once per user like every other test.
  for (const user of sessionRoles) {
    const wrongCredentials = [
      {
        username: () => usernameOf(user),
        password: () => "wrong_password",
        label: `${user}/wrong_password`,
      },
      {
        username: () => "unknown_user",
        password: () => password(),
        label: "unknown_user/secret_sauce",
      },
    ];
    for (const { username, password: pass, label } of wrongCredentials) {
      test(
        `login is refused with wrong credentials ${label} [${user}]`,
        { tag: ["@regression", `@${user}`] },
        async ({ login }) => {
          await test.step("Given the user is on the login page", () =>
            login.goto());
          await test.step(`When the user logs in with ${label}`, () =>
            login.signIn(username(), pass()));
          await test.step("Then the mismatch error is shown", () =>
            expect(login.error, "credentials mismatch error").toHaveText(
              "Epic sadface: Username and password do not match any user in this service",
            ));
        },
      );
    }
  }

  test(
    "a username with extra spaces still logs in [problem_user]",
    { tag: ["@regression", "@problem_user", "@BUG-15"] },
    async ({ login, inventory }) => {
      const user: Role = "problem_user";

      await test.step(`Given ${user} is on the login page`, () => login.goto());
      await test.step(`When ${user} logs in with spaces added around the username`, () =>
        login.signIn(` ${usernameOf(user)} `, password()));
      await test.step(`Then ${user} sees the products page`, () =>
        expect(inventory.title, "products page title").toHaveText("Products"));
    },
  );
});
