import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "@/contexts/LocationContext";
import { trpc } from "@/lib/trpc";
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useLocationFilterDisplay } from "@/hooks/useLocationFilter";
import DashboardLayout from "@/components/DashboardLayout";
import { EmptyState } from "@/components/EmptyState";
import { ExportButtons } from "@/components/ExportButtons";
import { CollectionStrategySimulator } from "@/components/CollectionStrategySimulator";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data for AR aging
const arAgingData = [
  { bucket: "0-30", amount: 1780000, customers: 45, percentage: 46, trend: 2.5 },
  { bucket: "31-60", amount: 1140000, customers: 28, percentage: 29, trend: -1.2 },
  { bucket: "61-90", amount: 612200, customers: 15, percentage: 16, trend: 0.8 },
  { bucket: "90+", amount: 333500, customers: 8, percentage: 9, trend: 3.1 },
];

const forecastData = [
  { month: "Jan", forecast: 3500000, actual: 3420000, collected: 3200000, projected: 3450000 },
  { month: "Feb", forecast: 3650000, actual: 3510000, collected: 3350000, projected: 3600000 },
  { month: "Mar", forecast: 3800000, actual: 3900000, collected: 3650000, projected: 3750000 },
  { month: "Apr", forecast: 3950000, actual: null, collected: null, projected: 3900000 },
  { month: "May", forecast: 4100000, actual: null, collected: null, projected: 4050000 },
  { month: "Jun", forecast: 4250000, actual: null, collected: null, projected: 4200000 },
];

const collectionRateData = [
  { name: "0-30 Days", value: 92, fill: "#10b981" },
  { name: "31-60 Days", value: 78, fill: "#3b82f6" },
  { name: "61-90 Days", value: 45, fill: "#f59e0b" },
  { name: "90+ Days", value: 15, fill: "#ef4444" },
];

const customerData = [
  { name: "Acme Corp", amount: 450000, days: 45, status: "at-risk", trend: -2.5 },
  { name: "Tech Solutions", amount: 380000, days: 38, status: "good", trend: 1.2 },
  { name: "Global Retail", amount: 520000, days: 52, status: "at-risk", trend: -3.1 },
  { name: "Manufacturing Co", amount: 310000, days: 28, status: "good", trend: 2.8 },
  { name: "Healthcare Group", amount: 280000, days: 65, status: "overdue", trend: -5.2 },
];

const dsoTrendData = [
  { month: "Jan", dso: 38, target: 35 },
  { month: "Feb", dso: 40, target: 35 },
  { month: "Mar", dso: 42, target: 35 },
  { month: "Apr", dso: 44, target: 35 },
  { month: "May", dso: 43, target: 35 },
  { month: "Jun", dso: 42, target: 35 },
];

interface CustomerDetails {
  name: string;
  amount: number;
  days: number;
  status: string;
  trend: number;
}

