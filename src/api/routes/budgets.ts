import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { db, budgets, transactions, notifications } from "@/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";

const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/, "Invalid amount format"),
  currency: z.string().length(3),
  period: z.enum(["weekly", "monthly", "yearly"]),
  startDate: z.string(), // Date string in YYYY-MM-DD format
});

const updateBudgetSchema = z.object({
  categoryId: z.string().uuid().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  currency: z.string().length(3).optional(),
  period: z.enum(["weekly", "monthly", "yearly"]).optional(),
  startDate: z.string().optional(),
});

const querySchema = z.object({
  categoryId: z.string().uuid().optional(),
  period: z.enum(["weekly", "monthly", "yearly"]).optional(),
});

const budgetsRoute = new Hono();

// Helper function to get period dates
function getPeriodDates(
  period: "weekly" | "monthly" | "yearly",
  startDate: Date
): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(startDate);
  let end: Date;

  switch (period) {
    case "weekly":
      // Find the current week's start based on original start date
      const daysSinceStart = Math.floor(
        (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const currentWeekStart = Math.floor(daysSinceStart / 7) * 7;
      start.setDate(start.getDate() + currentWeekStart);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      break;
    case "monthly":
      // Current month
      start.setFullYear(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      break;
    case "yearly":
      // Current year
      start.setFullYear(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      break;
  }

  return { start, end };
}

// GET / - List budgets
budgetsRoute.get("/", requireAuth, zValidator("query", querySchema), async (c) => {
  const user = c.get("user");
  const { categoryId, period } = c.req.valid("query");

  try {
    const conditions = [eq(budgets.userId, user.id)];

    if (categoryId) {
      conditions.push(eq(budgets.categoryId, categoryId));
    }

    if (period) {
      conditions.push(eq(budgets.period, period));
    }

    const result = await db.query.budgets.findMany({
      where: and(...conditions),
      with: {
        category: true,
      },
      orderBy: (budgets, { desc }) => [desc(budgets.createdAt)],
    });

    return c.json({ budgets: result });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch budgets" });
  }
});

// POST / - Create budget
budgetsRoute.post("/", requireAuth, zValidator("json", createBudgetSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  try {
    // Check if budget already exists for this category and period
    const existingBudget = await db.query.budgets.findFirst({
      where: and(
        eq(budgets.userId, user.id),
        eq(budgets.categoryId, data.categoryId),
        eq(budgets.period, data.period)
      ),
    });

    if (existingBudget) {
      throw new HTTPException(409, {
        message: "Budget already exists for this category and period",
      });
    }

    const [budget] = await db
      .insert(budgets)
      .values({
        ...data,
        userId: user.id,
        startDate: new Date(data.startDate),
      })
      .returning();

    const result = await db.query.budgets.findFirst({
      where: eq(budgets.id, budget.id),
      with: {
        category: true,
      },
    });

    return c.json({ budget: result }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to create budget" });
  }
});

// GET /:id - Get budget
budgetsRoute.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const budgetId = c.req.param("id");

  try {
    const budget = await db.query.budgets.findFirst({
      where: eq(budgets.id, budgetId),
      with: {
        category: true,
      },
    });

    if (!budget) {
      throw new HTTPException(404, { message: "Budget not found" });
    }

    if (budget.userId !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to view this budget" });
    }

    return c.json({ budget });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to fetch budget" });
  }
});

// PUT /:id - Update budget
budgetsRoute.put(
  "/:id",
  requireAuth,
  zValidator("json", updateBudgetSchema),
  async (c) => {
    const user = c.get("user");
    const budgetId = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const existingBudget = await db.query.budgets.findFirst({
        where: eq(budgets.id, budgetId),
      });

      if (!existingBudget) {
        throw new HTTPException(404, { message: "Budget not found" });
      }

      if (existingBudget.userId !== user.id) {
        throw new HTTPException(403, { message: "Not authorized to update this budget" });
      }

      const { startDate, ...restData } = data;
      const [updated] = await db
        .update(budgets)
        .set({
          ...restData,
          ...(startDate && { startDate: new Date(startDate) }),
        })
        .where(eq(budgets.id, budgetId))
        .returning();

      const result = await db.query.budgets.findFirst({
        where: eq(budgets.id, updated.id),
        with: {
          category: true,
        },
      });

      return c.json({ budget: result });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to update budget" });
    }
  }
);

// DELETE /:id - Delete budget
budgetsRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const budgetId = c.req.param("id");

  try {
    const existingBudget = await db.query.budgets.findFirst({
      where: eq(budgets.id, budgetId),
    });

    if (!existingBudget) {
      throw new HTTPException(404, { message: "Budget not found" });
    }

    if (existingBudget.userId !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to delete this budget" });
    }

    await db.delete(budgets).where(eq(budgets.id, budgetId));

    return c.json({ message: "Budget deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete budget" });
  }
});

