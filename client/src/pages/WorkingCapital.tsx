import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  ComposedChart,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  DollarSign,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import DashboardLayout from "@/components/DashboardLayout";
import { Loader2 } from "lucide-react";

// Mock data for Working Capital
const kpiData = [
  {
    name: "Days Sales Outstanding",
    metric: "DSO",
    value: 35.2,
    unit: "days",
    status: "excellent",
    benchmark: 45,
    trend: -2.5,
    description: "Average time to collect payment from customers",
    icon: "dso",
  },
  {
    name: "Days Payable Outstanding",
    metric: "DPO",
    value: 42.8,
    unit: "days",
    status: "healthy",
    benchmark: 45,
    trend: 1.2,
    description: "Average time to pay suppliers",
    icon: "dpo",
  },
  {
    name: "Days Inventory Outstanding",
    metric: "DIO",
    value: 28.5,
    unit: "days",
    status: "excellent",
    benchmark: 45,
    trend: -1.8,
    description: "Average time inventory is held",
    icon: "dio",
  },
  {
    name: "Cash Conversion Cycle",
    metric: "CCC",
    value: 20.9,
    unit: "days",
    status: "excellent",
    benchmark: 30,
    trend: -3.1,
    description: "Days between paying suppliers and collecting from customers",
    icon: "ccc",
  },
];

const trendData = [
  { month: "Jan", dso: 42, dpo: 38, dio: 35, ccc: 39 },
  { month: "Feb", dso: 39, dpo: 40, dio: 32, ccc: 31 },
  { month: "Mar", dso: 36.5, dpo: 41, dio: 30, ccc: 25.5 },
  { month: "Apr", dso: 35.8, dpo: 42, dio: 29, ccc: 22.8 },
  { month: "May", dso: 35.5, dpo: 42.5, dio: 28.8, ccc: 21.8 },
  { month: "Jun", dso: 35.2, dpo: 42.8, dio: 28.5, ccc: 20.9 },
];

const workingCapitalComponents = [
  { name: "Current Assets", value: 2500000, trend: 3.2 },
  { name: "Current Liabilities", value: 1350000, trend: -1.5 },
  { name: "Working Capital", value: 1150000, trend: 5.1 },
];

const liquidityMetrics = [
  { name: "Current Ratio", value: 1.85, benchmark: 1.5, status: "excellent" },
  { name: "Quick Ratio", value: 1.62, benchmark: 1.0, status: "excellent" },
  { name: "Cash Ratio", value: 0.95, benchmark: 0.5, status: "excellent" },
];

