import { type Locator, type Page } from "@playwright/test";

export class CartPage {
  readonly items: Locator;
  readonly continueShopping: Locator;
  readonly checkout: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId("inventory-item");
    this.continueShopping = page.getByTestId("continue-shopping");
    this.checkout = page.getByTestId("checkout");
  }

  async goto() {
    await this.page.goto("/cart.html");
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  removeButton(name: string): Locator {
    return this.item(name).getByRole("button", { name: "Remove" });
  }
}
