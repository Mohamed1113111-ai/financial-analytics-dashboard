import React, { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, AlertTriangle, Info, ChevronDown, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "@/contexts/LocationContext";

type AlertSeverity = "critical" | "warning" | "info";
type AlertType = "ar_high_risk" | "ar_credit_limit" | "cash_flow_shortfall" | "margin_deterioration" | "collection_risk";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  locationId: number;
  locationName: string;
  customerId?: number;
  customerName?: string;
  amount?: number;
  riskScore?: number;
  createdAt: Date;
  actionItems: string[];
}

export function Alerts() {
  const locationContext = useLocation();
  const selectedLocationId = locationContext?.selectedLocations[0] || 1;
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | null>(null);
  const [selectedAlertType, setSelectedAlertType] = useState<AlertType | null>(null);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());

  // Fetch alerts - using mock data until router is integrated
  const [alerts] = React.useState<Alert[]>([
    {
      id: "ar-1",
      type: "ar_high_risk",
      severity: "critical",
      title: "High-Risk AR: Acme Corp",
      description: "Acme Corp has $125,000 outstanding 90+ days. Risk Score: 85/100",
      locationId: 1,
      locationName: "New York",
      customerId: 1,
      customerName: "Acme Corp",
      amount: 125000,
      riskScore: 85,
      createdAt: new Date(),
      actionItems: [
        "Contact customer immediately for payment",
        "Review credit terms and consider payment plan",
        "Escalate to collections team",
      ],
    },
    {
      id: "cf-1",
      type: "cash_flow_shortfall",
      severity: "warning",
      title: "Cash Flow Shortfall Alert",
      description: "Projected 30-day cash flow of $350,000 is below minimum threshold of $500,000. Shortfall: $150,000",
      locationId: selectedLocationId || 1,
      locationName: "Company-wide",
      amount: 150000,
      riskScore: 65,
      createdAt: new Date(),
      actionItems: [
        "Accelerate AR collections",
        "Defer non-critical expenses",
        "Arrange short-term financing",
      ],
    },
  ]);
  const isLoading = false;

  // Mock summary data
  const [summary] = React.useState({
    criticalCount: 2,
    warningCount: 3,
    infoCount: 1,
    totalAlerts: 6,
    totalRiskAmount: 450000,
    averageRiskScore: 65,
  });

  // Filter out dismissed alerts
  const visibleAlerts = useMemo(() => {
    if (!alerts) return [];
    return alerts.filter((alert) => !dismissedAlertIds.has(alert.id));
  }, [alerts, dismissedAlertIds]);

  // Get severity icon and color
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadgeColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
    }
  };

  const getAlertTypeLabel = (type: AlertType) => {
    const labels: Record<AlertType, string> = {
      ar_high_risk: "High-Risk AR",
      ar_credit_limit: "Credit Limit",
      cash_flow_shortfall: "Cash Flow",
      margin_deterioration: "Margin",
      collection_risk: "Collection Risk",
    };
    return labels[type];
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlertIds((prev) => new Set(prev).add(alertId));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alerts & Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Real-time monitoring of cash flow shortfalls and high-risk AR accounts
            </p>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{summary?.criticalCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Immediate action required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{summary?.warningCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Monitor closely</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{summary?.infoCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Informational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Risk Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                ${(summary?.totalRiskAmount || 0) / 1000 > 1000 ? ((summary?.totalRiskAmount || 0) / 1000000).toFixed(1) + "M" : ((summary?.totalRiskAmount || 0) / 1000).toFixed(0) + "K"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">At-risk amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Severity: {selectedSeverity ? selectedSeverity.toUpperCase() : "All"} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedSeverity(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSeverity("critical")}>Critical</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSeverity("warning")}>Warning</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedSeverity("info")}>Info</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Type: {selectedAlertType ? getAlertTypeLabel(selectedAlertType) : "All"} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedAlertType(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedAlertType("ar_high_risk")}>High-Risk AR</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedAlertType("ar_credit_limit")}>Credit Limit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedAlertType("cash_flow_shortfall")}>Cash Flow</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedAlertType("margin_deterioration")}>Margin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedAlertType("collection_risk")}>Collection Risk</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {visibleAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No alerts found. Your financial metrics are looking good!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            visibleAlerts.map((alert: Alert) => (
              <Card key={alert.id} className="border-l-4" style={{
                borderLeftColor: alert.severity === "critical" ? "#ef4444" : alert.severity === "warning" ? "#eab308" : "#3b82f6",
              }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getSeverityIcon(alert.severity as AlertSeverity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge className={getSeverityBadgeColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{getAlertTypeLabel(alert.type)}</Badge>
                          {alert.riskScore !== undefined && (
                            <Badge variant="secondary">Risk: {alert.riskScore}/100</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>

                        {/* Action Items */}
                        {expandedAlertId === alert.id && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-semibold mb-2">Recommended Actions:</p>
                            <ul className="space-y-1">
                              {alert.actionItems.map((item: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-bold">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)
                            }
                          >
                            {expandedAlertId === alert.id ? "Hide" : "Show"} Actions
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Alert Details Info */}
        {visibleAlerts.length > 0 && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Alert Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Total Alerts:</strong> {visibleAlerts.length}
              </p>
              <p>
                <strong>Locations Affected:</strong> {new Set(visibleAlerts.map((a: Alert) => a.locationName)).size}
              </p>
              <p>
                <strong>Total Risk Amount:</strong> $
                {(visibleAlerts.reduce((sum: number, a: Alert) => sum + (a.amount || 0), 0) / 1000).toFixed(0)}K
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Alerts;
