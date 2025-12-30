import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { createClient } from "@supabase/supabase-js";
import { HTTPException } from "hono/http-exception";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  baseCurrency: string;
};

declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const requireAuth = createMiddleware(async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    throw new HTTPException(401, { message: "Missing authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    throw new HTTPException(401, { message: "Missing bearer token" });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new HTTPException(401, { message: "Invalid or expired token" });
    }

    // Get or create user in our database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!dbUser) {
      // Create user in database if not exists
      const [newUser] = await db
        .insert(users)
        .values({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split("@")[0],
        })
        .returning();
      dbUser = newUser;
    }

    c.set("user", {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatarUrl: dbUser.avatarUrl ?? undefined,
      baseCurrency: dbUser.baseCurrency,
    });

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(401, { message: "Authentication failed" });
  }
});

export const optionalAuth = createMiddleware(async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");

    if (token) {
      try {
        const {
          data: { user },
        } = await supabaseAdmin.auth.getUser(token);

        if (user) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, user.id),
          });

          if (dbUser) {
            c.set("user", {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              avatarUrl: dbUser.avatarUrl ?? undefined,
              baseCurrency: dbUser.baseCurrency,
            });
          }
        }
      } catch {
        // Ignore auth errors for optional auth
      }
    }
  }

  await next();
});
