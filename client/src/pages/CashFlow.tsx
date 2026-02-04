import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  AreaChart,
  Area,
} from "recharts";
import {
  ArrowDown,
  ArrowUp,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Zap,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

// Mock data for cash flow
const cashFlowStatement = [
  { name: "Opening Balance", value: 2500000, fill: "#3b82f6" },
  { name: "Operating Cash Flow", value: 1200000, fill: "#10b981" },
  { name: "AR Collections", value: 850000, fill: "#10b981" },
  { name: "Inventory Reduction", value: 150000, fill: "#10b981" },
  { name: "AP Payments", value: -680000, fill: "#ef4444" },
  { name: "Capex", value: -300000, fill: "#ef4444" },
  { name: "Debt Repayment", value: -200000, fill: "#ef4444" },
  { name: "Closing Balance", value: 3520000, fill: "#3b82f6" },
];

const monthlyForecast = [
  { month: "Jan", forecast: 2800000, optimistic: 3100000, conservative: 2400000, actual: 2750000 },
  { month: "Feb", forecast: 3050000, optimistic: 3450000, conservative: 2650000, actual: 3100000 },
  { month: "Mar", forecast: 3200000, optimistic: 3650000, conservative: 2750000, actual: 3150000 },
  { month: "Apr", forecast: 3350000, optimistic: 3850000, conservative: 2850000, actual: null },
  { month: "May", forecast: 3500000, optimistic: 4050000, conservative: 2950000, actual: null },
  { month: "Jun", forecast: 3650000, optimistic: 4250000, conservative: 3050000, actual: null },
];

const scenarioData = [
  {
    name: "Base Case",
    description: "Expected scenario with normal collection and payment patterns",
    endingCash: 3520000,
    minimumCash: 2500000,
    buffer: 1020000,
    riskLevel: "low",
    assumptions: [
      "AR collection rate: 85%",
      "Payment terms: Net 30",
      "Seasonal adjustments: Normal",
      "No major capex",
    ],
  },
  {
    name: "Optimistic Case",
    description: "Best-case scenario with accelerated collections and cost control",
    endingCash: 4250000,
    minimumCash: 2500000,
    buffer: 1750000,
    riskLevel: "low",
    assumptions: [
      "AR collection rate: 95%",
      "Payment terms: Net 20",
      "Seasonal boost: +15%",
      "Reduced capex",
    ],
  },
  {
    name: "Conservative Case",
    description: "Worst-case scenario with delayed collections and increased expenses",
    endingCash: 2850000,
    minimumCash: 2500000,
    buffer: 350000,
    riskLevel: "high",
    assumptions: [
      "AR collection rate: 70%",
      "Payment terms: Net 45",
      "Seasonal decline: -10%",
      "Increased capex",
    ],
  },
];

const cashFlowComponents = [
  { name: "Operating Activities", value: 2200000, trend: 3.5, icon: "activity" },
  { name: "Investing Activities", value: -300000, trend: -2.1, icon: "invest" },
  { name: "Financing Activities", value: -200000, trend: 1.2, icon: "finance" },
  { name: "Net Cash Flow", value: 1700000, trend: 2.8, icon: "net" },
];

export default function CashFlow() {
  const [selectedScenario, setSelectedScenario] = useState("base");
  const [selectedTab, setSelectedTab] = useState("statement");
  const isLoading = false;

  const baseScenario = scenarioData[0];
  const optimisticScenario = scenarioData[1];
  const conservativeScenario = scenarioData[2];

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
            <h1 className="text-3xl font-bold tracking-tight">Cash Flow Analysis</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive cash flow statement with 6-month forecast and scenario analysis
            </p>
          </div>
          <ExportButtons filename="cash-flow" title="Cash Flow Analysis" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Current Cash Position */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Current Cash Position</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">$3.52M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+8.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Operating Cash Flow */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Operating Cash Flow</CardTitle>
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">$2.20M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+3.5% month-over-month</span>
              </div>
            </CardContent>
          </Card>

          {/* Minimum Cash Required */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Minimum Required</CardTitle>
                <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">$2.50M</div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Buffer: $1.02M</span>
              </div>
            </CardContent>
          </Card>

          {/* 6-Month Forecast */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Jun Forecast</CardTitle>
                <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">$3.65M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+3.8% growth</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="statement">Statement</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>

          {/* Cash Flow Statement Tab */}
          <TabsContent value="statement" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement - Waterfall</CardTitle>
                <CardDescription>Detailed breakdown of cash inflows and outflows</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cashFlowStatement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cash Flow Details */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Components</CardTitle>
                <CardDescription>Breakdown of major cash flow items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cashFlowComponents.map((component, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="font-semibold">{component.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">Monthly average</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${(component.value / 1000000).toFixed(2)}M</div>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          {component.trend > 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={component.trend > 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                            {Math.abs(component.trend)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>6-Month Cash Flow Forecast</CardTitle>
                <CardDescription>Projected cash position with base, optimistic, and conservative scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={monthlyForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    <Legend />
                    <Area type="monotone" dataKey="optimistic" fill="#10b981" stroke="#10b981" fillOpacity={0.2} name="Optimistic" />
                    <Area type="monotone" dataKey="conservative" fill="#ef4444" stroke="#ef4444" fillOpacity={0.2} name="Conservative" />
                    <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Base Forecast" />
                    <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} name="Actual" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {scenarioData.map((scenario, idx) => (
                <Card
                  key={idx}
                  className={`cursor-pointer transition-all ${
                    selectedScenario === scenario.name.toLowerCase().replace(" ", "-")
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedScenario(scenario.name.toLowerCase().replace(" ", "-"))}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <Badge
                        className={
                          scenario.riskLevel === "low"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {scenario.riskLevel === "low" ? "Low Risk" : "High Risk"}
                      </Badge>
                    </div>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Ending Cash</div>
                      <div className="text-2xl font-bold">${(scenario.endingCash / 1000000).toFixed(2)}M</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cash Buffer</div>
                      <div className="text-lg font-semibold text-green-600">${(scenario.buffer / 1000000).toFixed(2)}M</div>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="text-sm font-semibold mb-2">Key Assumptions:</div>
                      <ul className="space-y-1">
                        {scenario.assumptions.map((assumption, i) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            • {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scenario Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>Side-by-side comparison of ending cash positions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={scenarioData.map((s) => ({
                      name: s.name,
                      "Ending Cash": s.endingCash,
                      "Minimum Required": s.minimumCash,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                    <Legend />
                    <Bar dataKey="Ending Cash" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="Minimum Required" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Components Analysis</CardTitle>
                <CardDescription>Detailed view of operating, investing, and financing activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Operating Activities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <h3 className="font-semibold">Operating Activities</h3>
                  </div>
                  <div className="ml-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Income</span>
                      <span className="font-medium">$1,200,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Depreciation & Amortization</span>
                      <span className="font-medium">$150,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Changes in Working Capital</span>
                      <span className="font-medium">$850,000</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Operating</span>
                      <span className="text-green-600">$2,200,000</span>
                    </div>
                  </div>
                </div>

                {/* Investing Activities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <h3 className="font-semibold">Investing Activities</h3>
                  </div>
                  <div className="ml-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capital Expenditures</span>
                      <span className="font-medium">-$300,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asset Sales</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Investing</span>
                      <span className="text-red-600">-$300,000</span>
                    </div>
                  </div>
                </div>

                {/* Financing Activities */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <h3 className="font-semibold">Financing Activities</h3>
                  </div>
                  <div className="ml-5 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Debt Repayment</span>
                      <span className="font-medium">-$200,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dividend Payments</span>
                      <span className="font-medium">$0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Financing</span>
                      <span className="text-blue-600">-$200,000</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