const assetTurnover = [
  { month: "Jan", receivables: 1200000, inventory: 850000, payables: 600000 },
  { month: "Feb", receivables: 1150000, inventory: 820000, payables: 620000 },
  { month: "Mar", receivables: 1100000, inventory: 800000, payables: 640000 },
  { month: "Apr", receivables: 1080000, inventory: 780000, payables: 650000 },
  { month: "May", receivables: 1050000, inventory: 760000, payables: 660000 },
  { month: "Jun", receivables: 1020000, inventory: 740000, payables: 680000 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 text-green-800";
    case "healthy":
      return "bg-blue-100 text-blue-800";
    case "warning":
      return "bg-amber-100 text-amber-800";
    case "critical":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function WorkingCapital() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const isLoading = false;

  const currentRatio = 1.85;
  const quickRatio = 1.62;
  const workingCapital = 1150000;
  const ccc = 20.9;

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
            <h1 className="text-3xl font-bold tracking-tight">Working Capital Management</h1>
            <p className="text-muted-foreground mt-2">
              Monitor liquidity, cash conversion cycle, and operational efficiency metrics
            </p>
          </div>
          <ExportButtons filename="working-capital" title="Working Capital Analysis" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Current Ratio */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Current Ratio</CardTitle>
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{currentRatio.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Above benchmark (1.5)</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Ratio */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Quick Ratio</CardTitle>
                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{quickRatio.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">Excellent liquidity</span>
              </div>
            </CardContent>
          </Card>

          {/* Working Capital */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Working Capital</CardTitle>
                <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">${(workingCapital / 1000000).toFixed(2)}M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+5.1% improvement</span>
              </div>
            </CardContent>
          </Card>

          {/* Cash Conversion Cycle */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Cash Conversion</CardTitle>
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{ccc.toFixed(1)} days</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">-3.1% (improving)</span>
              </div>
            </CardContent>
          </Card>

          {/* DSO */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">Days Sales Outstanding</CardTitle>
                <Target className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">35.2 days</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">-2.5% (faster collection)</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kpis">KPI Details</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Working Capital Components */}
              <Card>
                <CardHeader>
                  <CardTitle>Working Capital Components</CardTitle>
                  <CardDescription>Current assets vs current liabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={workingCapitalComponents}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Asset Composition */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Composition Trend</CardTitle>
                  <CardDescription>Receivables, Inventory, and Payables over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={assetTurnover}>
                      <defs>
                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPay" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${((value as number) / 1000000).toFixed(2)}M`} />
                      <Legend />
                      <Area type="monotone" dataKey="receivables" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRec)" name="Receivables" />
                      <Area type="monotone" dataKey="inventory" stroke="#10b981" fillOpacity={1} fill="url(#colorInv)" name="Inventory" />
                      <Area type="monotone" dataKey="payables" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPay)" name="Payables" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* KPI Details Tab */}
          <TabsContent value="kpis" className="space-y-4">
            <div className="grid gap-4">
              {kpiData.map((kpi, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{kpi.name}</h3>
                          <Badge className={getStatusColor(kpi.status)}>{kpi.status.toUpperCase()}</Badge>
                          <Badge variant="outline">{kpi.metric}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{kpi.description}</p>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Current Value</div>
                            <div className="text-2xl font-bold">
                              {kpi.value} <span className="text-sm font-normal">{kpi.unit}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Benchmark</div>
                            <div className="text-2xl font-bold">
                              {kpi.benchmark} <span className="text-sm font-normal">{kpi.unit}</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Trend</div>
                            <div className="flex items-center gap-1">
                              {kpi.trend < 0 ? (
                                <ArrowDownRight className="w-4 h-4 text-green-500" />
                              ) : (
                                <ArrowUpRight className="w-4 h-4 text-red-500" />
                              )}
                              <span className={kpi.trend < 0 ? "text-green-600 text-lg font-bold" : "text-red-600 text-lg font-bold"}>
                                {Math.abs(kpi.trend)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (kpi.value / kpi.benchmark) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Working Capital KPI Trends</CardTitle>
                <CardDescription>6-month trend of DSO, DPO, DIO, and CCC</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="dso" stroke="#3b82f6" strokeWidth={2} name="DSO" />
                    <Line type="monotone" dataKey="dpo" stroke="#10b981" strokeWidth={2} name="DPO" />
                    <Line type="monotone" dataKey="dio" stroke="#f59e0b" strokeWidth={2} name="DIO" />
                    <Line type="monotone" dataKey="ccc" stroke="#ef4444" strokeWidth={2} name="CCC" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liquidity Tab */}
          <TabsContent value="liquidity" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {liquidityMetrics.map((metric, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">{metric.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                      <div className="text-3xl font-bold">{metric.value.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Benchmark</div>
                      <div className="text-xl font-semibold">{metric.benchmark.toFixed(2)}</div>
                    </div>
                    <div className="pt-4 border-t">
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.value > metric.benchmark ? "ABOVE BENCHMARK" : "BELOW BENCHMARK"}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="h-3 rounded-full bg-green-500"
                        style={{ width: `${Math.min(100, (metric.value / (metric.benchmark * 1.5)) * 100)}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Liquidity Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Liquidity Analysis</CardTitle>
                <CardDescription>Assessment of short-term financial health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-900 dark:text-green-100">Strong Liquidity Position</div>
                      <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                        Current ratio of 1.85 indicates excellent short-term liquidity. The company can cover current liabilities 1.85 times over with current assets.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-900 dark:text-blue-100">Efficient Working Capital</div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                        Cash conversion cycle of 20.9 days shows efficient management of receivables, inventory, and payables.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-amber-900 dark:text-amber-100">Monitor Receivables</div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Continue focus on DSO improvement to maintain strong cash flow and reduce financing needs.
                      </p>
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
