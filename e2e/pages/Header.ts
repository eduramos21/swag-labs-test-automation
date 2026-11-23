import { type Locator, type Page } from "@playwright/test";

export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly resetLink: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.menuButton = page.getByRole("button", { name: "Open Menu" });
    this.resetLink = page.getByRole("button", { name: "Reset App State" });
  }

  async resetAppState() {
    await this.menuButton.click();
    await this.resetLink.click();
  }
}
