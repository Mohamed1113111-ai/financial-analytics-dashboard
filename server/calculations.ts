import Decimal from "decimal.js";

/**
 * Financial Calculation Engines
 * Core business logic for AR forecasting, cash flow, P&L, and working capital analysis
 */

// ============================================================================
// AR Collections Forecast Engine
// ============================================================================

export interface ARAgingData {
  amount0_30: number;
  amount31_60: number;
  amount61_90: number;
  amount90_plus: number;
}

export interface CollectionRate {
  bucket: string;
  rate: number; // Percentage (0-100)
  daysToCollect: number;
}

export interface ARForecastResult {
  forecastedCollection: number;
  collectionEffectiveness: number;
  dso: number;
  monthlyBreakdown: Record<string, number>;
}

/**
 * Calculate AR collections forecast based on aging and collection rates
 */
export function calculateARForecast(
  arAging: ARAgingData,
  collectionRates: CollectionRate[]
): ARForecastResult {
  const totalAR = new Decimal(arAging.amount0_30)
    .plus(arAging.amount31_60)
    .plus(arAging.amount61_90)
    .plus(arAging.amount90_plus);

  if (totalAR.isZero()) {
    return {
      forecastedCollection: 0,
      collectionEffectiveness: 0,
      dso: 0,
      monthlyBreakdown: {},
    };
  }

  const rateMap = new Map(collectionRates.map((r) => [r.bucket, r]));

  // Calculate collections by bucket
  const collections = {
    "0-30": new Decimal(arAging.amount0_30)
      .times(rateMap.get("0-30")?.rate || 0)
      .dividedBy(100),
    "31-60": new Decimal(arAging.amount31_60)
      .times(rateMap.get("31-60")?.rate || 0)
      .dividedBy(100),
    "61-90": new Decimal(arAging.amount61_90)
      .times(rateMap.get("61-90")?.rate || 0)
      .dividedBy(100),
    "90+": new Decimal(arAging.amount90_plus)
      .times(rateMap.get("90+")?.rate || 0)
      .dividedBy(100),
  };

  const totalCollections = collections["0-30"]
    .plus(collections["31-60"])
    .plus(collections["61-90"])
    .plus(collections["90+"]);

  const collectionEffectiveness = totalCollections.dividedBy(totalAR).times(100);

  // Calculate DSO (Days Sales Outstanding)
  const weightedDays = new Decimal(arAging.amount0_30)
    .times(rateMap.get("0-30")?.daysToCollect || 15)
    .plus(
      new Decimal(arAging.amount31_60).times(rateMap.get("31-60")?.daysToCollect || 45)
    )
    .plus(
      new Decimal(arAging.amount61_90).times(rateMap.get("61-90")?.daysToCollect || 75)
    )
    .plus(new Decimal(arAging.amount90_plus).times(rateMap.get("90+")?.daysToCollect || 120));

  const dso = weightedDays.dividedBy(totalAR);

  // Monthly breakdown (simplified - assumes linear collection over DSO days)
  const monthlyBreakdown: Record<string, number> = {};
  const monthlyRate = totalCollections.dividedBy(Math.ceil(dso.toNumber() / 30));

  for (let i = 0; i < 6; i++) {
    monthlyBreakdown[`month_${i + 1}`] = monthlyRate.toNumber();
  }

  return {
    forecastedCollection: totalCollections.toNumber(),
    collectionEffectiveness: collectionEffectiveness.toNumber(),
    dso: dso.toNumber(),
    monthlyBreakdown,
  };
}

/**
 * Calculate DSO (Days Sales Outstanding)
 */
export function calculateDSO(arAmount: number, revenue: number, daysInPeriod: number = 30): number {
  if (revenue === 0) return 0;
  return new Decimal(arAmount).dividedBy(revenue).times(daysInPeriod).toNumber();
}

// ============================================================================
// Cash Flow Statement Engine
// ============================================================================

export interface CashFlowInputs {
  openingCash: number;
  arCollections: number;
  apPayments: number;
  payroll: number;
  capex: number;
  debtProceeds: number;
  debtRepayment: number;
  equityProceeds: number;
  workingCapitalChange: number;
}

export interface CashFlowResult {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  closingCash: number;
}

/**
 * Calculate cash flow statement
 */
export function calculateCashFlow(inputs: CashFlowInputs): CashFlowResult {
  // Operating Activities: Collections - Payments - Payroll + WC Changes
  const operatingCashFlow = new Decimal(inputs.arCollections)
    .minus(inputs.apPayments)
    .minus(inputs.payroll)
    .plus(inputs.workingCapitalChange);

  // Investing Activities: -CapEx (negative = cash outflow)
  const investingCashFlow = new Decimal(-inputs.capex);

  // Financing Activities: Debt + Equity proceeds - Debt repayment
  const financingCashFlow = new Decimal(inputs.debtProceeds)
    .plus(inputs.equityProceeds)
    .minus(inputs.debtRepayment);

  // Net Cash Flow
  const netCashFlow = operatingCashFlow.plus(investingCashFlow).plus(financingCashFlow);

  // Closing Cash
  const closingCash = new Decimal(inputs.openingCash).plus(netCashFlow);

  return {
    operatingCashFlow: operatingCashFlow.toNumber(),
    investingCashFlow: investingCashFlow.toNumber(),
    financingCashFlow: financingCashFlow.toNumber(),
    netCashFlow: netCashFlow.toNumber(),
    closingCash: closingCash.toNumber(),
  };
}

