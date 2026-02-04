import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  customers,
  locations,
  arAging,
  budget,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const dataRouter = router({
  // ===== CUSTOMERS =====
  customers: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(customers).limit(100);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          code: z.string().min(1, "Code is required"),
          locationId: z.number(),
          creditLimit: z.number().min(0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(customers).values({
          locationId: input.locationId,
          name: input.name,
          code: input.code,
          creditLimit: input.creditLimit ? input.creditLimit.toString() : undefined,
          status: "active",
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          code: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          creditLimit: z.number().min(0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updates: Record<string, any> = {};
        if (input.name) updates.name = input.name;
        if (input.code) updates.code = input.code;
        if (input.creditLimit !== undefined) updates.creditLimit = input.creditLimit?.toString();

        await db.update(customers).set(updates).where(eq(customers.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(customers).where(eq(customers.id, input.id));
        return { success: true };
      }),
  }),

  // ===== LOCATIONS =====
  locations: router({
    list: protectedProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return await db.select().from(locations).limit(100);
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          code: z.string().min(1, "Code is required"),
          region: z.string().min(1, "Region is required"),
          address: z.string().optional(),
          manager: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(locations).values({
          name: input.name,
          code: input.code,
          region: input.region,
          country: input.address,
          status: "active",
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).optional(),
          code: z.string().min(1).optional(),
          region: z.string().min(1).optional(),
          address: z.string().optional(),
          manager: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updates: Record<string, any> = {};
        if (input.name) updates.name = input.name;
        if (input.code) updates.code = input.code;
        if (input.region) updates.region = input.region;
        if (input.address) updates.country = input.address;
        if (input.isActive !== undefined) updates.status = input.isActive ? "active" : "inactive";

        await db.update(locations).set(updates).where(eq(locations.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.update(locations).set({ status: "inactive" }).where(eq(locations.id, input.id));
        return { success: true };
      }),
  }),

  // ===== AR RECORDS =====
  arRecords: router({
    list: protectedProcedure
      .input(z.object({ locationId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const allRecords = await db.select().from(arAging).limit(100);
        if (input.locationId) {
          return allRecords.filter((r) => r.locationId === input.locationId);
        }
        return allRecords;
      }),

    create: protectedProcedure
      .input(
        z.object({
          customerId: z.number(),
          locationId: z.number(),
          periodId: z.number(),
          amount0_30: z.number().min(0).optional(),
          amount31_60: z.number().min(0).optional(),
          amount61_90: z.number().min(0).optional(),
          amount90_plus: z.number().min(0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const totalAR =
          (input.amount0_30 || 0) +
          (input.amount31_60 || 0) +
          (input.amount61_90 || 0) +
          (input.amount90_plus || 0);

        await db.insert(arAging).values({
          locationId: input.locationId,
          customerId: input.customerId,
          periodId: input.periodId,
          amount0_30: input.amount0_30?.toString() || "0",
          amount31_60: input.amount31_60?.toString() || "0",
          amount61_90: input.amount61_90?.toString() || "0",
          amount90_plus: input.amount90_plus?.toString() || "0",
          totalAR: totalAR.toString(),
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          amount0_30: z.number().min(0).optional(),
          amount31_60: z.number().min(0).optional(),
          amount61_90: z.number().min(0).optional(),
          amount90_plus: z.number().min(0).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updates: Record<string, any> = {};
        if (input.amount0_30 !== undefined) updates.amount0_30 = input.amount0_30;
        if (input.amount31_60 !== undefined) updates.amount31_60 = input.amount31_60;
        if (input.amount61_90 !== undefined) updates.amount61_90 = input.amount61_90;
        if (input.amount90_plus !== undefined) updates.amount90_plus = input.amount90_plus;

        if (Object.keys(updates).length > 0) {
          const totalAR =
            (input.amount0_30 || 0) +
            (input.amount31_60 || 0) +
            (input.amount61_90 || 0) +
            (input.amount90_plus || 0);
          updates.totalAR = totalAR;
        }

        await db.update(arAging).set(updates).where(eq(arAging.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(arAging).where(eq(arAging.id, input.id));
        return { success: true };
      }),
  }),

  // ===== BUDGETS =====
  budgets: router({
    list: protectedProcedure
      .input(z.object({ locationId: z.number().optional(), periodId: z.number().optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const allBudgets = await db.select().from(budget).limit(100);
        return allBudgets.filter(
          (b) =>
            (!input.locationId || b.locationId === input.locationId) &&
            (!input.periodId || b.periodId === input.periodId)
        );
      }),

    create: protectedProcedure
      .input(
        z.object({
          locationId: z.number(),
          periodId: z.number(),
          accountId: z.number(),
          budgetAmount: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(budget).values({
          locationId: input.locationId,
          periodId: input.periodId,
          accountId: input.accountId,
          budgetedAmount: input.budgetAmount.toString(),
        });

        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          budgetAmount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const updates: Record<string, any> = {};
        if (input.budgetAmount !== undefined) updates.budgetedAmount = input.budgetAmount.toString();

        await db.update(budget).set(updates).where(eq(budget.id, input.id));
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(budget).where(eq(budget.id, input.id));
        return { success: true };
      }),
  }),
});
