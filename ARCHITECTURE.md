# Financial Analytics Platform - System Architecture

## System Overview

The Financial Analytics Platform is a multi-tenant, multi-location financial management system designed for enterprise-level visibility into cash flow, profitability, and working capital efficiency. The system provides integrated forecasting, analysis, and reporting capabilities across all business units.

## Core Entities & Relationships

### Master Data
- **Locations**: Business units with independent P&L, cash flow, and working capital tracking
- **Customers**: AR aging and collection behavior analysis by customer
- **Vendors**: AP payment patterns and terms
- **Accounts**: Chart of accounts for revenue, expenses, and balance sheet items
- **Time Dimension**: Monthly periods for historical and forecast data

### Financial Data
- **Transactions**: Individual journal entries (AR, AP, payroll, CapEx)
- **AR Aging**: Customer-level receivables with aging buckets
- **AP Aging**: Vendor-level payables with payment terms
- **Inventory**: Stock levels and valuation (if applicable)
- **Budget**: Period budgets by location and account for variance analysis

### Calculated Metrics
- **Collections Forecast**: Monthly cash inflow projections based on AR aging
- **Cash Flow Statement**: Operating, investing, financing activities
- **P&L Statement**: Revenue, COGS, expenses, margins by location
- **Working Capital Metrics**: DSO, DPO, DIO, CCC, current ratio, quick ratio

## Database Schema Design

### Core Tables
```
locations (id, name, region, status, created_at)
customers (id, location_id, name, credit_limit, payment_terms)
vendors (id, location_id, name, payment_terms)
accounts (id, account_code, name, type, category)
time_periods (id, period_date, month, year, quarter)

-- AR & Collections
ar_aging (id, location_id, customer_id, period_id, amount_0_30, amount_31_60, amount_61_90, amount_90_plus)
collection_history (id, customer_id, period_id, amount_collected, collection_rate)
collection_assumptions (id, location_id, aging_bucket, collection_rate, days_to_collect)

-- AP & Payables
ap_aging (id, location_id, vendor_id, period_id, amount_due, due_date)
ap_payment_history (id, vendor_id, period_id, amount_paid)

-- Transactions
transactions (id, location_id, account_id, period_id, amount, type, description)
inventory (id, location_id, period_id, quantity, value)

-- Budget & Forecast
budget (id, location_id, account_id, period_id, budgeted_amount)
forecast_assumptions (id, location_id, key, value, scenario)

-- Reports
financial_reports (id, location_id, report_type, period_id, data_json, created_at)
```

## Financial Calculation Engines

### AR Collections Forecast
**Input**: AR aging by location, customer, and bucket; historical collection rates; payment delay assumptions
**Process**:
1. Segment AR by aging bucket (0-30, 31-60, 61-90, 90+)
2. Apply location-specific collection rates per bucket
3. Calculate expected collection date for each bucket
4. Model scenarios (base, optimistic, conservative) with adjusted rates
5. Aggregate by period for monthly forecast

**Output**: Monthly collections forecast, collection effectiveness %, DSO by location

### Cash Flow Statement
**Input**: AR collections forecast, AP payment schedule, payroll, CapEx, financing activities
**Process**:
1. **Operating Activities**: Collections - Payments - Payroll + Changes in WC
2. **Investing Activities**: CapEx, asset sales, investments
3. **Financing Activities**: Debt proceeds, debt repayment, equity
4. **Reconciliation**: Opening cash + Net cash flow = Closing cash

**Output**: Monthly cash flow statement by location and consolidated

### P&L Statement
**Input**: Revenue transactions, COGS, operating expenses, non-operating items
**Process**:
1. Aggregate revenue by location
2. Calculate COGS and gross margin
3. Allocate operating expenses using drivers (headcount, revenue, area)
4. Calculate EBITDA and net profit
5. Compare actual vs budget and YoY trends

**Output**: P&L by location, margin analysis, variance analysis

