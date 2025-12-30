import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { db, userPreferences, users } from "@/db";
import { eq } from "drizzle-orm";

const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  emailWeeklySummary: z.boolean().optional(),
  emailBudgetAlerts: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  baseCurrency: z.string().length(3).optional(),
  avatarUrl: z.string().url().optional(),
});

const preferencesRoute = new Hono();

// GET / - Get preferences
preferencesRoute.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    let preferences = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, user.id),
    });

    // Create default preferences if not exists
    if (!preferences) {
      const [newPreferences] = await db
        .insert(userPreferences)
        .values({
          userId: user.id,
        })
        .returning();
      preferences = newPreferences;
    }

    // Get user info as well
    const userInfo = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    return c.json({
      preferences,
      user: userInfo
        ? {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            baseCurrency: userInfo.baseCurrency,
            avatarUrl: userInfo.avatarUrl,
          }
        : null,
    });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch preferences" });
  }
});

// PUT / - Update preferences
preferencesRoute.put(
  "/",
  requireAuth,
  zValidator("json", updatePreferencesSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    try {
      let preferences = await db.query.userPreferences.findFirst({
        where: eq(userPreferences.userId, user.id),
      });

      if (!preferences) {
        // Create with provided values
        const [newPreferences] = await db
          .insert(userPreferences)
          .values({
            userId: user.id,
            ...data,
          })
          .returning();
        return c.json({ preferences: newPreferences }, 201);
      }

      // Update existing preferences
      const [updated] = await db
        .update(userPreferences)
        .set(data)
        .where(eq(userPreferences.userId, user.id))
        .returning();

      return c.json({ preferences: updated });
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to update preferences" });
    }
  }
);

// PUT /profile - Update user profile
preferencesRoute.put(
  "/profile",
  requireAuth,
  zValidator("json", updateUserSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    try {
      const [updated] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, user.id))
        .returning();

      return c.json({
        user: {
          id: updated.id,
          email: updated.email,
          name: updated.name,
          baseCurrency: updated.baseCurrency,
          avatarUrl: updated.avatarUrl,
        },
      });
    } catch (error) {
      throw new HTTPException(500, { message: "Failed to update profile" });
    }
  }
);

export { preferencesRoute };
