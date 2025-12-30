# Personal Finance Tracker - London Spending

A production personal finance application to track spending in London while living in Malaysia.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Backend | Hono.js |
| Frontend | React + TanStack Router |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS + shadcn/ui (Radix UI) |
| Charts | Recharts |
| Build Tool | TSDX (for libraries) |
| Language | TypeScript (strict) |
| Unit Testing | Bun test (backend), Vitest + React Testing Library (frontend) |
| Integration Testing | Supertest + Bun test (API), MSW (mocking) |
| E2E Testing | Playwright |

---

## Testing Strategy

### Backend Testing
- **Unit Tests**: Bun test for services, utilities, validators
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: Test containers or Supabase test instance
- **Coverage Target**: 80%+ for services

### Frontend Testing
- **Unit Tests**: Vitest + React Testing Library for components
- **Integration Tests**: Test component interactions with MSW mocks
- **E2E Tests**: Playwright for critical user flows
- **Coverage Target**: 70%+ for components

### Test Files Structure
```
src/
├── api/
│   ├── routes/
│   │   ├── transactions.ts
│   │   └── transactions.test.ts      # API integration tests
│   └── services/
│       ├── transaction.service.ts
│       └── transaction.service.test.ts # Unit tests
├── features/
│   └── transactions/
│       ├── components/
│       │   ├── TransactionForm.tsx
│       │   └── TransactionForm.test.tsx # Component tests
│       └── hooks/
│           ├── useTransactions.ts
│           └── useTransactions.test.ts  # Hook tests
└── tests/
    ├── e2e/
    │   ├── transactions.spec.ts    # Playwright E2E
    │   ├── dashboard.spec.ts
    │   └── auth.spec.ts
    ├── mocks/
    │   ├── handlers.ts             # MSW handlers
    │   └── server.ts
    └── setup.ts
```

---

## Core Features

### Phase 1: Foundation
- [ ] Project setup with Bun + Hono + TanStack Router
- [ ] Supabase integration and authentication
- [ ] Database schema with Drizzle ORM
- [ ] Basic UI layout and navigation
- [ ] **Responsive design** (mobile-first, works on all devices)

### Phase 2: Core Functionality
- [ ] **Accounts**: Bank accounts, credit cards, cash (GBP/MYR)
- [ ] **Transactions**: Add, edit, delete expenses/income
- [ ] **Categories**: London-specific categories (Tube, Groceries, Rent, etc.)
- [ ] **Multi-currency**: GBP as primary, MYR for Malaysia expenses

### Phase 3: Collaboration & Sharing
- [ ] **Spending Groups**: Create shared spending groups (e.g., "London Trip", "Flat Expenses")
- [ ] **Email Invitations**: Invite users via email to join a spending group
- [ ] **Role-based Access**: Owner, Member, Viewer permissions
- [ ] **Data Isolation**: Users can ONLY see their own spending OR groups they're invited to
- [ ] **Row Level Security (RLS)**: Supabase RLS policies for strict data isolation

### Phase 4: Analytics
- [ ] **Dashboard**: Monthly overview, spending breakdown
- [ ] **Reports**: By category, by currency, trends over time
- [ ] **Budget tracking**: Set monthly budgets per category
- [ ] **Group Reports**: Shared spending analytics for group members

### Phase 5: Advanced
- [ ] **Recurring transactions**: Rent, subscriptions, bills
- [ ] **CSV Import**: Import bank statements
- [ ] **Currency conversion**: Live GBP/MYR rates
- [ ] **Export**: PDF/CSV reports

### Phase 6: Split Expenses & Settlements
- [ ] **Split transactions**: Split a bill among group members
- [ ] **Settlement tracking**: Track who owes whom in the group
- [ ] **Settle up**: Mark debts as paid
- [ ] **Balance summary**: Dashboard showing group balances

### Phase 7: Notifications & Alerts
- [ ] **Budget alerts**: Notify when approaching/exceeding budget (50%, 80%, 100%)
- [ ] **Email notifications**: Weekly spending summaries via Resend
- [ ] **In-app notifications**: Real-time alerts in the app
- [ ] **Bill reminders**: Remind before recurring bills are due

