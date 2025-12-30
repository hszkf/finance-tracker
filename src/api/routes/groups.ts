import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import {
  db,
  spendingGroups,
  groupMembers,
  groupInvitations,
  notifications,
  users,
  transactions,
} from "@/db";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  currency: z.string().length(3).default("USD"),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  currency: z.string().length(3).optional(),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

const invitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});

const groupsRoute = new Hono();

// GET / - List user's groups
groupsRoute.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    const memberships = await db.query.groupMembers.findMany({
      where: eq(groupMembers.userId, user.id),
      with: {
        group: {
          with: {
            members: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    const result = memberships.map((membership) => ({
      ...membership.group,
      role: membership.role,
      memberCount: membership.group.members.length,
    }));

    return c.json({ groups: result });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch groups" });
  }
});

// POST / - Create group
groupsRoute.post("/", requireAuth, zValidator("json", createGroupSchema), async (c) => {
  const user = c.get("user");
  const data = c.req.valid("json");

  try {
    const [group] = await db
      .insert(spendingGroups)
      .values({
        ...data,
        createdBy: user.id,
      })
      .returning();

    // Add creator as owner
    await db.insert(groupMembers).values({
      groupId: group.id,
      userId: user.id,
      role: "owner",
    });

    const result = await db.query.spendingGroups.findFirst({
      where: eq(spendingGroups.id, group.id),
      with: {
        members: {
          with: {
            user: true,
          },
        },
      },
    });

    return c.json({ group: result }, 201);
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to create group" });
  }
});

// GET /:id - Get group details
groupsRoute.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const groupId = c.req.param("id");

  try {
    // Verify membership
    const membership = await db.query.groupMembers.findFirst({
      where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)),
    });

    if (!membership) {
      throw new HTTPException(403, { message: "Not a member of this group" });
    }

    const group = await db.query.spendingGroups.findFirst({
      where: eq(spendingGroups.id, groupId),
      with: {
        members: {
          with: {
            user: true,
          },
        },
        accounts: true,
        transactions: {
          limit: 10,
          orderBy: (transactions, { desc }) => [desc(transactions.date)],
          with: {
            category: true,
            splits: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new HTTPException(404, { message: "Group not found" });
    }

    return c.json({ group, role: membership.role });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to fetch group" });
  }
});

// PUT /:id - Update group
groupsRoute.put(
  "/:id",
  requireAuth,
  zValidator("json", updateGroupSchema),
  async (c) => {
    const user = c.get("user");
    const groupId = c.req.param("id");
    const data = c.req.valid("json");

    try {
      // Verify admin/owner membership
      const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)),
      });

      if (!membership) {
        throw new HTTPException(403, { message: "Not a member of this group" });
      }

      if (membership.role !== "owner" && membership.role !== "admin") {
        throw new HTTPException(403, { message: "Only owners and admins can update group" });
      }

      const [updated] = await db
        .update(spendingGroups)
        .set(data)
        .where(eq(spendingGroups.id, groupId))
        .returning();

      return c.json({ group: updated });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to update group" });
    }
  }
);

// DELETE /:id - Delete group
groupsRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const groupId = c.req.param("id");

  try {
    // Verify owner membership
    const membership = await db.query.groupMembers.findFirst({
      where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)),
    });

    if (!membership) {
      throw new HTTPException(403, { message: "Not a member of this group" });
    }

    if (membership.role !== "owner") {
      throw new HTTPException(403, { message: "Only owners can delete group" });
    }

    // Delete group (cascades to members, invitations)
    await db.delete(spendingGroups).where(eq(spendingGroups.id, groupId));

    return c.json({ message: "Group deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete group" });
  }
});

