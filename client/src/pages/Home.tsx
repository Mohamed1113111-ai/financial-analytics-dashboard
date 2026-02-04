import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, TrendingUp, DollarSign, CreditCard, PieChart, Zap } from "lucide-react";
import { Link } from "wouter";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  href: string;
}

function MetricCard({ title, value, change, icon, href }: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Link href={href}>
      <a className="block">
        <Card className="financial-card cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="rounded-lg bg-accent/10 p-2 text-accent">{icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <div className={`flex items-center gap-1 text-sm font-medium mt-2 ${
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}>
              {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              {Math.abs(change)}% from last period
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="section-title">Financial Dashboard</h1>
          <p className="section-subtitle mt-2">
            Real-time visibility into cash flow, profitability, and working capital across all locations
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid-responsive">
          <MetricCard
            title="Total AR Outstanding"
            value="$2.45M"
            change={8.2}
            icon={<CreditCard className="h-5 w-5" />}
            href="/ar-forecast"
          />
          <MetricCard
            title="Monthly Cash Flow"
            value="$890K"
            change={12.5}
            icon={<DollarSign className="h-5 w-5" />}
            href="/cash-flow"
          />
          <MetricCard
            title="Gross Margin"
            value="42.3%"
            change={-2.1}
            icon={<PieChart className="h-5 w-5" />}
            href="/pl-analysis"
          />
          <MetricCard
            title="Cash Conversion Cycle"
            value="45 days"
            change={-5.3}
            icon={<Zap className="h-5 w-5" />}
            href="/working-capital"
          />
        </div>

        {/* Quick Access Sections */}
        <div className="grid-2col">
          {/* AR Collections Status */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                AR Collections Forecast
              </CardTitle>
              <CardDescription>
                Next 30 days collection forecast by aging bucket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">0-30 days</span>
                  <span className="font-semibold">$1.2M (92%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">31-60 days</span>
                  <span className="font-semibold">$680K (78%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">61-90 days</span>
                  <span className="font-semibold">$420K (62%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: "62%" }}></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">90+ days</span>
                  <span className="font-semibold">$150K (35%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>
              </div>
              <Link href="/ar-forecast">
                <a className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                  View detailed forecast →
                </a>
              </Link>
            </CardContent>
          </Card>

          {/* Cash Flow Summary */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-accent" />
                Cash Flow Summary
              </CardTitle>
              <CardDescription>
                Current month operating and investing activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm font-medium">Operating Cash Flow</span>
                  <span className="financial-value positive">+$750K</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm font-medium">Investing Activities</span>
                  <span className="financial-value negative">-$200K</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm font-medium">Financing Activities</span>
                  <span className="financial-value">-$50K</span>
                </div>
                <div className="flex items-center justify-between pt-2 font-bold">
                  <span>Net Cash Flow</span>
                  <span className="financial-value positive">+$500K</span>
                </div>
              </div>
              <Link href="/cash-flow">
                <a className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                  View full statement →
                </a>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Location Performance */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
            <CardDescription>
              Profitability and efficiency metrics by business unit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="financial-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Revenue</th>
                    <th>Gross Margin</th>
                    <th>DSO</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">New York</td>
                    <td className="financial-value">$1.2M</td>
                    <td className="financial-value">44.2%</td>
                    <td className="financial-value">38 days</td>
                    <td>
                      <span className="status-badge favorable">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium">Los Angeles</td>
                    <td className="financial-value">$980K</td>
                    <td className="financial-value">41.8%</td>
                    <td className="financial-value">42 days</td>
                    <td>
                      <span className="status-badge favorable">Good</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium">Chicago</td>
                    <td className="financial-value">$750K</td>
                    <td className="financial-value">39.5%</td>
                    <td className="financial-value">48 days</td>
                    <td>
                      <span className="status-badge unfavorable">Needs Attention</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium">Boston</td>
                    <td className="financial-value">$520K</td>
                    <td className="financial-value">43.1%</td>
                    <td className="financial-value">35 days</td>
                    <td>
                      <span className="status-badge favorable">Excellent</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Link href="/pl-analysis">
              <a className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                View detailed P&L analysis →
              </a>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid-3col">
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1.85</div>
              <p className="text-xs text-muted-foreground mt-1">Healthy liquidity position</p>
            </CardContent>
          </Card>
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Quick Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1.42</div>
              <p className="text-xs text-muted-foreground mt-1">Strong short-term solvency</p>
            </CardContent>
          </Card>
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">18.5%</div>
              <p className="text-xs text-muted-foreground mt-1">Profitability on track</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
