import { Page } from "puppeteer";
import {
  navigateTo,
  typeIntoTestId,
  clickTestId,
  waitForUrl,
  waitForTestId,
  getTestIdText,
  testIdExists,
} from "../utils/test-utils";
import { puppeteerConfig } from "../puppeteer.config";

/**
 * Page object for authentication-related actions
 */
export class AuthPage {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<void> {
    await navigateTo(this.page, "/login");
    await waitForTestId(this.page, "login-form");
  }

  /**
   * Navigate to register page
   */
  async goToRegister(): Promise<void> {
    await navigateTo(this.page, "/register");
    await waitForTestId(this.page, "register-form");
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await typeIntoTestId(this.page, "email-input", email);
    await typeIntoTestId(this.page, "password-input", password);
  }

  /**
   * Fill register form
   */
  async fillRegisterForm(name: string, email: string, password: string): Promise<void> {
    await typeIntoTestId(this.page, "name-input", name);
    await typeIntoTestId(this.page, "email-input", email);
    await typeIntoTestId(this.page, "password-input", password);
  }

  /**
   * Submit login form
   */
  async submitLogin(): Promise<void> {
    await clickTestId(this.page, "login-button");
  }

  /**
   * Submit register form
   */
  async submitRegister(): Promise<void> {
    await clickTestId(this.page, "register-button");
  }

  /**
   * Perform complete login flow
   */
  async login(
    email: string = puppeteerConfig.testUser.email,
    password: string = puppeteerConfig.testUser.password
  ): Promise<void> {
    await this.goToLogin();
    await this.fillLoginForm(email, password);
    await this.submitLogin();
    await waitForUrl(this.page, "/");
  }

  /**
   * Perform complete register flow
   */
  async register(
    name: string = puppeteerConfig.testUser.name,
    email: string = puppeteerConfig.testUser.email,
    password: string = puppeteerConfig.testUser.password
  ): Promise<void> {
    await this.goToRegister();
    await this.fillRegisterForm(name, email, password);
    await this.submitRegister();
    await waitForUrl(this.page, "/");
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await clickTestId(this.page, "user-menu-button");
    await clickTestId(this.page, "logout-button");
    await waitForUrl(this.page, "/login");
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return testIdExists(this.page, "user-menu-button");
  }

  /**
   * Get validation error message
   */
  async getValidationError(field: string): Promise<string> {
    return getTestIdText(this.page, `${field}-error`);
  }

  /**
   * Check if validation error exists
   */
  async hasValidationError(field: string): Promise<boolean> {
    return testIdExists(this.page, `${field}-error`);
  }
}