// GET /:id/members - List members
groupsRoute.get("/:id/members", requireAuth, async (c) => {
  const user = c.get("user");
  const groupId = c.req.param("id");

  try {
    // Verify membership
    const membership = await db.query.groupMembers.findFirst({
      where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)),
    });

    if (!membership) {
      throw new HTTPException(403, { message: "Not a member of this group" });
    }

    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: {
        user: true,
      },
    });

    return c.json({
      members: members.map((m) => ({
        id: m.id,
        user: {
          id: m.user.id,
          email: m.user.email,
          name: m.user.name,
          avatarUrl: m.user.avatarUrl,
        },
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to fetch members" });
  }
});

// POST /:id/invitations - Send invitation
groupsRoute.post(
  "/:id/invitations",
  requireAuth,
  zValidator("json", invitationSchema),
  async (c) => {
    const user = c.get("user");
    const groupId = c.req.param("id");
    const { email, role } = c.req.valid("json");

    try {
      // Verify admin/owner membership
      const membership = await db.query.groupMembers.findFirst({
        where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)),
      });

      if (!membership) {
        throw new HTTPException(403, { message: "Not a member of this group" });
      }

      if (membership.role !== "owner" && membership.role !== "admin") {
        throw new HTTPException(403, { message: "Only owners and admins can invite members" });
      }

      // Check if user already exists and is a member
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (existingUser) {
        const existingMembership = await db.query.groupMembers.findFirst({
          where: and(
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.userId, existingUser.id)
          ),
        });

        if (existingMembership) {
          throw new HTTPException(409, { message: "User is already a member of this group" });
        }
      }

      // Check for pending invitation
      const existingInvitation = await db.query.groupInvitations.findFirst({
        where: and(
          eq(groupInvitations.groupId, groupId),
          eq(groupInvitations.email, email),
          eq(groupInvitations.status, "pending")
        ),
      });

      if (existingInvitation) {
        throw new HTTPException(409, { message: "Pending invitation already exists for this email" });
      }

      // Create invitation
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const [invitation] = await db
        .insert(groupInvitations)
        .values({
          groupId,
          email,
          role,
          invitedBy: user.id,
          token,
          expiresAt,
        })
        .returning();

      // Create notification if user exists
      if (existingUser) {
        const group = await db.query.spendingGroups.findFirst({
          where: eq(spendingGroups.id, groupId),
        });

        await db.insert(notifications).values({
          userId: existingUser.id,
          type: "group_activity",
          title: "Group Invitation",
          message: `${user.name} invited you to join "${group?.name}"`,
          data: {
            groupId,
            invitationId: invitation.id,
            token,
          },
        });
      }

      return c.json(
        {
          invitation: {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt,
          },
        },
        201
      );
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to send invitation" });
    }
  }
);

// GET /:id/balances - Get who owes whom
groupsRoute.get("/:id/balances", requireAuth, async (c) => {
  const user = c.get("user");
  const groupId = c.req.param("id");

  try {
    // Verify membership
    const membership = await db.query.groupMembers.findFirst({
      where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id)),
    });

    if (!membership) {
      throw new HTTPException(403, { message: "Not a member of this group" });
    }

    // Get all unpaid splits for group transactions
    const groupTransactions = await db.query.transactions.findMany({
      where: eq(transactions.groupId, groupId),
      with: {
        splits: {
          with: {
            user: true,
          },
        },
        user: true,
      },
    });

    // Calculate balances
    const balances: Record<
      string,
      {
        userId: string;
        userName: string;
        owes: Record<string, number>;
        isOwed: Record<string, number>;
        netBalance: number;
      }
    > = {};

    // Initialize balances for all members
    const members = await db.query.groupMembers.findMany({
      where: eq(groupMembers.groupId, groupId),
      with: {
        user: true,
      },
    });

    for (const member of members) {
      balances[member.userId] = {
        userId: member.userId,
        userName: member.user.name,
        owes: {},
        isOwed: {},
        netBalance: 0,
      };
    }

    // Process transactions
    for (const transaction of groupTransactions) {
      const payerId = transaction.userId;

      for (const split of transaction.splits) {
        if (!split.isPaid && split.userId !== payerId) {
          const amount = Number(split.amount);

          // split.userId owes payerId
          if (!balances[split.userId]?.owes[payerId]) {
            if (balances[split.userId]) {
              balances[split.userId].owes[payerId] = 0;
            }
          }
          if (balances[split.userId]) {
            balances[split.userId].owes[payerId] += amount;
            balances[split.userId].netBalance -= amount;
          }

          // payerId is owed by split.userId
          if (!balances[payerId]?.isOwed[split.userId]) {
            if (balances[payerId]) {
              balances[payerId].isOwed[split.userId] = 0;
            }
          }
          if (balances[payerId]) {
            balances[payerId].isOwed[split.userId] += amount;
            balances[payerId].netBalance += amount;
          }
        }
      }
    }

    // Convert to array and add user info
    const balanceArray = Object.values(balances).map((balance) => ({
      user: {
        id: balance.userId,
        name: balance.userName,
      },
      owes: Object.entries(balance.owes).map(([userId, amount]) => ({
        userId,
        userName: balances[userId]?.userName || "Unknown",
        amount,
      })),
      isOwed: Object.entries(balance.isOwed).map(([userId, amount]) => ({
        userId,
        userName: balances[userId]?.userName || "Unknown",
        amount,
      })),
      netBalance: balance.netBalance,
    }));

    return c.json({ balances: balanceArray });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to calculate balances" });
  }
});

export { groupsRoute };
