import { describe, it, expect, beforeAll, afterAll, beforeEach } from "bun:test";
import { Browser, Page } from "puppeteer";
import { setupTestContext, teardownTestContext, navigateTo } from "../utils/test-utils";
import { AuthPage } from "../pages/auth.page";
import { puppeteerConfig } from "../puppeteer.config";

describe("Authentication", () => {
  let browser: Browser;
  let page: Page;
  let authPage: AuthPage;

  beforeAll(async () => {
    const context = await setupTestContext();
    browser = context.browser;
    page = context.page;
    authPage = new AuthPage(page);
  });

  afterAll(async () => {
    await teardownTestContext({ browser, page });
  });

  beforeEach(async () => {
    // Clear cookies and storage before each test
    const client = await page.target().createCDPSession();
    await client.send("Network.clearBrowserCookies");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  describe("Login Page", () => {
    it("should display login form", async () => {
      await authPage.goToLogin();

      const emailInput = await page.$('[data-testid="email-input"]');
      const passwordInput = await page.$('[data-testid="password-input"]');
      const loginButton = await page.$('[data-testid="login-button"]');

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(loginButton).toBeTruthy();
    });

    it("should show validation errors for empty form submission", async () => {
      await authPage.goToLogin();
      await authPage.submitLogin();

      const hasEmailError = await authPage.hasValidationError("email");
      const hasPasswordError = await authPage.hasValidationError("password");

      expect(hasEmailError).toBe(true);
      expect(hasPasswordError).toBe(true);
    });

    it("should show error for invalid email format", async () => {
      await authPage.goToLogin();
      await authPage.fillLoginForm("invalid-email", "password123");
      await authPage.submitLogin();

      const emailError = await authPage.getValidationError("email");
      expect(emailError).toContain("email");
    });

    it("should redirect to dashboard after successful login", async () => {
      await authPage.login(
        puppeteerConfig.testUser.email,
        puppeteerConfig.testUser.password
      );

      const currentUrl = page.url();
      expect(currentUrl).toContain(puppeteerConfig.baseUrl);
      expect(currentUrl).not.toContain("/login");
    });

    it("should show error for invalid credentials", async () => {
      await authPage.goToLogin();
      await authPage.fillLoginForm("wrong@example.com", "wrongpassword");
      await authPage.submitLogin();

      // Wait for error message
      await page.waitForSelector('[data-testid="login-error"], [role="alert"]', {
        timeout: 5000,
      });

      const errorExists =
        (await page.$('[data-testid="login-error"]')) !== null ||
        (await page.$('[role="alert"]')) !== null;

      expect(errorExists).toBe(true);
    });

    it("should have link to register page", async () => {
      await authPage.goToLogin();

      const registerLink = await page.$('a[href="/register"]');
      expect(registerLink).toBeTruthy();
    });
  });

  describe("Register Page", () => {
    it("should display register form", async () => {
      await authPage.goToRegister();

      const nameInput = await page.$('[data-testid="name-input"]');
      const emailInput = await page.$('[data-testid="email-input"]');
      const passwordInput = await page.$('[data-testid="password-input"]');
      const registerButton = await page.$('[data-testid="register-button"]');

      expect(nameInput).toBeTruthy();
      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(registerButton).toBeTruthy();
    });

    it("should show validation errors for empty form submission", async () => {
      await authPage.goToRegister();
      await authPage.submitRegister();

      const hasNameError = await authPage.hasValidationError("name");
      const hasEmailError = await authPage.hasValidationError("email");
      const hasPasswordError = await authPage.hasValidationError("password");

      expect(hasNameError).toBe(true);
      expect(hasEmailError).toBe(true);
      expect(hasPasswordError).toBe(true);
    });

    it("should show error for short password", async () => {
      await authPage.goToRegister();
      await authPage.fillRegisterForm("Test User", "test@example.com", "123");
      await authPage.submitRegister();

      const passwordError = await authPage.getValidationError("password");
      expect(passwordError).toContain("8");
    });

    it("should have link to login page", async () => {
      await authPage.goToRegister();

      const loginLink = await page.$('a[href="/login"]');
      expect(loginLink).toBeTruthy();
    });
  });

  describe("Logout", () => {
    it("should logout and redirect to login page", async () => {
      // First login
      await authPage.login();

      // Then logout
      await authPage.logout();

      const currentUrl = page.url();
      expect(currentUrl).toContain("/login");
    });
  });

  describe("Protected Routes", () => {
    it("should redirect to login when accessing protected route without auth", async () => {
      await navigateTo(page, "/transactions");

      // Should redirect to login
      await page.waitForFunction(
        () => window.location.href.includes("/login"),
        { timeout: 5000 }
      );

      const currentUrl = page.url();
      expect(currentUrl).toContain("/login");
    });

    it("should allow access to protected routes when authenticated", async () => {
      await authPage.login();

      await navigateTo(page, "/transactions");

      const currentUrl = page.url();
      expect(currentUrl).toContain("/transactions");
      expect(currentUrl).not.toContain("/login");
    });
  });
});