function ARForecastContent() {
  const { selectedCount } = useLocationFilterDisplay();
  const { selectedLocations } = useLocation();
  const [selectedTab, setSelectedTab] = useState("overview");
  const { user } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch AR aging data from database
  const { data: arData, isLoading } = trpc.dashboard.arAgingSummary.useQuery(
    {
      locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
    },
    {
      enabled: !!user,
      refetchInterval: 30000,
    }
  );

  const hasData = !!arData && arData.length > 0;
  const displayData = arData || arAgingData;
  const totalAR = displayData.reduce((sum: number, item: any) => {
    if (item.amount !== undefined) return sum + item.amount;
    if (item.total !== undefined) return sum + item.total;
    return sum + (item.bucket0_30 + item.bucket31_60 + item.bucket61_90 + item.bucket90_plus);
  }, 0);
  const overdue90Plus = (() => {
    const item = displayData.find((item: any) => item.bucket === "90+" || (item as any).bucket90_plus !== undefined);
    if (!item) return 0;
    if ((item as any).amount !== undefined) return (item as any).amount;
    if ((item as any).bucket90_plus !== undefined) return (item as any).bucket90_plus;
    return 0;
  })();
  const avgDSO = arData ? Math.round(totalAR / (totalAR / 42)) : 42;
  const targetDSO = 35;
  const collectionEfficiency = arData ? 85 : 78.5;
  const totalCustomers = displayData.reduce((sum: number, item: any) => sum + item.customers, 0);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hasData) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AR Collections Forecast</h1>
            <p className="text-muted-foreground mt-2">Analyze aging buckets, collection probability, and cash flow impact</p>
          </div>
          <EmptyState
            title="No AR Data Available"
            description="There is no accounts receivable data available for the selected location(s)."
            icon="database"
          />
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
            <h1 className="text-3xl font-bold tracking-tight">AR Collections Forecast</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive analysis of aging buckets, collection probability, and cash flow impact across {selectedCount} location(s)
            </p>
          </div>
          <ExportButtons filename="ar-forecast" title="AR Collections Forecast" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Total AR Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">Total AR Outstanding</CardTitle>
                <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">${(totalAR / 1000000).toFixed(2)}M</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600 dark:text-red-400">+5.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* 90+ Days Overdue Card */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-900 dark:text-red-100">90+ Days Overdue</CardTitle>
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900 dark:text-red-100">${(overdue90Plus / 1000).toFixed(0)}K</div>
              <Badge className="mt-2 bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200">High Risk</Badge>
            </CardContent>
          </Card>

          {/* Avg DSO Card */}
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Avg DSO</CardTitle>
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{avgDSO} days</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-amber-600 dark:text-amber-400">Target: {targetDSO} days</span>
              </div>
            </CardContent>
          </Card>

          {/* Collection Efficiency Card */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">Collection Rate</CardTitle>
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{collectionEfficiency}%</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-600 dark:text-green-400">+2.1% improvement</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Customers Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">Active Customers</CardTitle>
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalCustomers}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-purple-600 dark:text-purple-400">Accounts in AR</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
            <TabsTrigger value="strategy">Strategy Simulator</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Collection Rate by Bucket */}
              <Card>
                <CardHeader>
                  <CardTitle>Collection Rate by Aging Bucket</CardTitle>
                  <CardDescription>Percentage of invoices collected by days outstanding</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={collectionRateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {collectionRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* DSO Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Days Sales Outstanding Trend</CardTitle>
                  <CardDescription>DSO vs Target over 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dsoTrendData}>
                      <defs>
                        <linearGradient id="colorDSO" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="dso" stroke="#f59e0b" fillOpacity={1} fill="url(#colorDSO)" />
                      <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aging Analysis Tab */}
          <TabsContent value="aging" className="space-y-4">
            <div className="grid gap-4">
              {/* Aging Buckets Detail */}
              <Card>
                <CardHeader>
                  <CardTitle>AR Aging Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of accounts receivable by aging bucket</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {arAgingData.map((bucket) => (
                      <div key={bucket.bucket} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-24 font-medium">{bucket.bucket} Days</div>
                            <div className="text-2xl font-bold">${((bucket.amount as number) / 1000).toFixed(0)}K</div>
                            <Badge variant="outline">{bucket.percentage}%</Badge>
                            <div className="flex items-center gap-1 ml-4">
                              {bucket.trend > 0 ? (
                                <ArrowUpRight className="w-4 h-4 text-red-500" />
                              ) : (
                                <ArrowDownRight className="w-4 h-4 text-green-500" />
                              )}
                              <span className={bucket.trend > 0 ? "text-red-600" : "text-green-600"}>
                                {Math.abs(bucket.trend)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">{bucket.customers} customers</div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              bucket.bucket === "0-30"
                                ? "bg-green-500"
                                : bucket.bucket === "31-60"
                                  ? "bg-blue-500"
                                  : bucket.bucket === "61-90"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${bucket.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Aging Distribution Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Aging Distribution</CardTitle>
                  <CardDescription>Visual representation of AR distribution across aging buckets</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={arAgingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => `$${((value as number) / 1000).toFixed(0)}K`} />
                      <Legend />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AR Forecast vs Actual</CardTitle>
                <CardDescription>6-month forecast with actual and collected amounts</CardDescription>
              </CardHeader>
              <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => (value ? `$${((value as number) / 1000000).toFixed(2)}M` : "N/A")} />
                      <Legend />
                      <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} name="Forecast" />
                      <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                      <Line type="monotone" dataKey="collected" stroke="#f59e0b" strokeWidth={2} name="Collected" />
                    </LineChart>
                  </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategy Simulator Tab */}
          <TabsContent value="strategy" className="space-y-4">
            <CollectionStrategySimulator
              currentAging={{
                "0-30": arAgingData[0].amount,
                "31-60": arAgingData[1].amount,
                "61-90": arAgingData[2].amount,
                "90+": arAgingData[3].amount,
              }}
            />
          </TabsContent>

          {/* Top Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Customers by AR Balance</CardTitle>
                <CardDescription>Largest AR accounts and their collection status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerData.map((customer, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{customer.name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">{customer.days} days outstanding</span>
                          <Badge
                            variant="outline"
                            className={
                              customer.status === "good"
                                ? "bg-green-100 text-green-800"
                                : customer.status === "at-risk"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {customer.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${((customer.amount as number) / 1000).toFixed(0)}K</div>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          {customer.trend < 0 ? (
                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={customer.trend < 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
                            {Math.abs(customer.trend)}%
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

        {/* Customer Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCustomer?.name}</DialogTitle>
              <DialogDescription>Customer AR Account Details</DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                {/* AR Amount */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total AR Balance</div>
                  <div className="text-2xl font-bold text-blue-900">
                    ${(selectedCustomer.amount / 1000).toFixed(0)}K
                  </div>
                </div>

                {/* Days Outstanding */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Days Outstanding</div>
                    <div className="text-2xl font-bold text-amber-900">{selectedCustomer.days}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <Badge
                      className={`mt-2 ${
                        selectedCustomer.status === "good"
                          ? "bg-green-100 text-green-800"
                          : selectedCustomer.status === "at-risk"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedCustomer.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Trend */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">AR Trend (30-day)</div>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.trend < 0 ? (
                      <>
                        <ArrowDownRight className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-bold text-green-600">{Math.abs(selectedCustomer.trend)}% Improvement</span>
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-bold text-red-600">{selectedCustomer.trend}% Increase</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-3">Recommended Actions</div>
                  <div className="space-y-2">
                    {selectedCustomer.status === "overdue" && (
                      <>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>Initiate collection follow-up immediately</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span>Consider payment plan negotiation</span>
                        </div>
                      </>
                    )}
                    {selectedCustomer.status === "at-risk" && (
                      <>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>Monitor payment patterns closely</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <span>Consider early payment discount</span>
                        </div>
                      </>
                    )}
                    {selectedCustomer.status === "good" && (
                      <>
                        <div className="flex items-start gap-2 text-sm text-green-700">
                          <span>✓ Account in good standing</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-green-700">
                          <span>✓ Continue regular follow-up</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Button className="flex-1" variant="default">
                    Send Payment Reminder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

export default ARForecastContent;
