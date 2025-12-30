# Personal Finance Tracker - Project Configuration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Backend | Hono.js |
| Frontend | React + TanStack Router |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Build Tool | Vite + TSDX (libraries) |
| Language | TypeScript (strict) |
| Backend Testing | Bun test + Supertest |
| Frontend Testing | Vitest + React Testing Library |
| E2E Testing | Playwright (Chromium) |
| API Mocking | MSW (Mock Service Worker) |

---

## Running the Application

### Development Mode

```bash
# Start both backend and frontend in development
bun run dev

# Or run separately:
bun run dev:backend    # Start Hono.js API server (port 3001)
bun run dev:frontend   # Start Vite frontend (port 3000)
```

### Production Mode

```bash
# Build for production
bun run build

# Start production server
bun run start
```

### Database

```bash
bun run db:generate    # Generate Drizzle migrations
bun run db:migrate     # Apply migrations to database
bun run db:push        # Push schema directly (dev only)
bun run db:seed        # Seed default categories
bun run db:studio      # Open Drizzle Studio GUI
```

---

## Testing Strategy

### Overview

| Test Type | Tool | Target | When to Run |
|-----------|------|--------|-------------|
| Unit (Backend) | Bun test | Services, utilities, validators | On save, pre-commit |
| Integration (API) | Bun test + Supertest | API routes, middleware | Pre-push |
| Unit (Frontend) | Vitest + RTL | Components, hooks | On save, pre-commit |
| E2E (UI) | Playwright + Chromium | Full user flows | Pre-push, CI |

### Coverage Targets

- **Backend Services**: 80%+ coverage
- **Frontend Components**: 70%+ coverage
- **Critical Flows**: 100% E2E coverage (auth, transactions, reports)

---

## Backend Testing

### Commands

```bash
# Run all backend unit tests
bun test

# Watch mode (re-run on file changes)
bun test --watch

# Run with coverage report
bun test --coverage

# Run specific test file
bun test src/api/services/transaction.service.test.ts

# Run integration tests (API routes)
bun run test:integration

# Run tests matching pattern
bun test --grep "transaction"
```

### Test File Convention

```
src/api/
├── services/
│   ├── transaction.service.ts
│   └── transaction.service.test.ts    # Unit test (colocated)
├── routes/
│   ├── transactions.ts
│   └── transactions.test.ts           # Integration test (colocated)
```

### Example Backend Test

```typescript
// src/api/services/transaction.service.test.ts
import { describe, it, expect, beforeEach, mock } from "bun:test";
import { TransactionService } from "./transaction.service";

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService(mockDb);
  });

  it("should create a transaction", async () => {
    const result = await service.create({
      amount: 100,
      currency: "GBP",
      categoryId: "cat-123",
    });
    expect(result.id).toBeDefined();
    expect(result.amount).toBe(100);
  });

  it("should convert currency when different from base", async () => {
    const result = await service.create({
      amount: 100,
      currency: "MYR",
    });
    expect(result.amountInBase).toBeDefined();
    expect(result.exchangeRate).toBeGreaterThan(0);
  });
});
```

### Pre-Push Hook (Backend)

**IMPORTANT**: Always run backend tests before pushing code:

```bash
# This MUST pass before pushing
bun test && bun run test:integration
```

---

## Frontend Testing

### Commands

```bash
# Run all frontend tests (Vitest)
bun run test:frontend

# Watch mode
bun run test:frontend:watch

# With coverage
bun run test:frontend:coverage

# Run specific test
bun run test:frontend src/features/transactions/components/TransactionForm.test.tsx

# UI mode (interactive)
bun run test:frontend:ui
```

### Test File Convention

```
src/features/transactions/
├── components/
│   ├── TransactionForm.tsx
│   └── TransactionForm.test.tsx       # Component test (colocated)
├── hooks/
│   ├── useTransactions.ts
│   └── useTransactions.test.ts        # Hook test (colocated)
```

### Example Frontend Test

```typescript
// src/features/transactions/components/TransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransactionForm } from "./TransactionForm";

describe("TransactionForm", () => {
  it("should render all form fields", () => {
    render(<TransactionForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("should submit form with valid data", async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: "50.00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 50 })
      );
    });
  });

  it("should show validation error for empty amount", async () => {
    render(<TransactionForm onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    });
  });
});
```

---

## E2E Testing with Playwright (Chromium)

### Setup

```bash
# Install Playwright browsers (Chromium only for faster tests)
bunx playwright install chromium

# Install dependencies
bunx playwright install-deps chromium
```

### Commands

