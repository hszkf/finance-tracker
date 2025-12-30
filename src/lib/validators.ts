import { z } from "zod";

// Auth validators
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Account validators
export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["bank", "credit_card", "cash", "ewallet"]),
  currency: z.enum(["GBP", "MYR"]),
  balance: z.number().default(0),
  groupId: z.string().uuid().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

// Transaction validators
export const createTransactionSchema = z.object({
  accountId: z.string().uuid("Invalid account ID"),
  categoryId: z.string().uuid("Invalid category ID"),
  type: z.enum(["expense", "income", "transfer"]),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["GBP", "MYR"]),
  description: z.string().optional(),
  date: z.string().or(z.date()),
  notes: z.string().optional(),
  location: z.string().optional(),
  groupId: z.string().uuid().optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  type: z.enum(["expense", "income", "transfer"]).optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
});

// Category validators
export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["expense", "income"]),
  icon: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Budget validators
export const createBudgetSchema = z.object({
  categoryId: z.string().uuid("Invalid category ID"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["GBP", "MYR"]).default("GBP"),
  period: z.enum(["weekly", "monthly", "yearly"]),
  startDate: z.string().or(z.date()).optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Group validators
export const createGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().optional(),
  currency: z.enum(["GBP", "MYR"]).default("GBP"),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const inviteToGroupSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

// Split validators
export const createSplitSchema = z.object({
  splits: z.array(
    z.object({
      userId: z.string().uuid("Invalid user ID"),
      amount: z.number().positive("Amount must be positive"),
    })
  ),
});

// Settlement validators
export const createSettlementSchema = z.object({
  groupId: z.string().uuid("Invalid group ID"),
  toUserId: z.string().uuid("Invalid user ID"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["GBP", "MYR"]),
  notes: z.string().optional(),
});

// Preferences validators
export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailWeeklySummary: z.boolean().optional(),
  emailBudgetAlerts: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

// Export types from schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFiltersInput = z.infer<typeof transactionFiltersSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type InviteToGroupInput = z.infer<typeof inviteToGroupSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
export type CreateSplitInput = z.infer<typeof createSplitSchema>;
export type CreateSettlementInput = z.infer<typeof createSettlementSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
