import { Page } from "puppeteer";
import {
  navigateTo,
  typeIntoTestId,
  clickTestId,
  waitForTestId,
  getTestIdText,
  testIdExists,
  countElements,
  waitForUrl,
  waitForToast,
} from "../utils/test-utils";

/**
 * Page object for transactions-related actions
 */
export class TransactionsPage {
  constructor(private page: Page) {}

  /**
   * Navigate to transactions list
   */
  async goToList(): Promise<void> {
    await navigateTo(this.page, "/transactions");
    await waitForTestId(this.page, "transactions-page");
  }

  /**
   * Navigate to new transaction form
   */
  async goToNewTransaction(): Promise<void> {
    await navigateTo(this.page, "/transactions/new");
    await waitForTestId(this.page, "transaction-form");
  }

  /**
   * Click add transaction button from list
   */
  async clickAddButton(): Promise<void> {
    await clickTestId(this.page, "add-transaction-button");
    await waitForUrl(this.page, "/transactions/new");
  }

  /**
   * Fill transaction form
   */
  async fillForm(data: {
    amount: string;
    description?: string;
    category?: string;
    account?: string;
    type?: "expense" | "income";
  }): Promise<void> {
    await typeIntoTestId(this.page, "amount-input", data.amount);

    if (data.description) {
      await typeIntoTestId(this.page, "description-input", data.description);
    }

    if (data.category) {
      await clickTestId(this.page, "category-select");
      await clickTestId(this.page, `category-option-${data.category}`);
    }

    if (data.account) {
      await clickTestId(this.page, "account-select");
      await clickTestId(this.page, `account-option-${data.account}`);
    }

    if (data.type) {
      await clickTestId(this.page, `type-${data.type}`);
    }
  }

  /**
   * Submit transaction form
   */
  async submitForm(): Promise<void> {
    await clickTestId(this.page, "submit-button");
  }

  /**
   * Create a new transaction
   */
  async createTransaction(data: {
    amount: string;
    description?: string;
    category?: string;
    account?: string;
    type?: "expense" | "income";
  }): Promise<void> {
    await this.goToNewTransaction();
    await this.fillForm(data);
    await this.submitForm();
    await waitForToast(this.page);
  }

  /**
   * Get transaction count in list
   */
  async getTransactionCount(): Promise<number> {
    await waitForTestId(this.page, "transaction-list");
    return countElements(this.page, '[data-testid="transaction-item"]');
  }

  /**
   * Click on a transaction by index (0-based)
   */
  async clickTransaction(index: number): Promise<void> {
    const selector = `[data-testid="transaction-item"]:nth-child(${index + 1})`;
    await this.page.click(selector);
  }

  /**
   * Delete transaction by index
   */
  async deleteTransaction(index: number): Promise<void> {
    const deleteBtn = `[data-testid="transaction-item"]:nth-child(${index + 1}) [data-testid="delete-button"]`;
    await this.page.click(deleteBtn);
    await clickTestId(this.page, "confirm-delete-button");
    await waitForToast(this.page);
  }

  /**
   * Filter by category
   */
  async filterByCategory(category: string): Promise<void> {
    await clickTestId(this.page, "filter-button");
    await clickTestId(this.page, `category-filter-${category}`);
    await clickTestId(this.page, "apply-filter-button");
  }

  /**
   * Filter by date range
   */
  async filterByDateRange(startDate: string, endDate: string): Promise<void> {
    await clickTestId(this.page, "filter-button");
    await typeIntoTestId(this.page, "start-date-input", startDate);
    await typeIntoTestId(this.page, "end-date-input", endDate);
    await clickTestId(this.page, "apply-filter-button");
  }

  /**
   * Clear all filters
   */
  async clearFilters(): Promise<void> {
    await clickTestId(this.page, "clear-filters-button");
  }

  /**
   * Get total amount displayed
   */
  async getTotalAmount(): Promise<string> {
    return getTestIdText(this.page, "total-amount");
  }

  /**
   * Check if empty state is shown
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return testIdExists(this.page, "empty-state");
  }

  /**
   * Get validation error for a field
   */
  async getFieldError(field: string): Promise<string> {
    return getTestIdText(this.page, `${field}-error`);
  }
}
