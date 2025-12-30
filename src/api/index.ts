import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { HTTPException } from "hono/http-exception";

// Import routes
import { auth } from "./routes/auth";
import { accountsRoute } from "./routes/accounts";
import { transactionsRoute } from "./routes/transactions";
import { categoriesRoute } from "./routes/categories";
import { groupsRoute } from "./routes/groups";
import { budgetsRoute } from "./routes/budgets";
import { notificationsRoute } from "./routes/notifications";
import { preferencesRoute } from "./routes/preferences";

// Create main app
const app = new Hono();

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "X-Request-Id"],
    credentials: true,
    maxAge: 86400,
  })
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "finance-tracker-api",
  });
});

// Mount API routes
const api = new Hono();

api.route("/auth", auth);
api.route("/accounts", accountsRoute);
api.route("/transactions", transactionsRoute);
api.route("/categories", categoriesRoute);
api.route("/groups", groupsRoute);
api.route("/budgets", budgetsRoute);
api.route("/notifications", notificationsRoute);
api.route("/preferences", preferencesRoute);

// Mount all API routes under /api
app.route("/api", api);

// Global error handler
app.onError((err, c) => {
  console.error("API Error:", err);

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          message: err.message,
          status: err.status,
        },
      },
      err.status
    );
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    return c.json(
      {
        error: {
          message: "Validation error",
          status: 400,
          details: err,
        },
      },
      400
    );
  }

  // Handle database errors
  if (err.message?.includes("duplicate key")) {
    return c.json(
      {
        error: {
          message: "Resource already exists",
          status: 409,
        },
      },
      409
    );
  }

  if (err.message?.includes("foreign key constraint")) {
    return c.json(
      {
        error: {
          message: "Related resource not found",
          status: 400,
        },
      },
      400
    );
  }

  // Generic error response
  return c.json(
    {
      error: {
        message:
          process.env.NODE_ENV === "production"
            ? "Internal server error"
            : err.message || "Unknown error",
        status: 500,
      },
    },
    500
  );
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        message: "Not found",
        status: 404,
      },
    },
    404
  );
});

// Start server
const port = Number(process.env.PORT) || 3001;

console.log(`Starting Finance Tracker API server on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};

// Export app for testing
export { app };
