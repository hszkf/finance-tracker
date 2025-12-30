import { Page } from "puppeteer";
import {
  navigateTo,
  waitForTestId,
  getTestIdText,
  testIdExists,
  clickTestId,
  countElements,
} from "../utils/test-utils";

/**
 * Page object for dashboard-related actions
 */
export class DashboardPage {
  constructor(private page: Page) {}

  /**
   * Navigate to dashboard
   */
  async go(): Promise<void> {
    await navigateTo(this.page, "/");
    await waitForTestId(this.page, "dashboard-page");
  }

  /**
   * Wait for dashboard to fully load
   */
  async waitForLoad(): Promise<void> {
    await waitForTestId(this.page, "dashboard-page");
    await waitForTestId(this.page, "overview-cards");
  }

  /**
   * Get total balance
   */
  async getTotalBalance(): Promise<string> {
    return getTestIdText(this.page, "total-balance");
  }

  /**
   * Get monthly spending
   */
  async getMonthlySpending(): Promise<string> {
    return getTestIdText(this.page, "monthly-spending");
  }

  /**
   * Get monthly income
   */
  async getMonthlyIncome(): Promise<string> {
    return getTestIdText(this.page, "monthly-income");
  }

  /**
   * Check if spending chart is visible
   */
  async isSpendingChartVisible(): Promise<boolean> {
    return testIdExists(this.page, "spending-chart");
  }

  /**
   * Check if budget progress is visible
   */
  async isBudgetProgressVisible(): Promise<boolean> {
    return testIdExists(this.page, "budget-progress");
  }

  /**
   * Get recent transactions count
   */
  async getRecentTransactionsCount(): Promise<number> {
    await waitForTestId(this.page, "recent-transactions");
    return countElements(this.page, '[data-testid="recent-transaction-item"]');
  }

  /**
   * Click quick add transaction button
   */
  async clickQuickAdd(): Promise<void> {
    await clickTestId(this.page, "quick-add-button");
  }

  /**
   * Navigate to transactions from dashboard
   */
  async goToTransactions(): Promise<void> {
    await clickTestId(this.page, "view-all-transactions");
  }

  /**
   * Navigate to specific overview card
   */
  async clickOverviewCard(card: "balance" | "spending" | "income"): Promise<void> {
    await clickTestId(this.page, `overview-${card}-card`);
  }

  /**
   * Get top spending category
   */
  async getTopSpendingCategory(): Promise<string> {
    return getTestIdText(this.page, "top-category-name");
  }

  /**
   * Get top spending amount
   */
  async getTopSpendingAmount(): Promise<string> {
    return getTestIdText(this.page, "top-category-amount");
  }

  /**
   * Check if welcome message is shown (for new users)
   */
  async isWelcomeMessageVisible(): Promise<boolean> {
    return testIdExists(this.page, "welcome-message");
  }

  /**
   * Dismiss welcome message
   */
  async dismissWelcomeMessage(): Promise<void> {
    await clickTestId(this.page, "dismiss-welcome");
  }

  /**
   * Check if notifications bell has indicator
   */
  async hasNotificationIndicator(): Promise<boolean> {
    return testIdExists(this.page, "notification-indicator");
  }

  /**
   * Get notification count
   */
  async getNotificationCount(): Promise<number> {
    const text = await getTestIdText(this.page, "notification-count");
    return parseInt(text, 10) || 0;
  }

  /**
   * Open notifications panel
   */
  async openNotifications(): Promise<void> {
    await clickTestId(this.page, "notifications-button");
    await waitForTestId(this.page, "notifications-panel");
  }

  /**
   * Switch currency display
   */
  async switchCurrency(currency: "GBP" | "MYR"): Promise<void> {
    await clickTestId(this.page, "currency-toggle");
    await clickTestId(this.page, `currency-${currency}`);
  }

  /**
   * Get current currency display
   */
  async getCurrentCurrency(): Promise<string> {
    return getTestIdText(this.page, "current-currency");
  }
}
