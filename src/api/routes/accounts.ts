import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { db, accounts, groupMembers } from "@/db";
import { eq, and, or, inArray } from "drizzle-orm";

const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.enum(["bank", "credit_card", "cash", "ewallet"]),
  currency: z.string().length(3).default("USD"),
  balance: z.string().optional().default("0"),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  groupId: z.string().uuid().optional(),
});

const updateAccountSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(["bank", "credit_card", "cash", "ewallet"]).optional(),
  currency: z.string().length(3).optional(),
  balance: z.string().optional(),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  isActive: z.boolean().optional(),
  groupId: z.string().uuid().nullable().optional(),
});

const querySchema = z.object({
  groupId: z.string().uuid().optional(),
  type: z.enum(["bank", "credit_card", "cash", "ewallet"]).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

const accountsRoute = new Hono();

// GET / - List accounts (with group filtering)
accountsRoute.get("/", requireAuth, zValidator("query", querySchema), async (c) => {
  const user = c.get("user");
  const { groupId, type, isActive } = c.req.valid("query");

  try {
    // Get user's group memberships
    const userGroups = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, user.id),
    });
    const groupIds = userGroups.map((g) => g.groupId);

    const conditions = [
      or(
        eq(accounts.userId, user.id),
        groupIds.length > 0 ? inArray(accounts.groupId, groupIds) : undefined
      ),
    ].filter(Boolean);

    if (groupId) {
      conditions.push(eq(accounts.groupId, groupId));
    }

    if (type) {
      conditions.push(eq(accounts.type, type));
    }

    if (isActive !== undefined) {
      conditions.push(eq(accounts.isActive, isActive));
    }

    const result = await db.query.accounts.findMany({
      where: and(...conditions),
      with: {
        group: true,
      },
      orderBy: (accounts, { desc }) => [desc(accounts.createdAt)],
    });

    return c.json({ accounts: result });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch accounts" });
  }
});

// POST / - Create account
accountsRoute.post("/", requireAuth, zValidator("json", createAccountSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  try {
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

    const [account] = await db
      .insert(accounts)
      .values({
        ...data,
        userId: user.id,
      })
      .returning();

    return c.json({ account }, 201);
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to create account" });
  }
});

// GET /:id - Get account
accountsRoute.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const accountId = c.req.param("id");

  try {
    const account = await db.query.accounts.findFirst({
      where: eq(accounts.id, accountId),
      with: {
        group: true,
        transactions: {
          limit: 10,
          orderBy: (transactions, { desc }) => [desc(transactions.date)],
        },
      },
    });

    if (!account) {
      throw new HTTPException(404, { message: "Account not found" });
    }

    // Check ownership or group membership
    if (account.userId !== user.id) {
      if (!account.groupId) {
        throw new HTTPException(403, { message: "Not authorized to view this account" });
      }

      const membership = await db.query.groupMembers.findFirst({
        where: and(
          eq(groupMembers.groupId, account.groupId),
          eq(groupMembers.userId, user.id)
        ),
      });

      if (!membership) {
        throw new HTTPException(403, { message: "Not authorized to view this account" });
      }
    }

    return c.json({ account });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to fetch account" });
  }
});

// PUT /:id - Update account
accountsRoute.put(
  "/:id",
  requireAuth,
  zValidator("json", updateAccountSchema),
  async (c) => {
    const user = c.get("user");
    const accountId = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const existingAccount = await db.query.accounts.findFirst({
        where: eq(accounts.id, accountId),
      });

      if (!existingAccount) {
        throw new HTTPException(404, { message: "Account not found" });
      }

      // Check ownership
      if (existingAccount.userId !== user.id) {
        throw new HTTPException(403, { message: "Not authorized to update this account" });
      }

      // Verify new group membership if changing group
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

      const [updated] = await db
        .update(accounts)
        .set(data)
        .where(eq(accounts.id, accountId))
        .returning();

      return c.json({ account: updated });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to update account" });
    }
  }
);

// DELETE /:id - Delete account
accountsRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const accountId = c.req.param("id");

  try {
    const existingAccount = await db.query.accounts.findFirst({
      where: eq(accounts.id, accountId),
    });

    if (!existingAccount) {
      throw new HTTPException(404, { message: "Account not found" });
    }

    // Check ownership
    if (existingAccount.userId !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to delete this account" });
    }

    await db.delete(accounts).where(eq(accounts.id, accountId));

    return c.json({ message: "Account deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete account" });
  }
});

export { accountsRoute };