### Phase 8: UX Enhancements
- [ ] **Dark mode**: Light/dark theme toggle with system preference
- [ ] **Malaysian bank CSV parsers**: Maybank, CIMB statement import
- [ ] **Theme persistence**: Save user theme preference

---

## Multi-User & Sharing Architecture

### Spending Groups
Users can create "Spending Groups" to share specific expenses with others:
- **Personal**: Default group, private to user only
- **Shared**: Invite others via email, everyone in group sees transactions
- **Use cases**: Flatmates sharing bills, tracking trip expenses with friends

### Permission Levels
| Role | View Transactions | Add Transactions | Edit Own | Edit All | Manage Members | Delete Group |
|------|-------------------|------------------|----------|----------|----------------|--------------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Member | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Data Isolation Rules
1. Users see ONLY transactions in groups they belong to
2. Personal transactions are in a default "Personal" group (user is sole member)
3. All database queries filter by group membership
4. Supabase RLS enforces isolation at database level

### Supabase Row Level Security (RLS) Policies

```sql
-- Users can only see groups they are members of
CREATE POLICY "Users can view their groups" ON spending_groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Users can only see transactions in their groups
CREATE POLICY "Users can view group transactions" ON transactions
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Users can only insert transactions in groups they are members of (not viewers)
CREATE POLICY "Members can insert transactions" ON transactions
  FOR INSERT WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
  );

-- Users can only update their own transactions (or all if admin/owner)
CREATE POLICY "Users can update transactions" ON transactions
  FOR UPDATE USING (
    user_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Accounts follow same pattern as transactions
CREATE POLICY "Users can view group accounts" ON accounts
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
```

---

## Database Schema

### users
```sql
id: uuid PRIMARY KEY
email: text UNIQUE NOT NULL
name: text
avatar_url: text
base_currency: text DEFAULT 'GBP'
created_at: timestamp
updated_at: timestamp
```

### spending_groups
```sql
id: uuid PRIMARY KEY
name: text NOT NULL (e.g., "Personal", "London Flat", "Malaysia Trip")
description: text
currency: text DEFAULT 'GBP'
icon: text
color: text
is_personal: boolean DEFAULT false  -- true for default personal group
created_by: uuid REFERENCES users
created_at: timestamp
updated_at: timestamp
```

### group_members
```sql
id: uuid PRIMARY KEY
group_id: uuid REFERENCES spending_groups ON DELETE CASCADE
user_id: uuid REFERENCES users ON DELETE CASCADE
role: enum('owner', 'admin', 'member', 'viewer') DEFAULT 'member'
joined_at: timestamp
invited_by: uuid REFERENCES users
UNIQUE(group_id, user_id)
```

### group_invitations
```sql
id: uuid PRIMARY KEY
group_id: uuid REFERENCES spending_groups ON DELETE CASCADE
email: text NOT NULL  -- invited user's email
role: enum('admin', 'member', 'viewer') DEFAULT 'member'
token: text UNIQUE NOT NULL  -- unique invitation token
invited_by: uuid REFERENCES users
status: enum('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending'
expires_at: timestamp
created_at: timestamp
```

### accounts
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users
group_id: uuid REFERENCES spending_groups  -- accounts belong to a group
name: text NOT NULL (e.g., "Monzo", "HSBC", "Cash GBP")
type: enum('bank', 'credit_card', 'cash', 'ewallet')
currency: text NOT NULL ('GBP' | 'MYR')
balance: decimal(12,2) DEFAULT 0
icon: text
color: text
is_active: boolean DEFAULT true
created_at: timestamp
updated_at: timestamp
```

### categories
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users
name: text NOT NULL
icon: text
color: text
type: enum('expense', 'income')
parent_id: uuid REFERENCES categories (for subcategories)
```

**Default London Categories:**
- 🚇 Transport (Tube, Bus, Uber)
- 🍔 Food & Dining (Groceries, Restaurants, Takeaway)
- 🏠 Housing (Rent, Utilities, Council Tax)
- 🛒 Shopping (Clothes, Electronics, Household)
- 🎭 Entertainment (Cinema, Events, Subscriptions)
- 💊 Health (NHS, Pharmacy, Gym)
- ✈️ Travel (Flights to Malaysia, Hotels)
- 📱 Bills (Phone, Internet)
- 💰 Income (Salary, Freelance)

