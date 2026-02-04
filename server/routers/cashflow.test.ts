import { describe, expect, it } from "vitest";
import { calculateCashFlow } from "../calculations";

describe("Cash Flow Router Procedures", () => {
  describe("calculateStatement", () => {
    it("should calculate cash flow statement correctly", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);

      expect(result.operatingCashFlow).toBeCloseTo(100000, 0);
      expect(result.investingCashFlow).toBe(-100000);
      expect(result.financingCashFlow).toBe(0);
      expect(result.netCashFlow).toBeCloseTo(0, 0);
      expect(result.closingCash).toBeCloseTo(500000, 0);
    });

    it("should handle positive financing activities", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 100000,
        debtRepayment: 50000,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);

      expect(result.financingCashFlow).toBe(50000);
      expect(result.netCashFlow).toBeCloseTo(50000, 0);
      expect(result.closingCash).toBeCloseTo(550000, 0);
    });

    it("should handle working capital changes", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 50000,
      };

      const result = calculateCashFlow(inputs);

      // Operating: 750K - 450K - 200K + 50K = 150K
      expect(result.operatingCashFlow).toBeCloseTo(150000, 0);
      // Net: 150K - 100K = 50K
      expect(result.netCashFlow).toBeCloseTo(50000, 0);
    });
  });

  describe("Waterfall Data Generation", () => {
    it("should generate correct waterfall structure", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);

      expect(result.closingCash).toBeGreaterThan(0);
      expect(result.operatingCashFlow).toBeLessThanOrEqual(
        inputs.arCollections - inputs.apPayments - inputs.payroll
      );
    });

    it("should include debt activities in waterfall when present", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 200000,
        debtRepayment: 100000,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);

      expect(result.financingCashFlow).toBe(100000);
      expect(result.closingCash).toBeCloseTo(600000, 0);
    });
  });

  describe("Stress Testing Scenarios", () => {
    it("should show different results for different scenarios", () => {
      // Base scenario
      const baseInputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const baseResult = calculateCashFlow(baseInputs);

      // Optimistic scenario (20% higher AR collections)
      const optimisticInputs = {
        ...baseInputs,
        arCollections: 750000 * 1.2,
      };

      const optimisticResult = calculateCashFlow(optimisticInputs);

      // Conservative scenario (20% lower AR collections)
      const conservativeInputs = {
        ...baseInputs,
        arCollections: 750000 * 0.8,
      };

      const conservativeResult = calculateCashFlow(conservativeInputs);

      expect(optimisticResult.closingCash).toBeGreaterThan(baseResult.closingCash);
      expect(conservativeResult.closingCash).toBeLessThan(baseResult.closingCash);
    });

    it("should calculate liquidity ratio correctly", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);
      const minimumCashRequired = (inputs.payroll + inputs.apPayments) * 0.1;

      expect(result.closingCash).toBeGreaterThan(minimumCashRequired);
    });
  });

  describe("Rolling Forecast", () => {
    it("should generate 12-month forecast with growth", () => {
      const baseMonthlyArCollections = 750000;
      const baseMonthlyApPayments = 450000;
      const baseMonthlyPayroll = 200000;
      const baseMonthlyCapex = 100000;
      const growthRate = 0.02; // 2% monthly growth

      // Simulate 12 months
      let currentCash = 500000;
      const forecast = [];

      for (let i = 0; i < 12; i++) {
        const growthMultiplier = Math.pow(1 + growthRate, i);

        const arCollections = baseMonthlyArCollections * growthMultiplier;
        const apPayments = baseMonthlyApPayments * growthMultiplier;
        const payroll = baseMonthlyPayroll * growthMultiplier;
        const capex = baseMonthlyCapex;

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
          month: i + 1,
          closingCash: result.closingCash,
        });

        currentCash = result.closingCash;
      }

      expect(forecast.length).toBe(12);
      expect(forecast[11]?.closingCash).toBeGreaterThan(forecast[0]?.closingCash || 0);
    });

    it("should apply seasonality factors correctly", () => {
      const baseMonthlyArCollections = 750000;
      const seasonalityFactors = [1.0, 0.9, 0.8, 1.1, 1.2, 1.0, 0.9, 0.8, 1.1, 1.2, 1.0, 0.9];

      let currentCash = 500000;
      const forecast = [];

      for (let i = 0; i < 12; i++) {
        const seasonalityFactor = seasonalityFactors[i] || 1.0;
        const arCollections = baseMonthlyArCollections * seasonalityFactor;

        const result = calculateCashFlow({
          openingCash: currentCash,
          arCollections,
          apPayments: 450000,
          payroll: 200000,
          capex: 100000,
          debtProceeds: 0,
          debtRepayment: 0,
          equityProceeds: 0,
          workingCapitalChange: 0,
        });

        forecast.push({
          month: i + 1,
          closingCash: result.closingCash,
          seasonalityFactor,
        });

        currentCash = result.closingCash;
      }

      // Check that seasonality affects results
      const highSeasonMonth = forecast.find((m) => m.seasonalityFactor === 1.2);
      const lowSeasonMonth = forecast.find((m) => m.seasonalityFactor === 0.8);

      expect(highSeasonMonth?.closingCash).toBeGreaterThan(lowSeasonMonth?.closingCash || 0);
    });
  });

  describe("Liquidity Analysis", () => {
    it("should identify healthy liquidity status", () => {
      const inputs = {
        openingCash: 500000,
        arCollections: 750000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);
      const minimumCashRequired = (inputs.payroll + inputs.apPayments) * 0.1;
      const liquidityRatio = result.closingCash / minimumCashRequired;

      expect(liquidityRatio).toBeGreaterThan(1);
    });

    it("should identify stressed liquidity status", () => {
      const inputs = {
        openingCash: 100000,
        arCollections: 300000,
        apPayments: 450000,
        payroll: 200000,
        capex: 100000,
        debtProceeds: 0,
        debtRepayment: 0,
        equityProceeds: 0,
        workingCapitalChange: 0,
      };

      const result = calculateCashFlow(inputs);
      const minimumCashRequired = (inputs.payroll + inputs.apPayments) * 0.1;
      const liquidityRatio = result.closingCash / minimumCashRequired;

      expect(liquidityRatio).toBeLessThan(1);
    });
  });
});
