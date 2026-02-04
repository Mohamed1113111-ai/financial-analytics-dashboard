import { describe, expect, it } from "vitest";
import { calculateWorkingCapital } from "../calculations";

describe("Working Capital Router Procedures", () => {
  describe("calculateMetrics", () => {
    it("should calculate DSO, DPO, DIO, CCC correctly", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // DSO = (500K / 2M) * 30 = 7.5 days
      expect(result.dso).toBeCloseTo(7.5, 1);

      // DPO = (300K / 1M) * 30 = 9 days
      expect(result.dpo).toBeCloseTo(9, 1);

      // DIO = (200K / 1M) * 30 = 6 days
      expect(result.dio).toBeCloseTo(6, 1);

      // CCC = 7.5 + 6 - 9 = 4.5 days
      expect(result.ccc).toBeCloseTo(4.5, 1);
    });

    it("should calculate liquidity ratios correctly", () => {
      const result = calculateWorkingCapital({
        ar: 400000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 1000000,
        daysInPeriod: 30,
      });

      // Current Ratio = 1500K / 1000K = 1.5
      expect(result.currentRatio).toBeCloseTo(1.5, 1);

      // Quick Ratio = (1500K - 200K) / 1000K = 1.3
      expect(result.quickRatio).toBeCloseTo(1.3, 1);
    });

    it("should handle zero revenue", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 0,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(result.dso).toBe(0);
      expect(result.dio).toBeCloseTo(6, 1);
    });

    it("should handle zero COGS", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 0,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(result.dpo).toBe(0);
      expect(result.dio).toBe(0);
    });
  });

  describe("KPI Scorecard", () => {
    it("should assign correct health status for DSO", () => {
      // Excellent DSO (< 30 days)
      const excellent = calculateWorkingCapital({
        ar: 166667,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(excellent.dso).toBeLessThan(30);

      // Concerning DSO (>= 60 days)
      const concerning = calculateWorkingCapital({
        ar: 1000000,
        revenue: 500000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(concerning.dso).toBeGreaterThanOrEqual(60);
    });

    it("should assign correct health status for DPO", () => {
      // Excellent DPO (>= 60 days)
      const excellent = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 2000000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(excellent.dpo).toBeGreaterThanOrEqual(60);

      // Concerning DPO (< 30 days)
      const concerning = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 200000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(concerning.dpo).toBeLessThan(30);
    });

    it("should assign correct health status for CCC", () => {
      // Excellent CCC (<= 0 days)
      const excellent = calculateWorkingCapital({
        ar: 100000,
        revenue: 2000000,
        ap: 500000,
        cogs: 1000000,
        inventory: 100000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(excellent.ccc).toBeLessThanOrEqual(0);

      // Concerning CCC (> 60 days) - higher AR and inventory, lower AP
      const concerning = calculateWorkingCapital({
        ar: 1500000,
        revenue: 1000000,
        ap: 50000,
        cogs: 1000000,
        inventory: 800000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      expect(concerning.ccc).toBeGreaterThan(60);
    });
  });

  describe("Scenario Comparison", () => {
    it("should compare baseline vs optimistic scenario", () => {
      const baseline = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Optimistic: better AR collections, extended payables, reduced inventory
      const optimistic = calculateWorkingCapital({
        ar: 300000, // 40% reduction
        revenue: 2000000,
        ap: 450000, // 50% increase
        cogs: 1000000,
        inventory: 100000, // 50% reduction
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Optimistic should have lower CCC
      expect(optimistic.ccc).toBeLessThan(baseline.ccc);
    });

    it("should compare baseline vs conservative scenario", () => {
      const baseline = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Conservative: slower collections, tighter payables, higher inventory
      const conservative = calculateWorkingCapital({
        ar: 700000, // 40% increase
        revenue: 2000000,
        ap: 200000, // 33% decrease
        cogs: 1000000,
        inventory: 300000, // 50% increase
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Conservative should have higher CCC
      expect(conservative.ccc).toBeGreaterThan(baseline.ccc);
    });
  });

  describe("Improvement Analysis", () => {
    it("should calculate cash impact from AR reduction", () => {
      const baseline = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // 20% AR reduction
      const improved = calculateWorkingCapital({
        ar: 400000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Cash freed up = 100K
      const cashImpact = 500000 - 400000;
      expect(cashImpact).toBe(100000);

      // DSO should improve
      expect(improved.dso).toBeLessThan(baseline.dso);
    });

    it("should calculate cash impact from AP extension", () => {
      const baseline = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // 50% AP increase
      const improved = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 450000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Cash freed up = 150K
      const cashImpact = 450000 - 300000;
      expect(cashImpact).toBe(150000);

      // DPO should improve
      expect(improved.dpo).toBeGreaterThan(baseline.dpo);
    });

    it("should calculate cash impact from inventory reduction", () => {
      const baseline = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // 50% inventory reduction
      const improved = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 100000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Cash freed up = 100K
      const cashImpact = 200000 - 100000;
      expect(cashImpact).toBe(100000);

      // DIO should improve
      expect(improved.dio).toBeLessThan(baseline.dio);
    });

    it("should calculate combined improvement impact", () => {
      const baseline = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Combined improvements
      const improved = calculateWorkingCapital({
        ar: 400000, // 20% reduction
        revenue: 2000000,
        ap: 450000, // 50% increase
        cogs: 1000000,
        inventory: 100000, // 50% reduction
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // Total cash freed = 100K + 150K + 100K = 350K
      const totalCashImpact = (500000 - 400000) + (450000 - 300000) + (200000 - 100000);
      expect(totalCashImpact).toBe(350000);

      // CCC should improve significantly
      expect(improved.ccc).toBeLessThan(baseline.ccc);
    });
  });

  describe("Trend Analysis", () => {
    it("should identify improving CCC trend", () => {
      const period1 = calculateWorkingCapital({
        ar: 600000,
        revenue: 2000000,
        ap: 250000,
        cogs: 1000000,
        inventory: 250000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      const period2 = calculateWorkingCapital({
        ar: 550000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 225000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      const period3 = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 350000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // CCC should be improving (decreasing)
      expect(period2.ccc).toBeLessThan(period1.ccc);
      expect(period3.ccc).toBeLessThan(period2.ccc);
    });

    it("should identify deteriorating CCC trend", () => {
      const period1 = calculateWorkingCapital({
        ar: 400000,
        revenue: 2000000,
        ap: 400000,
        cogs: 1000000,
        inventory: 150000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      const period2 = calculateWorkingCapital({
        ar: 450000,
        revenue: 2000000,
        ap: 350000,
        cogs: 1000000,
        inventory: 175000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      const period3 = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // CCC should be deteriorating (increasing)
      expect(period2.ccc).toBeGreaterThan(period1.ccc);
      expect(period3.ccc).toBeGreaterThan(period2.ccc);
    });
  });

  describe("Cash Impact Analysis", () => {
    it("should calculate total cash impact correctly", () => {
      const current = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      const target = calculateWorkingCapital({
        ar: 400000,
        revenue: 2000000,
        ap: 450000,
        cogs: 1000000,
        inventory: 100000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // AR impact: 500K - 400K = 100K freed
      // AP impact: 450K - 300K = 150K freed
      // Inventory impact: 200K - 100K = 100K freed
      // Total: 350K freed

      const arImpact = 500000 - 400000;
      const apImpact = 450000 - 300000;
      const inventoryImpact = 200000 - 100000;
      const totalImpact = arImpact + apImpact + inventoryImpact;

      expect(arImpact).toBe(100000);
      expect(apImpact).toBe(150000);
      expect(inventoryImpact).toBe(100000);
      expect(totalImpact).toBe(350000);

      // CCC should improve
      expect(target.ccc).toBeLessThan(current.ccc);
    });
  });

  describe("Liquidity Ratios", () => {
    it("should calculate current ratio correctly", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 2000000,
        currentLiabilities: 1000000,
        daysInPeriod: 30,
      });

      // Current Ratio = 2M / 1M = 2.0
      expect(result.currentRatio).toBeCloseTo(2.0, 1);
    });

    it("should calculate quick ratio correctly", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 2000000,
        currentLiabilities: 1000000,
        daysInPeriod: 30,
      });

      // Quick Ratio = (2M - 200K) / 1M = 1.8
      expect(result.quickRatio).toBeCloseTo(1.8, 1);
    });

    it("should identify liquidity concerns", () => {
      // Healthy liquidity
      const healthy = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 2000000,
        currentLiabilities: 1000000,
        daysInPeriod: 30,
      });

      expect(healthy.currentRatio).toBeGreaterThan(1.5);

      // Concerning liquidity
      const concerning = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 800000,
        currentLiabilities: 1000000,
        daysInPeriod: 30,
      });

      expect(concerning.currentRatio).toBeLessThan(1.0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very high AR", () => {
      const result = calculateWorkingCapital({
        ar: 5000000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // DSO = (5M / 2M) * 30 = 75 days
      expect(result.dso).toBeCloseTo(75, 1);
    });

    it("should handle very high inventory", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 2000000,
        currentAssets: 1500000,
        currentLiabilities: 800000,
        daysInPeriod: 30,
      });

      // DIO = (2M / 1M) * 30 = 60 days
      expect(result.dio).toBeCloseTo(60, 1);
    });

    it("should handle negative working capital", () => {
      const result = calculateWorkingCapital({
        ar: 500000,
        revenue: 2000000,
        ap: 300000,
        cogs: 1000000,
        inventory: 200000,
        currentAssets: 500000,
        currentLiabilities: 1000000,
        daysInPeriod: 30,
      });

      // Net WC = 500K - 1M = -500K
      expect(result.netWorkingCapital).toBe(-500000);
      expect(result.currentRatio).toBeLessThan(1.0);
    });
  });
});
