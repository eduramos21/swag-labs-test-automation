import { type Locator, type Page } from '@playwright/test';

export class ProductDetailPage {
  readonly name: Locator;
  readonly addButton: Locator;
  readonly removeButton: Locator;
  readonly backToProducts: Locator;

  constructor(page: Page) {
    // The detail page reuses the catalog's data-test values, so scope to its own container.
    // Otherwise these locators also match the catalog while the page is still navigating.
    const product = page.locator('.inventory_details_container');
    this.name = product.getByTestId('inventory-item-name');
    this.addButton = product.getByRole('button', { name: 'Add to cart' });
    this.removeButton = product.getByRole('button', { name: 'Remove' });
    this.backToProducts = page.getByTestId('back-to-products');
  }
}