// ============================================================================
// P&L Statement Engine
// ============================================================================

export interface PLInputs {
  revenue: number;
  cogs: number;
  operatingExpenses: number;
  depreciation: number;
  interestExpense: number;
  taxRate: number; // Percentage (0-100)
}

export interface PLResult {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  ebitda: number;
  ebitdaMargin: number;
  depreciation: number;
  ebit: number;
  ebitMargin: number;
  interestExpense: number;
  ebt: number;
  taxes: number;
  netProfit: number;
  netMargin: number;
}

/**
 * Calculate P&L statement
 */
export function calculatePL(inputs: PLInputs): PLResult {
  const revenue = new Decimal(inputs.revenue);
  const cogs = new Decimal(inputs.cogs);
  const opex = new Decimal(inputs.operatingExpenses);
  const depreciation = new Decimal(inputs.depreciation);
  const interest = new Decimal(inputs.interestExpense);
  const taxRate = new Decimal(inputs.taxRate).dividedBy(100);

  // Gross Profit
  const grossProfit = revenue.minus(cogs);
  const grossMargin = revenue.isZero() ? new Decimal(0) : grossProfit.dividedBy(revenue).times(100);

  // EBITDA (Earnings Before Interest, Tax, Depreciation, Amortization)
  const ebitda = grossProfit.minus(opex);
  const ebitdaMargin = revenue.isZero() ? new Decimal(0) : ebitda.dividedBy(revenue).times(100);

  // EBIT (Operating Income)
  const ebit = ebitda.minus(depreciation);
  const ebitMargin = revenue.isZero() ? new Decimal(0) : ebit.dividedBy(revenue).times(100);

  // EBT (Earnings Before Tax)
  const ebt = ebit.minus(interest);

  // Taxes
  const taxes = ebt.isNegative() ? new Decimal(0) : ebt.times(taxRate);

  // Net Profit
  const netProfit = ebt.minus(taxes);
  const netMargin = revenue.isZero() ? new Decimal(0) : netProfit.dividedBy(revenue).times(100);

  return {
    revenue: revenue.toNumber(),
    cogs: cogs.toNumber(),
    grossProfit: grossProfit.toNumber(),
    grossMargin: grossMargin.toNumber(),
    operatingExpenses: opex.toNumber(),
    ebitda: ebitda.toNumber(),
    ebitdaMargin: ebitdaMargin.toNumber(),
    depreciation: depreciation.toNumber(),
    ebit: ebit.toNumber(),
    ebitMargin: ebitMargin.toNumber(),
    interestExpense: interest.toNumber(),
    ebt: ebt.toNumber(),
    taxes: taxes.toNumber(),
    netProfit: netProfit.toNumber(),
    netMargin: netMargin.toNumber(),
  };
}

// ============================================================================
// Working Capital Analysis Engine
// ============================================================================

export interface WorkingCapitalInputs {
  ar: number; // Accounts Receivable
  ap: number; // Accounts Payable
  inventory: number;
  revenue: number;
  cogs: number;
  currentAssets: number;
  currentLiabilities: number;
  daysInPeriod: number;
}

export interface WorkingCapitalResult {
  dso: number; // Days Sales Outstanding
  dpo: number; // Days Payable Outstanding
  dio: number; // Days Inventory Outstanding
  ccc: number; // Cash Conversion Cycle
  currentRatio: number;
  quickRatio: number;
  netWorkingCapital: number;
  workingCapitalPercentOfRevenue: number;
}

/**
 * Calculate working capital metrics
 */
