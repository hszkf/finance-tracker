import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import {
  db,
  transactions,
  accounts,
  groupMembers,
  transactionSplits,
  notifications,
} from "@/db";
import { eq, and, or, gte, lte, inArray, sql } from "drizzle-orm";

const createTransactionSchema = z.object({
  accountId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/, "Invalid amount format"),
  currency: z.string().length(3),
  amountInBase: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  exchangeRate: z.string().regex(/^\d+(\.\d{1,10})?$/).optional(),
  description: z.string().max(500).optional(),
  date: z.string(), // Date string in YYYY-MM-DD format
  notes: z.string().max(1000).optional(),
  location: z.string().max(500).optional(),
  isRecurring: z.boolean().default(false),
});

const updateTransactionSchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  groupId: z.string().uuid().nullable().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  currency: z.string().length(3).optional(),
  amountInBase: z.string().regex(/^\d+(\.\d{1,4})?$/).optional(),
  exchangeRate: z.string().regex(/^\d+(\.\d{1,10})?$/).optional(),
  description: z.string().max(500).optional(),
  date: z.string().optional(),
  notes: z.string().max(1000).optional(),
  location: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(),
});

const splitTransactionSchema = z.object({
  splits: z.array(
    z.object({
      userId: z.string().uuid(),
      amount: z.string().regex(/^\d+(\.\d{1,4})?$/),
    })
  ),
});

const querySchema = z.object({
  accountId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  type: z.enum(["income", "expense", "transfer"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().transform(Number).default("50"),
  offset: z.string().transform(Number).default("0"),
});

const transactionsRoute = new Hono();

// GET / - List transactions with filters
transactionsRoute.get("/", requireAuth, zValidator("query", querySchema), async (c) => {
  const user = c.get("user");
  const { accountId, categoryId, groupId, type, startDate, endDate, limit, offset } =
    c.req.valid("query");

  try {
    // Get user's group memberships
    const userGroups = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, user.id),
    });
    const groupIds = userGroups.map((g) => g.groupId);

    const conditions = [
      or(
        eq(transactions.userId, user.id),
        groupIds.length > 0 ? inArray(transactions.groupId, groupIds) : undefined
      ),
    ].filter(Boolean);

    if (accountId) {
      conditions.push(eq(transactions.accountId, accountId));
    }

    if (categoryId) {
      conditions.push(eq(transactions.categoryId, categoryId));
    }

    if (groupId) {
      conditions.push(eq(transactions.groupId, groupId));
    }

    if (type) {
      conditions.push(eq(transactions.type, type));
    }

    if (startDate) {
      conditions.push(gte(transactions.date, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(transactions.date, new Date(endDate)));
    }

    const result = await db.query.transactions.findMany({
      where: and(...conditions),
      with: {
        account: true,
        category: true,
        group: true,
        splits: {
          with: {
            user: true,
          },
        },
      },
      orderBy: (transactions, { desc }) => [desc(transactions.date)],
      limit,
      offset,
    });

    // Get total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(and(...conditions));

    return c.json({
      transactions: result,
      pagination: {
        total: Number(countResult.count),
        limit,
        offset,
      },
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch transactions" });
  }
});

// POST / - Create transaction
transactionsRoute.post(
  "/",
  requireAuth,
  zValidator("json", createTransactionSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    try {
      // Verify account ownership or group membership
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.id, data.accountId),
      });

      if (!account) {
        throw new HTTPException(404, { message: "Account not found" });
      }

      if (account.userId !== user.id) {
        if (!account.groupId) {
          throw new HTTPException(403, { message: "Not authorized to use this account" });
        }

        const membership = await db.query.groupMembers.findFirst({
          where: and(
            eq(groupMembers.groupId, account.groupId),
            eq(groupMembers.userId, user.id)
          ),
        });

        if (!membership) {
          throw new HTTPException(403, { message: "Not authorized to use this account" });
        }
      }

      // Verify group membership if groupId provided
      if (data.groupId) {
        const membership = await db.query.groupMembers.findFirst({
          where: and(
            eq(groupMembers.groupId, data.groupId),
            eq(groupMembers.userId, user.id)
          ),
        });

        if (!membership) {
          throw new HTTPException(403, { message: "Not a member of this group" });
        }
      }

      const [transaction] = await db
        .insert(transactions)
        .values({
          ...data,
          userId: user.id,
          date: new Date(data.date),
        })
        .returning();

      // Update account balance
      const balanceChange =
        data.type === "income" ? Number(data.amount) : -Number(data.amount);
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${balanceChange}`,
        })
        .where(eq(accounts.id, data.accountId));

      const result = await db.query.transactions.findFirst({
        where: eq(transactions.id, transaction.id),
        with: {
          account: true,
          category: true,
          group: true,
        },
      });

      return c.json({ transaction: result }, 201);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to create transaction" });
    }
  }
);

// GET /:id - Get transaction
transactionsRoute.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const transactionId = c.req.param("id");

  try {
    const transaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId),
      with: {
        account: true,
        category: true,
        group: true,
        splits: {
          with: {
            user: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new HTTPException(404, { message: "Transaction not found" });
    }

    // Check ownership or group membership
    if (transaction.userId !== user.id) {
      if (!transaction.groupId) {
        throw new HTTPException(403, {
          message: "Not authorized to view this transaction",
        });
      }

      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, transaction.groupId),
          eq(groupMembers.userId, user.id)
        ),
      });

      if (!membership) {
        throw new HTTPException(403, {
          message: "Not authorized to view this transaction",
        });
      }
    }

    return c.json({ transaction });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to fetch transaction" });
  }
});

// PUT /:id - Update transaction
transactionsRoute.put(
  "/:id",
  requireAuth,
  zValidator("json", updateTransactionSchema),
  async (c) => {
    const user = c.get("user");
    const transactionId = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const existingTransaction = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
      });

      if (!existingTransaction) {
        throw new HTTPException(404, { message: "Transaction not found" });
      }

      // Check ownership
      if (existingTransaction.userId !== user.id) {
        throw new HTTPException(403, {
          message: "Not authorized to update this transaction",
        });
      }

      // Revert old balance change
      const oldBalanceChange =
        existingTransaction.type === "income"
          ? -Number(existingTransaction.amount)
          : Number(existingTransaction.amount);
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${oldBalanceChange}`,
        })
        .where(eq(accounts.id, existingTransaction.accountId));

      // Update transaction
      const { date, ...restData } = data;
      const [updated] = await db
        .update(transactions)
        .set({
          ...restData,
          ...(date && { date: new Date(date) }),
        })
        .where(eq(transactions.id, transactionId))
        .returning();

      // Apply new balance change
      const newType = data.type || existingTransaction.type;
      const newAmount = data.amount || existingTransaction.amount;
      const newAccountId = data.accountId || existingTransaction.accountId;
      const newBalanceChange =
        newType === "income" ? Number(newAmount) : -Number(newAmount);
      await db
        .update(accounts)
        .set({
          balance: sql`${accounts.balance} + ${newBalanceChange}`,
        })
        .where(eq(accounts.id, newAccountId));

      const result = await db.query.transactions.findFirst({
        where: eq(transactions.id, updated.id),
        with: {
          account: true,
          category: true,
          group: true,
        },
      });

      return c.json({ transaction: result });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to update transaction" });
    }
  }
);

