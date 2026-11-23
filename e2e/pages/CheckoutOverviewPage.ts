import { type Locator, type Page } from "@playwright/test";

export class CheckoutOverviewPage {
  readonly items: Locator;
  readonly finish: Locator;

  constructor(page: Page) {
    this.items = page.getByTestId("inventory-item");
    this.finish = page.getByRole("button", { name: "Finish" });
  }

  item(name: string): Locator {
    return this.items.filter({ hasText: name });
  }

  quantity(name: string): Locator {
    return this.item(name).getByTestId("item-quantity");
  }

  description(name: string): Locator {
    return this.item(name).getByTestId("inventory-item-desc");
  }
}
