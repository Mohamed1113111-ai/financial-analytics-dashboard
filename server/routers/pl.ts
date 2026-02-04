import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { calculatePL, calculateVariance } from "../calculations";
import Decimal from "decimal.js";

/**
 * P&L Router
 * Handles P&L statement generation, variance analysis, and period comparisons
 */

// Schema for P&L inputs
const PLInputSchema = z.object({
  revenue: z.number(),
  cogs: z.number(),
  operatingExpenses: z.number(),
  depreciation: z.number(),
  interestExpense: z.number(),
  taxRate: z.number().min(0).max(100),
  locationId: z.number().optional(),
  periodId: z.number().optional(),
});

// Schema for budget data
const BudgetInputSchema = z.object({
  revenue: z.number(),
  cogs: z.number(),
  operatingExpenses: z.number(),
  depreciation: z.number(),
  interestExpense: z.number(),
  taxRate: z.number().min(0).max(100),
});

// Schema for period comparison
const PeriodComparisonSchema = z.object({
  currentPeriod: PLInputSchema,
  previousPeriod: PLInputSchema,
  periodName: z.string().optional(),
  previousPeriodName: z.string().optional(),
});

// Schema for multi-period analysis
const MultiPeriodSchema = z.object({
  periods: z.array(
    z.object({
      name: z.string(),
      revenue: z.number(),
      cogs: z.number(),
      operatingExpenses: z.number(),
      depreciation: z.number(),
      interestExpense: z.number(),
      taxRate: z.number(),
    })
  ),
  locationId: z.number().optional(),
});

