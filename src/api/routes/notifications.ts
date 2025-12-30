import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { db, notifications } from "@/db";
import { eq, and, sql } from "drizzle-orm";

const querySchema = z.object({
  type: z
    .enum(["budget_alert", "bill_reminder", "group_activity", "settlement_request"])
    .optional(),
  isRead: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  limit: z.string().transform(Number).default("50"),
  offset: z.string().transform(Number).default("0"),
});

const notificationsRoute = new Hono();

// GET / - List notifications
notificationsRoute.get("/", requireAuth, zValidator("query", querySchema), async (c) => {
  const user = c.get("user");
  const { type, isRead, limit, offset } = c.req.valid("query");

  try {
    const conditions = [eq(notifications.userId, user.id)];

    if (type) {
      conditions.push(eq(notifications.type, type));
    }

    if (isRead !== undefined) {
      conditions.push(eq(notifications.isRead, isRead));
    }

    const result = await db.query.notifications.findMany({
      where: and(...conditions),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(...conditions));

    // Get unread count
    const [unreadResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

    return c.json({
      notifications: result,
      pagination: {
        total: Number(countResult.count),
        limit,
        offset,
      },
      unreadCount: Number(unreadResult.count),
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch notifications" });
  }
});

// PUT /:id/read - Mark as read
notificationsRoute.put("/:id/read", requireAuth, async (c) => {
  const user = c.get("user");
  const notificationId = c.req.param("id");

  try {
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!notification) {
      throw new HTTPException(404, { message: "Notification not found" });
    }

    if (notification.userId !== user.id) {
      throw new HTTPException(403, {
        message: "Not authorized to update this notification",
      });
    }

    const [updated] = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, notificationId))
      .returning();

    return c.json({ notification: updated });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to update notification" });
  }
});

// PUT /read-all - Mark all as read
notificationsRoute.put("/read-all", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

    return c.json({ message: "All notifications marked as read" });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to mark notifications as read" });
  }
});

// DELETE /:id - Delete notification
notificationsRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const notificationId = c.req.param("id");

  try {
    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!notification) {
      throw new HTTPException(404, { message: "Notification not found" });
    }

    if (notification.userId !== user.id) {
      throw new HTTPException(403, {
        message: "Not authorized to delete this notification",
      });
    }

    await db.delete(notifications).where(eq(notifications.id, notificationId));

    return c.json({ message: "Notification deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete notification" });
  }
});

export { notificationsRoute };
