import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import CashFlow from "./pages/CashFlow";
import PLAnalysis from "./pages/PLAnalysis";
import WorkingCapital from "./pages/WorkingCapital";
import ARForecast from "./pages/ARForecast";
import ManageCustomers from "./pages/ManageCustomers";
import ManageLocations from "./pages/ManageLocations";
import ManageARRecords from "./pages/ManageARRecords";
import ManageBudgets from "./pages/ManageBudgets";
import Alerts from "./pages/Alerts";
import Locations from "./pages/Locations";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path={"\\"} component={Home} />
        <Route path={"/alerts"} component={Alerts} />
        <Route path={"/ar-forecast"} component={ARForecast} />
        <Route path={"/cash-flow"} component={CashFlow} />
        <Route path={"/pl-analysis"} component={PLAnalysis} />
        <Route path={"/working-capital"} component={WorkingCapital} />
        <Route path={"/manage-customers"} component={ManageCustomers} />
        <Route path={"/manage-locations"} component={ManageLocations} />
        <Route path={"/manage-ar-records"} component={ManageARRecords} />
        <Route path={"/manage-budgets"} component={ManageBudgets} />
        <Route path={"locations"} component={Locations} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