### transactions
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users  -- who created this transaction
group_id: uuid REFERENCES spending_groups  -- which group this belongs to
account_id: uuid REFERENCES accounts
category_id: uuid REFERENCES categories
type: enum('expense', 'income', 'transfer')
amount: decimal(12,2) NOT NULL
currency: text NOT NULL
amount_in_base: decimal(12,2) -- converted to base currency
exchange_rate: decimal(10,6)
description: text
date: date NOT NULL
notes: text
location: text (e.g., "London", "Kuala Lumpur")
is_recurring: boolean DEFAULT false
recurring_id: uuid REFERENCES recurring_transactions
created_at: timestamp
updated_at: timestamp
```

### budgets
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users
category_id: uuid REFERENCES categories
amount: decimal(12,2) NOT NULL
currency: text DEFAULT 'GBP'
period: enum('weekly', 'monthly', 'yearly')
start_date: date
created_at: timestamp
```

### recurring_transactions
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users
account_id: uuid REFERENCES accounts
category_id: uuid REFERENCES categories
amount: decimal(12,2) NOT NULL
currency: text NOT NULL
description: text
frequency: enum('daily', 'weekly', 'monthly', 'yearly')
next_date: date
is_active: boolean DEFAULT true
created_at: timestamp
```

### exchange_rates
```sql
id: uuid PRIMARY KEY
from_currency: text NOT NULL
to_currency: text NOT NULL
rate: decimal(10,6) NOT NULL
date: date NOT NULL
created_at: timestamp
UNIQUE(from_currency, to_currency, date)
```

### transaction_splits (for split expenses)
```sql
id: uuid PRIMARY KEY
transaction_id: uuid REFERENCES transactions ON DELETE CASCADE
user_id: uuid REFERENCES users  -- who owes this portion
amount: decimal(12,2) NOT NULL
currency: text NOT NULL
is_paid: boolean DEFAULT false
paid_at: timestamp
created_at: timestamp
```

### settlements (who owes whom)
```sql
id: uuid PRIMARY KEY
group_id: uuid REFERENCES spending_groups ON DELETE CASCADE
from_user_id: uuid REFERENCES users  -- who owes
to_user_id: uuid REFERENCES users    -- who is owed
amount: decimal(12,2) NOT NULL
currency: text NOT NULL
status: enum('pending', 'paid', 'cancelled') DEFAULT 'pending'
paid_at: timestamp
notes: text
created_at: timestamp
updated_at: timestamp
```

### notifications
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users ON DELETE CASCADE
type: enum('budget_alert', 'bill_reminder', 'group_activity', 'settlement_request')
title: text NOT NULL
message: text NOT NULL
data: jsonb  -- additional data (e.g., budget_id, transaction_id)
is_read: boolean DEFAULT false
read_at: timestamp
created_at: timestamp
```