// GET /status - Budget vs actual
budgetsRoute.get("/status", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    const activeBudgets = await db.query.budgets.findMany({
      where: eq(budgets.userId, user.id),
      with: {
        category: true,
      },
    });

    const statusResults = await Promise.all(
      activeBudgets.map(async (budget) => {
        const { start, end } = getPeriodDates(
          budget.period as "weekly" | "monthly" | "yearly",
          budget.startDate
        );

        // Calculate actual spending
        const conditions = [
          eq(transactions.userId, user.id),
          eq(transactions.type, "expense"),
          eq(transactions.categoryId, budget.categoryId),
          gte(transactions.date, start),
          lte(transactions.date, end),
        ];

        const [spendingResult] = await db
          .select({
            total: sql<string>`COALESCE(SUM(${transactions.amount}), 0)`,
          })
          .from(transactions)
          .where(and(...conditions));

        const spent = Number(spendingResult.total);
        const budgetAmount = Number(budget.amount);
        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
        const remaining = budgetAmount - spent;

        // Check if threshold exceeded (80%) and create notification
        if (percentage >= 80 && percentage < 100) {
          // Check if we already sent a notification for this period
          const existingNotification = await db.query.notifications.findFirst({
            where: and(
              eq(notifications.userId, user.id),
              eq(notifications.type, "budget_alert"),
              gte(notifications.createdAt, start)
            ),
          });

          if (!existingNotification) {
            await db.insert(notifications).values({
              userId: user.id,
              type: "budget_alert",
              title: "Budget Alert",
              message: `You've used ${percentage.toFixed(0)}% of your "${budget.category?.name}" budget`,
              data: {
                budgetId: budget.id,
                spent,
                budgetAmount,
                percentage,
              },
            });
          }
        }

        return {
          budget: {
            id: budget.id,
            amount: budget.amount,
            currency: budget.currency,
            period: budget.period,
            category: budget.category,
          },
          period: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
          actual: {
            spent: spent.toFixed(2),
            remaining: remaining.toFixed(2),
            percentage: percentage.toFixed(1),
          },
          status:
            percentage >= 100
              ? "exceeded"
              : percentage >= 80
                ? "warning"
                : "on_track",
        };
      })
    );

    // Summary statistics
    const totalBudget = activeBudgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = statusResults.reduce(
      (sum, s) => sum + Number(s.actual.spent),
      0
    );
    const overBudgetCount = statusResults.filter((s) => s.status === "exceeded").length;
    const warningCount = statusResults.filter((s) => s.status === "warning").length;

    return c.json({
      budgets: statusResults,
      summary: {
        totalBudget: totalBudget.toFixed(2),
        totalSpent: totalSpent.toFixed(2),
        totalRemaining: (totalBudget - totalSpent).toFixed(2),
        overallPercentage: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : "0",
        budgetCount: activeBudgets.length,
        overBudgetCount,
        warningCount,
        onTrackCount: activeBudgets.length - overBudgetCount - warningCount,
      },
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch budget status" });
  }
});

export { budgetsRoute };
