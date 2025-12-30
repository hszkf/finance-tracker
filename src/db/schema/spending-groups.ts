import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const spendingGroups = pgTable("spending_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 7 }),
  isPersonal: boolean("is_personal").notNull().default(false),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type SpendingGroup = typeof spendingGroups.$inferSelect;
export type NewSpendingGroup = typeof spendingGroups.$inferInsert;
