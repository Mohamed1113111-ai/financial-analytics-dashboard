import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useState } from "react";

// Mock data - in production this would come from tRPC
const mockWaterfallData = [
  { name: "Opening Cash", value: 500000, fill: "#3b82f6" },
  { name: "AR Collections", value: 750000, fill: "#10b981" },
  { name: "AP Payments", value: -450000, fill: "#ef4444" },
  { name: "Payroll", value: -200000, fill: "#f59e0b" },
  { name: "CapEx", value: -100000, fill: "#8b5cf6" },
  { name: "Closing Cash", value: 500000, fill: "#6366f1" },
];

const mockRollingForecast = [
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

const mockStressTest = [
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

function WaterfallChart() {
  // Custom waterfall chart implementation
  const data = mockWaterfallData;
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
              <div className="text-3xl font-bold">+$750K</div>
              <p className="text-xs text-muted-foreground mt-1">Current month</p>
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
              <div className="text-3xl font-bold">-$100K</div>
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
              <div className="text-3xl font-bold">$500K</div>
              <p className="text-xs text-muted-foreground mt-1">End of period</p>
            </CardContent>
          </Card>
        </div>

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
                <WaterfallChart />
                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Operating</p>
                    <p className="text-lg font-bold text-green-600">+$550K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Investing</p>
                    <p className="text-lg font-bold text-red-600">-$100K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Financing</p>
                    <p className="text-lg font-bold">-$50K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Net Change</p>
                    <p className="text-lg font-bold text-blue-600">+$400K</p>
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
                        <td className="financial-value positive">+$550K</td>
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
                      <tr className="border-t-2 border-border">
                        <td className="font-semibold">Investing Activities</td>
                        <td className="financial-value negative">-$100K</td>
                        <td>13%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Capital Expenditures</td>
                        <td className="financial-value negative">-$100K</td>
                        <td>100%</td>
                      </tr>
                      <tr className="border-t-2 border-border">
                        <td className="font-semibold">Financing Activities</td>
                        <td className="financial-value negative">-$50K</td>
                        <td>7%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Debt Repayment</td>
                        <td className="financial-value negative">-$50K</td>
                        <td>100%</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-muted">
                        <td className="font-bold">Net Cash Flow</td>
                        <td className="financial-value positive font-bold">+$400K</td>
                        <td className="font-bold">53%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 12-Month Forecast */}
          <TabsContent value="forecast" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>12-Month Rolling Cash Flow Forecast</CardTitle>
                <CardDescription>
                  Projected cash position with growth and seasonality adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={mockRollingForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: any) => `$${(typeof value === 'number' ? value / 1000 : 0).toFixed(0)}K`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="operatingCashFlow"
                      fill="#10b981"
                      name="Operating Cash Flow"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="closingCash"
                      stroke="#3b82f6"
                      name="Closing Cash"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Average Monthly</p>
                    <p className="text-lg font-bold">$715K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Minimum Cash</p>
                    <p className="text-lg font-bold">$520K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Maximum Cash</p>
                    <p className="text-lg font-bold">$900K</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Year-End Cash</p>
                    <p className="text-lg font-bold">$900K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stress Testing */}
          <TabsContent value="stress" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Liquidity Stress Testing</CardTitle>
                <CardDescription>
                  Analyze cash position under different economic scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockStressTest.map((scenario) => (
                    <div
                      key={scenario.scenario}
                      className="rounded-lg border border-border p-4 cursor-pointer transition-all hover:bg-muted"
                      onClick={() => setSelectedScenario(scenario.scenario.toLowerCase())}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{scenario.scenario} Scenario</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Closing Cash: <span className="font-mono font-bold">${(scenario.closingCash / 1000).toFixed(0)}K</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                              scenario.status === "healthy"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {scenario.status === "healthy" ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {scenario.status.charAt(0).toUpperCase() + scenario.status.slice(1)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Liquidity Ratio</p>
                          <p className="text-lg font-bold">{scenario.liquidityRatio.toFixed(2)}x</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Closing Cash</p>
                          <p className="text-lg font-bold">${(scenario.closingCash / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-lg font-bold capitalize">{scenario.status}</p>
                        </div>
                      </div>

                      <div className="mt-4 w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            scenario.status === "healthy"
                              ? "bg-green-500"
                              : scenario.status === "adequate"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(scenario.liquidityRatio * 25, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Recommendations</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                        <li>✅ Strong liquidity position across all scenarios. Good operational flexibility.</li>
                        <li>📊 Monitor AR collection rates - they're critical to maintaining positive cash flow.</li>
                        <li>💡 Consider optimizing AP payment terms to improve cash conversion cycle.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Comparison Chart */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockStressTest}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scenario" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `$${(typeof value === 'number' ? value / 1000 : 0).toFixed(0)}K`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Bar dataKey="closingCash" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
