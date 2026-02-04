import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { calculateWorkingCapital } from "../calculations";
import Decimal from "decimal.js";

/**
 * Working Capital Router
 * Handles DSO, DPO, DIO, CCC calculations and scenario modeling
 */

// Schema for WC inputs
const WCInputSchema = z.object({
  ar: z.number(),
  revenue: z.number(),
  ap: z.number(),
  cogs: z.number(),
  inventory: z.number(),
  daysInPeriod: z.number().default(30),
  currentAssets: z.number().default(0),
  currentLiabilities: z.number().default(0),
  locationId: z.number().optional(),
  periodId: z.number().optional(),
});

// Schema for scenario modeling
const ScenarioSchema = z.object({
  name: z.string(),
  ar: z.number(),
  revenue: z.number(),
  ap: z.number(),
  cogs: z.number(),
  inventory: z.number(),
  daysInPeriod: z.number().default(30),
  currentAssets: z.number().default(0),
  currentLiabilities: z.number().default(0),
});

// Schema for multi-period trend
const MultiPeriodWCSchema = z.object({
  periods: z.array(
    z.object({
      name: z.string(),
      ar: z.number(),
      revenue: z.number(),
      ap: z.number(),
      cogs: z.number(),
      inventory: z.number(),
      daysInPeriod: z.number().default(30),
      currentAssets: z.number().default(0),
      currentLiabilities: z.number().default(0),
    })
  ),
  locationId: z.number().optional(),
});

// Schema for improvement analysis
const ImprovementAnalysisSchema = z.object({
  baseline: WCInputSchema,
  improvements: z.object({
    arReductionPercent: z.number().min(0).max(100).optional(),
    apIncreasePercent: z.number().min(0).max(100).optional(),
    inventoryReductionPercent: z.number().min(0).max(100).optional(),
  }),
});

