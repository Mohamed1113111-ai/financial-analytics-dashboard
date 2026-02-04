import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, EmptyChart } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
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
  Cell,
} from "recharts";
import { useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";

// Mock data - in production this would come from tRPC
const mockPLStatement = {
  revenue: 1000000,
  cogs: 400000,
  grossProfit: 600000,
  grossMargin: 60,
  operatingExpenses: 200000,
  ebitda: 400000,
  ebitdaMargin: 40,
  depreciation: 50000,
  ebit: 350000,
  ebitMargin: 35,
  interestExpense: 30000,
  ebt: 320000,
  taxes: 80000,
  netProfit: 240000,
  netMargin: 24,
};

const mockBudgetComparison = {
  revenue: { actual: 1000000, budget: 950000, variance: 50000, status: "favorable" },
  cogs: { actual: 400000, budget: 420000, variance: 20000, status: "favorable" },
  grossProfit: { actual: 600000, budget: 530000, variance: 70000, status: "favorable" },
  operatingExpenses: { actual: 200000, budget: 210000, variance: 10000, status: "favorable" },
  ebitda: { actual: 400000, budget: 320000, variance: 80000, status: "favorable" },
  ebit: { actual: 350000, budget: 270000, variance: 80000, status: "favorable" },
  netProfit: { actual: 240000, budget: 190000, variance: 50000, status: "favorable" },
};

const mockPeriodComparison = [
  { period: "Jan", revenue: 850000, cogs: 340000, opex: 170000, ebitda: 340000, netProfit: 180000 },
  { period: "Feb", revenue: 920000, cogs: 368000, opex: 184000, ebitda: 368000, netProfit: 210000 },
  { period: "Mar", revenue: 1000000, cogs: 400000, opex: 200000, ebitda: 400000, netProfit: 240000 },
];

const mockVarianceWaterfall = [
  { name: "Budget NP", value: 190000, fill: "#3b82f6" },
  { name: "Revenue Var", value: 50000, fill: "#10b981" },
  { name: "COGS Var", value: 20000, fill: "#10b981" },
  { name: "OpEx Var", value: 10000, fill: "#10b981" },
  { name: "Other Var", value: -30000, fill: "#ef4444" },
  { name: "Actual NP", value: 240000, fill: "#6366f1" },
];

const mockMarginTrend = [
  { month: "Jan", grossMargin: 58, ebitdaMargin: 38, netMargin: 22 },
  { month: "Feb", grossMargin: 59, ebitdaMargin: 39, netMargin: 23 },
  { month: "Mar", grossMargin: 60, ebitdaMargin: 40, netMargin: 24 },
];

export default function PLAnalysis() {
  const [selectedTab, setSelectedTab] = useState("statement");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="section-title">P&L Statement & Analysis</h1>
          <p className="section-subtitle mt-2">
            Monitor profitability with period comparison and budget variance analysis
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid-3col">
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$1.0M</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">↑ 5.3%</span> vs budget
              </p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">60.0%</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">↑ 1.2%</span> vs prior month
              </p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$240K</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">↑ 26.3%</span> vs budget
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="statement" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="variance">Budget Variance</TabsTrigger>
            <TabsTrigger value="comparison">Period Comparison</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* P&L Statement */}
          <TabsContent value="statement" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Income Statement - March 2026</CardTitle>
                <CardDescription>Current period P&L with margin analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Line Item</th>
                        <th>Amount</th>
                        <th>% of Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="font-semibold">
                        <td>Revenue</td>
                        <td className="financial-value">$1,000,000</td>
                        <td>100.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Cost of Goods Sold</td>
                        <td className="financial-value negative">($400,000)</td>
                        <td>40.0%</td>
                      </tr>
                      <tr className="border-t-2 border-border font-semibold">
                        <td>Gross Profit</td>
                        <td className="financial-value positive">$600,000</td>
                        <td className="text-green-600">60.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Operating Expenses</td>
                        <td className="financial-value negative">($200,000)</td>
                        <td>20.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Depreciation & Amortization</td>
                        <td className="financial-value negative">($50,000)</td>
                        <td>5.0%</td>
                      </tr>
                      <tr className="border-t-2 border-border font-semibold">
                        <td>EBITDA</td>
                        <td className="financial-value positive">$400,000</td>
                        <td className="text-green-600">40.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Depreciation & Amortization</td>
                        <td className="financial-value negative">($50,000)</td>
                        <td>5.0%</td>
                      </tr>
                      <tr className="border-t-2 border-border font-semibold">
                        <td>EBIT (Operating Income)</td>
                        <td className="financial-value positive">$350,000</td>
                        <td className="text-green-600">35.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Interest Expense</td>
                        <td className="financial-value negative">($30,000)</td>
                        <td>3.0%</td>
                      </tr>
                      <tr className="border-t-2 border-border font-semibold">
                        <td>EBT (Earnings Before Tax)</td>
                        <td className="financial-value positive">$320,000</td>
                        <td className="text-green-600">32.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Income Tax (25%)</td>
                        <td className="financial-value negative">($80,000)</td>
                        <td>8.0%</td>
                      </tr>
                      <tr className="border-t-2 border-border bg-muted">
                        <td className="font-bold">Net Profit</td>
                        <td className="financial-value positive font-bold">$240,000</td>
                        <td className="font-bold text-green-600">24.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Variance Analysis */}
          <TabsContent value="variance" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Budget vs Actual Variance Analysis</CardTitle>
                <CardDescription>Detailed breakdown of favorable and unfavorable variances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Line Item</th>
                        <th>Actual</th>
                        <th>Budget</th>
                        <th>Variance</th>
                        <th>% Var</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Revenue</td>
                        <td>$1,000,000</td>
                        <td>$950,000</td>
                        <td className="financial-value positive">+$50,000</td>
                        <td className="text-green-600">+5.3%</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>COGS</td>
                        <td>$400,000</td>
                        <td>$420,000</td>
                        <td className="financial-value positive">+$20,000</td>
                        <td className="text-green-600">+4.8%</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Gross Profit</td>
                        <td>$600,000</td>
                        <td>$530,000</td>
                        <td className="financial-value positive">+$70,000</td>
                        <td className="text-green-600">+13.2%</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>Operating Expenses</td>
                        <td>$200,000</td>
                        <td>$210,000</td>
                        <td className="financial-value positive">+$10,000</td>
                        <td className="text-green-600">+4.8%</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Favorable
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t-2 border-border">
                        <td className="font-semibold">EBITDA</td>
                        <td className="font-semibold">$400,000</td>
                        <td className="font-semibold">$320,000</td>
                        <td className="financial-value positive font-semibold">+$80,000</td>
                        <td className="text-green-600 font-semibold">+25.0%</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Favorable
                          </span>
                        </td>
                      </tr>
                      <tr className="border-t-2 border-border">
                        <td className="font-semibold">Net Profit</td>
                        <td className="font-semibold">$240,000</td>
                        <td className="font-semibold">$190,000</td>
                        <td className="financial-value positive font-semibold">+$50,000</td>
                        <td className="text-green-600 font-semibold">+26.3%</td>
                        <td>
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3" />
                            Favorable
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Variance Summary</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-300">
                        <li>✅ Total favorable variances: <span className="font-bold">+$150,000</span></li>
                        <li>📊 Revenue exceeded budget by 5.3% - strong market demand</li>
                        <li>💡 COGS efficiency improved - cost controls working well</li>
                        <li>🎯 Net profit 26.3% above budget - excellent performance</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variance Waterfall */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Variance Waterfall</CardTitle>
                <CardDescription>Bridge from budget to actual net profit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={mockVarianceWaterfall}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) =>
                        `$${(typeof value === "number" ? value / 1000 : 0).toFixed(0)}K`
                      }
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {mockVarianceWaterfall.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Period Comparison */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>3-Month Period Comparison</CardTitle>
                <CardDescription>Revenue, profitability, and margin trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={mockPeriodComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: any) =>
                        `$${(typeof value === "number" ? value / 1000 : 0).toFixed(0)}K`
                      }
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar yAxisId="left" dataKey="cogs" fill="#ef4444" name="COGS" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="netProfit"
                      stroke="#10b981"
                      name="Net Profit"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Revenue Growth</p>
                    <p className="text-lg font-bold text-green-600">+17.6%</p>
                    <p className="text-xs text-muted-foreground mt-1">Jan to Mar</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Profit Growth</p>
                    <p className="text-lg font-bold text-green-600">+33.3%</p>
                    <p className="text-xs text-muted-foreground mt-1">Jan to Mar</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs text-muted-foreground">Avg Net Margin</p>
                    <p className="text-lg font-bold">23.0%</p>
                    <p className="text-xs text-muted-foreground mt-1">3-month average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Margin Trends</CardTitle>
                <CardDescription>Gross, EBITDA, and net margin progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={mockMarginTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) =>
                        typeof value === "number" ? `${value.toFixed(1)}%` : value
                      }
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="grossMargin"
                      stroke="#3b82f6"
                      name="Gross Margin"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="ebitdaMargin"
                      stroke="#10b981"
                      name="EBITDA Margin"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="netMargin"
                      stroke="#f59e0b"
                      name="Net Margin"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                  <div className="flex gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-200">Positive Trend</h4>
                      <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                        All margins showing consistent improvement over the 3-month period. Gross margin up from 58% to 60%, net margin up from 22% to 24%. Continue monitoring cost controls and pricing strategies.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      <div className="flex justify-end">
        <ExportButtons title="P&L Statement" filename="P&L-Statement" />
      </div>
      </div>
    </DashboardLayout>
  );
}
