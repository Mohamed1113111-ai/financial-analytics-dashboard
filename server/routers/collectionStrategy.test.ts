import { describe, it, expect } from "vitest";
import { collectionStrategyRouter } from "./collectionStrategy";

// Mock user context for protected procedures
const mockUserContext = {
  user: {
    id: "test-user",
    email: "test@example.com",
    name: "Test User",
    role: "admin",
  },
};

describe("Collection Strategy Router", () => {
  const mockAging = {
    "0-30": 1780000,
    "31-60": 1140000,
    "61-90": 612200,
    "90+": 333500,
  };

  describe("simulateStrategy", () => {
    it("should calculate baseline metrics correctly", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.baselineMetrics.totalAR).toBe(3865700);
      expect(result.baselineMetrics.dso).toBeGreaterThan(0);
      expect(result.baselineMetrics.collectionRate).toBeGreaterThan(0);
    });

    it("should project lower DSO with aggressive strategy", () => {
      const conservativeStrategy = {
        earlyPaymentDiscount: 0,
        earlyPaymentDays: 0,
        standardPaymentTerms: 30,
        collectionIntensity: 20,
        badDebtRate: 1,
        collectionCostPerInvoice: 0,
        currentAging: mockAging,
      };

      const aggressiveStrategy = {
        earlyPaymentDiscount: 3,
        earlyPaymentDays: 15,
        standardPaymentTerms: 20,
        collectionIntensity: 80,
        badDebtRate: 3,
        collectionCostPerInvoice: 150,
        currentAging: mockAging,
      };

      const conservativeResult = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .simulateStrategy(conservativeStrategy);
      const aggressiveResult = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .simulateStrategy(aggressiveStrategy);

      expect(aggressiveResult.projectedMetrics.dso).toBeLessThan(
        conservativeResult.projectedMetrics.dso
      );
    });

    it("should calculate positive DSO reduction for effective strategy", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.impact.dsoDaysReduction).toBeGreaterThan(0);
      expect(result.impact.dsoPercentReduction).toBeGreaterThan(0);
    });

    it("should calculate cash flow improvement", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.impact.cashFlowImprovement).toBeGreaterThan(0);
      expect(result.projectedMetrics.cashFlowImprovement).toBeGreaterThan(0);
    });

    it("should calculate net benefit after costs", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.impact.netCashBenefit).toBe(
        result.impact.cashFlowImprovement - result.impact.collectionCostIncrease
      );
    });

    it("should calculate payback period", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.impact.paybackPeriod).toBeGreaterThanOrEqual(0);
      expect(result.impact.paybackPeriod).toBeLessThan(365);
    });

    it("should reduce AR outstanding with collection strategy", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.impact.arReduction).toBeGreaterThan(0);
      expect(result.projectedMetrics.totalAR).toBeLessThan(result.baselineMetrics.totalAR);
    });

    it("should generate recommendations for effective strategy", () => {
      const strategy = {
        earlyPaymentDiscount: 2,
        earlyPaymentDays: 10,
        standardPaymentTerms: 30,
        collectionIntensity: 50,
        badDebtRate: 2,
        collectionCostPerInvoice: 50,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain("DSO");
    });

    it("should handle zero costs scenario", () => {
      const strategy = {
        earlyPaymentDiscount: 0,
        earlyPaymentDays: 0,
        standardPaymentTerms: 30,
        collectionIntensity: 0,
        badDebtRate: 0,
        collectionCostPerInvoice: 0,
        currentAging: mockAging,
      };

      const result = collectionStrategyRouter.createCaller(mockUserContext as any).simulateStrategy(strategy);

      expect(result.impact.collectionCostIncrease).toBe(0);
      expect(result.impact.netCashBenefit).toBe(result.impact.cashFlowImprovement);
    });
  });

  describe("compareStrategies", () => {
    it("should compare multiple strategies", () => {
      const strategies = [
        {
          earlyPaymentDiscount: 1,
          earlyPaymentDays: 5,
          standardPaymentTerms: 30,
          collectionIntensity: 30,
          badDebtRate: 1,
          collectionCostPerInvoice: 0,
          currentAging: mockAging,
        },
        {
          earlyPaymentDiscount: 2,
          earlyPaymentDays: 10,
          standardPaymentTerms: 30,
          collectionIntensity: 50,
          badDebtRate: 2,
          collectionCostPerInvoice: 50,
          currentAging: mockAging,
        },
        {
          earlyPaymentDiscount: 3,
          earlyPaymentDays: 15,
          standardPaymentTerms: 20,
          collectionIntensity: 80,
          badDebtRate: 3,
          collectionCostPerInvoice: 150,
          currentAging: mockAging,
        },
      ];

      const results = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .compareStrategies({ strategies });

      expect(results).toHaveLength(3);
      expect(results[0].baselineMetrics).toBeDefined();
      expect(results[1].projectedMetrics).toBeDefined();
      expect(results[2].impact).toBeDefined();
    });

    it("should rank strategies by net benefit", () => {
      const strategies = [
        {
          earlyPaymentDiscount: 1,
          earlyPaymentDays: 5,
          standardPaymentTerms: 30,
          collectionIntensity: 30,
          badDebtRate: 1,
          collectionCostPerInvoice: 0,
          currentAging: mockAging,
        },
        {
          earlyPaymentDiscount: 3,
          earlyPaymentDays: 15,
          standardPaymentTerms: 20,
          collectionIntensity: 80,
          badDebtRate: 3,
          collectionCostPerInvoice: 150,
          currentAging: mockAging,
        },
      ];

      const results = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .compareStrategies({ strategies });

      // More aggressive strategy should have higher net benefit
      expect(results[1].impact.netCashBenefit).toBeGreaterThan(results[0].impact.netCashBenefit);
    });
  });

  describe("getTemplates", () => {
    it("should return predefined templates", () => {
      const templates = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .getTemplates({ currentAging: mockAging });

      expect(templates).toHaveProperty("conservative");
      expect(templates).toHaveProperty("balanced");
      expect(templates).toHaveProperty("aggressive");
    });

    it("should have correct template properties", () => {
      const templates = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .getTemplates({ currentAging: mockAging });

      expect(templates.conservative).toHaveProperty("name");
      expect(templates.conservative).toHaveProperty("description");
      expect(templates.conservative).toHaveProperty("strategy");
      expect(templates.balanced.strategy.collectionIntensity).toBeGreaterThan(
        templates.conservative.strategy.collectionIntensity
      );
      expect(templates.aggressive.strategy.collectionIntensity).toBeGreaterThan(
        templates.balanced.strategy.collectionIntensity
      );
    });
  });

  describe("getRecommendations", () => {
    it("should provide recommendations", () => {
      const recommendations = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .getRecommendations({ currentAging: mockAging });

      expect(recommendations).toBeInstanceOf(Array);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it("should filter by target DSO", () => {
      const recommendations = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .getRecommendations({ currentAging: mockAging, targetDSO: 35 });

      expect(recommendations).toBeInstanceOf(Array);
      // All recommendations should meet DSO target
      recommendations.forEach((rec) => {
        expect(rec.projectedMetrics.dso).toBeLessThanOrEqual(35);
      });
    });

    it("should filter by max budget", () => {
      const recommendations = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .getRecommendations({ currentAging: mockAging, maxBudget: 50000 });

      expect(recommendations).toBeInstanceOf(Array);
      // All recommendations should be within budget
      recommendations.forEach((rec) => {
        expect(rec.projectedMetrics.collectionCosts).toBeLessThanOrEqual(50000);
      });
    });

    it("should rank by net benefit", () => {
      const recommendations = collectionStrategyRouter
        .createCaller(mockUserContext as any)
        .getRecommendations({ currentAging: mockAging });

      // Should be sorted by net benefit descending
      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].impact.netCashBenefit).toBeGreaterThanOrEqual(
          recommendations[i + 1].impact.netCashBenefit
        );
      }
    });
  });
});
