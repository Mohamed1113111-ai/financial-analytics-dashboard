import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { calculateCashFlow, applyScenarioFactors } from "../calculations";
import Decimal from "decimal.js";

/**
 * Cash Flow Router
 * Handles cash flow statement generation, forecasting, and stress testing
 */

// Schema for cash flow inputs
const CashFlowInputSchema = z.object({
  locationId: z.number().optional(),
  periodId: z.number().optional(),
  openingCash: z.number(),
  arCollections: z.number(),
  apPayments: z.number(),
  payroll: z.number(),
  capex: z.number(),
  debtProceeds: z.number().default(0),
  debtRepayment: z.number().default(0),
  equityProceeds: z.number().default(0),
  workingCapitalChange: z.number().default(0),
});

// Schema for stress testing scenarios
const StressTestSchema = z.object({
  locationId: z.number().optional(),
  baseOpeningCash: z.number(),
  baseArCollections: z.number(),
  baseApPayments: z.number(),
  basePayroll: z.number(),
  baseCapex: z.number(),
  scenarios: z.array(
    z.object({
      name: z.enum(["base", "optimistic", "conservative"]),
      arCollectionAdjustment: z.number().default(0),
      apPaymentAdjustment: z.number().default(0),
      payrollAdjustment: z.number().default(0),
      capexAdjustment: z.number().default(0),
    })
  ),
  months: z.number().min(1).max(24).default(12),
});

