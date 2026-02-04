import { useLocation } from "@/contexts/LocationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationHeatmapData {
  location: string;
  metric: number; // 0-100 scale
  status: "excellent" | "healthy" | "adequate" | "concerning" | "critical";
  details?: string;
}

interface LocationHeatmapProps {
  data: LocationHeatmapData[];
  title?: string;
  description?: string;
  metricLabel?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700";
    case "healthy":
      return "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700";
    case "adequate":
      return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700";
    case "concerning":
      return "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700";
    case "critical":
      return "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700";
    default:
      return "bg-gray-100 dark:bg-gray-900/30 border-gray-300 dark:border-gray-700";
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "text-green-700 dark:text-green-300";
    case "healthy":
      return "text-blue-700 dark:text-blue-300";
    case "adequate":
      return "text-yellow-700 dark:text-yellow-300";
    case "concerning":
      return "text-orange-700 dark:text-orange-300";
    case "critical":
      return "text-red-700 dark:text-red-300";
    default:
      return "text-gray-700 dark:text-gray-300";
  }
};

export default function LocationHeatmap({
  data,
  title = "Location Risk Heatmap",
  description = "AR aging and collection risk by location",
  metricLabel = "Risk Score",
}: LocationHeatmapProps) {
  const { selectedLocations } = useLocation();

  // Filter data to only show selected locations
  const filteredData = data.filter((item) =>
    selectedLocations.some((locId) => item.location.includes(locId.toString()))
  );

  if (filteredData.length === 0) {
    return (
      <Card className="financial-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No locations selected for heatmap
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="financial-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{item.location}</span>
                <span className={`text-sm font-semibold ${getStatusTextColor(item.status)}`}>
                  {item.metric}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-8 bg-muted rounded-lg overflow-hidden border border-border">
                <div
                  className={`h-full flex items-center justify-center text-xs font-semibold transition-all ${getStatusColor(item.status)}`}
                  style={{ width: `${item.metric}%` }}
                >
                  {item.metric > 20 && <span className={getStatusTextColor(item.status)}>{item.metric}%</span>}
                </div>
              </div>

              {/* Details */}
              {item.details && (
                <p className="text-xs text-muted-foreground">{item.details}</p>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3">Status Legend</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">Excellent (&gt;80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs">Healthy (60-80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">Adequate (40-60)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs">Concerning (20-40)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs">Critical (&lt;20)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
