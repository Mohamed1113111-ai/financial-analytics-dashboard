import { useLocation } from "@/contexts/LocationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface LocationComparisonData {
  location: string;
  revenue: number;
  profitMargin: number;
  dso: number;
  ccc: number;
  currentRatio: number;
}

interface LocationComparisonProps {
  data: LocationComparisonData[];
  title?: string;
  description?: string;
  metric?: "revenue" | "profitMargin" | "dso" | "ccc" | "currentRatio";
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function LocationComparison({
  data,
  title = "Location Performance Comparison",
  description = "Compare key metrics across selected locations",
  metric = "revenue",
}: LocationComparisonProps) {
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
            No locations selected for comparison
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricLabel = () => {
    switch (metric) {
      case "revenue":
        return "Revenue ($M)";
      case "profitMargin":
        return "Profit Margin (%)";
      case "dso":
        return "DSO (days)";
      case "ccc":
        return "CCC (days)";
      case "currentRatio":
        return "Current Ratio";
      default:
        return "Metric";
    }
  };

  const getMetricColor = () => {
    switch (metric) {
      case "revenue":
        return "#3b82f6";
      case "profitMargin":
        return "#10b981";
      case "dso":
        return "#f59e0b";
      case "ccc":
        return "#ef4444";
      case "currentRatio":
        return "#8b5cf6";
      default:
        return "#3b82f6";
    }
  };

  return (
    <Card className="financial-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151" }}
              formatter={(value: any) => {
                if (metric === "profitMargin" || metric === "dso" || metric === "ccc") {
                  return `${typeof value === "number" ? value.toFixed(1) : value}`;
                }
                return `$${typeof value === "number" ? (value / 1000000).toFixed(1) : value}M`;
              }}
            />
            <Legend />
            <Bar dataKey={metric} fill={getMetricColor()} name={getMetricLabel()} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Summary Table */}
        <div className="mt-8 overflow-x-auto">
          <table className="financial-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Revenue</th>
                <th>Profit Margin</th>
                <th>DSO</th>
                <th>CCC</th>
                <th>Current Ratio</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="font-semibold">{item.location}</td>
                  <td>${(item.revenue / 1000000).toFixed(1)}M</td>
                  <td>{item.profitMargin.toFixed(1)}%</td>
                  <td>{item.dso.toFixed(1)} days</td>
                  <td>{item.ccc.toFixed(1)} days</td>
                  <td>{item.currentRatio.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
