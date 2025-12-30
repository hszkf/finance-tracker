import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:3001/api";

// Mock data
const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  baseCurrency: "GBP",
};

const mockAccounts = [
  {
    id: "account-1",
    name: "Monzo",
    type: "bank",
    currency: "GBP",
    balance: 1500.0,
    isActive: true,
  },
  {
    id: "account-2",
    name: "Cash",
    type: "cash",
    currency: "GBP",
    balance: 50.0,
    isActive: true,
  },
];

const mockCategories = [
  { id: "cat-1", name: "Transport", type: "expense", icon: "train", color: "#3b82f6" },
  { id: "cat-2", name: "Food & Dining", type: "expense", icon: "utensils", color: "#ef4444" },
  { id: "cat-3", name: "Salary", type: "income", icon: "wallet", color: "#22c55e" },
];

const mockTransactions = [
  {
    id: "tx-1",
    amount: 2.8,
    currency: "GBP",
    description: "Tube to work",
    date: new Date().toISOString(),
    type: "expense",
    categoryId: "cat-1",
    accountId: "account-1",
  },
  {
    id: "tx-2",
    amount: 15.5,
    currency: "GBP",
    description: "Lunch at Pret",
    date: new Date().toISOString(),
    type: "expense",
    categoryId: "cat-2",
    accountId: "account-1",
  },
];

const mockGroups = [
  { id: "group-1", name: "Personal", isPersonal: true, currency: "GBP" },
  { id: "group-2", name: "Flat Expenses", isPersonal: false, currency: "GBP" },
];

export const handlers = [
  // Auth handlers
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({ data: mockUser });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({ data: { user: mockUser, token: "mock-token" } });
    }
    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name: string };
    return HttpResponse.json({
      data: { user: { ...mockUser, email: body.email, name: body.name } },
    });
  }),

  http.post(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json({ data: { success: true } });
  }),

  // Account handlers
  http.get(`${API_URL}/accounts`, () => {
    return HttpResponse.json({ data: mockAccounts });
  }),

  http.post(`${API_URL}/accounts`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: "new-account-id", ...body },
    });
  }),

  http.get(`${API_URL}/accounts/:id`, ({ params }) => {
    const account = mockAccounts.find((a) => a.id === params.id);
    if (!account) {
      return HttpResponse.json({ error: "Account not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: account });
  }),

  // Category handlers
  http.get(`${API_URL}/categories`, () => {
    return HttpResponse.json({ data: mockCategories });
  }),

  http.post(`${API_URL}/categories`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: "new-category-id", ...body },
    });
  }),

  // Transaction handlers
  http.get(`${API_URL}/transactions`, () => {
    return HttpResponse.json({
      data: mockTransactions,
      total: mockTransactions.length,
      page: 1,
      pageSize: 20,
    });
  }),

  http.post(`${API_URL}/transactions`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: "new-tx-id", ...body, createdAt: new Date().toISOString() },
    });
  }),

  http.get(`${API_URL}/transactions/:id`, ({ params }) => {
    const tx = mockTransactions.find((t) => t.id === params.id);
    if (!tx) {
      return HttpResponse.json({ error: "Transaction not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: tx });
  }),

  http.put(`${API_URL}/transactions/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: params.id, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete(`${API_URL}/transactions/:id`, () => {
    return HttpResponse.json({ data: { success: true } });
  }),

  // Group handlers
  http.get(`${API_URL}/groups`, () => {
    return HttpResponse.json({ data: mockGroups });
  }),

  http.post(`${API_URL}/groups`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: "new-group-id", ...body, isPersonal: false },
    });
  }),

  http.get(`${API_URL}/groups/:id`, ({ params }) => {
    const group = mockGroups.find((g) => g.id === params.id);
    if (!group) {
      return HttpResponse.json({ error: "Group not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: group });
  }),

  // Budget handlers
  http.get(`${API_URL}/budgets`, () => {
    return HttpResponse.json({
      data: [
        {
          id: "budget-1",
          categoryId: "cat-1",
          amount: 100,
          period: "monthly",
          spent: 45,
          percentage: 45,
        },
        {
          id: "budget-2",
          categoryId: "cat-2",
          amount: 300,
          period: "monthly",
          spent: 180,
          percentage: 60,
        },
      ],
    });
  }),

  http.get(`${API_URL}/budgets/status`, () => {
    return HttpResponse.json({
      data: {
        totalBudget: 400,
        totalSpent: 225,
        percentage: 56,
        categories: [
          { categoryId: "cat-1", name: "Transport", budget: 100, spent: 45, percentage: 45 },
          { categoryId: "cat-2", name: "Food & Dining", budget: 300, spent: 180, percentage: 60 },
        ],
      },
    });
  }),

  // Notification handlers
  http.get(`${API_URL}/notifications`, () => {
    return HttpResponse.json({
      data: [
        {
          id: "notif-1",
          type: "budget_alert",
          title: "Budget Alert",
          message: "Food budget at 80%",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }),

  http.put(`${API_URL}/notifications/:id/read`, () => {
    return HttpResponse.json({ data: { success: true } });
  }),

  // Preferences handlers
  http.get(`${API_URL}/preferences`, () => {
    return HttpResponse.json({
      data: {
        theme: "system",
        emailWeeklySummary: true,
        emailBudgetAlerts: true,
        pushNotifications: true,
      },
    });
  }),

  http.put(`${API_URL}/preferences`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ data: body });
  }),
];