### user_preferences
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES users ON DELETE CASCADE UNIQUE
theme: enum('light', 'dark', 'system') DEFAULT 'system'
email_weekly_summary: boolean DEFAULT true
email_budget_alerts: boolean DEFAULT true
push_notifications: boolean DEFAULT true
created_at: timestamp
updated_at: timestamp
```

---

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Spending Groups
- `GET /api/groups` - List user's groups (owned + member of)
- `POST /api/groups` - Create new spending group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group (owner/admin only)
- `DELETE /api/groups/:id` - Delete group (owner only)
- `GET /api/groups/:id/members` - List group members
- `DELETE /api/groups/:id/members/:userId` - Remove member (owner/admin)
- `PUT /api/groups/:id/members/:userId` - Update member role

### Invitations
- `POST /api/groups/:id/invitations` - Send invitation email
- `GET /api/groups/:id/invitations` - List pending invitations
- `DELETE /api/invitations/:id` - Cancel invitation
- `POST /api/invitations/accept/:token` - Accept invitation (public)
- `POST /api/invitations/decline/:token` - Decline invitation (public)

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create account
- `GET /api/accounts/:id` - Get account details
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `GET /api/accounts/:id/transactions` - Account transactions

### Transactions
- `GET /api/transactions` - List with filters (date, category, account)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk` - Bulk import (CSV)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/status` - Budget vs actual spending

### Reports
- `GET /api/reports/summary` - Monthly summary
- `GET /api/reports/by-category` - Spending by category
- `GET /api/reports/trends` - Spending trends
- `GET /api/reports/currency` - By currency breakdown

### Exchange Rates
- `GET /api/exchange-rates/latest` - Get latest GBP/MYR rate
- `POST /api/exchange-rates/convert` - Convert amount

### Split Expenses
- `POST /api/transactions/:id/split` - Split a transaction among group members
- `GET /api/transactions/:id/splits` - Get splits for a transaction
- `PUT /api/splits/:id` - Update a split (mark as paid)
- `DELETE /api/splits/:id` - Remove a split

### Settlements
- `GET /api/groups/:id/balances` - Get who owes whom in a group
- `POST /api/settlements` - Create a settlement (request payment)
- `GET /api/settlements` - List user's settlements (pending/paid)
- `PUT /api/settlements/:id` - Update settlement (mark as paid)
- `DELETE /api/settlements/:id` - Cancel a settlement

### Notifications
- `GET /api/notifications` - List user's notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### User Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences (theme, notifications)

### Bank CSV Import
- `POST /api/import/maybank` - Import Maybank CSV statement
- `POST /api/import/cimb` - Import CIMB CSV statement
- `POST /api/import/generic` - Import generic CSV

---

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Overview, recent transactions, budget status |
| `/transactions` | Transactions | List, add, filter transactions |
| `/transactions/new` | Add Transaction | Quick add form |
| `/accounts` | Accounts | Manage bank accounts |
| `/budgets` | Budgets | Set and track budgets |
| `/reports` | Reports | Charts and analytics |
| `/categories` | Categories | Manage categories |
| `/groups` | Groups | Manage spending groups |
| `/groups/new` | Create Group | Create new spending group |
| `/groups/:id` | Group Details | View group, members, transactions |
| `/groups/:id/settings` | Group Settings | Manage members, invitations |
| `/groups/:id/balances` | Group Balances | Who owes whom, settle up |
| `/groups/:id/settlements` | Settlements | Settlement history |
| `/invite/:token` | Accept Invitation | Public page to accept/decline invite |
| `/notifications` | Notifications | All notifications |
| `/import` | Import Data | CSV import from banks (Maybank, CIMB) |
| `/settings` | Settings | Profile, theme, notification preferences |

---

## Project Structure

```
src/
├── api/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── auth.test.ts              # Integration tests
│   │   ├── accounts.ts
│   │   ├── accounts.test.ts
│   │   ├── transactions.ts
│   │   ├── transactions.test.ts
│   │   ├── categories.ts
│   │   ├── categories.test.ts
│   │   ├── budgets.ts
│   │   ├── budgets.test.ts
│   │   ├── reports.ts
│   │   ├── reports.test.ts
│   │   └── exchange-rates.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── auth.test.ts
│   │   └── validation.ts
│   ├── services/
│   │   ├── transaction.service.ts
│   │   ├── transaction.service.test.ts  # Unit tests
│   │   ├── account.service.ts
│   │   ├── account.service.test.ts
│   │   ├── budget.service.ts
│   │   ├── budget.service.test.ts
│   │   ├── report.service.ts
│   │   ├── report.service.test.ts
│   │   ├── currency.service.ts
│   │   └── currency.service.test.ts
│   └── index.ts
├── db/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── accounts.ts
│   │   ├── transactions.ts
│   │   ├── categories.ts
│   │   ├── budgets.ts
│   │   └── index.ts
│   ├── migrations/
│   ├── seed.ts
│   └── index.ts
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginForm.test.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── RegisterForm.test.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useAuth.test.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── OverviewCard.tsx
│   │   │   ├── SpendingChart.tsx
│   │   │   ├── RecentTransactions.tsx
│   │   │   └── BudgetProgress.tsx
│   │   └── hooks/
│   ├── transactions/
│   │   ├── components/
│   │   │   ├── TransactionForm.tsx
│   │   │   ├── TransactionForm.test.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   ├── TransactionList.test.tsx
│   │   │   ├── TransactionFilters.tsx
│   │   │   └── CurrencyBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useTransactions.ts
│   │   │   └── useTransactions.test.ts
│   │   └── types.ts
│   ├── groups/                          # Spending groups feature
│   │   ├── components/
│   │   │   ├── GroupCard.tsx
│   │   │   ├── GroupCard.test.tsx
│   │   │   ├── GroupForm.tsx
│   │   │   ├── GroupForm.test.tsx
│   │   │   ├── MemberList.tsx
│   │   │   ├── MemberList.test.tsx
│   │   │   ├── InviteForm.tsx
│   │   │   ├── InviteForm.test.tsx
│   │   │   ├── PendingInvitations.tsx
│   │   │   └── RoleBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useGroups.ts
│   │   │   ├── useGroups.test.ts
│   │   │   ├── useGroupMembers.ts
│   │   │   └── useInvitations.ts
│   │   └── types.ts
│   ├── accounts/
│   ├── budgets/
│   ├── reports/
│   └── categories/
├── components/
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   ├── badge.tsx
│   │   ├── calendar.tsx
│   │   ├── popover.tsx
│   │   ├── toast.tsx
│   │   └── tabs.tsx
│   ├── forms/
│   │   ├── CurrencyInput.tsx
│   │   ├── CurrencyInput.test.tsx
│   │   ├── DatePicker.tsx
│   │   └── CategorySelect.tsx
│   ├── charts/
│   │   ├── SpendingPieChart.tsx
│   │   ├── TrendLineChart.tsx
│   │   └── BudgetBarChart.tsx
│   └── layout/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── Footer.tsx
│       └── Layout.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   ├── utils.test.ts
│   ├── currency.ts
│   ├── currency.test.ts
│   └── validators.ts
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── transactions/
│   │   ├── index.tsx
│   │   └── new.tsx
│   ├── accounts/
│   │   └── index.tsx
│   ├── budgets/
│   │   └── index.tsx
│   ├── reports/
│   │   └── index.tsx
│   └── settings/
│       └── index.tsx
├── tests/
│   ├── e2e/                         # Playwright E2E tests
│   │   ├── auth.spec.ts
│   │   ├── transactions.spec.ts
│   │   ├── dashboard.spec.ts
│   │   ├── budgets.spec.ts
│   │   └── reports.spec.ts
│   ├── mocks/                       # MSW mock handlers
│   │   ├── handlers/
│   │   │   ├── auth.ts
│   │   │   ├── transactions.ts
│   │   │   ├── accounts.ts
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── fixtures/                    # Test data
│   │   ├── users.ts
│   │   ├── transactions.ts
│   │   └── accounts.ts
│   └── setup.ts
├── types/
│   └── index.ts
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

