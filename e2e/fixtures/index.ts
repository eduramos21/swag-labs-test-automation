import { test as base, expect } from "@playwright/test";
import { createRng, type Rng } from "../data/random";
import { readFileSync } from "node:fs";
import { authFile, type Role } from "../data/users";
import { CartPage } from "../pages/CartPage";
import { CheckoutCompletePage } from "../pages/CheckoutCompletePage";
import { CheckoutInfoPage } from "../pages/CheckoutInfoPage";
import { CheckoutOverviewPage } from "../pages/CheckoutOverviewPage";
import { Header } from "../pages/Header";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";
import { ProductDetailPage } from "../pages/ProductDetailPage";

interface Fixtures {
  login: LoginPage;
  inventory: InventoryPage;
  productDetail: ProductDetailPage;
  cart: CartPage;
  checkoutInfo: CheckoutInfoPage;
  checkoutOverview: CheckoutOverviewPage;
  checkoutComplete: CheckoutCompletePage;
  header: Header;
  loginAs: (role: Role) => Promise<void>;
  seedCart: (productIds: number[]) => Promise<void>;
  rng: Rng;
  highlight: void;
}

export const test = base.extend<Fixtures>({
  login: async ({ page }, use) => use(new LoginPage(page)),
  inventory: async ({ page }, use) => use(new InventoryPage(page)),
  productDetail: async ({ page }, use) => use(new ProductDetailPage(page)),
  cart: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfo: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverview: async ({ page }, use) =>
    use(new CheckoutOverviewPage(page)),
  checkoutComplete: async ({ page }, use) =>
    use(new CheckoutCompletePage(page)),
  header: async ({ page }, use) => use(new Header(page)),

  // Reuses the session saved by auth.setup.ts: the app keeps its session in one cookie.
  loginAs: async ({ page, inventory }, use) => {
    await use(async (role) => {
      const { cookies } = JSON.parse(readFileSync(authFile(role), "utf8"));
      await page.context().addCookies(cookies);
      await inventory.goto();
      await expect(
        inventory.title,
        `${role} reaches the products page`,
      ).toHaveText("Products");
    });
  },

  // Writes the app's own cart storage before it loads, so catalog bugs cannot break setup.
  // The session flag stops the script from overwriting the cart on later page loads.
  seedCart: async ({ page }, use) => {
    await use(async (productIds) => {
      await page.addInitScript((ids) => {
        if (sessionStorage.getItem("cart-seeded")) return;
        sessionStorage.setItem("cart-seeded", "1");
        localStorage.setItem("cart-contents", JSON.stringify(ids));
      }, productIds);
    });
  },

  // HIGHLIGHT=1 (set by run.js on headed runs) outlines each element the test clicks, types in or selects.
  highlight: [
    async ({ context }, use) => {
      if (process.env.HIGHLIGHT) {
        await context.addInitScript(() => {
          const flash = (e: Event) => {
            const el = e.target;
            if (!(el instanceof HTMLElement)) return;
            const old = el.style.cssText;
            el.style.outline = "3px solid #ff2d95";
            el.style.outlineOffset = "2px";
            setTimeout(() => (el.style.cssText = old), 600);
          };
          for (const t of ["mousedown", "focusin", "change"])
            addEventListener(t, flash, true);
        });
      }
      await use();
    },
    { auto: true },
  ],

  rng: async ({}, use, testInfo) => {
    const seed = Number(
      process.env.SEED ?? Math.floor(Math.random() * 2 ** 31),
    );
    if (!Number.isInteger(seed))
      throw new Error(`SEED must be an integer, got "${process.env.SEED}"`);
    await testInfo.attach("seed", {
      body: String(seed),
      contentType: "text/plain",
    });
    await use(createRng(seed));
  },
});

export { expect };
