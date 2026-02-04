import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { arAging, customers, locations } from "../../drizzle/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

/**
 * Alert severity levels
 */
export const AlertSeverity = {
  CRITICAL: "critical", // Immediate action required
  WARNING: "warning", // Monitor closely
  INFO: "info", // Informational
} as const;

/**
 * Alert types
 */
export const AlertType = {
  AR_HIGH_RISK: "ar_high_risk", // Customer 90+ days overdue
  AR_CREDIT_LIMIT: "ar_credit_limit", // Customer exceeds credit limit
  CASH_FLOW_SHORTFALL: "cash_flow_shortfall", // Projected cash flow below minimum
  MARGIN_DETERIORATION: "margin_deterioration", // Gross margin declining
  COLLECTION_RISK: "collection_risk", // Low collection rate
} as const;

/**
 * Input schemas
 */
const GetAlertsSchema = z.object({
  locationId: z.number().optional(),
  severity: z.enum(["critical", "warning", "info"]).optional(),
  type: z.string().optional(),
  limit: z.number().default(50),
});

const GetARiskScoreSchema = z.object({
  customerId: z.number(),
  locationId: z.number(),
});

const GetCashFlowRiskSchema = z.object({
  locationId: z.number().optional(),
  minimumCash: z.number().default(200000),
});

/**
 * Alert data types
 */
export type Alert = {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  locationId: number;
  locationName: string;
  customerId?: number;
  customerName?: string;
  amount?: number;
  riskScore?: number;
  createdAt: Date;
  actionItems: string[];
};

/**
 * Risk scoring algorithm
 */
function calculateARiskScore(
  amount90Plus: number,
  totalAR: number,
  creditLimit: number,
  daysOverdue: number
): number {
  let score = 0;

  // Days overdue factor (0-40 points)
  if (daysOverdue >= 120) score += 40;
  else if (daysOverdue >= 90) score += 30;
  else if (daysOverdue >= 60) score += 20;
  else if (daysOverdue >= 30) score += 10;

  // Amount overdue factor (0-40 points)
  const percentageOverdue = (amount90Plus / totalAR) * 100;
  if (percentageOverdue >= 50) score += 40;
  else if (percentageOverdue >= 30) score += 30;
  else if (percentageOverdue >= 15) score += 20;
  else if (percentageOverdue >= 5) score += 10;

  // Credit limit utilization (0-20 points)
  const creditUtilization = (totalAR / creditLimit) * 100;
  if (creditUtilization >= 120) score += 20;
  else if (creditUtilization >= 100) score += 15;
  else if (creditUtilization >= 80) score += 10;

  return Math.min(score, 100);
}

/**
 * Determine alert severity based on risk score
 */
function getSeverityFromScore(score: number): string {
  if (score >= 70) return AlertSeverity.CRITICAL;
  if (score >= 40) return AlertSeverity.WARNING;
  return AlertSeverity.INFO;
}

/**
 * Generate action items based on alert type and data
 */
function generateActionItems(type: string, data: any): string[] {
  switch (type) {
    case AlertType.AR_HIGH_RISK:
      return [
        "Contact customer immediately for payment",
        "Review credit terms and consider payment plan",
        "Escalate to collections team",
        "Consider credit hold on future orders",
      ];
    case AlertType.AR_CREDIT_LIMIT:
      return [
        "Review customer credit limit",
        "Request updated financial statements",
        "Implement payment plan",
        "Reduce credit exposure",
      ];
    case AlertType.CASH_FLOW_SHORTFALL:
      return [
        "Accelerate AR collections",
        "Defer non-critical expenses",
        "Arrange short-term financing",
        "Review AP payment schedule",
      ];
    case AlertType.MARGIN_DETERIORATION:
      return [
        "Review pricing strategy",
        "Analyze cost structure",
        "Identify cost reduction opportunities",
        "Review product mix",
      ];
    case AlertType.COLLECTION_RISK:
      return [
        "Increase collection efforts",
        "Review collection strategy",
        "Consider early payment discounts",
        "Escalate to management",
      ];
    default:
      return ["Review and take appropriate action"];
  }
}

/**
 * Alerts Router
 */
