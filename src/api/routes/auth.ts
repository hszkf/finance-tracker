import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { db, users, userPreferences } from "@/db";
import { eq } from "drizzle-orm";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required").max(255),
  baseCurrency: z.string().length(3).default("USD"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const auth = new Hono();

// POST /register - Register with email/password/name
auth.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, password, name, baseCurrency } = c.req.valid("json");

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      throw new HTTPException(400, { message: error.message });
    }

    if (!data.user) {
      throw new HTTPException(500, { message: "Failed to create user" });
    }

    // Create user in our database
    const [newUser] = await db
      .insert(users)
      .values({
        id: data.user.id,
        email: data.user.email!,
        name,
        baseCurrency,
      })
      .returning();

    // Create default preferences
    await db.insert(userPreferences).values({
      userId: newUser.id,
    });

    // Sign in to get tokens
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      throw new HTTPException(500, { message: "User created but sign-in failed" });
    }

    return c.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          baseCurrency: newUser.baseCurrency,
        },
        session: {
          accessToken: signInData.session?.access_token,
          refreshToken: signInData.session?.refresh_token,
          expiresAt: signInData.session?.expires_at,
        },
      },
      201
    );
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Registration failed" });
  }
});

// POST /login - Login with email/password
auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new HTTPException(401, { message: "Invalid credentials" });
    }

    if (!data.session) {
      throw new HTTPException(500, { message: "Failed to create session" });
    }

    // Get user from database
    let dbUser = await db.query.users.findFirst({
      where: eq(users.id, data.user.id),
    });

    if (!dbUser) {
      // Create user if not exists
      const [newUser] = await db
        .insert(users)
        .values({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!.split("@")[0],
        })
        .returning();
      dbUser = newUser;

      // Create default preferences
      await db.insert(userPreferences).values({
        userId: newUser.id,
      });
    }

    return c.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
        baseCurrency: dbUser.baseCurrency,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Login failed" });
  }
});

// POST /logout - Logout
auth.post("/logout", requireAuth, async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    try {
      await supabaseAdmin.auth.admin.signOut(token);
    } catch {
      // Ignore errors during logout
    }
  }

  return c.json({ message: "Logged out successfully" });
});

// GET /me - Get current user
auth.get("/me", requireAuth, async (c) => {
  const user = c.get("user");

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    with: {
      preferences: true,
    },
  });

  if (!dbUser) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return c.json({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    avatarUrl: dbUser.avatarUrl,
    baseCurrency: dbUser.baseCurrency,
    createdAt: dbUser.createdAt,
    preferences: dbUser.preferences,
  });
});

export { auth };