### Working Capital Analysis
**Input**: AR, AP, inventory data by period
**Process**:
1. **DSO** = (AR / Revenue) × Days in period
2. **DPO** = (AP / COGS) × Days in period
3. **DIO** = (Inventory / COGS) × Days in period
4. **CCC** = DSO + DIO - DPO
5. **Current Ratio** = Current Assets / Current Liabilities
6. **Quick Ratio** = (Current Assets - Inventory) / Current Liabilities

**Output**: KPI scorecards, trend analysis, cash impact quantification

## Frontend Architecture

### Page Structure
- **Dashboard Home**: Executive summary with key metrics, alerts, and quick links
- **AR Forecasting**: Aging analysis, collection forecast, risk heatmap, scenario modeling
- **Cash Flow**: Statement view, waterfall analysis, liquidity indicators, stress testing
- **P&L Analysis**: Statement view, location comparison, margin analysis, variance analysis
- **Working Capital**: KPI dashboard, trend charts, improvement scenarios
- **Reports**: Report generation, export, historical archive

### Data Flow
1. User selects location, period, and scenario filters
2. Frontend calls tRPC procedure with filter parameters
3. Backend queries database and executes calculation engine
4. Results cached for 5 minutes to optimize performance
5. Frontend renders interactive charts and tables
6. User can drill-down, compare, or export data

### Visualization Components
- Line charts for trends (Recharts)
- Bar charts for comparisons
- Heatmaps for AR risk analysis
- Waterfall charts for cash flow
- KPI cards for metrics
- Data tables for detailed views

## API Contract (tRPC Procedures)

### AR Module
- `ar.getAging(locationId, periodId)` - AR aging by bucket
- `ar.getForecast(locationId, scenario, months)` - Collections forecast
- `ar.getHeatmap(periodId)` - Risk heatmap by location/customer
- `ar.getDelinquent(locationId, limit)` - Top delinquent customers

### Cash Flow Module
- `cashflow.getStatement(locationId, periodId)` - Cash flow statement
- `cashflow.getWaterfall(locationId, periodId)` - Waterfall analysis
- `cashflow.getLiquidity(locationId, months)` - Liquidity forecast
- `cashflow.getScenario(locationId, scenario)` - Scenario analysis

### P&L Module
- `pl.getStatement(locationId, periodId)` - P&L statement
- `pl.getComparison(periodIds)` - Location comparison
- `pl.getVariance(locationId, periodId)` - Variance analysis
- `pl.getTrend(locationId, months)` - Trend analysis

### Working Capital Module
- `wc.getMetrics(locationId, periodId)` - WC metrics
- `wc.getTrend(locationId, months)` - Trend analysis
- `wc.getImprovement(locationId)` - Improvement scenarios

### Export Module
- `export.getPDF(reportType, locationId, periodId)` - PDF export
- `export.getExcel(reportType, locationId, periodId)` - Excel export

## Performance Considerations

1. **Caching**: Cache calculation results for 5 minutes
2. **Indexing**: Index on (location_id, period_id) for fast queries
3. **Aggregation**: Pre-calculate monthly aggregates to avoid real-time computation
4. **Pagination**: Limit result sets for large datasets
5. **Lazy Loading**: Load charts and tables on demand

## Security & Governance

1. **Role-Based Access**: Admin can see all locations; users see assigned locations
2. **Audit Trail**: Log all data changes and report exports
3. **Data Validation**: Validate all inputs and calculations
4. **Assumption Tracking**: Version all assumptions and override history
5. **Reconciliation**: Automated reconciliation checks between modules

## Deployment Architecture

- **Frontend**: React 19 + Vite (client-side rendering)
- **Backend**: Express 4 + tRPC 11 (server-side logic)
- **Database**: MySQL (data persistence)
- **Storage**: S3 (report exports)
- **Auth**: Manus OAuth (user authentication)

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, Recharts, shadcn/ui
- **Backend**: Express 4, tRPC 11, Drizzle ORM
- **Database**: MySQL 8
- **Testing**: Vitest
- **Export**: jsPDF, ExcelJS
- **Charts**: Recharts
