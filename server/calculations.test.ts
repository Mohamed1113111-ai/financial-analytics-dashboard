import { describe, expect, it } from "vitest";
import {
  calculateARForecast,
  calculateCashFlow,
  calculateDSO,
  calculatePL,
  calculateVariance,
  calculateWorkingCapital,
  analyzeTrend,
} from "./calculations";

describe("Financial Calculation Engines", () => {
  describe("AR Collections Forecast", () => {
    it("should calculate AR forecast correctly", () => {
      const arAging = {
        amount0_30: 1000000,
        amount31_60: 600000,
        amount61_90: 300000,
        amount90_plus: 100000,
      };

      const collectionRates = [
        { bucket: "0-30", rate: 95, daysToCollect: 15 },
        { bucket: "31-60", rate: 80, daysToCollect: 45 },
        { bucket: "61-90", rate: 60, daysToCollect: 75 },
        { bucket: "90+", rate: 30, daysToCollect: 120 },
      ];

      const result = calculateARForecast(arAging, collectionRates);

      expect(result.forecastedCollection).toBeCloseTo(1640000, 0);
      expect(result.collectionEffectiveness).toBeCloseTo(82, 1);
      expect(result.dso).toBeGreaterThan(0);
      expect(Object.keys(result.monthlyBreakdown).length).toBe(6);
    });

    it("should handle zero AR correctly", () => {
      const arAging = {
        amount0_30: 0,
        amount31_60: 0,
        amount61_90: 0,
        amount90_plus: 0,
      };

      const collectionRates = [
        { bucket: "0-30", rate: 95, daysToCollect: 15 },
      ];

      const result = calculateARForecast(arAging, collectionRates);

      expect(result.forecastedCollection).toBe(0);
      expect(result.collectionEffectiveness).toBe(0);
      expect(result.dso).toBe(0);
    });
  });

  describe("DSO Calculation", () => {
    it("should calculate DSO correctly", () => {
      const dso = calculateDSO(500000, 2000000, 30);
      expect(dso).toBeCloseTo(7.5, 1);
    });

    it("should handle zero revenue", () => {
      const dso = calculateDSO(500000, 0, 30);
      expect(dso).toBe(0);
    });
  });

  describe("Cash Flow Statement", () => {
    it("should calculate cash flow correctly", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 1000000,
        apPayments: 600000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 50000,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);

      expect(result.operatingCashFlow).toBeCloseTo(200000, 0);
      expect(result.investingCashFlow).toBe(-100000);
      expect(result.financingCashFlow).toBe(-50000);
      expect(result.netCashFlow).toBeCloseTo(50000, 0);
      expect(result.closingCash).toBeCloseTo(550000, 0);
    });

    it("should reconcile opening and closing cash", () => {
      const inputs = {
        openingCash: 1000000,
        arCollections: 500000,
        apPayments: 300000,
        payroll: 100000,
        capex: 50000,
        debtProceeds: 200000,
        debtRepayment: 100000,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);

      const expectedClosing = inputs.openingCash + result.netCashFlow;
      expect(result.closingCash).toBeCloseTo(expectedClosing, 0);
    });
  });

  describe("P&L Statement", () => {
    it("should calculate P&L correctly", () => {
      const inputs = {
        revenue: 1000000,
        cogs: 600000,
        operatingExpenses: 250000,
        depreciation: 50000,
        interestExpense: 20000,
        taxRate: 25,
      };

      const result = calculatePL(inputs);

      expect(result.revenue).toBe(1000000);
      expect(result.cogs).toBe(600000);
      expect(result.grossProfit).toBe(400000);
      expect(result.grossMargin).toBeCloseTo(40, 1);
      expect(result.ebitda).toBe(150000);
      expect(result.ebitdaMargin).toBeCloseTo(15, 1);
      expect(result.ebit).toBe(100000);
      expect(result.netProfit).toBeGreaterThan(0);
      expect(result.netMargin).toBeGreaterThan(0);
    });

    it("should handle zero revenue", () => {
      const inputs = {
        revenue: 0,
        cogs: 0,
        operatingExpenses: 0,
        depreciation: 0,
        interestExpense: 0,
        taxRate: 25,
      };

      const result = calculatePL(inputs);

      expect(result.grossMargin).toBe(0);
      expect(result.ebitdaMargin).toBe(0);
      expect(result.netMargin).toBe(0);
    });

    it("should not calculate negative taxes", () => {
      const inputs = {
        revenue: 100000,
        cogs: 150000,
        operatingExpenses: 50000,
        depreciation: 10000,
        interestExpense: 5000,
        taxRate: 25,
      };

      const result = calculatePL(inputs);

      expect(result.taxes).toBe(0);
    });
  });

  describe("Working Capital Analysis", () => {
    it("should calculate working capital metrics correctly", () => {
      const inputs = {
        ar: 500000,
        ap: 300000,
        inventory: 200000,
        revenue: 2000000,
        cogs: 1200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      };

      const result = calculateWorkingCapital(inputs);

      expect(result.dso).toBeCloseTo(7.5, 1);
      expect(result.dpo).toBeCloseTo(7.5, 1);
      expect(result.dio).toBeCloseTo(5, 1);
      expect(result.ccc).toBeCloseTo(5, 1);
      expect(result.currentRatio).toBeCloseTo(1.875, 1);
      expect(result.quickRatio).toBeCloseTo(1.625, 1);
      expect(result.netWorkingCapital).toBe(700000);
    });

    it("should handle zero revenue and COGS", () => {
      const inputs = {
        ar: 100000,
        ap: 50000,
        inventory: 30000,
        revenue: 0,
        cogs: 0,
        currentAssets: 500000,
        currentLiabilities: 200000,
        daysInPeriod: 30,
      };

      const result = calculateWorkingCapital(inputs);

      expect(result.dso).toBe(0);
      expect(result.dpo).toBe(0);
      expect(result.dio).toBe(0);
      expect(result.ccc).toBe(0);
    });
  });

  describe("Variance Analysis", () => {
    it("should calculate favorable revenue variance", () => {
      const result = calculateVariance(1100000, 1000000, false);

      expect(result.actual).toBe(1100000);
      expect(result.budget).toBe(1000000);
      expect(result.variance).toBe(100000);
      expect(result.variancePercent).toBeCloseTo(10, 1);
      expect(result.status).toBe("favorable");
    });

    it("should calculate favorable expense variance", () => {
      const result = calculateVariance(90000, 100000, true);

      expect(result.actual).toBe(90000);
      expect(result.budget).toBe(100000);
      expect(result.variance).toBe(-10000);
      expect(result.variancePercent).toBeCloseTo(-10, 1);
      expect(result.status).toBe("favorable");
    });

    it("should calculate unfavorable variance", () => {
      const result = calculateVariance(900000, 1000000, false);

      expect(result.status).toBe("unfavorable");
    });

    it("should handle zero budget", () => {
      const result = calculateVariance(100000, 0, false);

      expect(result.variancePercent).toBe(0);
    });
  });

  describe("Trend Analysis", () => {
    it("should detect increasing trend", () => {
      const data = [
        { period: "Jan", value: 100 },
        { period: "Feb", value: 120 },
        { period: "Mar", value: 150 },
      ];

      const result = analyzeTrend(data);

      expect(result.trend).toBe("increasing");
      expect(result.changePercent).toBeCloseTo(50, 0);
      expect(result.avgValue).toBeCloseTo(123.33, 1);
      expect(result.minValue).toBe(100);
      expect(result.maxValue).toBe(150);
    });

    it("should detect decreasing trend", () => {
      const data = [
        { period: "Jan", value: 150 },
        { period: "Feb", value: 120 },
        { period: "Mar", value: 100 },
      ];

      const result = analyzeTrend(data);

      expect(result.trend).toBe("decreasing");
      expect(result.changePercent).toBeCloseTo(-33.33, 1);
    });

    it("should detect stable trend", () => {
      const data = [
        { period: "Jan", value: 100 },
        { period: "Feb", value: 100 },
        { period: "Mar", value: 100 },
      ];

      const result = analyzeTrend(data);

      expect(result.trend).toBe("stable");
      expect(result.changePercent).toBe(0);
    });

    it("should handle single data point", () => {
      const data = [{ period: "Jan", value: 100 }];

      const result = analyzeTrend(data);

      expect(result.trend).toBe("stable");
      expect(result.avgValue).toBe(100);
      expect(result.minValue).toBe(100);
      expect(result.maxValue).toBe(100);
    });

    it("should handle empty data", () => {
      const data: any[] = [];

      const result = analyzeTrend(data);

      expect(result.trend).toBe("stable");
      expect(result.changePercent).toBe(0);
      expect(result.avgValue).toBe(0);
    });
  });
});
