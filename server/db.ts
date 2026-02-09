import { eq, and, gte, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  locations,
  customers,
  arAging,
  collectionHistory,
  collectionAssumptions,
  transactions,
  budget,
  plStatement,
  cashFlowStatement,
  workingCapitalMetrics,
  timePeriods,
  accounts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// Location Queries
// ============================================================================

export async function getAllLocations() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(locations).where(eq(locations.status, "active"));
}

export async function getAllLocationsIncludingInactive() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(locations).orderBy(desc(locations.createdAt));
}

export async function getLocationById(locationId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(locations).where(eq(locations.id, locationId)).limit(1);
  return result[0] || null;
}

export async function createLocation(data: { name: string; code: string; region?: string; country?: string; status: "active" | "inactive" }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(locations).values(data);
  return result;
}

export async function updateLocation(locationId: number, data: Partial<{ name: string; code: string; region?: string; country?: string; status: "active" | "inactive" }>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(locations).set(data).where(eq(locations.id, locationId));
  return result;
}

export async function deleteLocation(locationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.delete(locations).where(eq(locations.id, locationId));
  return result;
}

// ============================================================================
// Time Period Queries
// ============================================================================

export async function getTimePeriodById(periodId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(timePeriods).where(eq(timePeriods.id, periodId)).limit(1);
  return result[0] || null;
}

export async function getLatestTimePeriod() {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(timePeriods)
    .orderBy(desc(timePeriods.periodDate))
    .limit(1);
  return result[0] || null;
}

export async function getTimePeriodsByYear(year: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(timePeriods).where(eq(timePeriods.year, year));
}

// ============================================================================
// AR Aging Queries
// ============================================================================

export async function getARAgingByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(arAging)
    .where(and(eq(arAging.locationId, locationId), eq(arAging.periodId, periodId)));
}

export async function getTotalARByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(arAging)
    .where(and(eq(arAging.locationId, locationId), eq(arAging.periodId, periodId)));

  if (result.length === 0) return null;

  const total = result.reduce(
    (sum, row) => ({
      amount0_30: sum.amount0_30 + Number(row.amount0_30),
      amount31_60: sum.amount31_60 + Number(row.amount31_60),
      amount61_90: sum.amount61_90 + Number(row.amount61_90),
      amount90_plus: sum.amount90_plus + Number(row.amount90_plus),
    }),
    { amount0_30: 0, amount31_60: 0, amount61_90: 0, amount90_plus: 0 }
  );

  return total;
}

// ============================================================================
// Collection Assumptions Queries
// ============================================================================

export async function getCollectionAssumptionsByLocation(locationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(collectionAssumptions)
    .where(eq(collectionAssumptions.locationId, locationId));
}

// ============================================================================
// Transaction Queries
// ============================================================================

export async function getTransactionsByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.locationId, locationId), eq(transactions.periodId, periodId)));
}

export async function getTransactionsByAccountAndPeriod(accountId: number, periodId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.accountId, accountId), eq(transactions.periodId, periodId)));
}

// ============================================================================
// Budget Queries
// ============================================================================

export async function getBudgetByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(budget)
    .where(and(eq(budget.locationId, locationId), eq(budget.periodId, periodId)));
}

// ============================================================================
// Cached Results Queries
// ============================================================================

export async function getPLStatementByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(plStatement)
    .where(and(eq(plStatement.locationId, locationId), eq(plStatement.periodId, periodId)))
    .limit(1);
  return result[0] || null;
}

export async function getCashFlowStatementByLocationAndPeriod(
  locationId: number,
  periodId: number,
  scenario: "base" | "optimistic" | "conservative" = "base"
) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(cashFlowStatement)
    .where(
      and(
        eq(cashFlowStatement.locationId, locationId),
        eq(cashFlowStatement.periodId, periodId),
        eq(cashFlowStatement.scenario, scenario)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function getWorkingCapitalMetricsByLocationAndPeriod(
  locationId: number,
  periodId: number
) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(workingCapitalMetrics)
    .where(and(eq(workingCapitalMetrics.locationId, locationId), eq(workingCapitalMetrics.periodId, periodId)))
    .limit(1);
  return result[0] || null;
}

// ============================================================================
// Account Queries
// ============================================================================

export async function getAccountsByType(type: "asset" | "liability" | "equity" | "revenue" | "expense") {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(accounts).where(eq(accounts.type, type));
}

export async function getAllAccounts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(accounts);
}

// ============================================================================
// Customer Queries
// ============================================================================

export async function getCustomersByLocation(locationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(customers)
    .where(and(eq(customers.locationId, locationId), eq(customers.status, "active")));
}

// ============================================================================
// Cash Flow Data Queries
// ============================================================================

export async function getCashFlowDataByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get AR collections from arAging
  const arData = await db
    .select()
    .from(arAging)
    .where(and(eq(arAging.locationId, locationId), eq(arAging.periodId, periodId)));

  const totalAR = arData.reduce((sum, row) => sum + Number(row.totalAR), 0);

  // Get transactions for operating and investing cash flows
  const transactions_data = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.locationId, locationId), eq(transactions.periodId, periodId)));

  // Get budget for forecast data
  const budgetData = await db
    .select()
    .from(budget)
    .where(and(eq(budget.locationId, locationId), eq(budget.periodId, periodId)));

  return {
    arCollections: totalAR,
    transactions: transactions_data,
    budget: budgetData,
  };
}

export async function getCashFlowStatementsByLocationAndPeriodRange(
  locationId: number,
  startPeriodId: number,
  endPeriodId: number
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(cashFlowStatement)
    .where(
      and(
        eq(cashFlowStatement.locationId, locationId),
        gte(cashFlowStatement.periodId, startPeriodId),
        lte(cashFlowStatement.periodId, endPeriodId)
      )
    )
    .orderBy(desc(cashFlowStatement.periodId));
}

// ============================================================================
// P&L Data Queries
// ============================================================================

export async function getPLDataByLocationAndPeriod(locationId: number, periodId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get cached P&L statement
  const plData = await db
    .select()
    .from(plStatement)
    .where(and(eq(plStatement.locationId, locationId), eq(plStatement.periodId, periodId)))
    .limit(1);

  if (plData.length === 0) return null;

  // Get budget comparison data
  const budgetData = await db
    .select()
    .from(budget)
    .where(and(eq(budget.locationId, locationId), eq(budget.periodId, periodId)));

  return {
    statement: plData[0],
    budget: budgetData,
  };
}

export async function getPLStatementsByLocationAndPeriodRange(
  locationId: number,
  startPeriodId: number,
  endPeriodId: number
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(plStatement)
    .where(
      and(
        eq(plStatement.locationId, locationId),
        gte(plStatement.periodId, startPeriodId),
        lte(plStatement.periodId, endPeriodId)
      )
    )
    .orderBy(desc(plStatement.periodId));
}

export async function getPLStatementsByLocation(locationId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(plStatement)
    .where(eq(plStatement.locationId, locationId))
    .orderBy(desc(plStatement.periodId))
    .limit(limit);
}
