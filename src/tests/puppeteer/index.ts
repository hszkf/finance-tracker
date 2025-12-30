/**
 * Puppeteer E2E Testing Module
 *
 * This module provides a comprehensive E2E testing setup using Puppeteer with Chromium.
 *
 * ## Structure
 * - puppeteer.config.ts - Configuration for browser, timeouts, and test user
 * - utils/test-utils.ts - Helper functions for common testing operations
 * - pages/*.page.ts - Page Object Models for different pages
 * - specs/*.spec.ts - Test specifications
 *
 * ## Usage
 * Run tests with: bun run test:puppeteer
 *
 * ## Available Scripts
 * - test:puppeteer - Run all Puppeteer tests
 * - test:puppeteer:headed - Run tests with visible browser
 * - test:puppeteer:debug - Run with debug logging
 */

// Configuration
export { puppeteerConfig } from "./puppeteer.config";
export type { PuppeteerConfig } from "./puppeteer.config";

// Utilities
export {
  // Browser/Page management
  launchBrowser,
  createPage,
  setupTestContext,
  teardownTestContext,
  delay,
  // Navigation
  navigateTo,
  waitForUrl,
  // Element interactions
  waitForElement,
  waitForTestId,
  clickElement,
  clickTestId,
  typeIntoInput,
  typeIntoTestId,
  selectOption,
  scrollIntoView,
  // Content retrieval
  getTextContent,
  getTestIdText,
  getAttribute,
  hasClass,
  // Element checks
  elementExists,
  testIdExists,
  countElements,
  getAllElements,
  // Waiting
  waitForNetworkIdle,
  waitForToast,
  // Screenshots
  takeScreenshot,
  // Storage
  clearLocalStorage,
  setLocalStorageItem,
  getLocalStorageItem,
} from "./utils/test-utils";

export type { TestContext } from "./utils/test-utils";

// Page Objects
export { AuthPage } from "./pages/auth.page";
export { TransactionsPage } from "./pages/transactions.page";
export { DashboardPage } from "./pages/dashboard.page";
