import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
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
import { useState, useMemo } from "react";
import { ExportButtons } from "@/components/ExportButtons";
import { trpc } from "@/lib/trpc";
import { useLocationFilterParams } from "@/hooks/useLocationFilter";
import { useDateRange } from "@/contexts/DateRangeContext";
import { Loader2 } from "lucide-react";

export default function PLAnalysis() {
  const [selectedTab, setSelectedTab] = useState("statement");
  const { locationIds } = useLocationFilterParams();
  const { dateRange } = useDateRange();
  const selectedLocationId = locationIds[0] || 1; // Use first selected location or default to 1

  // Fetch P&L statement data
  const { data: plData, isLoading, error } = trpc.pl.calculateStatement.useQuery(
    {
      locationId: selectedLocationId,
      periodId: 1,
      revenue: 1000000,
      cogs: 400000,
      operatingExpenses: 200000,
      depreciation: 50000,
      interestExpense: 30000,
      taxRate: 25,
    },
    {
      enabled: !!selectedLocationId,
    }
  );

  // Fetch budget variance data
  const { data: varianceData } = trpc.pl.analyzeBudgetVariance.useQuery(
    {
      actual: {
        revenue: 1000000,
        cogs: 400000,
        operatingExpenses: 200000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
        locationId: selectedLocationId,
      },
      budget: {
        revenue: 950000,
        cogs: 420000,
        operatingExpenses: 210000,
        depreciation: 50000,
        interestExpense: 30000,
        taxRate: 25,
      },
      locationId: selectedLocationId,
    },
    {
      enabled: !!selectedLocationId,
    }
  );

  // Fetch trend analysis data
  const { data: trendData } = trpc.pl.getTrendAnalysis.useQuery(
    {
      periods: [
        {
          name: "Jan",
          revenue: 850000,
          cogs: 340000,
          operatingExpenses: 170000,
          depreciation: 50000,
          interestExpense: 30000,
          taxRate: 25,
        },
        {
          name: "Feb",
          revenue: 920000,
          cogs: 368000,
          operatingExpenses: 184000,
          depreciation: 50000,
          interestExpense: 30000,
          taxRate: 25,
        },
        {
          name: "Mar",
          revenue: 1000000,
          cogs: 400000,
          operatingExpenses: 200000,
          depreciation: 50000,
          interestExpense: 30000,
          taxRate: 25,
        },
      ],
      locationId: selectedLocationId,
    },
    {
      enabled: !!selectedLocationId,
    }
  );

  // Process margin trend data
  const marginTrendData = useMemo(() => {
    if (!trendData || !trendData.trends || !Array.isArray(trendData.trends)) {
      return [
        { month: "Jan", grossMargin: 58, ebitdaMargin: 38, netMargin: 22 },
        { month: "Feb", grossMargin: 59, ebitdaMargin: 39, netMargin: 23 },
        { month: "Mar", grossMargin: 60, ebitdaMargin: 40, netMargin: 24 },
      ];
    }
    return trendData.trends.map((period: any) => ({
      month: period.period,
      grossMargin: period.grossMargin,
      ebitdaMargin: period.ebitdaMargin,
      netMargin: period.netMargin,
    }));
  }, [trendData]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !plData) {
    return (
      <DashboardLayout>
        <EmptyState
          title="Unable to Load P&L Data"
          description="There was an error loading P&L data. Please try again."
        />
      </DashboardLayout>
    );
  }

  const revenue = plData.revenue || 1000000;
  const grossMargin = plData.grossMargin || 60;
  const netProfit = plData.netProfit || 240000;
  const netMargin = plData.netMargin || 24;

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
              <div className="text-3xl font-bold">${(revenue / 1000000).toFixed(1)}M</div>
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
              <div className="text-3xl font-bold">{grossMargin.toFixed(1)}%</div>
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
              <div className="text-3xl font-bold">${(netProfit / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">↑ 26.3%</span> vs budget
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Export Buttons */}
        <ExportButtons title="P&L Statement" filename="pl-statement" />

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
                <CardTitle>Income Statement - Current Period</CardTitle>
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
                      <tr>
                        <td className="font-semibold">Revenue</td>
                        <td className="financial-value">${(revenue / 1000).toFixed(0)}K</td>
                        <td>100.0%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Cost of Goods Sold</td>
                        <td className="financial-value negative">-${(plData.cogs / 1000).toFixed(0)}K</td>
                        <td>{((plData.cogs / revenue) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t">
                        <td className="font-semibold">Gross Profit</td>
                        <td className="financial-value positive font-semibold">${(plData.grossProfit / 1000).toFixed(0)}K</td>
                        <td className="font-semibold">{grossMargin.toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Operating Expenses</td>
                        <td className="financial-value negative">-${(plData.operatingExpenses / 1000).toFixed(0)}K</td>
                        <td>{((plData.operatingExpenses / revenue) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">EBITDA</td>
                        <td className="financial-value positive font-semibold">${(plData.ebitda / 1000).toFixed(0)}K</td>
                        <td className="font-semibold">{plData.ebitdaMargin.toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Depreciation & Amortization</td>
                        <td className="financial-value negative">-${(plData.depreciation / 1000).toFixed(0)}K</td>
                        <td>{((plData.depreciation / revenue) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t">
                        <td className="font-semibold">EBIT</td>
                        <td className="financial-value positive font-semibold">${(plData.ebit / 1000).toFixed(0)}K</td>
                        <td className="font-semibold">{plData.ebitMargin.toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Interest Expense</td>
                        <td className="financial-value negative">-${(plData.interestExpense / 1000).toFixed(0)}K</td>
                        <td>{((plData.interestExpense / revenue) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="font-semibold">EBT</td>
                        <td className="financial-value positive font-semibold">${(plData.ebt / 1000).toFixed(0)}K</td>
                        <td className="font-semibold">{((plData.ebt / revenue) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr>
                        <td className="pl-8">Taxes</td>
                        <td className="financial-value negative">-${(plData.taxes / 1000).toFixed(0)}K</td>
                        <td>{((plData.taxes / revenue) * 100).toFixed(1)}%</td>
                      </tr>
                      <tr className="border-t-2">
                        <td className="font-bold">Net Profit</td>
                        <td className="financial-value positive font-bold">${(netProfit / 1000).toFixed(0)}K</td>
                        <td className="font-bold">{netMargin.toFixed(1)}%</td>
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
                <CardTitle>Budget vs Actual Variance</CardTitle>
                <CardDescription>Detailed variance analysis with favorable/unfavorable indicators</CardDescription>
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
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-semibold">Revenue</td>
                        <td>${(revenue / 1000).toFixed(0)}K</td>
                        <td>$950K</td>
                        <td className="financial-value positive">+$50K</td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" /> Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold">COGS</td>
                        <td>${(plData.cogs / 1000).toFixed(0)}K</td>
                        <td>$420K</td>
                        <td className="financial-value positive">+$20K</td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" /> Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Gross Profit</td>
                        <td>${(plData.grossProfit / 1000).toFixed(0)}K</td>
                        <td>$530K</td>
                        <td className="financial-value positive">+$70K</td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" /> Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Operating Expenses</td>
                        <td>${(plData.operatingExpenses / 1000).toFixed(0)}K</td>
                        <td>$210K</td>
                        <td className="financial-value positive">+$10K</td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" /> Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold">EBITDA</td>
                        <td>${(plData.ebitda / 1000).toFixed(0)}K</td>
                        <td>$320K</td>
                        <td className="financial-value positive">+$80K</td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" /> Favorable
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold">Net Profit</td>
                        <td>${(netProfit / 1000).toFixed(0)}K</td>
                        <td>$190K</td>
                        <td className="financial-value positive">+$50K</td>
                        <td>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" /> Favorable
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Period Comparison */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>3-Month Trend Analysis</CardTitle>
                <CardDescription>Revenue, COGS, OpEx, EBITDA, and Net Profit trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={trendData?.trends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `$${(typeof value === 'number' ? value / 1000 : 0).toFixed(0)}K`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
                    <Bar dataKey="operatingExpenses" fill="#f59e0b" name="OpEx" />
                    <Line type="monotone" dataKey="netProfit" stroke="#10b981" name="Net Profit" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Margin Trends */}
          <TabsContent value="trends" className="space-y-6">
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Margin Trends</CardTitle>
                <CardDescription>Gross Margin, EBITDA Margin, and Net Margin progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={marginTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any) => `${typeof value === 'number' ? value.toFixed(1) : 0}%`}
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="grossMargin" stroke="#3b82f6" name="Gross Margin" strokeWidth={2} />
                    <Line type="monotone" dataKey="ebitdaMargin" stroke="#10b981" name="EBITDA Margin" strokeWidth={2} />
                    <Line type="monotone" dataKey="netMargin" stroke="#f59e0b" name="Net Margin" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
