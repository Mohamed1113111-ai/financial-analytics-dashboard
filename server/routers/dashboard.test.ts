import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createAuthContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "user" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("dashboard router", () => {
  it("should return metrics with default values when no data", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.metrics({});

    expect(result).toHaveProperty("totalAROutstanding");
    expect(result).toHaveProperty("arChange");
    expect(result).toHaveProperty("monthlyCashFlow");
    expect(result).toHaveProperty("cashFlowChange");
    expect(result).toHaveProperty("grossMargin");
    expect(result).toHaveProperty("marginChange");
    expect(result).toHaveProperty("workingCapital");
    expect(result).toHaveProperty("wcChange");
    expect(result).toHaveProperty("arAging");
    expect(result).toHaveProperty("topLocations");
  });

  it("should return AR aging summary", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.arAgingSummary({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should return cash flow summary", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.cashFlowSummary({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should return P&L summary", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.plSummary({});

    expect(Array.isArray(result)).toBe(true);
  });

  it("should filter by location IDs", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.metrics({
      locationIds: [1, 2, 3],
    });

    expect(result).toBeDefined();
    expect(typeof result.totalAROutstanding).toBe("number");
  });

  it("should handle date range filtering", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-02-04");

    const result = await caller.dashboard.metrics({
      startDate,
      endDate,
    });

    expect(result).toBeDefined();
  });

  it("should return properly formatted currency values", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.metrics({});

    expect(typeof result.totalAROutstanding).toBe("number");
    expect(typeof result.monthlyCashFlow).toBe("number");
    expect(typeof result.workingCapital).toBe("number");
  });

  it("should return AR aging breakdown with all buckets", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.metrics({});

    expect(result.arAging).toHaveProperty("0-30");
    expect(result.arAging).toHaveProperty("31-60");
    expect(result.arAging).toHaveProperty("61-90");
    expect(result.arAging).toHaveProperty("90+");
  });

  it("should return top locations array", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.metrics({});

    expect(Array.isArray(result.topLocations)).toBe(true);
  });

  it("should handle cash flow summary with limit", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.cashFlowSummary({
      limit: 6,
    });

    expect(Array.isArray(result)).toBe(true);
  });

  it("should handle P&L summary with limit", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.dashboard.plSummary({
      limit: 12,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
