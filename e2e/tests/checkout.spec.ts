import { stat } from "node:fs/promises";
import { expect, test as base } from "../fixtures";
import { sessionRoles, type Role } from "../data/users";

// Steps shared by every user's order test.
const test = base.extend<{ placeOrder: (user: Role) => Promise<void> }>({
  placeOrder: async (
    {
      rng,
      seedCart,
      loginAs,
      header,
      cart,
      checkoutInfo,
      checkoutOverview,
      checkoutComplete,
    },
    use,
  ) => {
    await use(async (user) => {
      const picks = rng.pick(2);

      await test.step(`Given ${user} is on the checkout information step with 2 random products in the cart`, async () => {
        await seedCart(picks.map((p) => p.id));
        await loginAs(user);
        await header.cartLink.click();
        await cart.checkout.click();
      });
      await test.step(`When ${user} enters first name "Ana", last name "Lopez" and postal code "32001"`, async () => {
        await checkoutInfo.fill("Ana", "Lopez", "32001");
        await checkoutInfo.continueButton.click();
      });
      await test.step("Then the checkout overview lists each product with its quantity and description", async () => {
        for (const { name, description } of picks) {
          await expect(
            checkoutOverview.quantity(name),
            `${name} quantity`,
          ).toHaveText("1");
          await expect(
            checkoutOverview.description(name),
            `${name} description`,
          ).toHaveText(description);
        }
      });
      await test.step(`When ${user} finishes the order`, () =>
        checkoutOverview.finish.click());
      await test.step('Then the confirmation "Thank you for your order!" is shown', () =>
        expect(checkoutComplete.header, "order confirmation").toBeVisible());
    });
  },
});

test.describe("checkout: placing an order and its validation", () => {
  for (const user of sessionRoles) {
    test(
      `an order is finished and its PDF downloads [${user}]`,
      { tag: ["@smoke", "@regression", `@${user}`, "@BUG-02"] },
      async ({ page, placeOrder, checkoutComplete }) => {
        await placeOrder(user);

        await test.step(`When ${user} generates the PDF order`, async () => {
          const download = page.waitForEvent("download");
          await checkoutComplete.generatePdf.click();
          const pdf = await download;
          expect(pdf.suggestedFilename(), "PDF file name").toMatch(
            /^swag-labs-order-.+\.pdf$/,
          );
          expect(
            (await stat(await pdf.path())).size,
            "PDF size in bytes",
          ).toBeGreaterThan(0);
        });
      },
    );

    test(
      `checkout information requires every field [${user}]`,
      { tag: ["@regression", `@${user}`] },
      async ({ rng, seedCart, loginAs, header, cart, checkoutInfo }) => {
        const [product] = rng.pick(1);

        await test.step(`Given ${user} is on the checkout information step with 1 random product in the cart`, async () => {
          await seedCart([product.id]);
          await loginAs(user);
          await header.cartLink.click();
          await cart.checkout.click();
        });
        await test.step(`When ${user} continues without the first name`, () =>
          checkoutInfo.continueButton.click());
        await test.step("Then the first name error is shown", () =>
          expect(checkoutInfo.error, "first name error").toHaveText(
            "Error: First Name is required",
          ));
        await test.step(`When ${user} continues without the last name`, async () => {
          await checkoutInfo.firstName.fill("Ana");
          await checkoutInfo.continueButton.click();
        });
        await test.step("Then the last name error is shown", () =>
          expect(checkoutInfo.error, "last name error").toHaveText(
            "Error: Last Name is required",
          ));
        await test.step(`When ${user} continues without the postal code`, async () => {
          await checkoutInfo.lastName.fill("Lopez");
          await checkoutInfo.continueButton.click();
        });
        await test.step("Then the postal code error is shown", () =>
          expect(checkoutInfo.error, "postal code error").toHaveText(
            "Error: Postal Code is required",
          ));
      },
    );
  }

  test(
    "checkout is not allowed with an empty cart [problem_user]",
    { tag: ["@regression", "@problem_user", "@BUG-01"] },
    async ({ seedCart, loginAs, header, cart, checkoutInfo, page }) => {
      await test.step("Given problem_user is logged in with an empty cart", async () => {
        await seedCart([]);
        await loginAs("problem_user");
      });
      await test.step("When problem_user goes to checkout", async () => {
        await header.cartLink.click();
        await cart.checkout.click();
      });
      // Provisional oracle: the design lists "what blocks checkout" as an open question.
      await test.step("Then the checkout cannot be started", async () => {
        await expect(page, "URL after pressing Checkout").not.toHaveURL(
          /checkout-step-one\.html/,
        );
        await expect(
          checkoutInfo.firstName,
          "checkout information form",
        ).toHaveCount(0);
      });
    },
  );
});
