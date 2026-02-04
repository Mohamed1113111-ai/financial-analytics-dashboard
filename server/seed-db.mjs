import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

async function seed() {
  console.log("🌱 Starting database seed...");

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // 1. Clear existing data
    console.log("🗑️  Clearing existing data...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "workingCapitalMetrics",
      "plStatement",
      "cashFlowStatement",
      "arForecast",
      "forecastAssumptions",
      "budget",
      "inventory",
      "transactions",
      "apAging",
      "collectionAssumptions",
      "collectionHistory",
      "arAging",
      "timePeriods",
      "accounts",
      "vendors",
      "customers",
      "locations",
      "users",
    ];

    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
        console.log(`  ✓ Cleared ${table}`);
      } catch (e) {
        // Table might not exist yet
      }
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // 2. Insert locations
    console.log("📍 Seeding locations...");
    const locationData = [
      { name: "New York", code: "NY", region: "Northeast" },
      { name: "Los Angeles", code: "LA", region: "West" },
      { name: "Chicago", code: "CHI", region: "Midwest" },
      { name: "Houston", code: "HOU", region: "South" },
      { name: "Miami", code: "MIA", region: "Southeast" },
      { name: "Seattle", code: "SEA", region: "Northwest" },
    ];

    const insertedLocations = [];
    for (const loc of locationData) {
      const result = await connection.query(
        "INSERT INTO locations (name, code, region, status) VALUES (?, ?, ?, ?)",
        [loc.name, loc.code, loc.region, "active"]
      );
      insertedLocations.push({ id: result[0].insertId, ...loc });
    }
    console.log(`✅ Inserted ${insertedLocations.length} locations`);

    // 3. Insert customers
    console.log("👥 Seeding customers...");
    const customerData = [
      { name: "Acme Corp", code: "ACME", locationId: insertedLocations[0].id },
      { name: "Tech Solutions Inc", code: "TECH", locationId: insertedLocations[0].id },
      { name: "Global Retail Ltd", code: "GLOB", locationId: insertedLocations[1].id },
      { name: "Manufacturing Co", code: "MFG", locationId: insertedLocations[1].id },
      { name: "Healthcare Group", code: "HEALTH", locationId: insertedLocations[2].id },
      { name: "Finance Partners", code: "FIN", locationId: insertedLocations[2].id },
      { name: "Energy Systems", code: "ENERGY", locationId: insertedLocations[3].id },
      { name: "Construction Plus", code: "CONST", locationId: insertedLocations[3].id },
      { name: "Logistics Hub", code: "LOG", locationId: insertedLocations[4].id },
      { name: "Distribution Center", code: "DIST", locationId: insertedLocations[5].id },
    ];

    const insertedCustomers = [];
    for (const cust of customerData) {
      const result = await connection.query(
        "INSERT INTO customers (name, code, locationId) VALUES (?, ?, ?)",
        [cust.name, cust.code, cust.locationId]
      );
      insertedCustomers.push({ id: result[0].insertId, ...cust });
    }
    console.log(`✅ Inserted ${insertedCustomers.length} customers`);

    // 4. Insert vendors
    console.log("🏭 Seeding vendors...");
    const vendorData = [
      { name: "Supplier A", code: "SUPA", locationId: insertedLocations[0].id },
      { name: "Supplier B", code: "SUPB", locationId: insertedLocations[1].id },
      { name: "Supplier C", code: "SUPC", locationId: insertedLocations[2].id },
      { name: "Supplier D", code: "SUPD", locationId: insertedLocations[3].id },
      { name: "Supplier E", code: "SUPE", locationId: insertedLocations[4].id },
    ];

    const insertedVendors = [];
    for (const vend of vendorData) {
      const result = await connection.query(
        "INSERT INTO vendors (name, code, locationId) VALUES (?, ?, ?)",
        [vend.name, vend.code, vend.locationId]
      );
      insertedVendors.push({ id: result[0].insertId, ...vend });
    }
    console.log(`✅ Inserted ${insertedVendors.length} vendors`);

    // 5. Insert accounts
    console.log("📊 Seeding accounts...");
    const accountData = [
      { code: "1000", name: "Cash", type: "asset", category: "current" },
      { code: "1100", name: "Accounts Receivable", type: "asset", category: "current" },
      { code: "1200", name: "Inventory", type: "asset", category: "current" },
      { code: "1500", name: "Fixed Assets", type: "asset", category: "noncurrent" },
      { code: "2000", name: "Accounts Payable", type: "liability", category: "current" },
      { code: "2100", name: "Short-term Debt", type: "liability", category: "current" },
      { code: "2500", name: "Long-term Debt", type: "liability", category: "noncurrent" },
      { code: "3000", name: "Common Stock", type: "equity", category: "equity" },
      { code: "4000", name: "Revenue", type: "revenue", category: "revenue" },
      { code: "5000", name: "Cost of Goods Sold", type: "expense", category: "cogs" },
      { code: "6000", name: "Operating Expenses", type: "expense", category: "operating" },
      { code: "6100", name: "Salaries", type: "expense", category: "operating" },
      { code: "6200", name: "Rent", type: "expense", category: "operating" },
      { code: "6300", name: "Utilities", type: "expense", category: "operating" },
    ];

    const insertedAccounts = [];
    for (const acc of accountData) {
      const result = await connection.query(
        "INSERT INTO accounts (code, name, type, category) VALUES (?, ?, ?, ?)",
        [acc.code, acc.name, acc.type, acc.category]
      );
      insertedAccounts.push({ id: result[0].insertId, ...acc });
    }
    console.log(`✅ Inserted ${insertedAccounts.length} accounts`);

    // 6. Insert time periods
    console.log("📅 Seeding time periods...");
    const insertedPeriods = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      const periodDate = new Date(year, month - 1, 1);
      const periodName = `${year}-${String(month).padStart(2, "0")}`;

      const result = await connection.query(
        "INSERT INTO timePeriods (periodDate, month, year, quarter, periodName) VALUES (?, ?, ?, ?, ?)",
        [periodDate, month, year, quarter, periodName]
      );
      insertedPeriods.push({ id: result[0].insertId, year, month, quarter, periodName });
    }
    console.log(`✅ Inserted ${insertedPeriods.length} time periods`);

    // 7. Insert AR Aging data
    console.log("💰 Seeding AR aging data...");
    let arCount = 0;
    for (const loc of insertedLocations) {
      for (const cust of insertedCustomers.filter((c) => c.locationId === loc.id)) {
        for (const period of insertedPeriods.slice(0, 3)) {
          const amount0_30 = Math.random() * 100000 + 50000;
          const amount31_60 = Math.random() * 80000 + 20000;
          const amount61_90 = Math.random() * 50000 + 10000;
          const amount90_plus = Math.random() * 30000 + 5000;
          const totalAR = amount0_30 + amount31_60 + amount61_90 + amount90_plus;

          await connection.query(
            "INSERT INTO arAging (locationId, customerId, periodId, amount0_30, amount31_60, amount61_90, amount90_plus, totalAR) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [loc.id, cust.id, period.id, amount0_30, amount31_60, amount61_90, amount90_plus, totalAR]
          );
          arCount++;
        }
      }
    }
    console.log(`✅ Inserted ${arCount} AR aging records`);

    // 8. Insert Inventory data
    console.log("📦 Seeding inventory data...");
    for (const loc of insertedLocations) {
      for (const period of insertedPeriods.slice(0, 3)) {
        const quantity = Math.floor(Math.random() * 10000) + 5000;
        const unitCost = Math.random() * 100 + 10;
        const value = quantity * unitCost;

        await connection.query(
          "INSERT INTO inventory (locationId, periodId, quantity, value) VALUES (?, ?, ?, ?)",
          [loc.id, period.id, quantity, value]
        );
      }
    }
    console.log(`✅ Inserted inventory data for ${insertedLocations.length} locations`);

    // 9. Insert Budget data
    console.log("💼 Seeding budget data...");
    let budgetCount = 0;
    for (const loc of insertedLocations) {
      for (const period of insertedPeriods.slice(0, 3)) {
        const revenueAccount = insertedAccounts.find((a) => a.code === "4000");
        const budgetedAmount = Math.random() * 500000 + 1000000;

        await connection.query(
          "INSERT INTO budget (locationId, accountId, periodId, budgetedAmount) VALUES (?, ?, ?, ?)",
          [loc.id, revenueAccount.id, period.id, budgetedAmount]
        );
        budgetCount++;
      }
    }
    console.log(`✅ Inserted ${budgetCount} budget records`);

    // 10. Insert P&L Statements
    console.log("📈 Seeding P&L statements...");
    for (const loc of insertedLocations) {
      for (const period of insertedPeriods.slice(0, 3)) {
        const revenue = Math.random() * 500000 + 1000000;
        const cogs = revenue * 0.4;
        const grossProfit = revenue - cogs;
        const grossMargin = (grossProfit / revenue) * 100;
        const opex = revenue * 0.26;
        const ebitda = grossProfit - opex;
        const ebitdaMargin = (ebitda / revenue) * 100;
        const netProfit = ebitda * 0.75;
        const netMargin = (netProfit / revenue) * 100;

        await connection.query(
          "INSERT INTO plStatement (locationId, periodId, revenue, cogs, grossProfit, grossMargin, operatingExpenses, ebitda, ebitdaMargin, netProfit, netMargin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [loc.id, period.id, revenue, cogs, grossProfit, grossMargin, opex, ebitda, ebitdaMargin, netProfit, netMargin]
        );
      }
    }
    console.log(`✅ Inserted P&L statements for ${insertedLocations.length} locations`);

    // 11. Insert Cash Flow Statements
    console.log("💵 Seeding cash flow statements...");
    for (const loc of insertedLocations) {
      for (const period of insertedPeriods.slice(0, 3)) {
        const operatingCF = Math.random() * 200000 + 100000;
        const investingCF = -(Math.random() * 100000 + 50000);
        const financingCF = Math.random() * 50000 - 25000;
        const netCashFlow = operatingCF + investingCF + financingCF;
        const openingCash = Math.random() * 500000 + 100000;
        const closingCash = openingCash + netCashFlow;

        await connection.query(
          "INSERT INTO cashFlowStatement (locationId, periodId, scenario, operatingCashFlow, investingCashFlow, financingCashFlow, netCashFlow, openingCash, closingCash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [loc.id, period.id, "base", operatingCF, investingCF, financingCF, netCashFlow, openingCash, closingCash]
        );
      }
    }
    console.log(`✅ Inserted cash flow statements for ${insertedLocations.length} locations`);

    // 12. Insert Working Capital Metrics
    console.log("⚙️  Seeding working capital metrics...");
    for (const loc of insertedLocations) {
      for (const period of insertedPeriods.slice(0, 3)) {
        const ar = Math.random() * 300000 + 100000;
        const ap = Math.random() * 200000 + 50000;
        const inv = Math.random() * 250000 + 75000;
        const revenue = Math.random() * 500000 + 1000000;
        const cogs = revenue * 0.4;
        const currentAssets = ar + inv + 100000;
        const currentLiabilities = ap + 50000;
        const netWC = currentAssets - currentLiabilities;

        const dso = (ar / revenue) * 30;
        const dpo = (ap / cogs) * 30;
        const dio = (inv / cogs) * 30;
        const ccc = dso + dio - dpo;
        const currentRatio = currentAssets / currentLiabilities;
        const quickRatio = (currentAssets - inv) / currentLiabilities;

        await connection.query(
          "INSERT INTO workingCapitalMetrics (locationId, periodId, dso, dpo, dio, ccc, currentRatio, quickRatio, netWorkingCapital) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [loc.id, period.id, dso, dpo, dio, ccc, currentRatio, quickRatio, netWC]
        );
      }
    }
    console.log(`✅ Inserted working capital metrics for ${insertedLocations.length} locations`);

    console.log("\n✨ Database seed completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - ${insertedLocations.length} locations`);
    console.log(`   - ${insertedCustomers.length} customers`);
    console.log(`   - ${insertedVendors.length} vendors`);
    console.log(`   - ${insertedAccounts.length} accounts`);
    console.log(`   - ${insertedPeriods.length} time periods`);
    console.log(`   - ${arCount} AR aging records`);
    console.log(`   - Financial data for all locations and periods`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
