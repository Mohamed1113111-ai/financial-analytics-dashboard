import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Percent,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

// Mock P&L data
const plStatement = [
  { category: "Revenue", amount: 5000000, percentage: 100 },
  { category: "Cost of Goods Sold", amount: -2000000, percentage: -40 },
  { category: "Gross Profit", amount: 3000000, percentage: 60 },
  { category: "Operating Expenses", amount: -1200000, percentage: -24 },
  { category: "EBITDA", amount: 1800000, percentage: 36 },
  { category: "Depreciation", amount: -250000, percentage: -5 },
  { category: "EBIT", amount: 1550000, percentage: 31 },
  { category: "Interest Expense", amount: -150000, percentage: -3 },
  { category: "EBT", amount: 1400000, percentage: 28 },
  { category: "Taxes", amount: -350000, percentage: -7 },
  { category: "Net Income", amount: 1050000, percentage: 21 },
];

const monthlyTrend = [
  { month: "Jan", revenue: 4200000, cogs: 1680000, opex: 1008000, netIncome: 840000 },
  { month: "Feb", revenue: 4500000, cogs: 1800000, opex: 1080000, netIncome: 945000 },
  { month: "Mar", revenue: 4800000, cogs: 1920000, opex: 1152000, netIncome: 1008000 },
  { month: "Apr", revenue: 5000000, cogs: 2000000, opex: 1200000, netIncome: 1050000 },
  { month: "May", revenue: 5200000, cogs: 2080000, opex: 1248000, netIncome: 1092000 },
  { month: "Jun", revenue: 5500000, cogs: 2200000, opex: 1320000, netIncome: 1155000 },
];

const expenseBreakdown = [
  { name: "COGS", value: 2000000, fill: "#ef4444" },
  { name: "Salaries", value: 600000, fill: "#f59e0b" },
  { name: "Marketing", value: 300000, fill: "#3b82f6" },
  { name: "Rent", value: 200000, fill: "#10b981" },
  { name: "Utilities", value: 100000, fill: "#8b5cf6" },
];

const budgetVariance = [
  { category: "Revenue", actual: 5000000, budget: 4800000, variance: 200000, variancePercent: 4.2 },
  { category: "COGS", actual: 2000000, budget: 1920000, variance: 80000, variancePercent: -4.2 },
  { category: "Operating Expenses", actual: 1200000, budget: 1250000, variance: -50000, variancePercent: 4.0 },
  { category: "Net Income", actual: 1050000, budget: 950000, variance: 100000, variancePercent: 10.5 },
];

const profitMarginTrend = [
  { month: "Jan", grossMargin: 60, operatingMargin: 28, netMargin: 20 },
  { month: "Feb", grossMargin: 60, operatingMargin: 28, netMargin: 21 },
  { month: "Mar", grossMargin: 60, operatingMargin: 29, netMargin: 21 },
  { month: "Apr", grossMargin: 60, operatingMargin: 30, netMargin: 21 },
  { month: "May", grossMargin: 60, operatingMargin: 30, netMargin: 21 },
  { month: "Jun", grossMargin: 60, operatingMargin: 30, netMargin: 21 },
];

export default function PLAnalysis() {
  const [selectedTab, setSelectedTab] = useState("statement");
  const isLoading = false;

  const totalRevenue = 5000000;
  const grossProfit = 3000000;
  const netIncome = 1050000;
  const grossMargin = 60;
  const netMargin = 21;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">P&L Analysis</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive profit and loss statement with variance analysis and trend tracking
            </p>
          </div>
          <ExportButtons filename="pl-analysis" title="P&L Analysis" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">${(totalRevenue / 1000000).toFixed(2)}M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+4.2% vs budget</span>
              </div>
            </CardContent>
          </Card>

          {/* Gross Profit */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Gross Profit</CardTitle>
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">${(grossProfit / 1000000).toFixed(2)}M</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-green-600 dark:text-green-400">Margin: {grossMargin}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Net Income */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Net Income</CardTitle>
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">${(netIncome / 1000000).toFixed(2)}M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+10.5% vs budget</span>
              </div>
            </CardContent>
          </Card>

          {/* Net Margin */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Net Margin</CardTitle>
                <Percent className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{netMargin}%</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+1.2% improvement</span>
              </div>
            </CardContent>
          </Card>

          {/* Gross Margin */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Gross Margin</CardTitle>
                <Percent className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">{grossMargin}%</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-red-600 dark:text-red-400">Stable YoY</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="variance">Variance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          </TabsList>

          {/* P&L Statement Tab */}
          <TabsContent value="statement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Statement</CardTitle>
                <CardDescription>Complete P&L statement with line items and percentages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plStatement.map((item, idx) => {
                    const isTotalRow = ["Gross Profit", "EBITDA", "EBIT", "EBT", "Net Income"].includes(item.category);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isTotalRow ? "bg-muted border font-semibold" : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.category}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${(item.amount / 1000000).toFixed(2)}M</div>
                          <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* P&L Summary Chart */}
            <Card>
              <CardHeader>
                <CardTitle>P&L Waterfall</CardTitle>
                <CardDescription>Visual flow from revenue to net income</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={plStatement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variance Tab */}
          <TabsContent value="variance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Analysis</CardTitle>
                <CardDescription>Variance analysis for key P&L line items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetVariance.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{item.category}</div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              (item.category === "Revenue" && item.variance > 0) ||
                              (item.category !== "Revenue" && item.variance < 0)
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {item.variance > 0 ? "+" : ""}{item.variancePercent}%
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex-1">
                          <div className="text-muted-foreground">Actual</div>
                          <div className="font-medium">${(item.actual / 1000000).toFixed(2)}M</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-muted-foreground">Budget</div>
                          <div className="font-medium">${(item.budget / 1000000).toFixed(2)}M</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-muted-foreground">Variance</div>
                          <div className={`font-medium ${item.variance > 0 ? "text-green-600" : "text-red-600"}`}>
                            ${(item.variance / 1000000).toFixed(2)}M
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${Math.min(100, (item.actual / item.budget) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Variance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Variance Comparison</CardTitle>
                <CardDescription>Actual vs Budget for major categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={budgetVariance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    <Legend />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="budget" fill="#d1d5db" name="Budget" radius={[8, 8, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>6-Month Revenue & Income Trend</CardTitle>
                <CardDescription>Monthly progression of key metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="cogs" fill="#ef4444" name="COGS" radius={[8, 8, 0, 0]} />
                    <Line type="monotone" dataKey="netIncome" stroke="#10b981" strokeWidth={2} name="Net Income" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Profit Margin Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Trends</CardTitle>
                <CardDescription>Gross, Operating, and Net margins over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={profitMarginTrend}>
                    <defs>
                      <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${value}%`} />
                    <Legend />
                    <Area type="monotone" dataKey="grossMargin" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGross)" name="Gross Margin" />
                    <Area type="monotone" dataKey="operatingMargin" stroke="#10b981" fillOpacity={1} fill="url(#colorOp)" name="Operating Margin" />
                    <Area type="monotone" dataKey="netMargin" stroke="#f59e0b" fillOpacity={1} fill="url(#colorNet)" name="Net Margin" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Distribution of operating expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: $${(value / 1000000).toFixed(1)}M`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Expense Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Details</CardTitle>
                  <CardDescription>Breakdown of major expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expenseBreakdown.map((expense, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: expense.fill }}></div>
                          <div className="font-medium">{expense.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${(expense.value / 1000000).toFixed(2)}M</div>
                          <div className="text-xs text-muted-foreground">
                            {((expense.value / 5000000) * 100).toFixed(1)}% of revenue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
