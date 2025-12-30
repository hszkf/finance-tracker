import { db } from "./index";
import { categories } from "./schema/categories";

const DEFAULT_CATEGORIES = [
  // Expense categories
  { name: "Transport", icon: "train", color: "#3b82f6", type: "expense" as const },
  { name: "Food & Dining", icon: "utensils", color: "#ef4444", type: "expense" as const },
  { name: "Groceries", icon: "shopping-cart", color: "#f97316", type: "expense" as const },
  { name: "Housing", icon: "home", color: "#8b5cf6", type: "expense" as const },
  { name: "Utilities", icon: "zap", color: "#eab308", type: "expense" as const },
  { name: "Entertainment", icon: "tv", color: "#ec4899", type: "expense" as const },
  { name: "Shopping", icon: "shopping-bag", color: "#06b6d4", type: "expense" as const },
  { name: "Health", icon: "heart", color: "#10b981", type: "expense" as const },
  { name: "Travel", icon: "plane", color: "#6366f1", type: "expense" as const },
  { name: "Bills", icon: "file-text", color: "#64748b", type: "expense" as const },
  { name: "Subscriptions", icon: "repeat", color: "#a855f7", type: "expense" as const },
  { name: "Education", icon: "book", color: "#0ea5e9", type: "expense" as const },
  { name: "Personal Care", icon: "smile", color: "#f472b6", type: "expense" as const },
  { name: "Gifts", icon: "gift", color: "#fb923c", type: "expense" as const },
  { name: "Other", icon: "more-horizontal", color: "#94a3b8", type: "expense" as const },

  // Income categories
  { name: "Salary", icon: "briefcase", color: "#22c55e", type: "income" as const },
  { name: "Freelance", icon: "laptop", color: "#14b8a6", type: "income" as const },
  { name: "Investments", icon: "trending-up", color: "#84cc16", type: "income" as const },
  { name: "Gifts Received", icon: "gift", color: "#f59e0b", type: "income" as const },
  { name: "Refunds", icon: "rotate-ccw", color: "#0891b2", type: "income" as const },
  { name: "Other Income", icon: "plus-circle", color: "#65a30d", type: "income" as const },
];

async function seed() {
  console.log("Seeding database...");

  try {
    // Insert default categories (system categories without userId)
    for (const category of DEFAULT_CATEGORIES) {
      await db
        .insert(categories)
        .values({
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
          userId: null, // System categories have no user
        })
        .onConflictDoNothing();
    }

    console.log("Seeded default categories");
    console.log("Database seeding complete!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