# Currency API (for live rates)
EXCHANGE_RATE_API_KEY=xxx

# Email (Resend) - https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx  # Get from Resend dashboard
FROM_EMAIL=noreply@yourdomain.com        # Must be verified domain in Resend

# App
APP_URL=http://localhost:3000

# Testing
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

### Setting up Resend

1. Create account at https://resend.com
2. Verify your domain (or use onboarding@resend.dev for testing)
3. Get API key from dashboard
4. Add to `.env` file (NEVER commit this file)

---

## Email Service (Resend)

### Setup

```bash
# Install Resend SDK
bun add resend
```

### Configuration

```typescript
// src/lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export { resend };
```

### Email Templates

#### 1. Group Invitation
```typescript
// src/api/services/email.service.ts
import { resend } from "@/lib/email";

export async function sendGroupInvitation({
  to,
  inviterName,
  groupName,
  token,
}: {
  to: string;
  inviterName: string;
  groupName: string;
  token: string;
}) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: `You're invited to join "${groupName}" on FinanceTracker`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">You've been invited!</h1>
        <p>${inviterName} has invited you to join <strong>"${groupName}"</strong>.</p>
        <p>Click below to accept:</p>
        <a href="${process.env.APP_URL}/invite/${token}"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Accept Invitation
        </a>
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          This invitation expires in 7 days.
        </p>
      </div>
    `,
  });
}
```

