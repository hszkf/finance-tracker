import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  date,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { spendingGroups } from "./spending-groups";
import { accounts } from "./accounts";
import { categories } from "./categories";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "expense",
  "income",
  "transfer",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: uuid("group_id").references(() => spendingGroups.id, {
    onDelete: "set null",
  }),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  type: transactionTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 19, scale: 4 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  amountInBase: numeric("amount_in_base", { precision: 19, scale: 4 }),
  exchangeRate: numeric("exchange_rate", { precision: 19, scale: 10 }),
  description: varchar("description", { length: 500 }),
  date: date("date", { mode: "date" }).notNull(),
  notes: text("notes"),
  location: varchar("location", { length: 500 }),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringId: uuid("recurring_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
