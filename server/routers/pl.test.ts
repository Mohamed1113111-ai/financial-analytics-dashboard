import { describe, expect, it } from "vitest";
import { calculatePL, calculateVariance } from "../calculations";

describe("P&L Router Procedures", () => {
  describe("calculateStatement", () => {
    it("should calculate P&L statement correctly", () => {
      const inputs = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const result = calculatePL(inputs);

      expect(result.revenue).toBe(1000000);
      expect(result.cogs).toBe(400000);
      expect(result.grossProfit).toBe(600000);
      expect(result.grossMargin).toBeCloseTo(60, 1);
      expect(result.operatingExpenses).toBe(200000);
      expect(result.ebitda).toBe(400000);
      expect(result.ebitdaMargin).toBeCloseTo(40, 1);
      expect(result.ebit).toBe(350000);
      expect(result.ebitMargin).toBeCloseTo(35, 1);
      expect(result.netProfit).toBeGreaterThan(0);
    });

    it("should handle zero revenue", () => {
      const inputs = {
        revenue: 0,
        cogs: 0,
        operatingExpenses: 100000,
        depreciation: 10000,
        interestExpense: 5000,
        taxRate: 25,
      };

      const result = calculatePL(inputs);

      expect(result.revenue).toBe(0);
      expect(result.grossProfit).toBe(0);
      expect(result.grossMargin).toBe(0);
      expect(result.netProfit).toBeLessThan(0);
    });

    it("should calculate margins correctly", () => {
      const inputs = {
        revenue: 500000,
        cogs: 150000,
        operatingExpenses: 100000,
        depreciation: 25000,
        interestExpense: 10000,
        taxRate: 20,
      };

      const result = calculatePL(inputs);

      // Gross Margin: (500K - 150K) / 500K = 70%
      expect(result.grossMargin).toBeCloseTo(70, 1);

      // EBITDA Margin: (500K - 150K - 100K) / 500K = 50%
      expect(result.ebitdaMargin).toBeCloseTo(50, 1);

      // EBIT Margin: (500K - 150K - 100K - 25K) / 500K = 45%
      expect(result.ebitMargin).toBeCloseTo(45, 1);
    });
  });

  describe("Budget Variance Analysis", () => {
    it("should calculate favorable revenue variance", () => {
      const actual = {
        revenue: 1100000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const budget = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const actualResult = calculatePL(actual);
      const budgetResult = calculatePL(budget);

      const revenueVariance = calculateVariance(actualResult.revenue, budgetResult.revenue, false);

      expect(revenueVariance.variance).toBe(100000);
      expect(revenueVariance.status).toBe("favorable");
    });

    it("should calculate unfavorable COGS variance", () => {
      const actual = {
        revenue: 1000000,
        cogs: 450000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const budget = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const actualResult = calculatePL(actual);
      const budgetResult = calculatePL(budget);

      const cogsVariance = calculateVariance(actualResult.cogs, budgetResult.cogs, true);

      // Actual COGS (450K) > Budget COGS (400K) = +50K variance
      // For expenses, positive variance is unfavorable
      expect(cogsVariance.variance).toBe(50000);
      expect(cogsVariance.status).toBe("unfavorable");
    });

    it("should calculate favorable OpEx variance", () => {
      const actual = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 180000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const budget = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const actualResult = calculatePL(actual);
      const budgetResult = calculatePL(budget);

      const opexVariance = calculateVariance(actualResult.operatingExpenses, budgetResult.operatingExpenses, true);

      // Actual OpEx (180K) < Budget OpEx (200K) = -20K variance
      // For expenses, negative variance is favorable
      expect(opexVariance.variance).toBe(-20000);
      expect(opexVariance.status).toBe("favorable");
    });
  });

  describe("Period Comparison", () => {
    it("should compare two periods correctly", () => {
      const currentPeriod = {
        revenue: 1200000,
        cogs: 420000,
        operatingExpenses: 220000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const previousPeriod = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const currentResult = calculatePL(currentPeriod);
      const previousResult = calculatePL(previousPeriod);

      // Revenue growth: (1.2M - 1M) / 1M = 20%
      const revenueGrowth = ((currentResult.revenue - previousResult.revenue) / previousResult.revenue) * 100;
      expect(revenueGrowth).toBeCloseTo(20, 1);

      // Gross profit growth
      const gpGrowth = ((currentResult.grossProfit - previousResult.grossProfit) / previousResult.grossProfit) * 100;
      expect(gpGrowth).toBeGreaterThan(0);
    });

    it("should handle negative growth", () => {
      const currentPeriod = {
        revenue: 800000,
        cogs: 350000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const previousPeriod = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const currentResult = calculatePL(currentPeriod);
      const previousResult = calculatePL(previousPeriod);

      // Revenue decline: (800K - 1M) / 1M = -20%
      const revenueGrowth = ((currentResult.revenue - previousResult.revenue) / previousResult.revenue) * 100;
      expect(revenueGrowth).toBeCloseTo(-20, 1);
    });
  });

  describe("Trend Analysis", () => {
    it("should identify upward revenue trend", () => {
      const periods = [
        { revenue: 800000, cogs: 320000, opex: 160000, dep: 40000, interest: 20000, taxRate: 25 },
        { revenue: 900000, cogs: 330000, opex: 170000, dep: 40000, interest: 20000, taxRate: 25 },
        { revenue: 1000000, cogs: 400000, opex: 200000, dep: 50000, interest: 30000, taxRate: 25 },
      ];

      const revenues = periods.map((p) => p.revenue);
      const trend = revenues[revenues.length - 1] - revenues[0];

      expect(trend).toBeGreaterThan(0);
      expect(trend).toBe(200000);
    });

    it("should identify downward profit trend", () => {
      const periods = [
        {
          revenue: 1000000,
          cogs: 300000,
          operatingExpenses: 150000,
          depreciation: 30000,
          interestExpense: 20000,
          taxRate: 20,
        },
        {
          revenue: 1000000,
          cogs: 350000,
          operatingExpenses: 180000,
          depreciation: 30000,
          interestExpense: 20000,
          taxRate: 20,
        },
        {
          revenue: 1000000,
          cogs: 400000,
          operatingExpenses: 200000,
          depreciation: 30000,
          interestExpense: 20000,
          taxRate: 20,
        },
      ];

      const results = periods.map((p) =>
        calculatePL({
          revenue: p.revenue,
          cogs: p.cogs,
          operatingExpenses: p.operatingExpenses,
          depreciation: p.depreciation,
          interestExpense: p.interestExpense,
          taxRate: p.taxRate,
        })
      );

      const netProfits = results.map((r) => r.netProfit);
      const trend = netProfits[netProfits.length - 1] - netProfits[0];

      expect(trend).toBeLessThan(0);
    });

    it("should calculate average metrics", () => {
      const periods = [
        { revenue: 800000, cogs: 320000, opex: 160000, dep: 40000, interest: 20000, taxRate: 25 },
        { revenue: 900000, cogs: 330000, opex: 170000, dep: 40000, interest: 20000, taxRate: 25 },
        { revenue: 1000000, cogs: 400000, opex: 200000, dep: 50000, interest: 30000, taxRate: 25 },
      ];

      const revenues = periods.map((p) => p.revenue);
      const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;

      expect(avgRevenue).toBe(900000);
    });
  });

  describe("Margin Analysis", () => {
    it("should track margin improvements", () => {
      const period1 = {
        revenue: 1000000,
        cogs: 500000,
        operatingExpenses: 300000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const period2 = {
        revenue: 1000000,
        cogs: 400000, // Improved COGS
        operatingExpenses: 250000, // Improved OpEx
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const result1 = calculatePL(period1);
      const result2 = calculatePL(period2);

      // Gross margin improved
      expect(result2.grossMargin).toBeGreaterThan(result1.grossMargin);

      // EBITDA margin improved
      expect(result2.ebitdaMargin).toBeGreaterThan(result1.ebitdaMargin);

      // Net margin improved
      expect(result2.netMargin).toBeGreaterThan(result1.netMargin);
    });

    it("should identify margin compression", () => {
      const period1 = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const period2 = {
        revenue: 1000000,
        cogs: 450000, // COGS increased
        operatingExpenses: 220000, // OpEx increased
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const result1 = calculatePL(period1);
      const result2 = calculatePL(period2);

      // Gross margin compressed
      expect(result2.grossMargin).toBeLessThan(result1.grossMargin);

      // EBITDA margin compressed
      expect(result2.ebitdaMargin).toBeLessThan(result1.ebitdaMargin);
    });
  });

  describe("Variance Waterfall", () => {
    it("should build correct waterfall structure", () => {
      const actual = {
        revenue: 1100000,
        cogs: 380000,
        operatingExpenses: 190000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const budget = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const actualResult = calculatePL(actual);
      const budgetResult = calculatePL(budget);

      // Waterfall should show:
      // 1. Budget net profit
      // 2. Revenue variance (favorable: +100K)
      // 3. COGS variance (favorable: +20K)
      // 4. OpEx variance (favorable: +10K)
      // 5. Actual net profit

      const revenueVar = actualResult.revenue - budgetResult.revenue;
      const cogsVar = budgetResult.cogs - actualResult.cogs;
      const opexVar = budgetResult.operatingExpenses - actualResult.operatingExpenses;

      expect(revenueVar).toBe(100000);
      expect(cogsVar).toBe(20000);
      expect(opexVar).toBe(10000);

      // Net profit should improve
      expect(actualResult.netProfit).toBeGreaterThan(budgetResult.netProfit);
    });

    it("should handle mixed favorable and unfavorable variances", () => {
      const actual = {
        revenue: 950000, // Lower than budget
        cogs: 350000, // Lower than budget (favorable)
        operatingExpenses: 220000, // Higher than budget (unfavorable)
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const budget = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const actualResult = calculatePL(actual);
      const budgetResult = calculatePL(budget);

      const revenueVar = actualResult.revenue - budgetResult.revenue;
      const cogsVar = budgetResult.cogs - actualResult.cogs;
      const opexVar = budgetResult.operatingExpenses - actualResult.operatingExpenses;

      expect(revenueVar).toBe(-50000); // Unfavorable
      expect(cogsVar).toBe(50000); // Favorable
      expect(opexVar).toBe(-20000); // Unfavorable
    });
  });

  describe("Tax Impact Analysis", () => {
    it("should calculate taxes correctly", () => {
      const inputs = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      };

      const result = calculatePL(inputs);

      // EBT: 1M - 400K - 200K - 50K - 30K = 320K
      expect(result.ebt).toBe(320000);

      // Taxes: 320K * 0.25 = 80K
      expect(result.taxes).toBe(80000);

      // Net Profit: 320K - 80K = 240K
      expect(result.netProfit).toBe(240000);
    });

    it("should handle different tax rates", () => {
      const baseInputs = {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
      };

      const result20 = calculatePL({ ...baseInputs, taxRate: 20 });
      const result30 = calculatePL({ ...baseInputs, taxRate: 30 });

      // Higher tax rate should result in lower net profit
      expect(result30.netProfit).toBeLessThan(result20.netProfit);
    });
  });
});