#### 2. Budget Alert
```typescript
export async function sendBudgetAlert({
  to,
  categoryName,
  budgetAmount,
  spentAmount,
  percentage,
}: {
  to: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
}) {
  const alertLevel = percentage >= 100 ? "exceeded" : percentage >= 80 ? "approaching" : "warning";
  const color = percentage >= 100 ? "#dc2626" : percentage >= 80 ? "#f59e0b" : "#2563eb";

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: `Budget Alert: ${categoryName} is ${alertLevel} limit`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: ${color};">Budget Alert</h1>
        <p>Your <strong>${categoryName}</strong> budget is at <strong>${percentage}%</strong>.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;">Spent: <strong>£${spentAmount.toFixed(2)}</strong></p>
          <p style="margin: 8px 0 0 0;">Budget: <strong>£${budgetAmount.toFixed(2)}</strong></p>
        </div>
        <a href="${process.env.APP_URL}/budgets"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View Budget
        </a>
      </div>
    `,
  });
}
```

#### 3. Weekly Summary
```typescript
export async function sendWeeklySummary({
  to,
  userName,
  totalSpent,
  currency,
  topCategories,
  weekStartDate,
}: {
  to: string;
  userName: string;
  totalSpent: number;
  currency: string;
  topCategories: { name: string; amount: number }[];
  weekStartDate: string;
}) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: `Your Weekly Spending Summary - ${weekStartDate}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Hi ${userName},</h1>
        <p>Here's your spending summary for the week of ${weekStartDate}:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <h2 style="margin: 0; color: #1a1a1a;">Total Spent</h2>
          <p style="font-size: 32px; font-weight: bold; margin: 8px 0; color: #2563eb;">
            ${currency === 'GBP' ? '£' : 'RM'}${totalSpent.toFixed(2)}
          </p>
        </div>
        <h3>Top Categories</h3>
        <ul style="padding-left: 20px;">
          ${topCategories.map(cat => `
            <li style="margin: 8px 0;">
              ${cat.name}: <strong>${currency === 'GBP' ? '£' : 'RM'}${cat.amount.toFixed(2)}</strong>
            </li>
          `).join('')}
        </ul>
        <a href="${process.env.APP_URL}/reports"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View Full Report
        </a>
      </div>
    `,
  });
}
```

#### 4. Settlement Request
```typescript
export async function sendSettlementRequest({
  to,
  fromUserName,
  amount,
  currency,
  groupName,
}: {
  to: string;
  fromUserName: string;
  amount: number;
  currency: string;
  groupName: string;
}) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to,
    subject: `${fromUserName} requested a settlement`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Settlement Request</h1>
        <p><strong>${fromUserName}</strong> has requested you settle up in <strong>"${groupName}"</strong>.</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 16px 0; text-align: center;">
          <p style="margin: 0; color: #666;">Amount Owed</p>
          <p style="font-size: 32px; font-weight: bold; margin: 8px 0; color: #dc2626;">
            ${currency === 'GBP' ? '£' : 'RM'}${amount.toFixed(2)}
          </p>
        </div>
        <a href="${process.env.APP_URL}/groups"
           style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View & Settle
        </a>
      </div>
    `,
  });
}
```

---

## Implementation Order

### Phase 1: Foundation
1. Initialize project with Bun + Vite + React
2. Set up Hono.js backend with Zod validation
3. Configure Supabase + Drizzle ORM
4. Create database schema with migrations
5. Implement Supabase authentication
6. Set up Tailwind CSS + shadcn/ui
7. Basic responsive layout (mobile-first)

### Phase 2: Groups & Permissions
1. Spending groups CRUD
2. Group membership management
3. Row Level Security (RLS) policies
4. Email invitation system (Resend)
5. Accept/decline invitation flow
6. Role-based permission checks

### Phase 3: Core Features
1. Accounts CRUD (scoped to groups)
2. Categories with London defaults
3. Transactions CRUD with group filtering
4. Quick transaction add form
5. Basic dashboard with group selector

### Phase 4: Multi-Currency
1. Currency conversion service
2. Exchange rate API integration
3. GBP/MYR conversion display
4. Amount display in both currencies

### Phase 5: Analytics & Reports
1. Spending by category charts
2. Monthly/weekly summaries
3. Group spending reports
4. Trends over time
5. Budget tracking

### Phase 6: Testing & Polish
1. Backend unit tests (80% coverage)
2. Frontend component tests
3. Playwright E2E tests
4. Responsive UI refinements
5. Performance optimization

