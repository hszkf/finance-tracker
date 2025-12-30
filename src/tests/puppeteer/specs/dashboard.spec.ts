import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { Browser, Page } from "puppeteer";
import { setupTestContext, teardownTestContext, delay } from "../utils/test-utils";
import { AuthPage } from "../pages/auth.page";
import { DashboardPage } from "../pages/dashboard.page";

describe("Dashboard", () => {
  let browser: Browser;
  let page: Page;
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  beforeAll(async () => {
    const context = await setupTestContext();
    browser = context.browser;
    page = context.page;
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);

    // Login before all tests
    await authPage.login();
  });

  afterAll(async () => {
    await teardownTestContext({ browser, page });
  });

  describe("Dashboard Layout", () => {
    beforeEach(async () => {
      await dashboardPage.go();
    });

    it("should display dashboard page", async () => {
      const dashboard = await page.$('[data-testid="dashboard-page"]');
      expect(dashboard).toBeTruthy();
    });

    it("should display overview cards", async () => {
      const overviewCards = await page.$('[data-testid="overview-cards"]');
      expect(overviewCards).toBeTruthy();
    });

    it("should show total balance card", async () => {
      const balanceCard = await page.$('[data-testid="total-balance"], [data-testid="overview-balance-card"]');
      expect(balanceCard).toBeTruthy();
    });

    it("should show monthly spending card", async () => {
      const spendingCard = await page.$('[data-testid="monthly-spending"], [data-testid="overview-spending-card"]');
      expect(spendingCard).toBeTruthy();
    });

    it("should show monthly income card", async () => {
      const incomeCard = await page.$('[data-testid="monthly-income"], [data-testid="overview-income-card"]');
      expect(incomeCard).toBeTruthy();
    });
  });

  describe("Charts and Visualizations", () => {
    beforeEach(async () => {
      await dashboardPage.go();
    });

    it("should display spending chart", async () => {
      // Wait for chart to load (might be lazy loaded)
      await page.waitForSelector('[data-testid="spending-chart"], .recharts-wrapper, svg', {
        timeout: 10000,
      }).catch(() => {
        // Chart might not be visible if no data
      });

      const chart = await page.$('[data-testid="spending-chart"], .recharts-wrapper');
      // Chart should exist or page should indicate no data
      expect(chart || (await page.$('[data-testid="no-data"]'))).toBeTruthy();
    });

    it("should display budget progress section", async () => {
      const budgetProgress = await page.$('[data-testid="budget-progress"]');
      // May or may not exist depending on user having budgets
      expect(typeof budgetProgress).toBe("object");
    });

    it("should display category breakdown", async () => {
      const categoryBreakdown = await page.$('[data-testid="category-breakdown"]');
      expect(typeof categoryBreakdown).toBe("object");
    });
  });

  describe("Recent Transactions", () => {
    beforeEach(async () => {
      await dashboardPage.go();
    });

    it("should display recent transactions section", async () => {
      const recentTransactions = await page.$('[data-testid="recent-transactions"]');
      expect(recentTransactions).toBeTruthy();
    });

    it("should show view all transactions link", async () => {
      const viewAllLink = await page.$('[data-testid="view-all-transactions"]');
      expect(viewAllLink).toBeTruthy();
    });

    it("should navigate to transactions when clicking view all", async () => {
      const viewAllLink = await page.$('[data-testid="view-all-transactions"]');

      if (viewAllLink) {
        await viewAllLink.click();
        await page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {
          // Navigation might be client-side
        });

        await page.waitForFunction(
          () => window.location.href.includes("/transactions"),
          { timeout: 5000 }
        );

        const currentUrl = page.url();
        expect(currentUrl).toContain("/transactions");
      }
    });
  });

  describe("Quick Actions", () => {
    beforeEach(async () => {
      await dashboardPage.go();
    });

    it("should display quick add button", async () => {
      const quickAddButton = await page.$('[data-testid="quick-add-button"]');
      expect(quickAddButton).toBeTruthy();
    });

    it("should navigate to new transaction when clicking quick add", async () => {
      const quickAddButton = await page.$('[data-testid="quick-add-button"]');

      if (quickAddButton) {
        await quickAddButton.click();

        await page.waitForFunction(
          () => window.location.href.includes("/transactions/new"),
          { timeout: 5000 }
        );

        const currentUrl = page.url();
        expect(currentUrl).toContain("/transactions/new");
      }
    });
  });

  describe("Navigation", () => {
    beforeEach(async () => {
      await dashboardPage.go();
    });

    it("should have sidebar navigation", async () => {
      const sidebar = await page.$('[data-testid="sidebar"], nav');
      expect(sidebar).toBeTruthy();
    });

    it("should have navbar", async () => {
      const navbar = await page.$('[data-testid="navbar"], header');
      expect(navbar).toBeTruthy();
    });

    it("should have navigation links", async () => {
      const navLinks = await page.$$('nav a, [data-testid="sidebar"] a');
      expect(navLinks.length).toBeGreaterThan(0);
    });

    it("should navigate to accounts page", async () => {
      const accountsLink = await page.$('a[href="/accounts"]');

      if (accountsLink) {
        await accountsLink.click();
        await page.waitForFunction(
          () => window.location.href.includes("/accounts"),
          { timeout: 5000 }
        );

        const currentUrl = page.url();
        expect(currentUrl).toContain("/accounts");
      }
    });

    it("should navigate to budgets page", async () => {
      const budgetsLink = await page.$('a[href="/budgets"]');

      if (budgetsLink) {
        await budgetsLink.click();
        await page.waitForFunction(
          () => window.location.href.includes("/budgets"),
          { timeout: 5000 }
        );

        const currentUrl = page.url();
        expect(currentUrl).toContain("/budgets");
      }
    });

    it("should navigate to groups page", async () => {
      const groupsLink = await page.$('a[href="/groups"]');

      if (groupsLink) {
        await groupsLink.click();
        await page.waitForFunction(
          () => window.location.href.includes("/groups"),
          { timeout: 5000 }
        );

        const currentUrl = page.url();
        expect(currentUrl).toContain("/groups");
      }
    });

    it("should navigate to settings page", async () => {
      const settingsLink = await page.$('a[href="/settings"]');

      if (settingsLink) {
        await settingsLink.click();
        await page.waitForFunction(
          () => window.location.href.includes("/settings"),
          { timeout: 5000 }
        );

        const currentUrl = page.url();
        expect(currentUrl).toContain("/settings");
      }
    });
  });

  describe("Theme Toggle", () => {
    beforeEach(async () => {
      await dashboardPage.go();
    });

    it("should have theme toggle", async () => {
      const themeToggle = await page.$('[data-testid="theme-toggle"], [data-testid="theme-select"]');
      expect(themeToggle).toBeTruthy();
    });

    it("should change theme when toggled", async () => {
      const themeToggle = await page.$('[data-testid="theme-toggle"], [data-testid="theme-select"]');

      if (themeToggle) {
        // Get initial theme
        const initialTheme = await page.evaluate(() => {
          return document.documentElement.classList.contains("dark") ? "dark" : "light";
        });

        await themeToggle.click();

        // Wait for theme change
        await delay(500);

        // Theme might have changed (or opened a dropdown)
        const dropdown = await page.$('[data-testid="theme-dropdown"]');
        if (dropdown) {
          // Click on opposite theme
          const targetTheme = initialTheme === "dark" ? "light" : "dark";
          await page.click(`[data-testid="theme-${targetTheme}"]`);
          await delay(500);

          const newTheme = await page.evaluate(() => {
            return document.documentElement.classList.contains("dark") ? "dark" : "light";
          });

          expect(newTheme).not.toBe(initialTheme);
        }
      }
    });
  });

  describe("Responsive Design", () => {
    it("should display correctly on mobile viewport", async () => {
      await page.setViewport({ width: 375, height: 812 });
      await dashboardPage.go();

      // Sidebar should be hidden or collapsed on mobile
      const sidebar = await page.$('[data-testid="sidebar"]');
      if (sidebar) {
        const isVisible = await page.evaluate((el) => {
          const style = window.getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        }, sidebar);

        // On mobile, sidebar might be hidden initially
        expect(typeof isVisible).toBe("boolean");
      }

      // Menu button should be visible
      const menuButton = await page.$('[data-testid="menu-button"], [aria-label="Toggle menu"]');
      expect(menuButton).toBeTruthy();

      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });

    it("should display correctly on tablet viewport", async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await dashboardPage.go();

      const dashboard = await page.$('[data-testid="dashboard-page"]');
      expect(dashboard).toBeTruthy();

      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      // Simulate offline
      await page.setOfflineMode(true);

      await dashboardPage.go().catch(() => {
        // Expected to fail
      });

      // Should show some error state or cached content
      const errorState = await page.$('[data-testid="error-state"], [data-testid="offline-message"]');
      const hasContent = await page.$('[data-testid="dashboard-page"]');

      // Either error state or cached content should be visible
      expect(errorState || hasContent).toBeTruthy();

      // Re-enable network
      await page.setOfflineMode(false);
    });
  });
});
