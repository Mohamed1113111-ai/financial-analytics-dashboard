import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, EmptyChart } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { useState, useMemo } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import { trpc } from "@/lib/trpc";
import { useLocationFilterParams } from "@/hooks/useLocationFilter";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Loader2 } from "lucide-react";

function WaterfallChart({ data }: { data: any[] }) {
  let cumulativeValue = 0;
  const processedData = data.map((item, index) => {
    const isFirst = index === 0;
    const isLast = index === data.length - 1;

    let start = 0;
    let end = 0;

    if (isFirst) {
      start = 0;
      end = item.value;
      cumulativeValue = item.value;
    } else if (isLast) {
      start = 0;
      end = cumulativeValue;
    } else {
      start = cumulativeValue;
      end = cumulativeValue + item.value;
      cumulativeValue = end;
    }

    return {
      name: item.name,
      value: isFirst || isLast ? item.value : Math.abs(item.value),
      start,
      end,
      fill: item.fill,
      isPositive: item.value >= 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={processedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip
          formatter={(value: any) => `$${(typeof value === 'number' ? value / 1000 : 0).toFixed(0)}K`}
          contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function CashFlow() {
  const [selectedScenario, setSelectedScenario] = useState("base");
  const { locationIds } = useLocationFilterParams();
  const { dateRange } = useDateRange();
  const selectedLocationId = locationIds[0] || 1; // Use first selected location or default to 1

  // Fetch cash flow data from database
  const { data: cashFlowData, isLoading, error } = trpc.cashflow.calculateStatement.useQuery(
    {
      locationId: selectedLocationId,
      periodId: 1, // Latest period
      openingCash: 500000,
      arCollections: 750000,
      apPayments: 450000,
      payroll: 200000,
      capex: 100000,
    },
    {
      enabled: !!selectedLocationId,
    }
  );

  // Fetch rolling forecast data
  const { data: forecastData } = trpc.cashflow.getRollingForecast.useQuery(
    {
      locationId: selectedLocationId,
      baseMonthlyArCollections: 62500,
      baseMonthlyApPayments: 37500,
      baseMonthlyPayroll: 16667,
      baseMonthlyCapex: 8333,
      openingCash: 500000,
      growthRate: 0.02,
    },
    {
      enabled: !!selectedLocationId,
    }
  );

  // Fetch stress test scenarios
  const { data: stressTestData } = trpc.cashflow.stressTest.useQuery(
    {
      locationId: selectedLocationId,
      baseOpeningCash: 500000,
      baseArCollections: 750000,
      baseApPayments: 450000,
      basePayroll: 200000,
      baseCapex: 100000,
      scenarios: [
        { name: "base", arCollectionAdjustment: 0, apPaymentAdjustment: 0, payrollAdjustment: 0, capexAdjustment: 0 },
        { name: "optimistic", arCollectionAdjustment: 15, apPaymentAdjustment: -10, payrollAdjustment: 0, capexAdjustment: 0 },
        { name: "conservative", arCollectionAdjustment: -15, apPaymentAdjustment: 10, payrollAdjustment: 5, capexAdjustment: 0 },
      ],
    },
    {
      enabled: !!selectedLocationId,
    }
  );

  // Process waterfall data
  const waterfallData = useMemo(() => {
    if (!cashFlowData) return [];
    return [
      { name: "Opening Cash", value: cashFlowData.operatingCashFlow || 500000, fill: "#3b82f6" },
      { name: "AR Collections", value: 750000, fill: "#10b981" },
      { name: "AP Payments", value: -450000, fill: "#ef4444" },
      { name: "Payroll", value: -200000, fill: "#f59e0b" },
      { name: "CapEx", value: -100000, fill: "#8b5cf6" },
      { name: "Closing Cash", value: cashFlowData.closingCash || 500000, fill: "#6366f1" },
    ];
  }, [cashFlowData]);

  // Process rolling forecast data
  const rollingForecastData = useMemo(() => {
    if (!forecastData || !Array.isArray(forecastData)) {
      return [
        { month: "Jan", closingCash: 520000, operatingCashFlow: 150000 },
        { month: "Feb", closingCash: 580000, operatingCashFlow: 180000 },
        { month: "Mar", closingCash: 620000, operatingCashFlow: 200000 },
        { month: "Apr", closingCash: 650000, operatingCashFlow: 220000 },
        { month: "May", closingCash: 680000, operatingCashFlow: 240000 },
        { month: "Jun", closingCash: 720000, operatingCashFlow: 260000 },
        { month: "Jul", closingCash: 750000, operatingCashFlow: 280000 },
        { month: "Aug", closingCash: 780000, operatingCashFlow: 300000 },
        { month: "Sep", closingCash: 810000, operatingCashFlow: 320000 },
        { month: "Oct", closingCash: 840000, operatingCashFlow: 340000 },
        { month: "Nov", closingCash: 870000, operatingCashFlow: 360000 },
        { month: "Dec", closingCash: 900000, operatingCashFlow: 380000 },
      ];
    }
    return forecastData;
  }, [forecastData]);

  // Process stress test data
  const stressTestScenarios = useMemo(() => {
    if (!stressTestData || !Array.isArray(stressTestData)) {
      return [
        {
          scenario: "Base",
          closingCash: 500000,
          liquidityRatio: 2.5,
          status: "healthy",
          color: "#10b981",
        },
        {
          scenario: "Optimistic",
          closingCash: 650000,
          liquidityRatio: 3.2,
          status: "healthy",
          color: "#06b6d4",
        },
        {
          scenario: "Conservative",
          closingCash: 350000,
          liquidityRatio: 1.8,
          status: "adequate",
          color: "#f59e0b",
        },
      ];
    }
    return stressTestData;
  }, [stressTestData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !cashFlowData) {
    return (
      <DashboardLayout>
        <EmptyState
          title="Unable to Load Cash Flow Data"
          description="There was an error loading cash flow data. Please try again."
        />
      </DashboardLayout>
    );
  }

  const operatingCashFlow = cashFlowData.operatingCashFlow || 750000;
  const investingCashFlow = cashFlowData.investingCashFlow || -100000;
  const closingCash = cashFlowData.closingCash || 500000;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="section-title">Cash Flow Statement & Forecasting</h1>
          <p className="section-subtitle mt-2">
            Monitor cash flow activities and stress-test liquidity scenarios
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid-3col">
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-green-600" />
                Operating Cash Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">+${(operatingCashFlow / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">Current period</p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-red-600" />
                Investing Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(investingCashFlow / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">CapEx & investments</p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Closing Cash
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(closingCash / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">End of period</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Buttons */}
        <ExportButtons title="Cash Flow Statement" filename="cash-flow-statement" />

        {/* Tabs for different views */}
        <Tabs defaultValue="waterfall" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="waterfall">Waterfall</TabsTrigger>
            <TabsTrigger value="forecast">12-Month Forecast</TabsTrigger>
            <TabsTrigger value="stress">Stress Testing</TabsTrigger>
          </TabsList>

          {/* Waterfall Visualization */}
          <TabsContent value="waterfall" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Cash Flow Waterfall</CardTitle>
                <CardDescription>
                  Visual breakdown of cash movements from opening to closing balance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WaterfallChart data={waterfallData} />
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Operating</p>
                    <p className="text-lg font-bold text-green-600">+${(operatingCashFlow / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Investing</p>
                    <p className="text-lg font-bold text-red-600">${(investingCashFlow / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Financing</p>
                    <p className="text-lg font-bold">-$50K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Net Change</p>
                    <p className="text-lg font-bold text-blue-600">+${(closingCash / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Statement */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Detailed Cash Flow Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Activity</th>
                        <th>Amount</th>
                        <th>% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold">Operating Activities</td>
                        <td className="financial-value positive">+${(operatingCashFlow / 1000).toFixed(0)}K</td>
                        <td>73%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">AR Collections</td>
                        <td className="financial-value positive">+$750K</td>
                        <td>100%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">AP Payments</td>
                        <td className="financial-value negative">-$450K</td>
                        <td>60%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Payroll</td>
                        <td className="financial-value negative">-$200K</td>
                        <td>27%</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Investing Activities</td>
                        <td className="financial-value negative">-$100K</td>
                        <td>13%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">CapEx</td>
                        <td className="financial-value negative">-$100K</td>
                        <td>100%</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Financing Activities</td>
                        <td className="financial-value negative">-$50K</td>
                        <td>7%</td>
                      </tr>
                      <tr className="border-t-2">
                        <td className="font-bold">Net Cash Flow</td>
                        <td className="financial-value positive font-bold">+$400K</td>
                        <td>100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rolling Forecast */}
          <TabsContent value="forecast" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>12-Month Rolling Forecast</CardTitle>
                <CardDescription>
                  Projected closing cash and operating cash flow for the next 12 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={rollingForecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `$${(typeof value === 'number' ? value / 1000 : 0).toFixed(0)}K`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Bar dataKey="operatingCashFlow" fill="#10b981" name="Operating CF" />
                    <Line type="monotone" dataKey="closingCash" stroke="#3b82f6" name="Closing Cash" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stress Testing */}
          <TabsContent value="stress" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Liquidity Stress Testing</CardTitle>
                <CardDescription>
                  Scenario analysis: Base, Optimistic, and Conservative cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {stressTestScenarios.map((scenario: any) => (
                    <div
                      key={scenario.scenario}
                      className="rounded-lg border-2 p-6"
                      style={{ borderColor: scenario.color }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{scenario.scenario}</h3>
                        {scenario.status === "healthy" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Closing Cash</p>
                          <p className="text-2xl font-bold">${(scenario.closingCash / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Liquidity Ratio</p>
                          <p className="text-lg font-semibold">{scenario.liquidityRatio.toFixed(1)}x</p>
                        </div>
                        <div>
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: scenario.color + "20", color: scenario.color }}>
                            {scenario.status.charAt(0).toUpperCase() + scenario.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
