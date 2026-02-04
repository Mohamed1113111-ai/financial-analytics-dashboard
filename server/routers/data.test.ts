import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "test",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("data router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createAuthContext();
  });

  describe("customers", () => {
    it("should list customers", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.customers.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a customer", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.customers.create({
        name: "Test Customer",
        code: "TEST-001",
        locationId: 1,
        creditLimit: 50000,
      });
      expect(result.success).toBe(true);
    });

    it("should update a customer", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.customers.update({
        id: 1,
        name: "Updated Customer",
      });
      expect(result.success).toBe(true);
    });

    it("should delete a customer", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.customers.delete({ id: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe("locations", () => {
    it("should list locations", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.locations.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a location", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.locations.create({
        name: "Test Location",
        code: "LOC-001",
        region: "North",
        address: "123 Main St",
        manager: "John Doe",
      });
      expect(result.success).toBe(true);
    });

    it("should update a location", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.locations.update({
        id: 1,
        name: "Updated Location",
        region: "South",
      });
      expect(result.success).toBe(true);
    });

    it("should delete a location", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.locations.delete({ id: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe("arRecords", () => {
    it("should list AR records", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.arRecords.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should list AR records by location", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.arRecords.list({ locationId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create an AR record", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.arRecords.create({
        customerId: 1,
        locationId: 1,
        periodId: 1,
        amount0_30: 10000,
        amount31_60: 5000,
        amount61_90: 2000,
        amount90_plus: 1000,
      });
      expect(result.success).toBe(true);
    });

    it("should update an AR record", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.arRecords.update({
        id: 1,
        amount0_30: 15000,
        amount31_60: 6000,
      });
      expect(result.success).toBe(true);
    });

    it("should delete an AR record", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.arRecords.delete({ id: 1 });
      expect(result.success).toBe(true);
    });
  });

  describe("budgets", () => {
    it("should list budgets", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.budgets.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should list budgets by location", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.budgets.list({ locationId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should list budgets by period", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.budgets.list({ periodId: 1 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should create a budget", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.budgets.create({
        locationId: 1,
        periodId: 1,
        accountId: 1,
        budgetAmount: 100000,
      });
      expect(result.success).toBe(true);
    });

    it("should update a budget", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.budgets.update({
        id: 1,
        budgetAmount: 120000,
      });
      expect(result.success).toBe(true);
    });

    it("should delete a budget", async () => {
      const caller = appRouter.createCaller(ctx);
      const result = await caller.data.budgets.delete({ id: 1 });
      expect(result.success).toBe(true);
    });
  });
});