---

## Commands

```bash
# Development
bun run dev          # Start dev server

# Database
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
bun run db:seed      # Seed default categories
bun run db:studio    # Open Drizzle Studio

# Build & Deploy
bun run build        # Production build
bun run start        # Start production

# Testing - Backend
bun test                      # Run all backend unit tests
bun test:watch                # Watch mode for backend tests
bun test:coverage             # Run with coverage report
bun test:integration          # Run API integration tests

# Testing - Frontend
bun run test:frontend         # Run Vitest frontend tests
bun run test:frontend:watch   # Watch mode for frontend
bun run test:frontend:coverage # Frontend coverage

# Testing - E2E
bun run test:e2e              # Run Playwright E2E tests
bun run test:e2e:ui           # Playwright with UI mode
bun run test:e2e:headed       # Run E2E in headed browser

# All Tests
bun run test:all              # Run all tests (unit + integration + e2e)

# Linting & Formatting
bun run lint                  # Run ESLint
bun run format                # Run Prettier
bun run typecheck             # TypeScript type checking
```

---

## Available Agents

Use these specialized agents for complex tasks:

| Agent | Use For |
|-------|---------|
| `api-designer` | REST API design, endpoint patterns, OpenAPI specs |
| `backend-developer` | Hono.js routes, services, business logic |
| `frontend-developer` | React components, TanStack Router pages, shadcn/ui components |
| `typescript-pro` | Advanced types, Zod schemas, type-safe patterns |
| `database-architect` | Drizzle schema, migrations, query optimization |
| `security-auditor` | Auth patterns, OWASP checks, security review |
| `devops-engineer` | Docker, CI/CD, GitHub Actions |

### Agent Usage Guidelines

**Always use agents for:**
- Creating new API routes → `backend-developer`
- Building UI components → `frontend-developer` + `frontend-dev-guidelines` skill
- Designing database schema → `database-architect`
- Writing complex TypeScript → `typescript-pro`
- Security review before deploy → `security-auditor`

---

## Available Skills

### Stack-Specific (Always Reference)
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `hono-patterns` | Routes, middleware, validation, auth | Every API route |
| `supabase-patterns` | Auth, storage, RLS policies | Auth & data access |
| `tanstack-router-patterns` | File routing, loaders, navigation | Every page/route |
| `database-migrations` | Drizzle migrations, safe changes | Schema changes |

### UI & Styling (Always Reference)
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `frontend-dev-guidelines` | React patterns, Suspense, data fetching | Every component |
| `frontend-design` | UI/UX, creative interfaces | Building new pages |

### Testing (Always Reference)
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `testing-patterns` | Unit/integration tests, mocking | Writing any test |
| `testing-e2e-playwright` | Playwright E2E, page objects, MSW | E2E test creation |
| `running-e2e-tests` | E2E execution and reporting | Running E2E suite |

### DevOps & CI/CD
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `docker-patterns` | Dockerfile, multi-stage builds | Containerization |
| `github-actions-templates` | CI/CD workflows | Setting up pipelines |

### Code Quality
| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `git-workflow` | Commits, branching | Every commit |
| `code-review-checklist` | PR review | Before merge |
| `security-checklist` | XSS/SQLi prevention | Security review |
| `performance-optimization` | Caching, optimization | Performance work |
| `debugging-guide` | Troubleshooting | Fixing bugs |

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
- Dark mode support built-in

### API (Hono.js)
- Use `zValidator` for input validation
- Proper HTTP status codes
- Thin handlers, delegate to services
- Always write integration tests

### Database (Drizzle + Supabase)
- Drizzle for all queries
- Supabase client for auth/storage/realtime only
- UUID primary keys
- Include `createdAt`/`updatedAt` timestamps
- Write migration tests

### Testing Requirements
- **Every service**: Unit tests (80%+ coverage)
- **Every API route**: Integration tests
- **Every component**: Component tests
- **Critical flows**: E2E tests (auth, transactions, reports)
- **Before merge**: All tests must pass

### Git
- Branches: `feature/`, `fix/`, `chore/`
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`
- Squash merge to main
- Run `bun run test:all` before push
