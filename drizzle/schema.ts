import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Master Data Tables
 */

// Locations - Business units with independent P&L and cash flow
export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;

// Customers - AR aging and collection analysis
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  creditLimit: decimal("creditLimit", { precision: 15, scale: 2 }),
  paymentTerms: int("paymentTerms"), // Days
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// Vendors - AP payment patterns
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }).notNull(),
  paymentTerms: int("paymentTerms"), // Days
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

// Chart of Accounts
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["asset", "liability", "equity", "revenue", "expense"]).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

// Time Periods
export const timePeriods = mysqlTable("timePeriods", {
  id: int("id").autoincrement().primaryKey(),
  periodDate: date("periodDate").notNull().unique(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  quarter: int("quarter").notNull(),
  periodName: varchar("periodName", { length: 50 }).notNull(), // e.g., "2024-01"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimePeriod = typeof timePeriods.$inferSelect;
export type InsertTimePeriod = typeof timePeriods.$inferInsert;

/**
 * AR & Collections Tables
 */

// AR Aging by location, customer, and period
export const arAging = mysqlTable("arAging", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  customerId: int("customerId").notNull(),
  periodId: int("periodId").notNull(),
  amount0_30: decimal("amount0_30", { precision: 15, scale: 2 }).default("0").notNull(),
  amount31_60: decimal("amount31_60", { precision: 15, scale: 2 }).default("0").notNull(),
  amount61_90: decimal("amount61_90", { precision: 15, scale: 2 }).default("0").notNull(),
  amount90_plus: decimal("amount90_plus", { precision: 15, scale: 2 }).default("0").notNull(),
  totalAR: decimal("totalAR", { precision: 15, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ARaging = typeof arAging.$inferSelect;
export type InsertARaging = typeof arAging.$inferInsert;

// Collection history for trend analysis
export const collectionHistory = mysqlTable("collectionHistory", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  periodId: int("periodId").notNull(),
  amountCollected: decimal("amountCollected", { precision: 15, scale: 2 }).notNull(),
  collectionRate: decimal("collectionRate", { precision: 5, scale: 2 }).notNull(), // Percentage
  daysToCollect: int("daysToCollect"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollectionHistory = typeof collectionHistory.$inferSelect;
export type InsertCollectionHistory = typeof collectionHistory.$inferInsert;

// Collection assumptions by location and aging bucket
export const collectionAssumptions = mysqlTable("collectionAssumptions", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  agingBucket: varchar("agingBucket", { length: 20 }).notNull(), // "0-30", "31-60", etc.
  baseCollectionRate: decimal("baseCollectionRate", { precision: 5, scale: 2 }).notNull(),
  optimisticRate: decimal("optimisticRate", { precision: 5, scale: 2 }),
  conservativeRate: decimal("conservativeRate", { precision: 5, scale: 2 }),
  daysToCollect: int("daysToCollect").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CollectionAssumptions = typeof collectionAssumptions.$inferSelect;
export type InsertCollectionAssumptions = typeof collectionAssumptions.$inferInsert;

/**
 * AP & Payables Tables
 */

// AP Aging by location, vendor, and period
export const apAging = mysqlTable("apAging", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  vendorId: int("vendorId").notNull(),
  periodId: int("periodId").notNull(),
  amount0_30: decimal("amount0_30", { precision: 15, scale: 2 }).default("0").notNull(),
  amount31_60: decimal("amount31_60", { precision: 15, scale: 2 }).default("0").notNull(),
  amount61_90: decimal("amount61_90", { precision: 15, scale: 2 }).default("0").notNull(),
  amount90_plus: decimal("amount90_plus", { precision: 15, scale: 2 }).default("0").notNull(),
  totalAP: decimal("totalAP", { precision: 15, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type APaging = typeof apAging.$inferSelect;
export type InsertAPaging = typeof apAging.$inferInsert;

/**
 * Transaction Tables
 */

// General ledger transactions
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  accountId: int("accountId").notNull(),
  periodId: int("periodId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["debit", "credit"]).notNull(),
  description: text("description"),
  referenceId: varchar("referenceId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

// Inventory by location and period
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  periodId: int("periodId").notNull(),
  quantity: decimal("quantity", { precision: 15, scale: 2 }).notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Budget & Forecast Tables
 */

// Budget by location, account, and period
export const budget = mysqlTable("budget", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  accountId: int("accountId").notNull(),
  periodId: int("periodId").notNull(),
  budgetedAmount: decimal("budgetedAmount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budget.$inferSelect;
export type InsertBudget = typeof budget.$inferInsert;

// Forecast assumptions for scenario modeling
export const forecastAssumptions = mysqlTable("forecastAssumptions", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  scenario: mysqlEnum("scenario", ["base", "optimistic", "conservative"]).notNull(),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForecastAssumptions = typeof forecastAssumptions.$inferSelect;
export type InsertForecastAssumptions = typeof forecastAssumptions.$inferInsert;

/**
 * Calculated Results Tables (for caching)
 */

// Cached AR forecast results
export const arForecast = mysqlTable("arForecast", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  periodId: int("periodId").notNull(),
  scenario: mysqlEnum("scenario", ["base", "optimistic", "conservative"]).notNull(),
  forecastedCollection: decimal("forecastedCollection", { precision: 15, scale: 2 }).notNull(),
  collectionEffectiveness: decimal("collectionEffectiveness", { precision: 5, scale: 2 }).notNull(),
  dso: decimal("dso", { precision: 8, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type ARForecast = typeof arForecast.$inferSelect;
export type InsertARForecast = typeof arForecast.$inferInsert;

// Cached cash flow statement results
export const cashFlowStatement = mysqlTable("cashFlowStatement", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  periodId: int("periodId").notNull(),
  scenario: mysqlEnum("scenario", ["base", "optimistic", "conservative"]).notNull(),
  operatingCashFlow: decimal("operatingCashFlow", { precision: 15, scale: 2 }).notNull(),
  investingCashFlow: decimal("investingCashFlow", { precision: 15, scale: 2 }).notNull(),
  financingCashFlow: decimal("financingCashFlow", { precision: 15, scale: 2 }).notNull(),
  netCashFlow: decimal("netCashFlow", { precision: 15, scale: 2 }).notNull(),
  openingCash: decimal("openingCash", { precision: 15, scale: 2 }).notNull(),
  closingCash: decimal("closingCash", { precision: 15, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type CashFlowStatement = typeof cashFlowStatement.$inferSelect;
export type InsertCashFlowStatement = typeof cashFlowStatement.$inferInsert;

// Cached P&L statement results
export const plStatement = mysqlTable("plStatement", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  periodId: int("periodId").notNull(),
  revenue: decimal("revenue", { precision: 15, scale: 2 }).notNull(),
  cogs: decimal("cogs", { precision: 15, scale: 2 }).notNull(),
  grossProfit: decimal("grossProfit", { precision: 15, scale: 2 }).notNull(),
  grossMargin: decimal("grossMargin", { precision: 5, scale: 2 }).notNull(),
  operatingExpenses: decimal("operatingExpenses", { precision: 15, scale: 2 }).notNull(),
  ebitda: decimal("ebitda", { precision: 15, scale: 2 }).notNull(),
  ebitdaMargin: decimal("ebitdaMargin", { precision: 5, scale: 2 }).notNull(),
  netProfit: decimal("netProfit", { precision: 15, scale: 2 }).notNull(),
  netMargin: decimal("netMargin", { precision: 5, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type PLStatement = typeof plStatement.$inferSelect;
export type InsertPLStatement = typeof plStatement.$inferInsert;

// Cached working capital metrics
export const workingCapitalMetrics = mysqlTable("workingCapitalMetrics", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  periodId: int("periodId").notNull(),
  dso: decimal("dso", { precision: 8, scale: 2 }).notNull(),
  dpo: decimal("dpo", { precision: 8, scale: 2 }).notNull(),
  dio: decimal("dio", { precision: 8, scale: 2 }).notNull(),
  ccc: decimal("ccc", { precision: 8, scale: 2 }).notNull(),
  currentRatio: decimal("currentRatio", { precision: 8, scale: 2 }).notNull(),
  quickRatio: decimal("quickRatio", { precision: 8, scale: 2 }).notNull(),
  netWorkingCapital: decimal("netWorkingCapital", { precision: 15, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculatedAt").defaultNow().notNull(),
});

export type WorkingCapitalMetrics = typeof workingCapitalMetrics.$inferSelect;
export type InsertWorkingCapitalMetrics = typeof workingCapitalMetrics.$inferInsert;

/**
 * Report & Export Tables
 */

// Generated financial reports
export const financialReports = mysqlTable("financialReports", {
  id: int("id").autoincrement().primaryKey(),
  locationId: int("locationId").notNull(),
  reportType: varchar("reportType", { length: 50 }).notNull(), // "ar_forecast", "cash_flow", "pl", "wc"
  periodId: int("periodId").notNull(),
  scenario: mysqlEnum("scenario", ["base", "optimistic", "conservative"]).default("base").notNull(),
  dataJson: json("dataJson").notNull(),
  exportUrl: varchar("exportUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = typeof financialReports.$inferInsert;

// Audit trail for data changes
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  entityType: varchar("entityType", { length: 50 }).notNull(),
  entityId: int("entityId").notNull(),
  action: mysqlEnum("action", ["create", "update", "delete"]).notNull(),
  oldValues: json("oldValues"),
  newValues: json("newValues"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
