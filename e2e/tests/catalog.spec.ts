import { expect, test } from "../fixtures";
import { sessionRoles } from "../data/users";
import { expectedOrder, products, sortOptions } from "../data/products";

test.describe("product catalog: display, details and sorting", () => {
  for (const user of sessionRoles) {
    test(
      `products show their key information [${user}]`,
      { tag: ["@regression", `@${user}`] },
      async ({ loginAs, inventory }) => {
        await test.step(`Given ${user} is logged in`, () => loginAs(user));
        await test.step("Then every product shows an image, title, price, description and an add to cart option", async () => {
          await expect(inventory.items, "product count").toHaveCount(
            products.length,
          );
          for (const { name } of products) {
            const item = inventory.item(name);
            await expect
              .soft(item.getByRole("img", { name }), `${name} image`)
              .toBeVisible();
            await expect
              .soft(item.getByTestId("inventory-item-price"), `${name} price`)
              .toHaveText(/^\$\d+\.\d{2}$/);
            await expect
              .soft(
                item.getByTestId("inventory-item-desc"),
                `${name} description`,
              )
              .not.toBeEmpty();
            await expect
              .soft(inventory.addButton(name), `${name} add to cart button`)
              .toBeVisible();
          }
        });
      },
    );
  }

  for (const user of sessionRoles) {
    test(
      `3 random products open their own detail page [${user}]`,
      { tag: ["@regression", `@${user}`, "@BUG-05", "@BUG-07"] },
      async ({ loginAs, inventory, productDetail, rng }) => {
        await test.step(`Given ${user} is logged in`, () => loginAs(user));
        await test.step("Then each of 3 random products opens a detail page showing that product", async () => {
          for (const { name } of rng.pick(3)) {
            await inventory.goto();
            await inventory.openDetails(name);
            await expect
              .soft(productDetail.name, `detail page opened from "${name}"`)
              .toHaveText(name);
          }
        });
      },
    );

    test(
      `products are sorted by every option [${user}]`,
      { tag: ["@regression", `@${user}`, "@BUG-09"] },
      async ({ loginAs, inventory }) => {
        await test.step(`Given ${user} is logged in`, () => loginAs(user));
        await test.step("Then the products are listed in the order of each sort option", async () => {
          for (const option of sortOptions) {
            await inventory.sortBy(option.label);
            const column =
              option.by === "name" ? inventory.itemNames : inventory.itemPrices;
            await expect
              .soft(column, `order after sorting by "${option.label}"`)
              .toHaveText(expectedOrder(option));
          }
        });
      },
    );
  }
});
