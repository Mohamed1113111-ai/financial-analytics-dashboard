import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Cell,
} from "recharts";
import {
  Zap,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Trash2,
} from "lucide-react";

interface StrategyInput {
  earlyPaymentDiscount: number;
  earlyPaymentDays: number;
  standardPaymentTerms: number;
  collectionIntensity: number;
  badDebtRate: number;
  collectionCostPerInvoice: number;
  currentAging: Record<string, number>;
}

interface SimulationResult {
  strategy: StrategyInput;
  baselineMetrics: any;
  projectedMetrics: any;
  impact: any;
  recommendations: string[];
}

interface CollectionStrategySimulatorProps {
  currentAging: Record<string, number>;
  onStrategyChange?: (strategy: StrategyInput) => void;
}

export function CollectionStrategySimulator({
  currentAging,
  onStrategyChange,
}: CollectionStrategySimulatorProps) {
  const [selectedTab, setSelectedTab] = useState("builder");
  const [strategies, setStrategies] = useState<StrategyInput[]>([
    {
      earlyPaymentDiscount: 2,
      earlyPaymentDays: 10,
      standardPaymentTerms: 30,
      collectionIntensity: 50,
      badDebtRate: 2,
      collectionCostPerInvoice: 50,
      currentAging,
    },
  ]);

  const [currentStrategy, setCurrentStrategy] = useState<StrategyInput>(strategies[0]);
  const [results, setResults] = useState<SimulationResult | null>(null);

  // Simulate strategy (mock implementation)
  const handleSimulate = () => {
    // Mock simulation result
    const mockResult: SimulationResult = {
      strategy: currentStrategy,
      baselineMetrics: {
        totalAR: 3865700,
        dso: 42,
        collectionRate: 75.1,
        aging: currentAging,
      },
      projectedMetrics: {
        totalAR: 3450000,
        dso: 35.2,
        collectionRate: 82.5,
        aging: {
          "0-30": 2100000,
          "31-60": 950000,
          "61-90": 300000,
          "90+": 100000,
        },
        cashFlowImprovement: 415700,
        collectionCosts: 45000,
        netBenefit: 370700,
      },
      impact: {
        dsoDaysReduction: 6.8,
        dsoPercentReduction: 16.2,
        cashFlowImprovement: 415700,
        arReduction: 415700,
        collectionCostIncrease: 45000,
        netCashBenefit: 370700,
        paybackPeriod: 39.5,
      },
      recommendations: [
        "Strong DSO improvement of 6.8 days - strategy is effective",
        "Net cash benefit of $371K - highly recommended",
        "Payback period of 39.5 days is excellent",
      ],
    };

    setResults(mockResult);
    onStrategyChange?.(currentStrategy);
  };

  const handleAddStrategy = () => {
    const newStrategy = { ...currentStrategy };
    setStrategies([...strategies, newStrategy]);
  };

  const handleRemoveStrategy = (index: number) => {
    if (strategies.length > 1) {
      const updated = strategies.filter((_, i) => i !== index);
      setStrategies(updated);
      if (index === strategies.length - 1) {
        setCurrentStrategy(updated[updated.length - 1]);
      }
    }
  };

  const handleStrategyChange = (key: keyof StrategyInput, value: any) => {
    const updated = { ...currentStrategy, [key]: value };
    setCurrentStrategy(updated);
  };

  // Comparison data for multiple strategies
  const comparisonData = strategies.map((strategy, idx) => ({
    name: `Strategy ${idx + 1}`,
    dso: 42 - idx * 2,
    cashFlow: 415700 + idx * 50000,
    cost: 45000 + idx * 10000,
  }));

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        {/* Strategy Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Strategy Parameters</CardTitle>
              <CardDescription>Adjust parameters to model different collection strategies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Early Payment Discount */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Early Payment Discount (%)</label>
                  <span className="text-2xl font-bold text-blue-600">{currentStrategy.earlyPaymentDiscount}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={currentStrategy.earlyPaymentDiscount}
                  onChange={(e) =>
                    handleStrategyChange("earlyPaymentDiscount", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Offer discount for payment within {currentStrategy.earlyPaymentDays} days
                </p>
              </div>

              {/* Early Payment Days */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Early Payment Days</label>
                  <span className="text-2xl font-bold text-blue-600">{currentStrategy.earlyPaymentDays} days</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={currentStrategy.earlyPaymentDays}
                  onChange={(e) =>
                    handleStrategyChange("earlyPaymentDays", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Example: 2/{currentStrategy.earlyPaymentDays} Net {currentStrategy.standardPaymentTerms}
                </p>
              </div>

              {/* Standard Payment Terms */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Standard Payment Terms</label>
                  <span className="text-2xl font-bold text-blue-600">{currentStrategy.standardPaymentTerms} days</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={currentStrategy.standardPaymentTerms}
                  onChange={(e) =>
                    handleStrategyChange("standardPaymentTerms", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">Net {currentStrategy.standardPaymentTerms}</p>
              </div>

              {/* Collection Intensity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Collection Intensity</label>
                  <span className="text-2xl font-bold text-blue-600">{currentStrategy.collectionIntensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={currentStrategy.collectionIntensity}
                  onChange={(e) =>
                    handleStrategyChange("collectionIntensity", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Bad Debt Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Bad Debt Write-off Rate (%)</label>
                  <span className="text-2xl font-bold text-red-600">{currentStrategy.badDebtRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={currentStrategy.badDebtRate}
                  onChange={(e) =>
                    handleStrategyChange("badDebtRate", parseFloat(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Percentage of 90+ day invoices to write off as uncollectible
                </p>
              </div>

              {/* Collection Cost Per Invoice */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Collection Cost Per Invoice</label>
                  <span className="text-2xl font-bold text-green-600">
                    ${currentStrategy.collectionCostPerInvoice}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="25"
                  value={currentStrategy.collectionCostPerInvoice}
                  onChange={(e) =>
                    handleStrategyChange("collectionCostPerInvoice", parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Cost for collection efforts (calls, letters, legal)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSimulate} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Simulate Strategy
                </Button>
                <Button onClick={handleAddStrategy} variant="outline" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Strategy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {results ? (
            <>
              {/* Impact Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                      DSO Reduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {results.impact.dsoDaysReduction} days
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700 dark:text-green-300">
                        {results.impact.dsoPercentReduction}% improvement
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Cash Flow Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      ${(results.impact.cashFlowImprovement / 1000).toFixed(0)}K
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-blue-700 dark:text-blue-300">Immediate benefit</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-900 dark:text-purple-100">
                      Net Cash Benefit
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      ${(results.impact.netCashBenefit / 1000).toFixed(0)}K
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs text-purple-700 dark:text-purple-300">
                        After costs ({results.impact.paybackPeriod} day payback)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Baseline vs Projected */}
              <Card>
                <CardHeader>
                  <CardTitle>Baseline vs Projected Metrics</CardTitle>
                  <CardDescription>Comparison of current state vs projected outcome</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h3 className="font-semibold">Baseline Metrics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total AR</span>
                          <span className="font-medium">
                            ${(results.baselineMetrics.totalAR / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">DSO</span>
                          <span className="font-medium">{results.baselineMetrics.dso} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collection Rate</span>
                          <span className="font-medium">{results.baselineMetrics.collectionRate}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Projected Metrics</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total AR</span>
                          <span className="font-medium">
                            ${(results.projectedMetrics.totalAR / 1000000).toFixed(2)}M
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">DSO</span>
                          <span className="font-medium text-green-600">{results.projectedMetrics.dso} days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Collection Rate</span>
                          <span className="font-medium text-green-600">{results.projectedMetrics.collectionRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Based on strategy simulation results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                          ✓
                        </div>
                        <p className="text-sm text-blue-900 dark:text-blue-100">{rec}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Adjust parameters and click "Simulate Strategy" to see results
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Comparison</CardTitle>
              <CardDescription>Compare DSO, Cash Flow, and Costs across strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" label={{ value: "DSO (days)", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: "Cash Flow ($)", angle: 90, position: "insideRight" }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="dso" fill="#3b82f6" name="DSO (days)" radius={[8, 8, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cashFlow" stroke="#10b981" strokeWidth={2} name="Cash Flow ($)" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strategy List */}
          <Card>
            <CardHeader>
              <CardTitle>Configured Strategies</CardTitle>
              <CardDescription>Manage multiple collection strategies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strategies.map((strategy, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="font-semibold">Strategy {idx + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {strategy.earlyPaymentDiscount}% discount, {strategy.collectionIntensity}% intensity
                      </div>
                    </div>
                    {strategies.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStrategy(idx)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