```bash
# Run all E2E tests with Chromium
bun run test:e2e

# Run in headed mode (see browser)
bun run test:e2e:headed

# Run with Playwright UI (interactive debugging)
bun run test:e2e:ui

# Run specific test file
bun run test:e2e src/tests/e2e/transactions.spec.ts

# Run tests matching pattern
bun run test:e2e --grep "add transaction"

# Generate test report
bun run test:e2e:report

# Debug mode (step through tests)
bun run test:e2e:debug
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Mobile viewport for responsive testing
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  // Start dev server before running tests
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### E2E Test Structure

```
src/tests/e2e/
├── auth.spec.ts              # Login, register, logout flows
├── transactions.spec.ts      # Add, edit, delete transactions
├── dashboard.spec.ts         # Dashboard displays, charts load
├── budgets.spec.ts           # Budget creation, tracking
├── groups.spec.ts            # Group management, invitations
├── reports.spec.ts           # Report generation, exports
└── fixtures/
    ├── auth.fixture.ts       # Auth helpers
    └── test-data.ts          # Test data generators
```

### Example E2E Test (UI Interactions)

```typescript
// src/tests/e2e/transactions.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Transactions", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL("/");
  });

  test("should add a new transaction", async ({ page }) => {
    // Navigate to transactions page
    await page.click('[data-testid="nav-transactions"]');
    await expect(page).toHaveURL("/transactions");

    // Click add button
    await page.click('[data-testid="add-transaction-button"]');
    await expect(page).toHaveURL("/transactions/new");

    // Fill form
    await page.fill('[data-testid="amount-input"]', "25.50");
    await page.selectOption('[data-testid="category-select"]', "transport");
    await page.fill('[data-testid="description-input"]', "Tube to work");

    // Select date using date picker
    await page.click('[data-testid="date-picker"]');
    await page.click('button[name="day"]:has-text("15")');

    // Submit form
    await page.click('[data-testid="submit-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      "Transaction added"
    );

    // Verify redirect back to list
    await expect(page).toHaveURL("/transactions");

    // Verify transaction appears in list
    await expect(
      page.locator('[data-testid="transaction-list"]')
    ).toContainText("Tube to work");
    await expect(
      page.locator('[data-testid="transaction-list"]')
    ).toContainText("£25.50");
  });

  test("should edit an existing transaction", async ({ page }) => {
    await page.goto("/transactions");

    // Click on first transaction
    await page.click('[data-testid="transaction-item"]:first-child');

    // Click edit button
    await page.click('[data-testid="edit-button"]');

    // Update amount
    await page.fill('[data-testid="amount-input"]', "30.00");

    // Save changes
    await page.click('[data-testid="submit-button"]');

    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      "Transaction updated"
    );
  });

  test("should delete a transaction with confirmation", async ({ page }) => {
    await page.goto("/transactions");

    // Get initial count
    const initialCount = await page.locator('[data-testid="transaction-item"]').count();

    // Click delete on first transaction
    await page.click('[data-testid="transaction-item"]:first-child [data-testid="delete-button"]');

    // Confirm deletion in dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await page.click('[data-testid="confirm-delete-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-toast"]')).toContainText(
      "Transaction deleted"
    );

    // Verify count decreased
    const newCount = await page.locator('[data-testid="transaction-item"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test("should filter transactions by category", async ({ page }) => {
    await page.goto("/transactions");

    // Open filter dropdown
    await page.click('[data-testid="filter-button"]');

    // Select category
    await page.click('[data-testid="category-filter-transport"]');

    // Apply filter
    await page.click('[data-testid="apply-filter-button"]');

    // Verify URL has filter param
    await expect(page).toHaveURL(/category=transport/);

    // Verify all visible transactions are transport category
    const categories = await page.locator('[data-testid="transaction-category"]').allTextContents();
    expect(categories.every((cat) => cat === "Transport")).toBe(true);
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    await page.goto("/transactions/new");

    // Submit empty form
    await page.click('[data-testid="submit-button"]');

    // Check validation errors appear
    await expect(page.locator('[data-testid="amount-error"]')).toContainText(
      "Amount is required"
    );
    await expect(page.locator('[data-testid="category-error"]')).toContainText(
      "Category is required"
    );

    // Form should not submit
    await expect(page).toHaveURL("/transactions/new");
  });
});
```

### E2E Test for Dashboard Charts

```typescript
// src/tests/e2e/dashboard.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
  });

  test("should display spending overview cards", async ({ page }) => {
    await expect(page.locator('[data-testid="total-spending-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="monthly-budget-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-category-card"]')).toBeVisible();
  });

  test("should load spending chart", async ({ page }) => {
    // Wait for chart to render
    await expect(page.locator('[data-testid="spending-chart"]')).toBeVisible();

    // Chart should have data points
    await expect(page.locator('[data-testid="spending-chart"] svg')).toBeVisible();
  });

  test("should show recent transactions", async ({ page }) => {
    await expect(page.locator('[data-testid="recent-transactions"]')).toBeVisible();

    // Should have at least one transaction
    const transactions = await page.locator('[data-testid="recent-transaction-item"]').count();
    expect(transactions).toBeGreaterThan(0);
  });

  test("should navigate to transactions from quick add", async ({ page }) => {
    await page.click('[data-testid="quick-add-button"]');
    await expect(page).toHaveURL("/transactions/new");
  });
});
```

### Visual Regression Testing

```typescript
// src/tests/e2e/visual.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Visual Regression", () => {
  test("dashboard should match snapshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("dashboard.png", {
      maxDiffPixels: 100,
    });
  });

  test("transaction form should match snapshot", async ({ page }) => {
    await page.goto("/transactions/new");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveScreenshot("transaction-form.png");
  });
});
```

---

## All Test Commands Summary

```bash
# ============ BACKEND TESTING ============
bun test                          # Run all backend unit tests
bun test --watch                  # Watch mode
bun test --coverage               # With coverage report
bun run test:integration          # Run API integration tests