export const workingCapitalRouter = router({
  /**
   * Calculate working capital metrics (DSO, DPO, DIO, CCC)
   */
  calculateMetrics: protectedProcedure
    .input(WCInputSchema)
    .query(({ input }) => {
      const result = calculateWorkingCapital({
        ar: input.ar,
        revenue: input.revenue,
        ap: input.ap,
        cogs: input.cogs,
        inventory: input.inventory,
        daysInPeriod: input.daysInPeriod,
        currentAssets: input.currentAssets,
        currentLiabilities: input.currentLiabilities,
      });

      return {
        dso: Math.round(result.dso * 100) / 100,
        dpo: Math.round(result.dpo * 100) / 100,
        dio: Math.round(result.dio * 100) / 100,
        ccc: Math.round(result.ccc * 100) / 100,
        workingCapitalPercentOfRevenue: Math.round(result.workingCapitalPercentOfRevenue * 100) / 100,
        currentRatio: Math.round(result.currentRatio * 100) / 100,
        quickRatio: Math.round(result.quickRatio * 100) / 100,
      };
    }),

  /**
   * Get KPI scorecard with status indicators
   */
  getKPIScorecard: protectedProcedure
    .input(WCInputSchema)
    .query(({ input }) => {
      const result = calculateWorkingCapital({
        ar: input.ar,
        revenue: input.revenue,
        ap: input.ap,
        cogs: input.cogs,
        inventory: input.inventory,
        daysInPeriod: input.daysInPeriod,
        currentAssets: input.currentAssets,
        currentLiabilities: input.currentLiabilities,
      });

      // Determine health status based on industry benchmarks
      const getDSOStatus = (dso: number) => {
        if (dso <= 30) return "excellent";
        if (dso <= 45) return "healthy";
        if (dso <= 60) return "adequate";
        return "concerning";
      };

      const getDPOStatus = (dpo: number) => {
        if (dpo >= 60) return "excellent";
        if (dpo >= 45) return "healthy";
        if (dpo >= 30) return "adequate";
        return "concerning";
      };

      const getDIOStatus = (dio: number) => {
        if (dio <= 30) return "excellent";
        if (dio <= 45) return "healthy";
        if (dio <= 60) return "adequate";
        return "concerning";
      };

      const getCCCStatus = (ccc: number) => {
        if (ccc <= 0) return "excellent";
        if (ccc <= 30) return "healthy";
        if (ccc <= 60) return "adequate";
        return "concerning";
      };

      return {
        kpis: [
          {
            name: "Days Sales Outstanding",
            metric: "DSO",
            value: Math.round(result.dso * 100) / 100,
            unit: "days",
            status: getDSOStatus(result.dso),
            description: "Average time to collect payment from customers",
            benchmark: 45,
            trend: -2.5,
          },
          {
            name: "Days Payable Outstanding",
            metric: "DPO",
            value: Math.round(result.dpo * 100) / 100,
            unit: "days",
            status: getDPOStatus(result.dpo),
            description: "Average time to pay suppliers",
            benchmark: 45,
            trend: 1.2,
          },
          {
            name: "Days Inventory Outstanding",
            metric: "DIO",
            value: Math.round(result.dio * 100) / 100,
            unit: "days",
            status: getDIOStatus(result.dio),
            description: "Average time inventory is held",
            benchmark: 45,
            trend: -1.8,
          },
          {
            name: "Cash Conversion Cycle",
            metric: "CCC",
            value: Math.round(result.ccc * 100) / 100,
            unit: "days",
            status: getCCCStatus(result.ccc),
            description: "Days between paying suppliers and collecting from customers",
            benchmark: 30,
            trend: -3.1,
          },
        ],
        liquidity: {
          currentRatio: Math.round(result.currentRatio * 100) / 100,
          quickRatio: Math.round(result.quickRatio * 100) / 100,
          workingCapitalPercentOfRevenue: Math.round(result.workingCapitalPercentOfRevenue * 100) / 100,
        },
      };
    }),

  /**
   * Compare multiple scenarios for improvement analysis
   */
  compareScenarios: protectedProcedure
    .input(z.object({ scenarios: z.array(ScenarioSchema) }))
    .query(({ input }) => {
      const scenarios = input.scenarios.map((scenario) => {
        const result = calculateWorkingCapital({
          ar: scenario.ar,
          revenue: scenario.revenue,
          ap: scenario.ap,
          cogs: scenario.cogs,
          inventory: scenario.inventory,
          daysInPeriod: scenario.daysInPeriod,
          currentAssets: scenario.currentAssets,
          currentLiabilities: scenario.currentLiabilities,
        });

        return {
          name: scenario.name,
          dso: Math.round(result.dso * 100) / 100,
          dpo: Math.round(result.dpo * 100) / 100,
          dio: Math.round(result.dio * 100) / 100,
          ccc: Math.round(result.ccc * 100) / 100,
          currentRatio: Math.round(result.currentRatio * 100) / 100,
          quickRatio: Math.round(result.quickRatio * 100) / 100,
        };
      });

      // Calculate improvements vs baseline
      const baseline = scenarios[0];
      const improvements = scenarios.slice(1).map((scenario) => ({
        name: scenario.name,
        dsoImprovement: Math.round((baseline.dso - scenario.dso) * 100) / 100,
        dpoImprovement: Math.round((scenario.dpo - baseline.dpo) * 100) / 100,
        dioImprovement: Math.round((baseline.dio - scenario.dio) * 100) / 100,
        cccImprovement: Math.round((baseline.ccc - scenario.ccc) * 100) / 100,
        currentRatioChange: Math.round((scenario.currentRatio - baseline.currentRatio) * 100) / 100,
      }));

      return {
        scenarios,
        improvements,
        bestScenario: scenarios.reduce((best, current) =>
          current.ccc < best.ccc ? current : best
        ),
      };
    }),

  /**
   * Analyze improvement opportunities
   */
  analyzeImprovements: protectedProcedure
    .input(ImprovementAnalysisSchema)
    .query(({ input }) => {
      const baseline = calculateWorkingCapital({
        ar: input.baseline.ar,
        revenue: input.baseline.revenue,
        ap: input.baseline.ap,
        cogs: input.baseline.cogs,
        inventory: input.baseline.inventory,
        daysInPeriod: input.baseline.daysInPeriod,
        currentAssets: input.baseline.currentAssets,
        currentLiabilities: input.baseline.currentLiabilities,
      });

      // Calculate improved scenario
      const improvedAR = input.baseline.ar * (1 - (input.improvements.arReductionPercent || 0) / 100);
      const improvedAP = input.baseline.ap * (1 + (input.improvements.apIncreasePercent || 0) / 100);
      const improvedInventory =
        input.baseline.inventory * (1 - (input.improvements.inventoryReductionPercent || 0) / 100);

      const improved = calculateWorkingCapital({
        ar: improvedAR,
        revenue: input.baseline.revenue,
        ap: improvedAP,
        cogs: input.baseline.cogs,
        inventory: improvedInventory,
        daysInPeriod: input.baseline.daysInPeriod,
        currentAssets: input.baseline.currentAssets,
        currentLiabilities: input.baseline.currentLiabilities,
      });

      // Calculate cash impact
      const dailyRevenue = new Decimal(input.baseline.revenue).dividedBy(input.baseline.daysInPeriod);
      const cccImprovement = baseline.ccc - improved.ccc;
      const cashImpact = dailyRevenue.times(cccImprovement).toNumber();

      const improvements_list = [
        {
          initiative: "Accelerate AR Collections",
          description: "Reduce DSO by 5 days through improved collection processes",
          
          impact: Math.round(
            dailyRevenue
              .times((input.improvements.arReductionPercent || 0) / 100)
              .times(input.baseline.daysInPeriod)
              .toNumber() * 100
          ) / 100,
          effort: "medium",
          timeline: "3-6 months",
        },
        {
          initiative: "Extend Payables",
          description: "Negotiate longer payment terms with suppliers",
          
          impact: Math.round(
            dailyRevenue
              .times((input.improvements.apIncreasePercent || 0) / 100)
              .times(input.baseline.daysInPeriod)
              .toNumber() * 100
          ) / 100,
          effort: "low",
          timeline: "1-3 months",
        },
        {
          initiative: "Optimize Inventory",
          description: "Reduce inventory levels through better demand forecasting",
          
          impact: Math.round(
            new Decimal(input.baseline.inventory)
              .times((input.improvements.inventoryReductionPercent || 0) / 100)
              .toNumber() * 100
          ) / 100,
          effort: "high",
          timeline: "6-12 months",
        },
      ];

      return {
        baseline: {
          dso: Math.round(baseline.dso * 100) / 100,
          dpo: Math.round(baseline.dpo * 100) / 100,
          dio: Math.round(baseline.dio * 100) / 100,
          ccc: Math.round(baseline.ccc * 100) / 100,
          workingCapital: Math.round(baseline.workingCapitalPercentOfRevenue * 100) / 100,
        },
        improved: {
          dso: Math.round(improved.dso * 100) / 100,
          dpo: Math.round(improved.dpo * 100) / 100,
          dio: Math.round(improved.dio * 100) / 100,
          ccc: Math.round(improved.ccc * 100) / 100,
          workingCapital: Math.round(improved.workingCapitalPercentOfRevenue * 100) / 100,
        },
        improvements: improvements_list,
        totalCashImpact: Math.round(cashImpact * 100) / 100,
        cccImprovement: Math.round(cccImprovement * 100) / 100,
      };
    }),

  /**
   * Get multi-period trend analysis
   */
  getTrendAnalysis: protectedProcedure
    .input(MultiPeriodWCSchema)
    .query(({ input }) => {
      const trends = input.periods.map((period) => {
        const result = calculateWorkingCapital({
          ar: period.ar,
          revenue: period.revenue,
          ap: period.ap,
          cogs: period.cogs,
          inventory: period.inventory,
          daysInPeriod: period.daysInPeriod,
          currentAssets: period.currentAssets,
          currentLiabilities: period.currentLiabilities,
        });

        return {
          period: period.name,
          dso: Math.round(result.dso * 100) / 100,
          dpo: Math.round(result.dpo * 100) / 100,
          dio: Math.round(result.dio * 100) / 100,
          ccc: Math.round(result.ccc * 100) / 100,
          currentRatio: Math.round(result.currentRatio * 100) / 100,
        };
      });

      // Calculate trend statistics
      const dsos = trends.map((t) => t.dso);
      const dpos = trends.map((t) => t.dpo);
      const dios = trends.map((t) => t.dio);
      const cccs = trends.map((t) => t.ccc);

      const calculateTrend = (values: number[]) => {
        if (values.length < 2) return 0;
        return Math.round(((values[values.length - 1] - values[0]) / Math.abs(values[0])) * 10000) / 100;
      };

      return {
        trends,
        statistics: {
          avgDSO: Math.round((dsos.reduce((a, b) => a + b, 0) / dsos.length) * 100) / 100,
          avgDPO: Math.round((dpos.reduce((a, b) => a + b, 0) / dpos.length) * 100) / 100,
          avgDIO: Math.round((dios.reduce((a, b) => a + b, 0) / dios.length) * 100) / 100,
          avgCCC: Math.round((cccs.reduce((a, b) => a + b, 0) / cccs.length) * 100) / 100,
          dsoTrend: calculateTrend(dsos),
          dpoTrend: calculateTrend(dpos),
          dioTrend: calculateTrend(dios),
          cccTrend: calculateTrend(cccs),
          minCCC: Math.min(...cccs),
          maxCCC: Math.max(...cccs),
        },
      };
    }),

  /**
   * Get cash impact analysis
   */
  getCashImpactAnalysis: protectedProcedure
    .input(
      z.object({
        current: WCInputSchema,
        target: WCInputSchema,
      })
    )
    .query(({ input }) => {
      const current = calculateWorkingCapital({
        ar: input.current.ar,
        revenue: input.current.revenue,
        ap: input.current.ap,
        cogs: input.current.cogs,
        inventory: input.current.inventory,
        daysInPeriod: input.current.daysInPeriod,
        currentAssets: input.current.currentAssets,
        currentLiabilities: input.current.currentLiabilities,
      });

      const target = calculateWorkingCapital({
        ar: input.target.ar,
        revenue: input.target.revenue,
        ap: input.target.ap,
        cogs: input.target.cogs,
        inventory: input.target.inventory,
        daysInPeriod: input.target.daysInPeriod,
        currentAssets: input.target.currentAssets,
        currentLiabilities: input.target.currentLiabilities,
      });

      // Calculate cash impact from each component
      const arCashImpact = new Decimal(input.current.ar).minus(input.target.ar).toNumber();
      const apCashImpact = new Decimal(input.target.ap).minus(input.current.ap).toNumber();
      const inventoryCashImpact = new Decimal(input.current.inventory)
        .minus(input.target.inventory)
        .toNumber();

      const totalCashImpact = arCashImpact + apCashImpact + inventoryCashImpact;

      return {
        current: {
          dso: Math.round(current.dso * 100) / 100,
          dpo: Math.round(current.dpo * 100) / 100,
          dio: Math.round(current.dio * 100) / 100,
          ccc: Math.round(current.ccc * 100) / 100,
        },
        target: {
          dso: Math.round(target.dso * 100) / 100,
          dpo: Math.round(target.dpo * 100) / 100,
          dio: Math.round(target.dio * 100) / 100,
          ccc: Math.round(target.ccc * 100) / 100,
        },
        cashImpact: {
          arImpact: Math.round(arCashImpact * 100) / 100,
          apImpact: Math.round(apCashImpact * 100) / 100,
          inventoryImpact: Math.round(inventoryCashImpact * 100) / 100,
          totalImpact: Math.round(totalCashImpact * 100) / 100,
        },
        improvements: {
          dsoImprovement: Math.round((current.dso - target.dso) * 100) / 100,
          dpoImprovement: Math.round((target.dpo - current.dpo) * 100) / 100,
          dioImprovement: Math.round((current.dio - target.dio) * 100) / 100,
          cccImprovement: Math.round((current.ccc - target.ccc) * 100) / 100,
        },
      };
    }),
});