export const cashflowRouter = router({
  /**
   * Calculate cash flow statement for a given period
   */
  calculateStatement: protectedProcedure
    .input(CashFlowInputSchema)
    .query(({ input }) => {
      const result = calculateCashFlow({
        openingCash: input.openingCash,
        arCollections: input.arCollections,
        apPayments: input.apPayments,
        payroll: input.payroll,
        capex: input.capex,
        debtProceeds: input.debtProceeds,
        debtRepayment: input.debtRepayment,
        equityProceeds: input.equityProceeds,
        workingCapitalChange: input.workingCapitalChange,
      });

      return {
        ...result,
        // Convert to serializable format
        operatingCashFlow: Math.round(result.operatingCashFlow * 100) / 100,
        investingCashFlow: Math.round(result.investingCashFlow * 100) / 100,
        financingCashFlow: Math.round(result.financingCashFlow * 100) / 100,
        netCashFlow: Math.round(result.netCashFlow * 100) / 100,
        closingCash: Math.round(result.closingCash * 100) / 100,
      };
    }),

  /**
   * Generate waterfall data for visualization
   */
  getWaterfallData: protectedProcedure
    .input(CashFlowInputSchema)
    .query(({ input }) => {
      const result = calculateCashFlow({
        openingCash: input.openingCash,
        arCollections: input.arCollections,
        apPayments: input.apPayments,
        payroll: input.payroll,
        capex: input.capex,
        debtProceeds: input.debtProceeds,
        debtRepayment: input.debtRepayment,
        equityProceeds: input.equityProceeds,
        workingCapitalChange: input.workingCapitalChange,
      });

      // Build waterfall data structure
      const waterfallData = [
        {
          name: "Opening Cash",
          value: Math.round(input.openingCash * 100) / 100,
          fill: "#3b82f6",
        },
        {
          name: "AR Collections",
          value: Math.round(input.arCollections * 100) / 100,
          fill: "#10b981",
        },
        {
          name: "AP Payments",
          value: -Math.round(input.apPayments * 100) / 100,
          fill: "#ef4444",
        },
        {
          name: "Payroll",
          value: -Math.round(input.payroll * 100) / 100,
          fill: "#f59e0b",
        },
        {
          name: "CapEx",
          value: -Math.round(input.capex * 100) / 100,
          fill: "#8b5cf6",
        },
      ];

      if (input.debtProceeds > 0) {
        waterfallData.push({
          name: "Debt Proceeds",
          value: Math.round(input.debtProceeds * 100) / 100,
          fill: "#06b6d4",
        });
      }

      if (input.debtRepayment > 0) {
        waterfallData.push({
          name: "Debt Repayment",
          value: -Math.round(input.debtRepayment * 100) / 100,
          fill: "#ec4899",
        });
      }

      waterfallData.push({
        name: "Closing Cash",
        value: Math.round(result.closingCash * 100) / 100,
        fill: "#6366f1",
      });

      return {
        waterfall: waterfallData,
        summary: {
          operatingCashFlow: Math.round(result.operatingCashFlow * 100) / 100,
          investingCashFlow: Math.round(result.investingCashFlow * 100) / 100,
          financingCashFlow: Math.round(result.financingCashFlow * 100) / 100,
          netCashFlow: Math.round(result.netCashFlow * 100) / 100,
        },
      };
    }),

  /**
   * Run liquidity stress testing with multiple scenarios
   */
  stressTest: protectedProcedure
    .input(StressTestSchema)
    .query(({ input }) => {
      const results = input.scenarios.map((scenario) => {
        const adjustedArCollections = new Decimal(input.baseArCollections)
          .times(new Decimal(1).plus(new Decimal(scenario.arCollectionAdjustment).dividedBy(100)))
          .toNumber();

        const adjustedApPayments = new Decimal(input.baseApPayments)
          .times(new Decimal(1).plus(new Decimal(scenario.apPaymentAdjustment).dividedBy(100)))
          .toNumber();

        const adjustedPayroll = new Decimal(input.basePayroll)
          .times(new Decimal(1).plus(new Decimal(scenario.payrollAdjustment).dividedBy(100)))
          .toNumber();

        const adjustedCapex = new Decimal(input.baseCapex)
          .times(new Decimal(1).plus(new Decimal(scenario.capexAdjustment).dividedBy(100)))
          .toNumber();

        const result = calculateCashFlow({
          openingCash: input.baseOpeningCash,
          arCollections: adjustedArCollections,
          apPayments: adjustedApPayments,
          payroll: adjustedPayroll,
          capex: adjustedCapex,
          debtProceeds: 0,
          debtRepayment: 0,
          equityProceeds: 0,
          workingCapitalChange: 0,
        });

        // Calculate liquidity metrics
        const closingCash = result.closingCash;
        const minimumCashRequired = new Decimal(adjustedPayroll)
          .plus(adjustedApPayments)
          .times(0.1)
          .toNumber(); // 10% buffer

        const liquidityRatio = minimumCashRequired > 0 ? closingCash / minimumCashRequired : 0;
        const isLiquidityCritical = closingCash < minimumCashRequired;

        return {
          scenario: scenario.name,
          closingCash: Math.round(closingCash * 100) / 100,
          netCashFlow: Math.round(result.netCashFlow * 100) / 100,
          operatingCashFlow: Math.round(result.operatingCashFlow * 100) / 100,
          liquidityRatio: Math.round(liquidityRatio * 100) / 100,
          isLiquidityCritical,
          status:
            liquidityRatio >= 2
              ? "healthy"
              : liquidityRatio >= 1
                ? "adequate"
                : liquidityRatio >= 0.5
                  ? "stressed"
                  : "critical",
        };
      });

      return {
        stressTestResults: results,
        baselineClosingCash: Math.round(input.baseOpeningCash * 100) / 100,
        recommendations: generateRecommendations(results),
      };
    }),

  /**
   * Generate rolling 12-month cash flow forecast
   */
  getRollingForecast: protectedProcedure
    .input(
      z.object({
        locationId: z.number().optional(),
        baseMonthlyArCollections: z.number(),
        baseMonthlyApPayments: z.number(),
        baseMonthlyPayroll: z.number(),
        baseMonthlyCapex: z.number(),
        openingCash: z.number(),
        growthRate: z.number().default(0.02), // 2% default growth
        seasonalityFactors: z.array(z.number()).length(12).optional(),
      })
    )
    .query(({ input }) => {
      const forecast = [];
      let currentCash = input.openingCash;
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      for (let i = 0; i < 12; i++) {
        const seasonalityFactor = input.seasonalityFactors?.[i] || 1.0;
        const growthMultiplier = Math.pow(1 + input.growthRate, i);

        const arCollections = new Decimal(input.baseMonthlyArCollections)
          .times(growthMultiplier)
          .times(seasonalityFactor)
          .toNumber();

        const apPayments = new Decimal(input.baseMonthlyApPayments)
          .times(growthMultiplier)
          .times(seasonalityFactor)
          .toNumber();

        const payroll = new Decimal(input.baseMonthlyPayroll)
          .times(growthMultiplier)
          .toNumber();

        const capex = new Decimal(input.baseMonthlyCapex)
          .times(seasonalityFactor)
          .toNumber();

        const result = calculateCashFlow({
          openingCash: currentCash,
          arCollections,
          apPayments,
          payroll,
          capex,
          debtProceeds: 0,
          debtRepayment: 0,
          equityProceeds: 0,
          workingCapitalChange: 0,
        });

        forecast.push({
          month: months[i],
          monthNumber: i + 1,
          openingCash: Math.round(currentCash * 100) / 100,
          arCollections: Math.round(arCollections * 100) / 100,
          apPayments: Math.round(apPayments * 100) / 100,
          payroll: Math.round(payroll * 100) / 100,
          capex: Math.round(capex * 100) / 100,
          operatingCashFlow: Math.round(result.operatingCashFlow * 100) / 100,
          netCashFlow: Math.round(result.netCashFlow * 100) / 100,
          closingCash: Math.round(result.closingCash * 100) / 100,
        });

        currentCash = result.closingCash;
      }

      return {
        forecast,
        averageMonthlyClosingCash:
          Math.round(
            (forecast.reduce((sum, m) => sum + m.closingCash, 0) / 12) * 100
          ) / 100,
        minCash: Math.round(Math.min(...forecast.map((m) => m.closingCash)) * 100) / 100,
        maxCash: Math.round(Math.max(...forecast.map((m) => m.closingCash)) * 100) / 100,
        endingCash: Math.round(forecast[11]?.closingCash || 0 * 100) / 100,
      };
    }),
});

/**
 * Generate recommendations based on stress test results
 */
function generateRecommendations(
  results: Array<{
    scenario: string;
    closingCash: number;
    liquidityRatio: number;
    isLiquidityCritical: boolean;
    status: string;
  }>
): string[] {
  const recommendations: string[] = [];
  const criticalScenarios = results.filter((r) => r.isLiquidityCritical);

  if (criticalScenarios.length > 0) {
    recommendations.push(
      `⚠️ Liquidity risk detected in ${criticalScenarios.map((s) => s.scenario).join(", ")} scenarios. Consider securing credit facilities.`
    );
  }

  const conservativeResult = results.find((r) => r.scenario === "conservative");
  if (conservativeResult && conservativeResult.liquidityRatio < 1) {
    recommendations.push(
      "📊 Conservative scenario shows inadequate liquidity. Review AR collection rates and AP payment terms."
    );
  }

  const allHealthy = results.every((r) => r.status === "healthy");
  if (allHealthy) {
    recommendations.push("✅ Strong liquidity position across all scenarios. Good operational flexibility.");
  }

  if (recommendations.length === 0) {
    recommendations.push("📈 Monitor cash flow trends and maintain current working capital management practices.");
  }

  return recommendations;
}