// DELETE /:id - Delete transaction
transactionsRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const transactionId = c.req.param("id");

  try {
    const existingTransaction = await db.query.transactions.findFirst({
      where: eq(transactions.id, transactionId),
    });

    if (!existingTransaction) {
      throw new HTTPException(404, { message: "Transaction not found" });
    }

    // Check ownership
    if (existingTransaction.userId !== user.id) {
      throw new HTTPException(403, {
        message: "Not authorized to delete this transaction",
      });
    }

    // Revert balance change
    const balanceChange =
      existingTransaction.type === "income"
        ? -Number(existingTransaction.amount)
        : Number(existingTransaction.amount);
    await db
      .update(accounts)
      .set({
        balance: sql`${accounts.balance} + ${balanceChange}`,
      })
      .where(eq(accounts.id, existingTransaction.accountId));

    // Delete splits first
    await db
      .delete(transactionSplits)
      .where(eq(transactionSplits.transactionId, transactionId));

    // Delete transaction
    await db.delete(transactions).where(eq(transactions.id, transactionId));

    return c.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete transaction" });
  }
});

// POST /:id/split - Split transaction among group members
transactionsRoute.post(
  "/:id/split",
  requireAuth,
  zValidator("json", splitTransactionSchema),
  async (c) => {
    const user = c.get("user");
    const transactionId = c.req.param("id");
    const { splits } = c.req.valid("json");

    try {
      const transaction = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
        with: {
          group: true,
        },
      });

      if (!transaction) {
        throw new HTTPException(404, { message: "Transaction not found" });
      }

      // Check ownership
      if (transaction.userId !== user.id) {
        throw new HTTPException(403, {
          message: "Not authorized to split this transaction",
        });
      }

      // Transaction must be part of a group
      if (!transaction.groupId) {
        throw new HTTPException(400, {
          message: "Transaction must be part of a group to split",
        });
      }

      // Verify all split users are group members
      for (const split of splits) {
        const membership = await db.query.groupMembers.findFirst({
          where: and(
            eq(groupMembers.groupId, transaction.groupId),
            eq(groupMembers.userId, split.userId)
          ),
        });

        if (!membership) {
          throw new HTTPException(400, {
            message: `User ${split.userId} is not a member of this group`,
          });
        }
      }

      // Validate total split amount equals transaction amount
      const totalSplit = splits.reduce((sum, s) => sum + Number(s.amount), 0);
      if (Math.abs(totalSplit - Number(transaction.amount)) > 0.01) {
        throw new HTTPException(400, {
          message: "Split amounts must equal transaction amount",
        });
      }

      // Delete existing splits
      await db
        .delete(transactionSplits)
        .where(eq(transactionSplits.transactionId, transactionId));

      // Create new splits
      const splitValues = splits.map((split) => ({
        transactionId,
        userId: split.userId,
        amount: split.amount,
        currency: transaction.currency,
        isPaid: split.userId === user.id, // Creator's share is marked as paid
      }));

      await db.insert(transactionSplits).values(splitValues);

      // Create notifications for other users
      const notificationValues = splits
        .filter((split) => split.userId !== user.id)
        .map((split) => ({
          userId: split.userId,
          type: "group_activity" as const,
          title: "Expense shared with you",
          message: `${user.name} split an expense of ${transaction.currency} ${split.amount} with you`,
          data: {
            transactionId,
            amount: split.amount,
            currency: transaction.currency,
          },
        }));

      if (notificationValues.length > 0) {
        await db.insert(notifications).values(notificationValues);
      }

      const result = await db.query.transactions.findFirst({
        where: eq(transactions.id, transactionId),
        with: {
          splits: {
            with: {
              user: true,
            },
          },
        },
      });

      return c.json({ transaction: result });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to split transaction" });
    }
  }
);

export { transactionsRoute };
