import puppeteer, { Browser, Page, ElementHandle } from "puppeteer";
import { puppeteerConfig } from "../puppeteer.config";
import * as fs from "fs";
import * as path from "path";

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Test context containing browser and page instances
 */
export interface TestContext {
  browser: Browser;
  page: Page;
}

/**
 * Launch a new browser instance with configured options
 */
export async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch(puppeteerConfig.launchOptions);
}

/**
 * Create a new page with default settings
 */
export async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();

  // Set default timeouts
  page.setDefaultNavigationTimeout(puppeteerConfig.timeouts.navigation);
  page.setDefaultTimeout(puppeteerConfig.timeouts.element);

  // Set viewport
  await page.setViewport(puppeteerConfig.viewport);

  return page;
}

/**
 * Setup test context with browser and page
 */
export async function setupTestContext(): Promise<TestContext> {
  const browser = await launchBrowser();
  const page = await createPage(browser);
  return { browser, page };
}

/**
 * Teardown test context
 */
export async function teardownTestContext(context: TestContext): Promise<void> {
  if (context.page) {
    await context.page.close();
  }
  if (context.browser) {
    await context.browser.close();
  }
}

/**
 * Navigate to a path relative to base URL
 */
export async function navigateTo(page: Page, path: string): Promise<void> {
  const url = `${puppeteerConfig.baseUrl}${path}`;
  await page.goto(url, { waitUntil: "networkidle0" });
}

/**
 * Wait for an element to be visible and return it
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout?: number
): Promise<ElementHandle<Element>> {
  const element = await page.waitForSelector(selector, {
    visible: true,
    timeout: timeout || puppeteerConfig.timeouts.element,
  });
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element;
}

/**
 * Wait for element by data-testid
 */
export async function waitForTestId(
  page: Page,
  testId: string,
  timeout?: number
): Promise<ElementHandle<Element>> {
  return waitForElement(page, `[data-testid="${testId}"]`, timeout);
}

/**
 * Click an element by selector
 */
export async function clickElement(page: Page, selector: string): Promise<void> {
  await waitForElement(page, selector);
  await page.click(selector);
}

/**
 * Click an element by data-testid
 */
export async function clickTestId(page: Page, testId: string): Promise<void> {
  await clickElement(page, `[data-testid="${testId}"]`);
}

/**
 * Type into an input field
 */
export async function typeIntoInput(
  page: Page,
  selector: string,
  text: string,
  options?: { clear?: boolean; delay?: number }
): Promise<void> {
  await waitForElement(page, selector);

  if (options?.clear) {
    await page.click(selector, { count: 3 }); // Triple-click to select all
    await page.keyboard.press("Backspace");
  }

  await page.type(selector, text, { delay: options?.delay || 0 });
}

/**
 * Type into an input by data-testid
 */
export async function typeIntoTestId(
  page: Page,
  testId: string,
  text: string,
  options?: { clear?: boolean; delay?: number }
): Promise<void> {
  await typeIntoInput(page, `[data-testid="${testId}"]`, text, options);
}

/**
 * Get text content of an element
 */
export async function getTextContent(page: Page, selector: string): Promise<string> {
  await waitForElement(page, selector);
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  const text = await page.evaluate((el) => el.textContent, element);
  return text?.trim() || "";
}

/**
 * Get text content by data-testid
 */
export async function getTestIdText(page: Page, testId: string): Promise<string> {
  return getTextContent(page, `[data-testid="${testId}"]`);
}

/**
 * Check if element exists on the page
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if element with data-testid exists
 */
export async function testIdExists(page: Page, testId: string): Promise<boolean> {
  return elementExists(page, `[data-testid="${testId}"]`);
}

/**
 * Wait for URL to match pattern
 */
export async function waitForUrl(
  page: Page,
  pattern: string | RegExp,
  timeout?: number
): Promise<void> {
  await page.waitForFunction(
    (urlPattern) => {
      if (typeof urlPattern === "string") {
        return window.location.href.includes(urlPattern);
      }
      return new RegExp(urlPattern).test(window.location.href);
    },
    { timeout: timeout || puppeteerConfig.timeouts.navigation },
    typeof pattern === "string" ? pattern : pattern.source
  );
}

/**
 * Take a screenshot and save it
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  options?: { fullPage?: boolean }
): Promise<string> {
  const screenshotsDir = puppeteerConfig.screenshotsDir;

  // Ensure directory exists
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(screenshotsDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: options?.fullPage ?? false,
  });

  return filepath;
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: Page, timeout?: number): Promise<void> {
  await page.waitForNetworkIdle({
    timeout: timeout || puppeteerConfig.timeouts.navigation,
  });
}

/**
 * Select an option from a dropdown
 */
export async function selectOption(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await waitForElement(page, selector);
  await page.select(selector, value);
}

/**
 * Get attribute value of an element
 */
export async function getAttribute(
  page: Page,
  selector: string,
  attribute: string
): Promise<string | null> {
  await waitForElement(page, selector);
  return page.$eval(selector, (el, attr) => el.getAttribute(attr), attribute);
}

/**
 * Check if an element has a specific class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  await waitForElement(page, selector);
  return page.$eval(
    selector,
    (el, cls) => el.classList.contains(cls),
    className
  );
}

/**
 * Wait for toast/notification to appear
 */
export async function waitForToast(
  page: Page,
  options?: { timeout?: number }
): Promise<ElementHandle<Element>> {
  return waitForElement(
    page,
    '[data-testid="toast"], [role="alert"], .toast',
    options?.timeout
  );
}

/**
 * Get all elements matching a selector
 */
export async function getAllElements(
  page: Page,
  selector: string
): Promise<ElementHandle<Element>[]> {
  await waitForElement(page, selector);
  return page.$$(selector);
}

/**
 * Count elements matching a selector
 */
export async function countElements(page: Page, selector: string): Promise<number> {
  const elements = await page.$$(selector);
  return elements.length;
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  await page.$eval(selector, (el) => el.scrollIntoView({ behavior: "smooth" }));
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    },
    {},
    selector
  );
}

/**
 * Clear local storage
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Set local storage item
 */
export async function setLocalStorageItem(
  page: Page,
  key: string,
  value: string
): Promise<void> {
  await page.evaluate(
    (k, v) => localStorage.setItem(k, v),
    key,
    value
  );
}

/**
 * Get local storage item
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return page.evaluate((k) => localStorage.getItem(k), key);
}
