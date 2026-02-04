import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertCircle, TrendingUp, Users, Calendar } from "lucide-react";
import { useLocationFilterDisplay } from "@/hooks/useLocationFilter";
import DashboardLayout from "@/components/DashboardLayout";
import { EmptyState, EmptyChart } from "@/components/EmptyState";

// Mock data for AR aging
const arAgingData = [
  { bucket: "0-30", amount: 450000, customers: 12, percentage: 35 },
  { bucket: "31-60", amount: 280000, customers: 8, percentage: 22 },
  { bucket: "61-90", amount: 220000, customers: 6, percentage: 17 },
  { bucket: "90+", amount: 350000, customers: 5, percentage: 26 },
];

const forecastData = [
  { month: "Jan", forecast: 450000, actual: 420000, collected: 380000 },
  { month: "Feb", forecast: 480000, actual: 510000, collected: 450000 },
  { month: "Mar", forecast: 520000, actual: 490000, collected: 440000 },
  { month: "Apr", forecast: 550000, actual: null, collected: null },
  { month: "May", forecast: 580000, actual: null, collected: null },
  { month: "Jun", forecast: 610000, actual: null, collected: null },
];

const collectionRateData = [
  { name: "0-30 Days", value: 92, fill: "#10b981" },
  { name: "31-60 Days", value: 78, fill: "#3b82f6" },
  { name: "61-90 Days", value: 45, fill: "#f59e0b" },
  { name: "90+ Days", value: 15, fill: "#ef4444" },
];

const customerData = [
  { name: "Acme Corp", amount: 125000, days: 45, status: "at-risk" },
  { name: "Tech Solutions", amount: 95000, days: 38, status: "good" },
  { name: "Global Retail", amount: 180000, days: 52, status: "at-risk" },
  { name: "Manufacturing Co", amount: 110000, days: 28, status: "good" },
  { name: "Healthcare Group", amount: 140000, days: 65, status: "overdue" },
];

function ARForecastContent() {
  const { selectedCount } = useLocationFilterDisplay();
  const [selectedTab, setSelectedTab] = useState("aging");
  const [hasData] = useState(true);

  const totalAR = arAgingData.reduce((sum, item) => sum + item.amount, 0);
  const overdue90Plus = arAgingData.find((item) => item.bucket === "90+")?.amount || 0;
  const avgDSO = 42; // Days Sales Outstanding

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AR Collections Forecast</h1>
          <p className="text-muted-foreground mt-2">Analyze aging buckets, collection probability, and cash flow impact</p>
        </div>
        <EmptyState
          title="No AR Data Available"
          description="There is no accounts receivable data available for the selected location(s). Please check your data source or select different filters."
          icon="database"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AR Collections Forecast</h1>
          <p className="text-muted-foreground mt-2">
            Analyze aging buckets, collection probability, and cash flow impact across {selectedCount} location(s)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total AR Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalAR / 1000000).toFixed(2)}M</div>
            <p className="text-xs text-muted-foreground mt-1">↑ 5.2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">90+ Days Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${(overdue90Plus / 1000).toFixed(0)}K</div>
            <Badge className="mt-2 bg-red-100 text-red-800">High Risk</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Sales Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDSO} days</div>
            <p className="text-xs text-muted-foreground mt-1">↓ 2 days improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collection Rate (0-30)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <p className="text-xs text-muted-foreground mt-1">On track</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
          <TabsTrigger value="forecast">Collections Forecast</TabsTrigger>
          <TabsTrigger value="rates">Collection Rates</TabsTrigger>
          <TabsTrigger value="customers">Top Customers</TabsTrigger>
        </TabsList>

        {/* Aging Analysis Tab */}
        <TabsContent value="aging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AR Aging Analysis</CardTitle>
              <CardDescription>Distribution of outstanding receivables by aging bucket</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arAgingData.map((item) => (
                  <div key={item.bucket} className="flex items-center gap-4">
                    <div className="w-24">
                      <span className="font-medium">{item.bucket} days</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${
                              item.bucket === "0-30"
                                ? "bg-green-500"
                                : item.bucket === "31-60"
                                  ? "bg-blue-500"
                                  : item.bucket === "61-90"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12">{item.percentage}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${(item.amount / 1000).toFixed(0)}K</span>
                        <span>{item.customers} customers</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aging Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Aging Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Bucket</th>
                      <th className="text-right py-2 px-2">Amount</th>
                      <th className="text-right py-2 px-2">% of Total</th>
                      <th className="text-right py-2 px-2">Customers</th>
                      <th className="text-right py-2 px-2">Avg Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {arAgingData.map((item) => (
                      <tr key={item.bucket} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 font-medium">{item.bucket} days</td>
                        <td className="text-right py-2 px-2">${(item.amount / 1000).toFixed(0)}K</td>
                        <td className="text-right py-2 px-2">{item.percentage}%</td>
                        <td className="text-right py-2 px-2">{item.customers}</td>
                        <td className="text-right py-2 px-2">
                          {item.bucket === "0-30"
                            ? "15"
                            : item.bucket === "31-60"
                              ? "45"
                              : item.bucket === "61-90"
                                ? "75"
                                : "120"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Forecast Tab */}
        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>6-Month Collections Forecast</CardTitle>
              <CardDescription>Projected vs actual collections with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => (value ? `$${(Number(value) / 1000).toFixed(0)}K` : "N/A")} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Forecast"
                    dot={{ fill: "#3b82f6" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Actual"
                    dot={{ fill: "#10b981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Collected"
                    dot={{ fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Details */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Assumptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm">Base Collection Rate (0-30 days)</span>
                <span className="font-medium">92%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm">Secondary Collection Rate (31-60 days)</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm">Tertiary Collection Rate (61-90 days)</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted rounded">
                <span className="text-sm">Write-off Rate (90+ days)</span>
                <span className="font-medium">15%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collection Rates Tab */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Rates by Aging Bucket</CardTitle>
              <CardDescription>Probability of collection within 30 days</CardDescription>
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

          {/* Collection Rate Details */}
          <Card>
            <CardHeader>
              <CardTitle>Collection Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {collectionRateData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${item.value}%` }} />
                      </div>
                      <span className="font-bold w-12 text-right">{item.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by AR Balance</CardTitle>
              <CardDescription>Risk assessment and collection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {customerData.map((customer) => (
                  <div key={customer.name} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{customer.name}</span>
                        <Badge
                          className={
                            customer.status === "good"
                              ? "bg-green-100 text-green-800"
                              : customer.status === "at-risk"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {customer.status === "good" ? "Good" : customer.status === "at-risk" ? "At Risk" : "Overdue"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{customer.days} days outstanding</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${(customer.amount / 1000).toFixed(0)}K</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Alert */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="h-5 w-5" />
                Collections at Risk
              </CardTitle>
            </CardHeader>
            <CardContent className="text-red-800">
              <p className="text-sm">
                2 customers have invoices overdue beyond 60 days totaling $320K. Recommend immediate follow-up and potential escalation to collections.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ARForecast() {
  return (
    <DashboardLayout>
      <ARForecastContent />
    </DashboardLayout>
  );
}