export const alertsRouter = router({
  /**
   * Get all active alerts for a location or company-wide
   */
  getAlerts: protectedProcedure
    .input(GetAlertsSchema)
    .query(async ({ input }: { input: z.infer<typeof GetAlertsSchema> }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const alerts: Alert[] = [];

      // Get AR high-risk accounts (90+ days overdue)
      const highRiskAR = await db
        .select({
          customerId: arAging.customerId,
          locationId: arAging.locationId,
          amount90Plus: arAging.amount90_plus,
          totalAR: arAging.totalAR,
          customerName: customers.name,
          locationName: locations.name,
          creditLimit: customers.creditLimit,
        })
        .from(arAging)
        .innerJoin(customers, eq(arAging.customerId, customers.id))
        .innerJoin(locations, eq(arAging.locationId, locations.id))
        .where(
          input.locationId
            ? and(
                eq(arAging.locationId, input.locationId),
                gte(arAging.amount90_plus, "1000")
              )
            : gte(arAging.amount90_plus, "1000")
        )
        .orderBy(desc(arAging.amount90_plus))
        .limit(input.limit);

      // Convert AR data to alerts
      highRiskAR.forEach((record: any) => {
        const riskScore = calculateARiskScore(
          parseFloat(record.amount90Plus.toString()),
          parseFloat(record.totalAR.toString()),
          parseFloat(record.creditLimit?.toString() || "0"),
          120 // Assume 120 days overdue for 90+ bucket
        );

        const severity = getSeverityFromScore(riskScore);

        // Apply severity filter if specified
        if (input.severity && input.severity !== severity) return;

        // Apply type filter if specified
        if (input.type && input.type !== AlertType.AR_HIGH_RISK) return;

        alerts.push({
          id: `ar-${record.customerId}-${record.locationId}`,
          type: AlertType.AR_HIGH_RISK,
          severity,
          title: `High-Risk AR: ${record.customerName}`,
          description: `${record.customerName} has $${parseFloat(record.amount90Plus.toString()).toLocaleString("en-US", { maximumFractionDigits: 0 })} outstanding 90+ days. Risk Score: ${riskScore.toFixed(0)}/100`,
          locationId: record.locationId,
          locationName: record.locationName,
          customerId: record.customerId,
          customerName: record.customerName,
          amount: parseFloat(record.amount90Plus.toString()),
          riskScore,
          createdAt: new Date(),
          actionItems: generateActionItems(AlertType.AR_HIGH_RISK, record),
        });
      });

      // Get credit limit exceeded accounts
      const creditLimitExceeded = await db
        .select({
          customerId: arAging.customerId,
          locationId: arAging.locationId,
          totalAR: arAging.totalAR,
          customerName: customers.name,
          locationName: locations.name,
          creditLimit: customers.creditLimit,
        })
        .from(arAging)
        .innerJoin(customers, eq(arAging.customerId, customers.id))
        .innerJoin(locations, eq(arAging.locationId, locations.id))
        .where(
          input.locationId
            ? eq(arAging.locationId, input.locationId)
            : undefined
        )
        .orderBy(desc(arAging.totalAR))
        .limit(input.limit);

      // Convert credit limit data to alerts
      creditLimitExceeded.forEach((record: any) => {
        const totalAR = parseFloat(record.totalAR.toString());
        const creditLimit = parseFloat(record.creditLimit?.toString() || "0");

        if (totalAR > creditLimit) {
          const exceedancePercentage = ((totalAR - creditLimit) / creditLimit) * 100;
          const riskScore = Math.min(50 + exceedancePercentage * 2, 100);
          const severity = getSeverityFromScore(riskScore);

          // Apply filters
          if (input.severity && input.severity !== severity) return;
          if (input.type && input.type !== AlertType.AR_CREDIT_LIMIT) return;

          alerts.push({
            id: `cl-${record.customerId}-${record.locationId}`,
            type: AlertType.AR_CREDIT_LIMIT,
            severity,
            title: `Credit Limit Exceeded: ${record.customerName}`,
            description: `${record.customerName} has exceeded credit limit by ${exceedancePercentage.toFixed(1)}%. Current AR: $${totalAR.toLocaleString("en-US", { maximumFractionDigits: 0 })}, Limit: $${creditLimit.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
            locationId: record.locationId,
            locationName: record.locationName,
            customerId: record.customerId,
            customerName: record.customerName,
            amount: totalAR,
            riskScore,
            createdAt: new Date(),
            actionItems: generateActionItems(AlertType.AR_CREDIT_LIMIT, record),
          });
        }
      });

      // Sort by severity and risk score
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      alerts.sort((a, b) => {
        const severityDiff =
          severityOrder[a.severity as keyof typeof severityOrder] -
          severityOrder[b.severity as keyof typeof severityOrder];
        if (severityDiff !== 0) return severityDiff;
        return (b.riskScore || 0) - (a.riskScore || 0);
      });

      return alerts;
    }),

  /**
   * Get risk score for a specific customer
   */
  getARiskScore: protectedProcedure
    .input(GetARiskScoreSchema)
    .query(async ({ input }: { input: z.infer<typeof GetARiskScoreSchema> }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const arRecord = await db
        .select({
          amount90Plus: arAging.amount90_plus,
          totalAR: arAging.totalAR,
          creditLimit: customers.creditLimit,
        })
        .from(arAging)
        .innerJoin(customers, eq(arAging.customerId, customers.id))
        .where(
          and(
            eq(arAging.customerId, input.customerId),
            eq(arAging.locationId, input.locationId)
          )
        )
        .limit(1);

      if (arRecord.length === 0) {
        return {
          customerId: input.customerId,
          riskScore: 0,
          severity: AlertSeverity.INFO,
          riskLevel: "Low",
        };
      }

      const record = arRecord[0];
      const riskScore = calculateARiskScore(
        parseFloat(record.amount90Plus.toString()),
        parseFloat(record.totalAR.toString()),
        parseFloat(record.creditLimit?.toString() || "0"),
        120
      );

      const severity = getSeverityFromScore(riskScore);
      const riskLevel =
        riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low";

      return {
        customerId: input.customerId,
        riskScore: Math.round(riskScore),
        severity,
        riskLevel,
      };
    }),

  /**
   * Get cash flow risk assessment
   */
  getCashFlowRisk: protectedProcedure
    .input(GetCashFlowRiskSchema)
    .query(async ({ input }: { input: z.infer<typeof GetCashFlowRiskSchema> }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Mock cash flow forecast data (in real implementation, fetch from database)
      const projectedCashFlow = 350000; // 30-day forecast
      const minimumCash = input.minimumCash;
      const shortfall = Math.max(0, minimumCash - projectedCashFlow);
      const riskScore = shortfall > 0 ? Math.min((shortfall / minimumCash) * 100, 100) : 0;

      const alerts: Alert[] = [];

      if (shortfall > 0) {
        const severity = riskScore >= 50 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING;

        alerts.push({
          id: `cf-${input.locationId || "company"}`,
          type: AlertType.CASH_FLOW_SHORTFALL,
          severity,
          title: "Cash Flow Shortfall Alert",
          description: `Projected 30-day cash flow of $${projectedCashFlow.toLocaleString("en-US", { maximumFractionDigits: 0 })} is below minimum threshold of $${minimumCash.toLocaleString("en-US", { maximumFractionDigits: 0 })}. Shortfall: $${shortfall.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
          locationId: input.locationId || 0,
          locationName: "Company-wide",
          amount: shortfall,
          riskScore,
          createdAt: new Date(),
          actionItems: generateActionItems(AlertType.CASH_FLOW_SHORTFALL, {}),
        });
      }

      return {
        projectedCashFlow,
        minimumCash,
        shortfall,
        riskScore: Math.round(riskScore),
        alerts,
      };
    }),

  /**
   * Get alert summary statistics
   */
  getAlertSummary: protectedProcedure
    .input(z.object({ locationId: z.number().optional() }))
    .query(async ({ input }: { input: { locationId?: number } }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get all alerts
      const allAlerts = await db
        .select({
          amount90Plus: arAging.amount90_plus,
          totalAR: arAging.totalAR,
          creditLimit: customers.creditLimit,
        })
        .from(arAging)
        .innerJoin(customers, eq(arAging.customerId, customers.id))
        .where(
          input.locationId
            ? eq(arAging.locationId, input.locationId)
            : undefined
        )

      let criticalCount = 0;
      let warningCount = 0;
      let infoCount = 0;
      let totalRiskAmount = 0;

      allAlerts.forEach((record: any) => {
        const amount90Plus = parseFloat(record.amount90Plus.toString());
        if (amount90Plus > 0) {
          totalRiskAmount += amount90Plus;
          const riskScore = calculateARiskScore(
            amount90Plus,
            parseFloat(record.totalAR.toString()),
            parseFloat(record.creditLimit?.toString() || "0"),
            120
          );

          if (riskScore >= 70) criticalCount++;
          else if (riskScore >= 40) warningCount++;
          else infoCount++;
        }
      });

      return {
        criticalCount,
        warningCount,
        infoCount,
        totalAlerts: criticalCount + warningCount + infoCount,
        totalRiskAmount,
        averageRiskScore: allAlerts.length > 0 ? 45 : 0, // Simplified
      };
    }),
});
