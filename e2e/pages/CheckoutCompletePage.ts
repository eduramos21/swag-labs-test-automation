import { type Locator, type Page } from "@playwright/test";

export class CheckoutCompletePage {
  readonly header: Locator;
  readonly message: Locator;
  readonly generatePdf: Locator;

  constructor(page: Page) {
    this.message = page.getByText("Your order has been dispatched", {
      exact: false,
    });
    this.header = page.getByRole("heading", {
      name: "Thank you for your order!",
    });
    this.generatePdf = page.getByRole("button", { name: "Generate PDF order" });
  }
}
