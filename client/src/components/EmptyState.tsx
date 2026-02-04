import { AlertCircle, BarChart3, Calendar, Database } from "lucide-react";
import { Button } from "./ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "database" | "chart" | "calendar" | "alert";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = "database",
  action,
  className = "",
}: EmptyStateProps) {
  const iconMap = {
    database: <Database className="h-12 w-12 text-muted-foreground" />,
    chart: <BarChart3 className="h-12 w-12 text-muted-foreground" />,
    calendar: <Calendar className="h-12 w-12 text-muted-foreground" />,
    alert: <AlertCircle className="h-12 w-12 text-muted-foreground" />,
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="mb-4">{iconMap[icon]}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline" size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface EmptyDataTableProps {
  columns: number;
  rows?: number;
}

export function EmptyDataTable({ columns, rows = 5 }: EmptyDataTableProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="h-8 bg-muted rounded flex-1 animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface EmptyChartProps {
  height?: number;
}

export function EmptyChart({ height = 300 }: EmptyChartProps) {
  return (
    <div
      className="flex items-center justify-center bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20"
      style={{ height: `${height}px` }}
    >
      <EmptyState
        title="No Data Available"
        description="Chart data will appear here once data is loaded"
        icon="chart"
      />
    </div>
  );
}
