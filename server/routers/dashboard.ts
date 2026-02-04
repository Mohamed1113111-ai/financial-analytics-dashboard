import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import {
  arAging,
  cashFlowStatement,
  plStatement,
  workingCapitalMetrics,
  timePeriods,
} from "../../drizzle/schema";
import Decimal from "decimal.js";

export const dashboardRouter = router({
  /**
   * Get dashboard metrics for selected locations and date range
   */
  metrics: protectedProcedure
    .input(
      z.object({
        locationIds: z.array(z.number()).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          totalAROutstanding: 0,
          arChange: 0,
          monthlyCashFlow: 0,
          cashFlowChange: 0,
          grossMargin: 0,
          marginChange: 0,
          workingCapital: 0,
          wcChange: 0,
          arAging: {
            "0-30": 0,
            "31-60": 0,
            "61-90": 0,
            "90+": 0,
          },
          topLocations: [],
        };
      }

      try {
        // Fetch AR data
        const arRecords = await db.select().from(arAging).limit(100);

        // Filter by location if specified
        const filteredAR = input.locationIds
          ? arRecords.filter((r) => input.locationIds?.includes(r.locationId))
          : arRecords;

        // Calculate total AR outstanding
        const totalAROutstanding = filteredAR.reduce((sum: any, record: any) => {
          const amount0_30 = new Decimal(record.amount0_30 || 0);
          const amount31_60 = new Decimal(record.amount31_60 || 0);
          const amount61_90 = new Decimal(record.amount61_90 || 0);
          const amount90_plus = new Decimal(record.amount90_plus || 0);
          return sum.plus(amount0_30).plus(amount31_60).plus(amount61_90).plus(amount90_plus);
        }, new Decimal(0));

        // Calculate AR aging breakdown
        const arAgingBuckets: any = filteredAR.reduce(
          (acc: any, record: any) => ({
            "0-30": acc["0-30"].plus(record.amount0_30 || 0),
            "31-60": acc["31-60"].plus(record.amount31_60 || 0),
            "61-90": acc["61-90"].plus(record.amount61_90 || 0),
            "90+": acc["90+"].plus(record.amount90_plus || 0),
          }),
          {
            "0-30": new Decimal(0),
            "31-60": new Decimal(0),
            "61-90": new Decimal(0),
            "90+": new Decimal(0),
          }
        );

        // Fetch cash flow data
        const cfRecords = await db.select().from(cashFlowStatement).limit(100);
        const filteredCF = input.locationIds
          ? cfRecords.filter((r) => input.locationIds?.includes(r.locationId))
          : cfRecords;

        // Calculate monthly cash flow (sum of recent months)
        const monthlyCashFlow = filteredCF.reduce((sum, record) => {
          return sum.plus(record.netCashFlow || 0);
        }, new Decimal(0));

        // Fetch P&L data
        const plRecords = await db.select().from(plStatement).limit(100);
        const filteredPL = input.locationIds
          ? plRecords.filter((r) => input.locationIds?.includes(r.locationId))
          : plRecords;

        // Calculate gross margin
        let grossMargin = new Decimal(0);
        if (filteredPL.length > 0) {
          const totalRevenue = filteredPL.reduce((sum, r) => sum.plus(r.revenue || 0), new Decimal(0));
          const totalCOGS = filteredPL.reduce((sum, r) => sum.plus(r.cogs || 0), new Decimal(0));
          if (totalRevenue.gt(0)) {
            grossMargin = totalRevenue.minus(totalCOGS).dividedBy(totalRevenue);
          }
        }

        // Fetch working capital data
        const wcRecords = await db.select().from(workingCapitalMetrics).limit(100);
        const filteredWC = input.locationIds
          ? wcRecords.filter((r) => input.locationIds?.includes(r.locationId))
          : wcRecords;

        // Calculate working capital
        const workingCapital = filteredWC.reduce((sum, record) => {
          return sum.plus(record.netWorkingCapital || 0);
        }, new Decimal(0));

        // Calculate changes (simplified - compare with previous period)
        const arChange = totalAROutstanding.gt(0) ? 8.2 : 0; // Mock change for demo
        const cashFlowChange = monthlyCashFlow.gt(0) ? 12.5 : 0;
        const marginChange = grossMargin.gt(0) ? -2.1 : 0;
        const wcChange = workingCapital.gt(0) ? 5.3 : 0;

        // Get top locations by AR
        const topLocations = filteredAR
          .slice(0, 5)
          .map((r: any) => ({
            locationId: r.locationId,
            arAmount: new Decimal(r.amount0_30 || 0)
              .plus(r.amount31_60 || 0)
              .plus(r.amount61_90 || 0)
              .plus(r.amount90_plus || 0),
            daysOverdue: Math.round(
              (new Decimal(r.amount31_60 || 0)
                .plus(r.amount61_90 || 0)
                .plus(r.amount90_plus || 0)
                .toNumber() /
                (new Decimal(r.amount0_30 || 0)
                  .plus(r.amount31_60 || 0)
                  .plus(r.amount61_90 || 0)
                  .plus(r.amount90_plus || 0)
                  .toNumber() || 1)) *
                45
            ),
          }));

        return {
          totalAROutstanding: parseFloat(totalAROutstanding.toFixed(2)),
          arChange,
          monthlyCashFlow: parseFloat(monthlyCashFlow.toFixed(2)),
          cashFlowChange,
          grossMargin: parseFloat(grossMargin.toFixed(4)),
          marginChange,
          workingCapital: parseFloat(workingCapital.toFixed(2)),
          wcChange,
          arAging: {
            "0-30": parseFloat(arAgingBuckets["0-30"].toFixed(2)),
            "31-60": parseFloat(arAgingBuckets["31-60"].toFixed(2)),
            "61-90": parseFloat(arAgingBuckets["61-90"].toFixed(2)),
            "90+": parseFloat(arAgingBuckets["90+"].toFixed(2)),
          },
          topLocations,
        };
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        throw new Error("Failed to fetch dashboard metrics");
      }
    }),

  /**
   * Get AR aging summary
   */
  arAgingSummary: protectedProcedure
    .input(
      z.object({
        locationIds: z.array(z.number()).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const records = await db.select().from(arAging).limit(100);
        const filtered = input.locationIds
          ? records.filter((r) => input.locationIds?.includes(r.locationId))
          : records;

        return filtered.map((r: any) => ({
          id: r.id,
          customerId: r.customerId,
          locationId: r.locationId,
          bucket0_30: parseFloat(new Decimal(r.amount0_30 || 0).toFixed(2)),
          bucket31_60: parseFloat(new Decimal(r.amount31_60 || 0).toFixed(2)),
          bucket61_90: parseFloat(new Decimal(r.amount61_90 || 0).toFixed(2)),
          bucket90_plus: parseFloat(new Decimal(r.amount90_plus || 0).toFixed(2)),
          total: parseFloat(
            new Decimal(r.amount0_30 || 0)
              .plus(r.amount31_60 || 0)
              .plus(r.amount61_90 || 0)
              .plus(r.amount90_plus || 0)
              .toFixed(2)
          ),
        }));
      } catch (error) {
        console.error("Error fetching AR aging summary:", error);
        throw new Error("Failed to fetch AR aging summary");
      }
    }),

  /**
   * Get cash flow summary
   */
  cashFlowSummary: protectedProcedure
    .input(
      z.object({
        locationIds: z.array(z.number()).optional(),
        limit: z.number().default(12),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const records = await db.select().from(cashFlowStatement).limit(input.limit);
        const filtered = input.locationIds
          ? records.filter((r) => input.locationIds?.includes(r.locationId))
          : records;

        return filtered.map((r: any) => ({
          id: r.id,
          periodId: r.periodId,
          locationId: r.locationId,
          operatingCashFlow: parseFloat(new Decimal(r.operatingCashFlow || 0).toFixed(2)),
          investingCashFlow: parseFloat(new Decimal(r.investingCashFlow || 0).toFixed(2)),
          financingCashFlow: parseFloat(new Decimal(r.financingCashFlow || 0).toFixed(2)),
          netCashFlow: parseFloat(new Decimal(r.netCashFlow || 0).toFixed(2)),
        }));
      } catch (error) {
        console.error("Error fetching cash flow summary:", error);
        throw new Error("Failed to fetch cash flow summary");
      }
    }),

  /**
   * Get P&L summary
   */
  plSummary: protectedProcedure
    .input(
      z.object({
        locationIds: z.array(z.number()).optional(),
        limit: z.number().default(3),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const records = await db.select().from(plStatement).limit(input.limit);
        const filtered = input.locationIds
          ? records.filter((r) => input.locationIds?.includes(r.locationId))
          : records;

        return filtered.map((r: any) => ({
          id: r.id,
          periodId: r.periodId,
          locationId: r.locationId,
          revenue: parseFloat(new Decimal(r.revenue || 0).toFixed(2)),
          cogs: parseFloat(new Decimal(r.cogs || 0).toFixed(2)),
          grossProfit: parseFloat(new Decimal(r.grossProfit || 0).toFixed(2)),
          operatingExpenses: parseFloat(new Decimal(r.operatingExpenses || 0).toFixed(2)),
          ebitda: parseFloat(new Decimal(r.ebitda || 0).toFixed(2)),
          netProfit: parseFloat(new Decimal(r.netProfit || 0).toFixed(2)),
        }));
      } catch (error) {
        console.error("Error fetching P&L summary:", error);
        throw new Error("Failed to fetch P&L summary");
      }
    }),
});
