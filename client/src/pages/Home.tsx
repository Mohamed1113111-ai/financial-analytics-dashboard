import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, DollarSign, Zap, PieChart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "@/contexts/LocationContext";
import { useLocation as useNavigate } from "wouter";

/**
 * Financial Dashboard - Main landing page with KPI metrics
 */
function QuickLinksSection() {
  const [, navigate] = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">AR Forecast</CardTitle>
          <CardDescription>View collection forecasts and aging analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => navigate("/ar-forecast")}>
            View Details
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Cash Flow</CardTitle>
          <CardDescription>Analyze cash flow statements and scenarios</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => navigate("/cash-flow")}>
            View Details
          </Button>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-lg">P&L Analysis</CardTitle>
          <CardDescription>Review profitability and variance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={() => navigate("/pl-analysis")}>
            View Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { selectedLocations } = useLocation();

  // Fetch dashboard metrics from database
  const { data: metrics, isLoading, error } = trpc.dashboard.metrics.useQuery(
    {
      locationIds: selectedLocations.length > 0 ? selectedLocations : undefined,
    },
    {
      enabled: !!user,
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  // Format currency for display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading dashboard</p>
          <p className="text-sm text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Real-time visibility into cash flow, profitability, and working capital across all locations
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total AR Outstanding */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total AR Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics?.totalAROutstanding || 0)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {metrics && metrics.arChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics && metrics.arChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics?.arChange || 0}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Cash Flow */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Monthly Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics?.monthlyCashFlow || 0)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {metrics && metrics.cashFlowChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics && metrics.cashFlowChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics?.cashFlowChange || 0}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Gross Margin */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPercent(metrics?.grossMargin || 0)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {metrics && metrics.marginChange <= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics && metrics.marginChange <= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics?.marginChange || 0}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Working Capital */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Working Capital
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(metrics?.workingCapital || 0)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {metrics && metrics.wcChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metrics && metrics.wcChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics?.wcChange || 0}% from last period
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AR Aging Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>AR Aging Analysis</CardTitle>
          <CardDescription>Distribution of accounts receivable by aging bucket</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {metrics?.arAging && Object.entries(metrics.arAging).map(([bucket, amount]) => (
              <div key={bucket} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground mb-2">{bucket} Days</div>
                <div className="text-xl font-bold text-foreground">{formatCurrency(amount as number)}</div>
                <div className="text-xs text-muted-foreground mt-2">
                  {metrics.totalAROutstanding > 0
                    ? `${(((amount as number) / metrics.totalAROutstanding) * 100).toFixed(1)}%`
                    : "0%"}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Locations by AR */}
      {metrics?.topLocations && metrics.topLocations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Locations by AR Outstanding</CardTitle>
            <CardDescription>Locations with highest accounts receivable balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topLocations.map((location: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Location {location.locationId}</div>
                    <div className="text-sm text-muted-foreground">{location.daysOverdue} days average</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{formatCurrency(location.arAmount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <QuickLinksSection />
    </div>
  );
}
