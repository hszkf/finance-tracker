import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string from environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client
// For Supabase, we use transaction mode pooler (port 6543)
// For session mode or direct connection, adjust accordingly
const client = postgres(connectionString, {
  max: 10, // Maximum number of connections in the pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Connection timeout in seconds
  prepare: false, // Required for Supabase transaction mode pooler
});

// Create drizzle database instance with schema
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// Export schema for convenience
export * from "./schema";

// Export types
export type Database = typeof db;
