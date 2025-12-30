import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia for theme tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
  clear: () => {},
  length: 0,
  key: (_index: number) => null,
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: () => "test-uuid-" + Math.random().toString(36).substring(7),
  },
});

// Global test utilities
export const TEST_USER = {
  id: "test-user-id",
  email: "test@example.com",
  name: "Test User",
};

export const TEST_ACCOUNT = {
  id: "test-account-id",
  name: "Test Account",
  type: "bank" as const,
  currency: "GBP" as const,
  balance: 1000,
};

export const TEST_CATEGORY = {
  id: "test-category-id",
  name: "Transport",
  type: "expense" as const,
  icon: "train",
  color: "#3b82f6",
};

export const TEST_TRANSACTION = {
  id: "test-transaction-id",
  amount: 25.5,
  currency: "GBP" as const,
  description: "Tube fare",
  date: new Date().toISOString(),
  type: "expense" as const,
};

export const TEST_GROUP = {
  id: "test-group-id",
  name: "Flat Expenses",
  currency: "GBP" as const,
  isPersonal: false,
};