export function calculateWorkingCapital(inputs: WorkingCapitalInputs): WorkingCapitalResult {
  const ar = new Decimal(inputs.ar);
  const ap = new Decimal(inputs.ap);
  const inventory = new Decimal(inputs.inventory);
  const revenue = new Decimal(inputs.revenue);
  const cogs = new Decimal(inputs.cogs);
  const currentAssets = new Decimal(inputs.currentAssets);
  const currentLiabilities = new Decimal(inputs.currentLiabilities);
  const daysInPeriod = inputs.daysInPeriod;

  // DSO = (AR / Revenue) × Days in Period
  const dso = revenue.isZero() ? new Decimal(0) : ar.dividedBy(revenue).times(daysInPeriod);

  // DPO = (AP / COGS) × Days in Period
  const dpo = cogs.isZero() ? new Decimal(0) : ap.dividedBy(cogs).times(daysInPeriod);

  // DIO = (Inventory / COGS) × Days in Period
  const dio = cogs.isZero() ? new Decimal(0) : inventory.dividedBy(cogs).times(daysInPeriod);

  // CCC = DSO + DIO - DPO
  const ccc = dso.plus(dio).minus(dpo);

  // Current Ratio = Current Assets / Current Liabilities
  const currentRatio = currentLiabilities.isZero()
    ? new Decimal(0)
    : currentAssets.dividedBy(currentLiabilities);

  // Quick Ratio = (Current Assets - Inventory) / Current Liabilities
  const quickAssets = currentAssets.minus(inventory);
  const quickRatio = currentLiabilities.isZero()
    ? new Decimal(0)
    : quickAssets.dividedBy(currentLiabilities);

  // Net Working Capital = Current Assets - Current Liabilities
  const netWorkingCapital = currentAssets.minus(currentLiabilities);

  // WC as % of Revenue
  const wcPercentOfRevenue = revenue.isZero()
    ? new Decimal(0)
    : netWorkingCapital.dividedBy(revenue).times(100);

  return {
    dso: dso.toNumber(),
    dpo: dpo.toNumber(),
    dio: dio.toNumber(),
    ccc: ccc.toNumber(),
    currentRatio: currentRatio.toNumber(),
    quickRatio: quickRatio.toNumber(),
    netWorkingCapital: netWorkingCapital.toNumber(),
    workingCapitalPercentOfRevenue: wcPercentOfRevenue.toNumber(),
  };
}

// ============================================================================
// Scenario Modeling
// ============================================================================

export interface ScenarioFactors {
  revenueMultiplier: number; // 1.0 = base, 1.2 = +20%
  collectionRateAdjustment: number; // -0.1 = -10 percentage points
  expenseMultiplier: number;
  capexMultiplier: number;
}

/**
 * Apply scenario factors to base assumptions
 */
export function applyScenarioFactors(
  baseValue: number,
  scenario: "base" | "optimistic" | "conservative"
): number {
  const factors: Record<string, ScenarioFactors> = {
    base: { revenueMultiplier: 1.0, collectionRateAdjustment: 0, expenseMultiplier: 1.0, capexMultiplier: 1.0 },
    optimistic: {
      revenueMultiplier: 1.15,
      collectionRateAdjustment: 0.05,
      expenseMultiplier: 0.95,
      capexMultiplier: 0.9,
    },
    conservative: {
      revenueMultiplier: 0.85,
      collectionRateAdjustment: -0.1,
      expenseMultiplier: 1.1,
      capexMultiplier: 1.1,
    },
  };

  const factor = factors[scenario] || factors.base;
  return new Decimal(baseValue).times(factor.revenueMultiplier).toNumber();
}

// ============================================================================
// Variance Analysis
// ============================================================================

export interface VarianceResult {
  actual: number;
  budget: number;
  variance: number;
  variancePercent: number;
  status: "favorable" | "unfavorable";
}

/**
 * Calculate variance between actual and budget
 */
export function calculateVariance(
  actual: number,
  budget: number,
  isExpense: boolean = false
): VarianceResult {
  const actualDec = new Decimal(actual);
  const budgetDec = new Decimal(budget);
  const variance = actualDec.minus(budgetDec);

  const variancePercent = budgetDec.isZero()
    ? new Decimal(0)
    : variance.dividedBy(budgetDec).times(100);

  // For revenue: positive variance is favorable; for expenses: negative variance is favorable
  const isFavorable = isExpense ? variance.isNegative() : variance.isPositive();

  return {
    actual: actualDec.toNumber(),
    budget: budgetDec.toNumber(),
    variance: variance.toNumber(),
    variancePercent: variancePercent.toNumber(),
    status: isFavorable ? "favorable" : "unfavorable",
  };
}

// ============================================================================
// Trend Analysis
// ============================================================================

export interface TrendPoint {
  period: string;
  value: number;
}

export interface TrendAnalysis {
  trend: "increasing" | "decreasing" | "stable";
  changePercent: number;
  avgValue: number;
  minValue: number;
  maxValue: number;
}

/**
 * Analyze trend over multiple periods
 */
export function analyzeTrend(data: TrendPoint[]): TrendAnalysis {
  if (data.length < 2) {
    return {
      trend: "stable",
      changePercent: 0,
      avgValue: data[0]?.value || 0,
      minValue: data[0]?.value || 0,
      maxValue: data[0]?.value || 0,
    };
  }

  const values = data.map((d) => new Decimal(d.value));
  const firstValue = values[0];
  const lastValue = values[values.length - 1];

  const changePercent = firstValue.isZero()
    ? new Decimal(0)
    : lastValue.minus(firstValue).dividedBy(firstValue).times(100);

  const avgValue = values.reduce((a, b) => a.plus(b)).dividedBy(values.length);
  const minValue = values.reduce((a, b) => (a.lessThan(b) ? a : b));
  const maxValue = values.reduce((a, b) => (a.greaterThan(b) ? a : b));

  const trend = changePercent.isZero()
    ? "stable"
    : changePercent.isPositive()
      ? "increasing"
      : "decreasing";

  return {
    trend,
    changePercent: changePercent.toNumber(),
    avgValue: avgValue.toNumber(),
    minValue: minValue.toNumber(),
    maxValue: maxValue.toNumber(),
  };
}