# ============ FRONTEND TESTING ============
bun run test:frontend             # Run Vitest frontend tests
bun run test:frontend:watch       # Watch mode
bun run test:frontend:coverage    # With coverage report
bun run test:frontend:ui          # Interactive UI mode

# ============ E2E TESTING (Playwright + Chromium) ============
bun run test:e2e                  # Run all E2E tests
bun run test:e2e:headed           # Run with visible browser
bun run test:e2e:ui               # Playwright UI mode (debugging)
bun run test:e2e:debug            # Debug mode (step through)
bun run test:e2e:report           # Generate HTML report

# ============ ALL TESTS ============
bun run test:all                  # Run ALL tests (unit + integration + e2e)

# ============ PRE-PUSH (REQUIRED) ============
bun run test:prepush              # Runs: lint + typecheck + test + test:e2e

# ============ CI TESTING ============
bun run test:ci                   # Full CI test suite with coverage
```

---

## Pre-Push Testing Requirements

**CRITICAL**: Before pushing ANY code, run:

```bash
bun run test:prepush
```

This command runs:
1. `bun run lint` - ESLint checks
2. `bun run typecheck` - TypeScript type checking
3. `bun test` - Backend unit tests
4. `bun run test:integration` - API integration tests
5. `bun run test:frontend` - Frontend component tests
6. `bun run test:e2e` - E2E tests with Chromium

**All tests MUST pass before pushing.**

---

## Project Structure

```
src/
├── api/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── auth.test.ts              # API integration tests
│   │   ├── transactions.ts
│   │   ├── transactions.test.ts
│   │   ├── groups.ts
│   │   └── groups.test.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── auth.test.ts
│   ├── services/
│   │   ├── transaction.service.ts
│   │   ├── transaction.service.test.ts  # Unit tests
│   │   ├── currency.service.ts
│   │   └── currency.service.test.ts
│   └── index.ts
├── db/
│   ├── schema/
│   ├── migrations/
│   ├── seed.ts
│   └── index.ts
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginForm.test.tsx
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       └── useAuth.test.ts
│   ├── transactions/
│   │   ├── components/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionForm.test.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── TransactionList.test.tsx
│   │   └── hooks/
│   │       ├── useTransactions.ts
│   │       └── useTransactions.test.ts
│   └── groups/
│       ├── components/
│       │   ├── GroupCard.tsx
│       │   └── GroupCard.test.tsx
│       └── hooks/
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── forms/
│   ├── charts/
│   └── layout/
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   ├── utils.test.ts
│   └── currency.ts
├── routes/                          # TanStack Router pages
├── tests/
│   ├── e2e/                         # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   ├── transactions.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── groups.spec.ts
│   │   └── fixtures/
│   ├── mocks/                       # MSW handlers
│   │   ├── handlers/
│   │   └── server.ts
│   └── setup.ts
├── types/
├── playwright.config.ts
├── vitest.config.ts
└── bunfig.toml
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Currency API
EXCHANGE_RATE_API_KEY=xxx

# Email (Resend) - https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com  # Must be verified domain

# App
APP_URL=http://localhost:3000

# Testing
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

---

## Available Agents

Use these specialized agents for complex tasks:

| Agent | Use For |
|-------|---------|
| `api-designer` | REST API design, endpoint patterns, OpenAPI specs |
| `backend-developer` | Hono.js routes, services, business logic, **backend tests** |
| `frontend-developer` | React components, TanStack Router pages, shadcn/ui, **component tests** |
| `typescript-pro` | Advanced types, Zod schemas, type-safe patterns |
| `database-architect` | Drizzle schema, migrations, query optimization |
| `security-auditor` | Auth patterns, OWASP checks, security review |
| `devops-engineer` | Docker, CI/CD, GitHub Actions, **test automation** |

### Agent Usage Guidelines

**Always use agents for:**
- Creating API routes → `backend-developer` (include integration tests)
- Building UI components → `frontend-developer` (include component tests)
- Writing E2E tests → `frontend-developer` + `testing-e2e-playwright` skill
- Setting up CI/CD → `devops-engineer` + `github-actions-templates` skill
- Database changes → `database-architect` (include migration tests)

### Testing-Specific Agent Instructions

When using `backend-developer`:
- **Always** write unit tests for new services
- **Always** write integration tests for new API routes
- Run `bun test` to verify tests pass before completing

When using `frontend-developer`:
- **Always** write component tests for new components
- **Always** add `data-testid` attributes for E2E testing
- Run `bun run test:frontend` to verify tests pass

When creating E2E tests:
- Use `testing-e2e-playwright` skill
- Test happy path AND error cases
- Include visual checks (element visibility, text content)
- Add proper wait conditions for async operations

---

## Available Skills

### Stack-Specific (Always Reference)
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `hono-patterns` | Routes, middleware, validation, auth | Every API route |
| `supabase-patterns` | Auth, storage, RLS policies | Auth & data access |
| `tanstack-router-patterns` | File routing, loaders, navigation | Every page/route |
| `database-migrations` | Drizzle migrations, safe changes | Schema changes |

### UI & Styling
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `frontend-dev-guidelines` | React patterns, Suspense, data fetching | Every component |
| `frontend-design` | UI/UX, creative interfaces | Building new pages |

### Testing (CRITICAL - Always Reference)
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `testing-patterns` | Unit/integration tests, Bun test, Vitest | **Every new service/component** |
| `testing-e2e-playwright` | Playwright tests, page objects, selectors | **Every user flow** |
| `running-e2e-tests` | E2E execution, debugging, CI setup | Running/debugging E2E |

### DevOps & CI/CD
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `docker-patterns` | Dockerfile, multi-stage builds | Containerization |
| `github-actions-templates` | CI/CD workflows, **test automation** | Pipeline setup |

### Code Quality
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `git-workflow` | Commits, branching, **pre-push hooks** | Every commit |
| `code-review-checklist` | PR review, **test coverage checks** | Before merge |
| `security-checklist` | XSS/SQLi prevention | Security review |
| `performance-optimization` | Caching, optimization | Performance work |
| `debugging-guide` | Troubleshooting, **test debugging** | Fixing issues |

---

## Conventions

### Code Style
- Package manager: `bun` only
- Prefer `const` over `let`
- TypeScript strict mode, no `any`
- Zod for runtime validation
- Named exports preferred
- Absolute imports with `@/` prefix

### UI Components (shadcn/ui)
- Use shadcn/ui components as base
- Customize via Tailwind CSS
- Follow Radix UI accessibility patterns
- **Always add `data-testid` attributes for E2E testing**

### API (Hono.js)
- Use `zValidator` for input validation
- Proper HTTP status codes
- Thin handlers, delegate to services
- **Always write integration tests for routes**

### Database (Drizzle + Supabase)
- Drizzle for all queries
- Supabase client for auth/storage/realtime only
- UUID primary keys
- Include `createdAt`/`updatedAt` timestamps

### Testing Requirements (MANDATORY)

| What | Requirement |
|------|-------------|
| Backend Services | Unit tests with 80%+ coverage |
| API Routes | Integration tests for all endpoints |
| React Components | Component tests with RTL |
| User Flows | E2E tests with Playwright |
| UI Elements | Must have `data-testid` attributes |
| Pre-Push | All tests must pass |

### Git
- Branches: `feature/`, `fix/`, `chore/`, `test/`
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Squash merge to main
- **Run `bun run test:prepush` before push**
- **All CI tests must pass before merge**

---

## CI/CD Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install

      - name: Lint
        run: bun run lint

      - name: Type Check
        run: bun run typecheck

      - name: Backend Tests
        run: bun test --coverage

      - name: Frontend Tests
        run: bun run test:frontend:coverage

      - name: Install Playwright
        run: bunx playwright install chromium --with-deps

      - name: E2E Tests
        run: bun run test:e2e

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results
          path: |
            playwright-report/
            coverage/
```
