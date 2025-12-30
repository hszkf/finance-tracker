import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../middleware/auth";
import { db, categories } from "@/db";
import { eq, and, or, isNull } from "drizzle-orm";

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  type: z.enum(["expense", "income"]),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").optional(),
  parentId: z.string().uuid().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(["expense", "income"]).optional(),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

const categoriesRoute = new Hono();

// GET / - List categories
categoriesRoute.get("/", requireAuth, async (c) => {
  const user = c.get("user");

  try {
    // Get both system categories (userId is null) and user's custom categories
    const result = await db.query.categories.findMany({
      where: or(isNull(categories.userId), eq(categories.userId, user.id)),
      with: {
        children: true,
        parent: true,
      },
      orderBy: (categories, { asc }) => [asc(categories.name)],
    });

    // Organize into tree structure
    const rootCategories = result.filter((cat) => !cat.parentId);
    const categoriesWithChildren = rootCategories.map((cat) => ({
      ...cat,
      children: result.filter((child) => child.parentId === cat.id),
    }));

    return c.json({ categories: categoriesWithChildren });
  } catch (error) {
    throw new HTTPException(500, { message: "Failed to fetch categories" });
  }
});

// POST / - Create category
categoriesRoute.post(
  "/",
  requireAuth,
  zValidator("json", createCategorySchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    try {
      // Verify parent category exists and belongs to user (or is system)
      if (data.parentId) {
        const parentCategory = await db.query.categories.findFirst({
          where: eq(categories.id, data.parentId),
        });

        if (!parentCategory) {
          throw new HTTPException(404, { message: "Parent category not found" });
        }

        if (parentCategory.userId && parentCategory.userId !== user.id) {
          throw new HTTPException(403, {
            message: "Not authorized to use this parent category",
          });
        }
      }

      // Check for duplicate name within user's categories
      const existingCategory = await db.query.categories.findFirst({
        where: and(
          eq(categories.name, data.name),
          eq(categories.type, data.type),
          or(eq(categories.userId, user.id), isNull(categories.userId))
        ),
      });

      if (existingCategory) {
        throw new HTTPException(409, { message: "Category with this name already exists" });
      }

      const [category] = await db
        .insert(categories)
        .values({
          ...data,
          userId: user.id,
        })
        .returning();

      return c.json({ category }, 201);
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to create category" });
    }
  }
);

// GET /:id - Get category
categoriesRoute.get("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const categoryId = c.req.param("id");

  try {
    const category = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
      with: {
        children: true,
        parent: true,
        transactions: {
          limit: 10,
          orderBy: (transactions, { desc }) => [desc(transactions.date)],
        },
        budgets: true,
      },
    });

    if (!category) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    // Check access (system categories are public, user categories are private)
    if (category.userId && category.userId !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to view this category" });
    }

    return c.json({ category });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to fetch category" });
  }
});

// PUT /:id - Update category
categoriesRoute.put(
  "/:id",
  requireAuth,
  zValidator("json", updateCategorySchema),
  async (c) => {
    const user = c.get("user");
    const categoryId = c.req.param("id");
    const data = c.req.valid("json");

    try {
      const existingCategory = await db.query.categories.findFirst({
        where: eq(categories.id, categoryId),
      });

      if (!existingCategory) {
        throw new HTTPException(404, { message: "Category not found" });
      }

      // Cannot update system categories (userId is null)
      if (!existingCategory.userId) {
        throw new HTTPException(403, { message: "Cannot modify system categories" });
      }

      // Check ownership
      if (existingCategory.userId !== user.id) {
        throw new HTTPException(403, { message: "Not authorized to update this category" });
      }

      // Verify parent category if changing
      if (data.parentId) {
        // Cannot set self as parent
        if (data.parentId === categoryId) {
          throw new HTTPException(400, { message: "Category cannot be its own parent" });
        }

        const parentCategory = await db.query.categories.findFirst({
          where: eq(categories.id, data.parentId),
        });

        if (!parentCategory) {
          throw new HTTPException(404, { message: "Parent category not found" });
        }

        if (parentCategory.userId && parentCategory.userId !== user.id) {
          throw new HTTPException(403, {
            message: "Not authorized to use this parent category",
          });
        }
      }

      // Check for duplicate name if changing
      if (data.name) {
        const duplicateCategory = await db.query.categories.findFirst({
          where: and(
            eq(categories.name, data.name),
            eq(categories.type, data.type || existingCategory.type),
            or(eq(categories.userId, user.id), isNull(categories.userId))
          ),
        });

        if (duplicateCategory && duplicateCategory.id !== categoryId) {
          throw new HTTPException(409, { message: "Category with this name already exists" });
        }
      }

      const [updated] = await db
        .update(categories)
        .set(data)
        .where(eq(categories.id, categoryId))
        .returning();

      return c.json({ category: updated });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: "Failed to update category" });
    }
  }
);

// DELETE /:id - Delete category
categoriesRoute.delete("/:id", requireAuth, async (c) => {
  const user = c.get("user");
  const categoryId = c.req.param("id");

  try {
    const existingCategory = await db.query.categories.findFirst({
      where: eq(categories.id, categoryId),
      with: {
        children: true,
      },
    });

    if (!existingCategory) {
      throw new HTTPException(404, { message: "Category not found" });
    }

    // Cannot delete system categories (userId is null)
    if (!existingCategory.userId) {
      throw new HTTPException(403, { message: "Cannot delete system categories" });
    }

    // Check ownership
    if (existingCategory.userId !== user.id) {
      throw new HTTPException(403, { message: "Not authorized to delete this category" });
    }

    // Check for child categories
    if (existingCategory.children && existingCategory.children.length > 0) {
      throw new HTTPException(400, {
        message: "Cannot delete category with subcategories. Delete subcategories first.",
      });
    }

    await db.delete(categories).where(eq(categories.id, categoryId));

    return c.json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Failed to delete category" });
  }
});

export { categoriesRoute };