export const plRouter = router({
  /**
   * Calculate P&L statement for a given period
   */
  calculateStatement: protectedProcedure
    .input(PLInputSchema)
    .query(({ input }) => {
      const result = calculatePL({
        revenue: input.revenue,
        cogs: input.cogs,
        operatingExpenses: input.operatingExpenses,
        depreciation: input.depreciation,
        interestExpense: input.interestExpense,
        taxRate: input.taxRate,
      });

      return {
        revenue: Math.round(result.revenue * 100) / 100,
        cogs: Math.round(result.cogs * 100) / 100,
        grossProfit: Math.round(result.grossProfit * 100) / 100,
        grossMargin: Math.round(result.grossMargin * 100) / 100,
        operatingExpenses: Math.round(result.operatingExpenses * 100) / 100,
        ebitda: Math.round(result.ebitda * 100) / 100,
        ebitdaMargin: Math.round(result.ebitdaMargin * 100) / 100,
        depreciation: Math.round(result.depreciation * 100) / 100,
        ebit: Math.round(result.ebit * 100) / 100,
        ebitMargin: Math.round(result.ebitMargin * 100) / 100,
        interestExpense: Math.round(result.interestExpense * 100) / 100,
        ebt: Math.round(result.ebt * 100) / 100,
        taxes: Math.round(result.taxes * 100) / 100,
        netProfit: Math.round(result.netProfit * 100) / 100,
        netMargin: Math.round(result.netMargin * 100) / 100,
      };
    }),

  /**
   * Analyze budget vs actual variance
   */
  analyzeBudgetVariance: protectedProcedure
    .input(
      z.object({
        actual: PLInputSchema,
        budget: BudgetInputSchema,
        locationId: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const actualResult = calculatePL({
        revenue: input.actual.revenue,
        cogs: input.actual.cogs,
        operatingExpenses: input.actual.operatingExpenses,
        depreciation: input.actual.depreciation,
        interestExpense: input.actual.interestExpense,
        taxRate: input.actual.taxRate,
      });

      const budgetResult = calculatePL({
        revenue: input.budget.revenue,
        cogs: input.budget.cogs,
        operatingExpenses: input.budget.operatingExpenses,
        depreciation: input.budget.depreciation,
        interestExpense: input.budget.interestExpense,
        taxRate: input.budget.taxRate,
      });

      // Calculate variances for key line items
      const variances = {
        revenue: calculateVariance(actualResult.revenue, budgetResult.revenue, false),
        cogs: calculateVariance(actualResult.cogs, budgetResult.cogs, true),
        grossProfit: calculateVariance(actualResult.grossProfit, budgetResult.grossProfit, false),
        operatingExpenses: calculateVariance(
          actualResult.operatingExpenses,
          budgetResult.operatingExpenses,
          true
        ),
        ebitda: calculateVariance(actualResult.ebitda, budgetResult.ebitda, false),
        ebit: calculateVariance(actualResult.ebit, budgetResult.ebit, false),
        netProfit: calculateVariance(actualResult.netProfit, budgetResult.netProfit, false),
      };

      // Calculate margin variances
      const marginVariances = {
        grossMargin: {
          actual: Math.round(actualResult.grossMargin * 100) / 100,
          budget: Math.round(budgetResult.grossMargin * 100) / 100,
          variance: Math.round((actualResult.grossMargin - budgetResult.grossMargin) * 100) / 100,
          status:
            actualResult.grossMargin > budgetResult.grossMargin ? "favorable" : "unfavorable",
        },
        ebitdaMargin: {
          actual: Math.round(actualResult.ebitdaMargin * 100) / 100,
          budget: Math.round(budgetResult.ebitdaMargin * 100) / 100,
          variance: Math.round((actualResult.ebitdaMargin - budgetResult.ebitdaMargin) * 100) / 100,
          status:
            actualResult.ebitdaMargin > budgetResult.ebitdaMargin ? "favorable" : "unfavorable",
        },
        netMargin: {
          actual: Math.round(actualResult.netMargin * 100) / 100,
          budget: Math.round(budgetResult.netMargin * 100) / 100,
          variance: Math.round((actualResult.netMargin - budgetResult.netMargin) * 100) / 100,
          status:
            actualResult.netMargin > budgetResult.netMargin ? "favorable" : "unfavorable",
        },
      };

      return {
        actual: {
          revenue: Math.round(actualResult.revenue * 100) / 100,
          cogs: Math.round(actualResult.cogs * 100) / 100,
          grossProfit: Math.round(actualResult.grossProfit * 100) / 100,
          operatingExpenses: Math.round(actualResult.operatingExpenses * 100) / 100,
          ebitda: Math.round(actualResult.ebitda * 100) / 100,
          ebit: Math.round(actualResult.ebit * 100) / 100,
          netProfit: Math.round(actualResult.netProfit * 100) / 100,
        },
        budget: {
          revenue: Math.round(budgetResult.revenue * 100) / 100,
          cogs: Math.round(budgetResult.cogs * 100) / 100,
          grossProfit: Math.round(budgetResult.grossProfit * 100) / 100,
          operatingExpenses: Math.round(budgetResult.operatingExpenses * 100) / 100,
          ebitda: Math.round(budgetResult.ebitda * 100) / 100,
          ebit: Math.round(budgetResult.ebit * 100) / 100,
          netProfit: Math.round(budgetResult.netProfit * 100) / 100,
        },
        variances,
        marginVariances,
        totalFavorableVariance: Math.round(
          Object.values(variances)
            .filter((v) => v.status === "favorable")
            .reduce((sum, v) => sum + v.variance, 0) * 100
        ) / 100,
        totalUnfavorableVariance: Math.round(
          Object.values(variances)
            .filter((v) => v.status === "unfavorable")
            .reduce((sum, v) => sum + Math.abs(v.variance), 0) * 100
        ) / 100,
      };
    }),

  /**
   * Compare two periods (e.g., current month vs previous month)
   */
  comparePeriods: protectedProcedure
    .input(PeriodComparisonSchema)
    .query(({ input }) => {
      const currentResult = calculatePL({
        revenue: input.currentPeriod.revenue,
        cogs: input.currentPeriod.cogs,
        operatingExpenses: input.currentPeriod.operatingExpenses,
        depreciation: input.currentPeriod.depreciation,
        interestExpense: input.currentPeriod.interestExpense,
        taxRate: input.currentPeriod.taxRate,
      });

      const previousResult = calculatePL({
        revenue: input.previousPeriod.revenue,
        cogs: input.previousPeriod.cogs,
        operatingExpenses: input.previousPeriod.operatingExpenses,
        depreciation: input.previousPeriod.depreciation,
        interestExpense: input.previousPeriod.interestExpense,
        taxRate: input.previousPeriod.taxRate,
      });

      // Calculate period-over-period changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return 0;
        return Math.round(((current - previous) / Math.abs(previous)) * 10000) / 100;
      };

      return {
        current: {
          period: input.periodName || "Current",
          revenue: Math.round(currentResult.revenue * 100) / 100,
          cogs: Math.round(currentResult.cogs * 100) / 100,
          grossProfit: Math.round(currentResult.grossProfit * 100) / 100,
          grossMargin: Math.round(currentResult.grossMargin * 100) / 100,
          operatingExpenses: Math.round(currentResult.operatingExpenses * 100) / 100,
          ebitda: Math.round(currentResult.ebitda * 100) / 100,
          ebitdaMargin: Math.round(currentResult.ebitdaMargin * 100) / 100,
          ebit: Math.round(currentResult.ebit * 100) / 100,
          netProfit: Math.round(currentResult.netProfit * 100) / 100,
          netMargin: Math.round(currentResult.netMargin * 100) / 100,
        },
        previous: {
          period: input.previousPeriodName || "Previous",
          revenue: Math.round(previousResult.revenue * 100) / 100,
          cogs: Math.round(previousResult.cogs * 100) / 100,
          grossProfit: Math.round(previousResult.grossProfit * 100) / 100,
          grossMargin: Math.round(previousResult.grossMargin * 100) / 100,
          operatingExpenses: Math.round(previousResult.operatingExpenses * 100) / 100,
          ebitda: Math.round(previousResult.ebitda * 100) / 100,
          ebitdaMargin: Math.round(previousResult.ebitdaMargin * 100) / 100,
          ebit: Math.round(previousResult.ebit * 100) / 100,
          netProfit: Math.round(previousResult.netProfit * 100) / 100,
          netMargin: Math.round(previousResult.netMargin * 100) / 100,
        },
        changes: {
          revenueChange: calculateChange(currentResult.revenue, previousResult.revenue),
          cogsChange: calculateChange(currentResult.cogs, previousResult.cogs),
          grossProfitChange: calculateChange(currentResult.grossProfit, previousResult.grossProfit),
          grossMarginChange: Math.round(
            (currentResult.grossMargin - previousResult.grossMargin) * 100
          ) / 100,
          operatingExpensesChange: calculateChange(
            currentResult.operatingExpenses,
            previousResult.operatingExpenses
          ),
          ebitdaChange: calculateChange(currentResult.ebitda, previousResult.ebitda),
          ebitdaMarginChange: Math.round(
            (currentResult.ebitdaMargin - previousResult.ebitdaMargin) * 100
          ) / 100,
          ebitChange: calculateChange(currentResult.ebit, previousResult.ebit),
          netProfitChange: calculateChange(currentResult.netProfit, previousResult.netProfit),
          netMarginChange: Math.round(
            (currentResult.netMargin - previousResult.netMargin) * 100
          ) / 100,
        },
      };
    }),

  /**
   * Get multi-period trend analysis
   */
  getTrendAnalysis: protectedProcedure
    .input(MultiPeriodSchema)
    .query(({ input }) => {
      const trends = input.periods.map((period) => {
        const result = calculatePL({
          revenue: period.revenue,
          cogs: period.cogs,
          operatingExpenses: period.operatingExpenses,
          depreciation: period.depreciation,
          interestExpense: period.interestExpense,
          taxRate: period.taxRate,
        });

        return {
          period: period.name,
          revenue: Math.round(result.revenue * 100) / 100,
          cogs: Math.round(result.cogs * 100) / 100,
          grossProfit: Math.round(result.grossProfit * 100) / 100,
          grossMargin: Math.round(result.grossMargin * 100) / 100,
          operatingExpenses: Math.round(result.operatingExpenses * 100) / 100,
          ebitda: Math.round(result.ebitda * 100) / 100,
          ebitdaMargin: Math.round(result.ebitdaMargin * 100) / 100,
          ebit: Math.round(result.ebit * 100) / 100,
          netProfit: Math.round(result.netProfit * 100) / 100,
          netMargin: Math.round(result.netMargin * 100) / 100,
        };
      });

      // Calculate trend statistics
      const revenues = trends.map((t) => t.revenue);
      const netProfits = trends.map((t) => t.netProfit);
      const netMargins = trends.map((t) => t.netMargin);

      const avgRevenue = Math.round((revenues.reduce((a, b) => a + b, 0) / revenues.length) * 100) / 100;
      const avgNetProfit =
        Math.round((netProfits.reduce((a, b) => a + b, 0) / netProfits.length) * 100) / 100;
      const avgNetMargin =
        Math.round((netMargins.reduce((a, b) => a + b, 0) / netMargins.length) * 100) / 100;

      const revenueGrowth =
        revenues.length > 1
          ? Math.round(((revenues[revenues.length - 1] - revenues[0]) / revenues[0]) * 10000) / 100
          : 0;

      const profitGrowth =
        netProfits.length > 1
          ? Math.round(((netProfits[netProfits.length - 1] - netProfits[0]) / Math.abs(netProfits[0])) * 10000) / 100
          : 0;

      return {
        trends,
        statistics: {
          avgRevenue,
          avgNetProfit,
          avgNetMargin,
          revenueGrowth,
          profitGrowth,
          minRevenue: Math.min(...revenues),
          maxRevenue: Math.max(...revenues),
          minNetMargin: Math.min(...netMargins),
          maxNetMargin: Math.max(...netMargins),
        },
      };
    }),

  /**
   * Get variance waterfall data for visualization
   */
  getVarianceWaterfall: protectedProcedure
    .input(
      z.object({
        actual: PLInputSchema,
        budget: BudgetInputSchema,
      })
    )
    .query(({ input }) => {
      const actualResult = calculatePL({
        revenue: input.actual.revenue,
        cogs: input.actual.cogs,
        operatingExpenses: input.actual.operatingExpenses,
        depreciation: input.actual.depreciation,
        interestExpense: input.actual.interestExpense,
        taxRate: input.actual.taxRate,
      });

      const budgetResult = calculatePL({
        revenue: input.budget.revenue,
        cogs: input.budget.cogs,
        operatingExpenses: input.budget.operatingExpenses,
        depreciation: input.budget.depreciation,
        interestExpense: input.budget.interestExpense,
        taxRate: input.budget.taxRate,
      });

      // Build waterfall from budget to actual
      const revenueVariance = actualResult.revenue - budgetResult.revenue;
      const cogsVariance = budgetResult.cogs - actualResult.cogs; // Favorable if actual COGS is lower
      const opexVariance = budgetResult.operatingExpenses - actualResult.operatingExpenses;
      const depreciationVariance = budgetResult.depreciation - actualResult.depreciation;
      const interestVariance = budgetResult.interestExpense - actualResult.interestExpense;
      const taxVariance = budgetResult.taxes - actualResult.taxes;

      const waterfallData = [
        {
          name: "Budget Net Profit",
          value: Math.round(budgetResult.netProfit * 100) / 100,
          fill: "#3b82f6",
        },
        {
          name: "Revenue Variance",
          value: Math.round(revenueVariance * 100) / 100,
          fill: revenueVariance >= 0 ? "#10b981" : "#ef4444",
        },
        {
          name: "COGS Variance",
          value: Math.round(cogsVariance * 100) / 100,
          fill: cogsVariance >= 0 ? "#10b981" : "#ef4444",
        },
        {
          name: "OpEx Variance",
          value: Math.round(opexVariance * 100) / 100,
          fill: opexVariance >= 0 ? "#10b981" : "#ef4444",
        },
        {
          name: "Other Variance",
          value: Math.round((depreciationVariance + interestVariance + taxVariance) * 100) / 100,
          fill: depreciationVariance + interestVariance + taxVariance >= 0 ? "#10b981" : "#ef4444",
        },
        {
          name: "Actual Net Profit",
          value: Math.round(actualResult.netProfit * 100) / 100,
          fill: "#6366f1",
        },
      ];

      return {
        waterfall: waterfallData,
        summary: {
          budgetNetProfit: Math.round(budgetResult.netProfit * 100) / 100,
          actualNetProfit: Math.round(actualResult.netProfit * 100) / 100,
          totalVariance: Math.round((actualResult.netProfit - budgetResult.netProfit) * 100) / 100,
          variancePercent:
            budgetResult.netProfit !== 0
              ? Math.round(
                  ((actualResult.netProfit - budgetResult.netProfit) / Math.abs(budgetResult.netProfit)) *
                    10000
                ) / 100
              : 0,
        },
      };
    }),
});
