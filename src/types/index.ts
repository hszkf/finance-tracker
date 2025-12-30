// Currency types
export type Currency = "GBP" | "MYR";

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  baseCurrency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

// Account types
export type AccountType = "bank" | "credit_card" | "cash" | "ewallet";

export interface Account {
  id: string;
  userId: string;
  groupId: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  icon: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category types
export type CategoryType = "expense" | "income";

export interface Category {
  id: string;
  userId: string;
  name: string;
  icon: string | null;
  color: string | null;
  type: CategoryType;
  parentId: string | null;
}

// Transaction types
export type TransactionType = "expense" | "income" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  groupId: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  amountInBase: number | null;
  exchangeRate: number | null;
  description: string | null;
  date: Date;
  notes: string | null;
  location: string | null;
  isRecurring: boolean;
  recurringId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Group types
export type GroupRole = "owner" | "admin" | "member" | "viewer";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface SpendingGroup {
  id: string;
  name: string;
  description: string | null;
  currency: Currency;
  icon: string | null;
  color: string | null;
  isPersonal: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
  invitedBy: string | null;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string;
  role: GroupRole;
  token: string;
  invitedBy: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

// Budget types
export type BudgetPeriod = "weekly" | "monthly" | "yearly";

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  period: BudgetPeriod;
  startDate: Date;
  createdAt: Date;
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  category: Category;
}

// Split and Settlement types
export type SettlementStatus = "pending" | "paid" | "cancelled";

export interface TransactionSplit {
  id: string;
  transactionId: string;
  userId: string;
  amount: number;
  currency: Currency;
  isPaid: boolean;
  paidAt: Date | null;
  createdAt: Date;
}

export interface Settlement {
  id: string;
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: Currency;
  status: SettlementStatus;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export type NotificationType =
  | "budget_alert"
  | "bill_reminder"
  | "group_activity"
  | "settlement_request";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

// User Preferences types
export type Theme = "light" | "dark" | "system";

export interface UserPreferences {
  id: string;
  userId: string;
  theme: Theme;
  emailWeeklySummary: boolean;
  emailBudgetAlerts: boolean;
  pushNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardSummary {
  totalSpending: number;
  monthlyBudget: number;
  remainingBudget: number;
  topCategory: { name: string; amount: number } | null;
  recentTransactions: Transaction[];
  spendingByCategory: { category: string; amount: number; color: string }[];
}

// Report types
export interface SpendingTrend {
  date: string;
  amount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

// Balance types (for group settlements)
export interface GroupBalance {
  userId: string;
  userName: string;
  owes: { toUserId: string; toUserName: string; amount: number }[];
  isOwed: { fromUserId: string; fromUserName: string; amount: number }[];
  netBalance: number;
}
