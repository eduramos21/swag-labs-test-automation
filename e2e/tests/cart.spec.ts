import { expect, test } from "../fixtures";
import { bugTags } from "../data/bugs";
import { sessionRoles as users } from "../data/users";

test.describe("cart: adding and removing products", () => {
  const addPlaces = [
    { place: "catalog", tags: ["@smoke", "@regression"], bugs: ["BUG-03"] },
    { place: "detail page", tags: ["@regression"], bugs: ["BUG-05"] },
  ] as const;

  for (const user of users) {
    for (const { place, tags, bugs } of addPlaces) {
      test(
        `keep shopping and add more products to the cart [${user}, ${place}]`,
        {
          tag: [...tags, `@${user}`, ...bugTags(user, ...bugs)],
        },
        async ({
          productPicker,
          seedCart,
          loginAs,
          header,
          cart,
          inventory,
          productDetail,
        }) => {
          const [first, ...more] = productPicker.pick(3);

          await test.step(`Given ${user} is logged in with 1 random product in the cart`, async () => {
            await seedCart([first.id]);
            await loginAs(user);
          });
          await test.step(`When ${user} clicks continue shopping and adds 2 more random products from the ${place}`, async () => {
            await header.cartLink.click();
            await cart.continueShopping.click();
            for (const { name } of more) {
              if (place === "catalog") {
                await inventory.addButton(name).click();
              } else {
                await inventory.openDetails(name);
                await productDetail.addButton.click();
                await productDetail.backToProducts.click();
              }
            }
          });
          await test.step("Then the cart badge shows 3", () =>
            expect(
              header.cartBadge,
              `badge after adding ${more.map((p) => p.name).join(", ")}`,
            ).toHaveText("3"));
          await test.step("And the cart lists the 3 products added", async () => {
            await header.cartLink.click();
            await expect(cart.items, "products in the cart").toHaveCount(3);
            for (const { name } of [first, ...more]) {
              await expect
                .soft(cart.item(name), `${name} in the cart`)
                .toBeVisible();
            }
          });
        },
      );
    }
  }

  const removePlaces = [
    { place: "cart page", tags: ["@smoke", "@regression"], bugs: [] },
    { place: "catalog", tags: ["@regression"], bugs: ["BUG-04"] },
    { place: "detail page", tags: ["@regression"], bugs: ["BUG-06"] },
  ] as const;

  for (const user of users) {
    for (const { place, tags, bugs } of removePlaces) {
      test(
        `remove products from the cart [${user}, ${place}]`,
        {
          tag: [...tags, `@${user}`, ...bugTags(user, ...bugs)],
        },
        async ({
          productPicker,
          seedCart,
          loginAs,
          header,
          cart,
          inventory,
          productDetail,
        }) => {
          const picks = productPicker.pick(3);

          await test.step(`Given ${user} is logged in with 3 random products in the cart`, async () => {
            await seedCart(picks.map((p) => p.id));
            await loginAs(user);
          });
          await test.step(`When ${user} removes those products from the ${place}`, async () => {
            if (place === "cart page") await header.cartLink.click();
            for (const { name } of picks) {
              if (place === "cart page") {
                await cart.removeButton(name).click();
              } else if (place === "catalog") {
                await inventory.removeButton(name).click();
              } else {
                await inventory.openDetails(name);
                await productDetail.removeButton.click();
                await productDetail.backToProducts.click();
              }
            }
          });
          await test.step("Then the cart is empty", async () => {
            await expect(
              header.cartBadge,
              `badge after removing ${picks.map((p) => p.name).join(", ")}`,
            ).toBeHidden();
            await header.cartLink.click();
            await expect(cart.items, "products left in the cart").toHaveCount(
              0,
            );
          });
        },
      );
    }
  }
});
