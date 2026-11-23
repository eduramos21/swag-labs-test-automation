import { type Locator, type Page } from "@playwright/test";

export class CheckoutCompletePage {
  readonly header: Locator;
  readonly generatePdf: Locator;

  constructor(page: Page) {
    this.header = page.getByRole("heading", {
      name: "Thank you for your order!",
    });
    this.generatePdf = page.getByRole("button", { name: "Generate PDF order" });
  }
}
