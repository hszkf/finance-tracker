import {
  pgTable,
  uuid,
  varchar,
  numeric,
  date,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const exchangeRates = pgTable(
  "exchange_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
    toCurrency: varchar("to_currency", { length: 3 }).notNull(),
    rate: numeric("rate", { precision: 19, scale: 10 }).notNull(),
    date: date("date", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("exchange_rates_currencies_date_unique").on(
      table.fromCurrency,
      table.toCurrency,
      table.date
    ),
  ]
);

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;
