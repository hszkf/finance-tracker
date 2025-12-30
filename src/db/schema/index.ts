import { relations } from "drizzle-orm";

// Export all tables
export { users } from "./users";
export type { User, NewUser } from "./users";

export { spendingGroups } from "./spending-groups";
export type { SpendingGroup, NewSpendingGroup } from "./spending-groups";

export { groupMembers, groupMemberRoleEnum } from "./group-members";
export type { GroupMember, NewGroupMember } from "./group-members";

export { groupInvitations, invitationStatusEnum } from "./group-invitations";
export type { GroupInvitation, NewGroupInvitation } from "./group-invitations";

export { accounts, accountTypeEnum } from "./accounts";
export type { Account, NewAccount } from "./accounts";

export { categories, categoryTypeEnum } from "./categories";
export type { Category, NewCategory } from "./categories";

export { transactions, transactionTypeEnum } from "./transactions";
export type { Transaction, NewTransaction } from "./transactions";

export { budgets, budgetPeriodEnum } from "./budgets";
export type { Budget, NewBudget } from "./budgets";

export {
  recurringTransactions,
  recurringFrequencyEnum,
} from "./recurring-transactions";
export type {
  RecurringTransaction,
  NewRecurringTransaction,
} from "./recurring-transactions";

export { exchangeRates } from "./exchange-rates";
export type { ExchangeRate, NewExchangeRate } from "./exchange-rates";

export { transactionSplits } from "./transaction-splits";
export type { TransactionSplit, NewTransactionSplit } from "./transaction-splits";

export { settlements, settlementStatusEnum } from "./settlements";
export type { Settlement, NewSettlement } from "./settlements";

export { notifications, notificationTypeEnum } from "./notifications";
export type { Notification, NewNotification } from "./notifications";

export { userPreferences, themeEnum } from "./user-preferences";
export type { UserPreference, NewUserPreference } from "./user-preferences";

// Import tables for relations
import { users } from "./users";
import { spendingGroups } from "./spending-groups";
import { groupMembers } from "./group-members";
import { groupInvitations } from "./group-invitations";
import { accounts } from "./accounts";
import { categories } from "./categories";
import { transactions } from "./transactions";
import { budgets } from "./budgets";
import { recurringTransactions } from "./recurring-transactions";
import { transactionSplits } from "./transaction-splits";
import { settlements } from "./settlements";
import { notifications } from "./notifications";
import { userPreferences } from "./user-preferences";

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  createdGroups: many(spendingGroups),
  groupMemberships: many(groupMembers),
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
  recurringTransactions: many(recurringTransactions),
  transactionSplits: many(transactionSplits),
  sentSettlements: many(settlements, { relationName: "fromUser" }),
  receivedSettlements: many(settlements, { relationName: "toUser" }),
  notifications: many(notifications),
  sentInvitations: many(groupInvitations),
}));

export const spendingGroupsRelations = relations(
  spendingGroups,
  ({ one, many }) => ({
    creator: one(users, {
      fields: [spendingGroups.createdBy],
      references: [users.id],
    }),
    members: many(groupMembers),
    invitations: many(groupInvitations),
    accounts: many(accounts),
    transactions: many(transactions),
    settlements: many(settlements),
  })
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(spendingGroups, {
    fields: [groupMembers.groupId],
    references: [spendingGroups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
  inviter: one(users, {
    fields: [groupMembers.invitedBy],
    references: [users.id],
  }),
}));

export const groupInvitationsRelations = relations(
  groupInvitations,
  ({ one }) => ({
    group: one(spendingGroups, {
      fields: [groupInvitations.groupId],
      references: [spendingGroups.id],
    }),
    inviter: one(users, {
      fields: [groupInvitations.invitedBy],
      references: [users.id],
    }),
  })
);

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
  group: one(spendingGroups, {
    fields: [accounts.groupId],
    references: [spendingGroups.id],
  }),
  transactions: many(transactions),
  recurringTransactions: many(recurringTransactions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentChild",
  }),
  children: many(categories, {
    relationName: "parentChild",
  }),
  transactions: many(transactions),
  budgets: many(budgets),
  recurringTransactions: many(recurringTransactions),
}));

export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
    group: one(spendingGroups, {
      fields: [transactions.groupId],
      references: [spendingGroups.id],
    }),
    account: one(accounts, {
      fields: [transactions.accountId],
      references: [accounts.id],
    }),
    category: one(categories, {
      fields: [transactions.categoryId],
      references: [categories.id],
    }),
    recurring: one(recurringTransactions, {
      fields: [transactions.recurringId],
      references: [recurringTransactions.id],
    }),
    splits: many(transactionSplits),
  })
);

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));

export const recurringTransactionsRelations = relations(
  recurringTransactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [recurringTransactions.userId],
      references: [users.id],
    }),
    account: one(accounts, {
      fields: [recurringTransactions.accountId],
      references: [accounts.id],
    }),
    category: one(categories, {
      fields: [recurringTransactions.categoryId],
      references: [categories.id],
    }),
    generatedTransactions: many(transactions),
  })
);

export const transactionSplitsRelations = relations(
  transactionSplits,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [transactionSplits.transactionId],
      references: [transactions.id],
    }),
    user: one(users, {
      fields: [transactionSplits.userId],
      references: [users.id],
    }),
  })
);

export const settlementsRelations = relations(settlements, ({ one }) => ({
  group: one(spendingGroups, {
    fields: [settlements.groupId],
    references: [spendingGroups.id],
  }),
  fromUser: one(users, {
    fields: [settlements.fromUserId],
    references: [users.id],
    relationName: "fromUser",
  }),
  toUser: one(users, {
    fields: [settlements.toUserId],
    references: [users.id],
    relationName: "toUser",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(
  userPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userPreferences.userId],
      references: [users.id],
    }),
  })
);
