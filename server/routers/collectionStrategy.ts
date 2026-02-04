import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import Decimal from "decimal.js";

/**
 * Collection Strategy Simulator
 * Allows users to model different AR collection strategies and see their impact on:
 * - Days Sales Outstanding (DSO)
 * - Cash flow improvement
 * - AR aging distribution
 * - Collection costs
 */

// Strategy input schema
const strategyInputSchema = z.object({
  // Early payment discount (percentage, e.g., 2 for 2%)
  earlyPaymentDiscount: z.number().min(0).max(10).default(0),
  // Early payment days (e.g., 10 for 2/10 Net 30)
  earlyPaymentDays: z.number().min(0).max(30).default(0),
  // Standard payment terms (days)
  standardPaymentTerms: z.number().min(0).max(90).default(30),
  // Collection intensity (0-100, higher = more aggressive)
  collectionIntensity: z.number().min(0).max(100).default(50),
  // Bad debt write-off rate (percentage)
  badDebtRate: z.number().min(0).max(10).default(2),
  // Collection cost per invoice (dollars)
  collectionCostPerInvoice: z.number().min(0).max(500).default(0),
  // Current AR aging data
  currentAging: z.object({
    "0-30": z.number().default(1780000),
    "31-60": z.number().default(1140000),
    "61-90": z.number().default(612200),
    "90+": z.number().default(333500),
  }),
});

type StrategyInput = z.infer<typeof strategyInputSchema>;

interface SimulationResult {
  strategy: StrategyInput;
  baselineMetrics: BaselineMetrics;
  projectedMetrics: ProjectedMetrics;
  impact: StrategyImpact;
  recommendations: string[];
}

interface BaselineMetrics {
  totalAR: number;
  dso: number;
  collectionRate: number;
  aging: Record<string, number>;
}

interface ProjectedMetrics {
  totalAR: number;
  dso: number;
  collectionRate: number;
  aging: Record<string, number>;
  cashFlowImprovement: number;
  collectionCosts: number;
  netBenefit: number;
}

interface StrategyImpact {
  dsoDaysReduction: number;
  dsoPercentReduction: number;
  cashFlowImprovement: number;
  arReduction: number;
  collectionCostIncrease: number;
  netCashBenefit: number;
  paybackPeriod: number;
}

/**
 * Calculate baseline metrics from current AR aging
 */
function calculateBaselineMetrics(aging: Record<string, number>): BaselineMetrics {
  const total = Object.values(aging).reduce((sum, val) => sum + val, 0);

  // Calculate weighted average DSO
  // 0-30: 15 days, 31-60: 45 days, 61-90: 75 days, 90+: 120 days
  const dso =
    (aging["0-30"] * 15 + aging["31-60"] * 45 + aging["61-90"] * 75 + aging["90+"] * 120) / total;

  // Estimate collection rate based on aging
  const collectionRate = ((aging["0-30"] + aging["31-60"]) / total) * 100;

  return {
    totalAR: total,
    dso: Math.round(dso * 10) / 10,
    collectionRate: Math.round(collectionRate * 10) / 10,
    aging,
  };
}

/**
 * Simulate collection strategy impact
 */
