import type { LaunchOptions } from "puppeteer";

/**
 * Puppeteer test configuration
 */
export const puppeteerConfig = {
  // Base URL for the application
  baseUrl: process.env.TEST_BASE_URL || "http://localhost:3000",

  // API URL for backend
  apiUrl: process.env.TEST_API_URL || "http://localhost:3001",

  // Browser launch options
  launchOptions: {
    headless: process.env.PUPPETEER_HEADLESS !== "false",
    slowMo: process.env.PUPPETEER_SLOW_MO ? parseInt(process.env.PUPPETEER_SLOW_MO) : 0,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  } satisfies LaunchOptions,

  // Viewport options
  viewport: {
    width: 1920,
    height: 1080,
  },

  // Timeouts
  timeouts: {
    navigation: 30000,
    element: 10000,
    action: 5000,
  },

  // Screenshots directory
  screenshotsDir: "src/tests/puppeteer/screenshots",

  // Test user credentials
  testUser: {
    email: process.env.TEST_USER_EMAIL || "test@example.com",
    password: process.env.TEST_USER_PASSWORD || "password123",
    name: "Test User",
  },
};

export type PuppeteerConfig = typeof puppeteerConfig;
