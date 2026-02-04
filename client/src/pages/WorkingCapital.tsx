import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, EmptyChart } from "@/components/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  Cell,
} from "recharts";
import { useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";

// Mock data - in production this would come from tRPC
const mockKPIScorecard = {
  kpis: [
    {
      name: "Days Sales Outstanding",
      metric: "DSO",
      value: 35.2,
      unit: "days",
      status: "healthy",
      description: "Average time to collect payment from customers",
      benchmark: 45,
      trend: -2.5,
    },
    {
      name: "Days Payable Outstanding",
      metric: "DPO",
      value: 42.8,
      unit: "days",
      status: "healthy",
      description: "Average time to pay suppliers",
      benchmark: 45,
      trend: 1.2,
    },
    {
      name: "Days Inventory Outstanding",
      metric: "DIO",
      value: 28.5,
      unit: "days",
      status: "excellent",
      description: "Average time inventory is held",
      benchmark: 45,
      trend: -1.8,
    },
    {
      name: "Cash Conversion Cycle",
      metric: "CCC",
      value: 20.9,
      unit: "days",
      status: "healthy",
      description: "Days between paying suppliers and collecting from customers",
      benchmark: 30,
      trend: -3.1,
    },
  ],
  liquidity: {
    currentRatio: 1.85,
    quickRatio: 1.62,
    workingCapitalDays: 12.5,
  },
};

const mockTrendData = [
  { month: "Jan", dso: 42, dpo: 38, dio: 35, ccc: 39 },
  { month: "Feb", dso: 39, dpo: 40, dio: 32, ccc: 31 },
  { month: "Mar", dso: 35.2, dpo: 42.8, dio: 28.5, ccc: 20.9 },
];

const mockScenarios = [
  { name: "Baseline", dso: 35.2, dpo: 42.8, dio: 28.5, ccc: 20.9, currentRatio: 1.85 },
  { name: "Optimistic", dso: 28, dpo: 50, dio: 20, ccc: -2, currentRatio: 2.15 },
  { name: "Conservative", dso: 42, dpo: 35, dio: 35, ccc: 42, currentRatio: 1.55 },
];

const mockImprovementInitiatives = [
  {
    initiative: "Accelerate AR Collections",
    description: "Reduce DSO by 5 days through improved collection processes",
    impact: 150000,
    effort: "medium",
    timeline: "3-6 months",
    cashFreed: 250000,
  },
  {
    initiative: "Extend Payables",
    description: "Negotiate longer payment terms with suppliers",
    impact: 200000,
    effort: "low",
    timeline: "1-3 months",
    cashFreed: 350000,
  },
  {
    initiative: "Optimize Inventory",
    description: "Reduce inventory levels through better demand forecasting",
    impact: 180000,
    effort: "high",
    timeline: "6-12 months",
    cashFreed: 300000,
  },
];

const mockCashImpactData = [
  { component: "AR Reduction", impact: 100000, fill: "#10b981" },
  { component: "AP Extension", impact: 150000, fill: "#3b82f6" },
  { component: "Inventory Reduction", impact: 100000, fill: "#f59e0b" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
    case "healthy":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200";
    case "adequate":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
    case "concerning":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "excellent":
    case "healthy":
      return <CheckCircle className="h-4 w-4" />;
    case "concerning":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <TrendingUp className="h-4 w-4" />;
  }
};

export default function WorkingCapital() {
  const [selectedTab, setSelectedTab] = useState("kpis");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="section-title">Working Capital Analysis</h1>
          <p className="section-subtitle mt-2">
            Monitor DSO, DPO, DIO, and CCC with scenario modeling and improvement opportunities
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid-4col">
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">DSO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">35.2</div>
              <p className="text-xs text-muted-foreground mt-1">days</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                2.5 days better
              </p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">DPO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">42.8</div>
              <p className="text-xs text-muted-foreground mt-1">days</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                1.2 days better
              </p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">DIO</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28.5</div>
              <p className="text-xs text-muted-foreground mt-1">days</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                1.8 days better
              </p>
            </CardContent>
          </Card>

          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CCC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">20.9</div>
              <p className="text-xs text-muted-foreground mt-1">days</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                3.1 days better
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="kpis" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpis">KPI Scorecard</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
          </TabsList>

          {/* KPI Scorecard */}
          <TabsContent value="kpis" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {mockKPIScorecard.kpis.map((kpi) => (
                <Card key={kpi.metric} className="financial-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{kpi.name}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(kpi.status)}`}>
                            {getStatusIcon(kpi.status)}
                            {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{kpi.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{kpi.value}</div>
                        <p className="text-xs text-muted-foreground">{kpi.unit}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="font-semibold">{kpi.value}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Benchmark</p>
                        <p className="font-semibold">{kpi.benchmark}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Trend</p>
                        <p className={`font-semibold ${kpi.trend < 0 ? "text-green-600" : "text-red-600"}`}>
                          {kpi.trend > 0 ? "+" : ""}{kpi.trend}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Liquidity Metrics */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Liquidity Metrics</CardTitle>
                <CardDescription>Short-term financial health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Current Ratio</p>
                    <p className="text-2xl font-bold mt-2">{mockKPIScorecard.liquidity.currentRatio}</p>
                    <p className="text-xs text-muted-foreground mt-1">Healthy: &gt;1.5</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Quick Ratio</p>
                    <p className="text-2xl font-bold mt-2">{mockKPIScorecard.liquidity.quickRatio}</p>
                    <p className="text-xs text-muted-foreground mt-1">Healthy: &gt;1.0</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">WC % of Revenue</p>
                    <p className="text-2xl font-bold mt-2">{mockKPIScorecard.liquidity.workingCapitalDays}%</p>
                    <p className="text-xs text-muted-foreground mt-1">Benchmark: &lt;15%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>3-Month Working Capital Trends</CardTitle>
                <CardDescription>DSO, DPO, DIO, and CCC progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `${typeof value === "number" ? value.toFixed(1) : value} days`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="dso" stroke="#3b82f6" name="DSO" strokeWidth={2} />
                    <Line type="monotone" dataKey="dpo" stroke="#10b981" name="DPO" strokeWidth={2} />
                    <Line type="monotone" dataKey="dio" stroke="#f59e0b" name="DIO" strokeWidth={2} />
                    <Line type="monotone" dataKey="ccc" stroke="#ef4444" name="CCC" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-8 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                  <div className="flex gap-3">
                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-200">Positive Trend</h4>
                      <p className="mt-1 text-sm text-green-800 dark:text-green-300">
                        All working capital metrics improving. DSO down 6.8 days, CCC down 18.1 days over 3 months. Continue focus on collections and inventory optimization.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scenarios */}
          <TabsContent value="scenarios" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
                <CardDescription>Baseline, optimistic, and conservative scenarios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="financial-table">
                    <thead>
                      <tr>
                        <th>Scenario</th>
                        <th>DSO</th>
                        <th>DPO</th>
                        <th>DIO</th>
                        <th>CCC</th>
                        <th>Current Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockScenarios.map((scenario) => (
                        <tr key={scenario.name}>
                          <td className="font-semibold">{scenario.name}</td>
                          <td>{scenario.dso.toFixed(1)}</td>
                          <td>{scenario.dpo.toFixed(1)}</td>
                          <td>{scenario.dio.toFixed(1)}</td>
                          <td className={scenario.ccc < 20.9 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                            {scenario.ccc.toFixed(1)}
                          </td>
                          <td>{scenario.currentRatio.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Baseline</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">20.9</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Current CCC</p>
                  </div>
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-200">Optimistic</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">-2.0</p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">Potential CCC</p>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-200">Conservative</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">42.0</p>
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1">Risk CCC</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Impact Waterfall */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Cash Impact by Component</CardTitle>
                <CardDescription>Optimistic scenario vs baseline</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockCashImpactData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="component" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `$${(typeof value === "number" ? value / 1000 : 0).toFixed(0)}K`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Bar dataKey="impact" radius={[8, 8, 0, 0]}>
                      {mockCashImpactData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Improvements */}
          <TabsContent value="improvements" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Improvement Initiatives</CardTitle>
                <CardDescription>Prioritized opportunities to optimize working capital</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockImprovementInitiatives.map((initiative, index) => (
                    <div key={index} className="rounded-lg border border-border p-4 hover:bg-muted/50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{initiative.initiative}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{initiative.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">${(initiative.cashFreed / 1000).toFixed(0)}K</p>
                          <p className="text-xs text-muted-foreground">Cash freed</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Effort Level</p>
                          <p className="font-semibold capitalize">{initiative.effort}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeline</p>
                          <p className="font-semibold">{initiative.timeline}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Financial Impact</p>
                          <p className="font-semibold text-green-600">${(initiative.impact / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex gap-3">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200">Total Opportunity</h4>
                      <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                        Combined initiatives could free up <span className="font-bold">$900K</span> in cash and reduce CCC to <span className="font-bold">-2 days</span>. Start with AR acceleration (low effort, quick wins).
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      <div className="flex justify-end">
        <ExportButtons title="Working Capital Analysis" filename="Working-Capital-Analysis" />
      </div>
      </div>
    </DashboardLayout>
  );
}