function simulateStrategy(input: StrategyInput): SimulationResult {
  const baseline = calculateBaselineMetrics(input.currentAging);

  // Calculate impact factors based on strategy parameters
  const discountAdoptionRate = Math.min(input.earlyPaymentDiscount * 5, 40); // Up to 40% adoption
  const collectionEffectiveness = (input.collectionIntensity / 100) * 0.3; // Up to 30% improvement

  // Project new aging distribution
  const projectedAging: Record<string, number> = {
    "0-30": 0,
    "31-60": 0,
    "61-90": 0,
    "90+": 0,
  };

  // Early payment discount moves 0-30 bucket earlier
  const earlyPaymentAmount = input.currentAging["0-30"] * (discountAdoptionRate / 100);
  projectedAging["0-30"] = input.currentAging["0-30"] - earlyPaymentAmount;

  // Collection intensity moves overdue amounts forward
  const collectionMovement = input.currentAging["90+"] * collectionEffectiveness;
  projectedAging["31-60"] = input.currentAging["31-60"] + collectionMovement * 0.3;
  projectedAging["61-90"] = input.currentAging["61-90"] + collectionMovement * 0.3;
  projectedAging["90+"] = input.currentAging["90+"] - collectionMovement;

  // Apply bad debt write-off
  const badDebtAmount = projectedAging["90+"] * (input.badDebtRate / 100);
  projectedAging["90+"] -= badDebtAmount;

  // Calculate projected DSO
  const totalProjectedAR = Object.values(projectedAging).reduce((sum, val) => sum + val, 0);
  const projectedDso =
    (projectedAging["0-30"] * 15 +
      projectedAging["31-60"] * 45 +
      projectedAging["61-90"] * 75 +
      projectedAging["90+"] * 120) /
    totalProjectedAR;

  const projectedCollectionRate = ((projectedAging["0-30"] + projectedAging["31-60"]) / totalProjectedAR) * 100;

  // Calculate costs
  const totalInvoices = Math.round(baseline.totalAR / 5000); // Assume $5K average invoice
  const collectionCosts = totalInvoices * input.collectionCostPerInvoice;
  const discountCost = earlyPaymentAmount * (input.earlyPaymentDiscount / 100);

  // Calculate cash flow improvement
  const arReduction = baseline.totalAR - totalProjectedAR;
  const dsoReduction = baseline.dso - projectedDso;
  const dailyCashFlow = baseline.totalAR / baseline.dso;
  const cashFlowImprovement = dsoReduction * dailyCashFlow;

  // Calculate net benefit
  const totalStrategyTCost = collectionCosts + discountCost + badDebtAmount;
  const netCashBenefit = cashFlowImprovement - totalStrategyTCost;
  const paybackPeriod = totalStrategyTCost > 0 ? totalStrategyTCost / (cashFlowImprovement / 365) : 0;

  const impact: StrategyImpact = {
    dsoDaysReduction: Math.round((baseline.dso - projectedDso) * 10) / 10,
    dsoPercentReduction: Math.round(((baseline.dso - projectedDso) / baseline.dso) * 1000) / 10,
    cashFlowImprovement: Math.round(cashFlowImprovement),
    arReduction: Math.round(arReduction),
    collectionCostIncrease: Math.round(totalStrategyTCost),
    netCashBenefit: Math.round(netCashBenefit),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
  };

  // Generate recommendations
  const recommendations: string[] = [];
  if (impact.dsoDaysReduction > 5) {
    recommendations.push(`Strong DSO improvement of ${impact.dsoDaysReduction} days - strategy is effective`);
  }
  if (impact.netCashBenefit > 100000) {
    recommendations.push(`Net cash benefit of $${(impact.netCashBenefit / 1000).toFixed(0)}K - highly recommended`);
  }
  if (input.earlyPaymentDiscount > 0 && discountAdoptionRate < 20) {
    recommendations.push(`Consider increasing early payment discount to boost adoption`);
  }
  if (input.collectionIntensity > 70) {
    recommendations.push(`High collection intensity may strain customer relationships - monitor carefully`);
  }
  if (impact.paybackPeriod > 180) {
    recommendations.push(`Long payback period (${impact.paybackPeriod} days) - consider adjusting strategy`);
  }

  return {
    strategy: input,
    baselineMetrics: baseline,
    projectedMetrics: {
      totalAR: totalProjectedAR,
      dso: Math.round(projectedDso * 10) / 10,
      collectionRate: Math.round(projectedCollectionRate * 10) / 10,
      aging: projectedAging,
      cashFlowImprovement: Math.round(cashFlowImprovement),
      collectionCosts: Math.round(totalStrategyTCost),
      netBenefit: Math.round(netCashBenefit),
    },
    impact,
    recommendations,
  };
}

/**
 * Compare multiple strategies
 */
function compareStrategies(strategies: StrategyInput[]): Array<SimulationResult> {
  return strategies.map((strategy) => simulateStrategy(strategy));
}

/**
 * Get predefined strategy templates
 */
function getStrategyTemplates(currentAging: Record<string, number>) {
  return {
    conservative: {
      name: "Conservative",
      description: "Minimal changes, focus on customer relationships",
      strategy: {
        earlyPaymentDiscount: 1,
        earlyPaymentDays: 5,
        standardPaymentTerms: 30,
        collectionIntensity: 30,
        badDebtRate: 1,
        collectionCostPerInvoice: 0,
        currentAging,
      },
    },
    balanced: {
      name: "Balanced",
      description: "Moderate improvements with reasonable costs",
      strategy: {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging,
      },
    },
    aggressive: {
      name: "Aggressive",
      description: "Maximum cash flow improvement",
      strategy: {
        earlyPaymentDiscount: 3,
        earlyPaymentDays: 15,
        standardPaymentTerms: 20,
        collectionIntensity: 80,
        badDebtRate: 3,
        collectionCostPerInvoice: 150,
        currentAging,
      },
    },
  };
}

export const collectionStrategyRouter = router({
  /**
   * Simulate a single collection strategy
   */
  simulateStrategy: protectedProcedure
    .input(strategyInputSchema)
    .query(({ input }) => {
      return simulateStrategy(input);
    }),

  /**
   * Compare multiple collection strategies
   */
  compareStrategies: protectedProcedure
    .input(
      z.object({
        strategies: z.array(strategyInputSchema),
      })
    )
    .query(({ input }) => {
      return compareStrategies(input.strategies);
    }),

  /**
   * Get predefined strategy templates
   */
  getTemplates: protectedProcedure
    .input(
      z.object({
        currentAging: z.object({
          "0-30": z.number(),
          "31-60": z.number(),
          "61-90": z.number(),
          "90+": z.number(),
        }),
      })
    )
    .query(({ input }) => {
      return getStrategyTemplates(input.currentAging);
    }),

  /**
   * Get recommendations for optimal strategy
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        currentAging: z.object({
          "0-30": z.number(),
          "31-60": z.number(),
          "61-90": z.number(),
          "90+": z.number(),
        }),
        targetDSO: z.number().optional(),
        maxBudget: z.number().optional(),
      })
    )
    .query(({ input }) => {
      const templates = getStrategyTemplates(input.currentAging);
      const results = compareStrategies(
        Object.values(templates).map((t) => t.strategy as StrategyInput)
      );

      // Filter by constraints
      let filtered = results;
      if (input.targetDSO !== undefined) {
        filtered = filtered.filter((r) => r.projectedMetrics.dso <= input.targetDSO!);
      }
      if (input.maxBudget !== undefined) {
        filtered = filtered.filter((r) => r.projectedMetrics.collectionCosts <= input.maxBudget!);
      }

      // Rank by net benefit
      return filtered.sort((a, b) => b.impact.netCashBenefit - a.impact.netCashBenefit);
    }),
});
