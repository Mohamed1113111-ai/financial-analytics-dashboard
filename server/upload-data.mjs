import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 5,
  host: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/').pop() || 'financial_db',
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

async function uploadData() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting comprehensive data upload...\n');

    // Clear existing data (optional - comment out to preserve)
    // await connection.query('DELETE FROM transactions');
    // await connection.query('DELETE FROM arAging');
    // await connection.query('DELETE FROM plStatement');
    // await connection.query('DELETE FROM cashFlowStatement');
    // await connection.query('DELETE FROM workingCapitalMetrics');

    // Enhanced AR Aging Data - More realistic aging distribution
    console.log('Uploading AR Aging Records...');
    const arAgingRecords = [
      // NY Location
      { locationId: 1, customerId: 1, periodId: 1, bucket: '0-30', amount: 125000, count: 8 },
      { locationId: 1, customerId: 1, periodId: 1, bucket: '31-60', amount: 85000, count: 5 },
      { locationId: 1, customerId: 1, periodId: 1, bucket: '61-90', amount: 45000, count: 2 },
      { locationId: 1, customerId: 1, periodId: 1, bucket: '90+', amount: 22000, count: 1 },
      
      { locationId: 1, customerId: 2, periodId: 1, bucket: '0-30', amount: 95000, count: 6 },
      { locationId: 1, customerId: 2, periodId: 1, bucket: '31-60', amount: 65000, count: 4 },
      { locationId: 1, customerId: 2, periodId: 1, bucket: '61-90', amount: 35000, count: 2 },
      { locationId: 1, customerId: 2, periodId: 1, bucket: '90+', amount: 18000, count: 1 },

      // LA Location
      { locationId: 2, customerId: 3, periodId: 1, bucket: '0-30', amount: 110000, count: 7 },
      { locationId: 2, customerId: 3, periodId: 1, bucket: '31-60', amount: 75000, count: 4 },
      { locationId: 2, customerId: 3, periodId: 1, bucket: '61-90', amount: 40000, count: 2 },
      { locationId: 2, customerId: 3, periodId: 1, bucket: '90+', amount: 20000, count: 1 },

      { locationId: 2, customerId: 4, periodId: 1, bucket: '0-30', amount: 105000, count: 7 },
      { locationId: 2, customerId: 4, periodId: 1, bucket: '31-60', amount: 72000, count: 4 },
      { locationId: 2, customerId: 4, periodId: 1, bucket: '61-90', amount: 38000, count: 2 },
      { locationId: 2, customerId: 4, periodId: 1, bucket: '90+', amount: 19000, count: 1 },

      // Chicago Location
      { locationId: 3, customerId: 5, periodId: 1, bucket: '0-30', amount: 98000, count: 6 },
      { locationId: 3, customerId: 5, periodId: 1, bucket: '31-60', amount: 68000, count: 4 },
      { locationId: 3, customerId: 5, periodId: 1, bucket: '61-90', amount: 36000, count: 2 },
      { locationId: 3, customerId: 5, periodId: 1, bucket: '90+', amount: 18000, count: 1 },
    ];

    for (const record of arAgingRecords) {
      await connection.query(
        `INSERT INTO arAging (locationId, customerId, periodId, bucket, amount, count) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE amount = VALUES(amount), count = VALUES(count)`,
        [record.locationId, record.customerId, record.periodId, record.bucket, record.amount, record.count]
      );
    }
    console.log(`✓ Uploaded ${arAgingRecords.length} AR aging records\n`);

    // Enhanced Transaction Data
    console.log('Uploading Transaction Records...');
    const transactions = [
      // NY Location - Revenue transactions
      { locationId: 1, accountId: 5, periodId: 1, type: 'credit', amount: 450000, description: 'Sales Revenue' },
      { locationId: 1, accountId: 6, periodId: 1, type: 'debit', amount: 270000, description: 'Cost of Goods Sold' },
      { locationId: 1, accountId: 7, periodId: 1, type: 'debit', amount: 85000, description: 'Operating Expenses' },
      { locationId: 1, accountId: 8, periodId: 1, type: 'debit', amount: 25000, description: 'Depreciation' },

      // LA Location - Revenue transactions
      { locationId: 2, accountId: 5, periodId: 1, type: 'credit', amount: 420000, description: 'Sales Revenue' },
      { locationId: 2, accountId: 6, periodId: 1, type: 'debit', amount: 252000, description: 'Cost of Goods Sold' },
      { locationId: 2, accountId: 7, periodId: 1, type: 'debit', amount: 78000, description: 'Operating Expenses' },
      { locationId: 2, accountId: 8, periodId: 1, type: 'debit', amount: 23000, description: 'Depreciation' },

      // Chicago Location - Revenue transactions
      { locationId: 3, accountId: 5, periodId: 1, type: 'credit', amount: 380000, description: 'Sales Revenue' },
      { locationId: 3, accountId: 6, periodId: 1, type: 'debit', amount: 228000, description: 'Cost of Goods Sold' },
      { locationId: 3, accountId: 7, periodId: 1, type: 'debit', amount: 71000, description: 'Operating Expenses' },
      { locationId: 3, accountId: 8, periodId: 1, type: 'debit', amount: 21000, description: 'Depreciation' },
    ];

    for (const txn of transactions) {
      await connection.query(
        `INSERT INTO transactions (locationId, accountId, periodId, type, amount, description) 
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
        [txn.locationId, txn.accountId, txn.periodId, txn.type, txn.amount, txn.description]
      );
    }
    console.log(`✓ Uploaded ${transactions.length} transaction records\n`);

    // Enhanced P&L Statement Data
    console.log('Uploading P&L Statement Records...');
    const plRecords = [
      // NY Location
      { locationId: 1, periodId: 1, revenue: 450000, cogs: 270000, grossProfit: 180000, operatingExpenses: 85000, ebitda: 95000, depreciation: 25000, ebit: 70000, netProfit: 52500, grossMargin: 40, operatingMargin: 15.6, netMargin: 11.7 },
      
      // LA Location
      { locationId: 2, periodId: 1, revenue: 420000, cogs: 252000, grossProfit: 168000, operatingExpenses: 78000, ebitda: 90000, depreciation: 23000, ebit: 67000, netProfit: 50250, grossMargin: 40, operatingMargin: 15.95, netMargin: 11.96 },
      
      // Chicago Location
      { locationId: 3, periodId: 1, revenue: 380000, cogs: 228000, grossProfit: 152000, operatingExpenses: 71000, ebitda: 81000, depreciation: 21000, ebit: 60000, netProfit: 45000, grossMargin: 40, operatingMargin: 15.79, netMargin: 11.84 },
    ];

    for (const pl of plRecords) {
      await connection.query(
        `INSERT INTO plStatement (locationId, periodId, revenue, cogs, grossProfit, operatingExpenses, ebitda, depreciation, ebit, netProfit, grossMargin, operatingMargin, netMargin) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE revenue = VALUES(revenue), netProfit = VALUES(netProfit)`,
        [pl.locationId, pl.periodId, pl.revenue, pl.cogs, pl.grossProfit, pl.operatingExpenses, pl.ebitda, pl.depreciation, pl.ebit, pl.netProfit, pl.grossMargin, pl.operatingMargin, pl.netMargin]
      );
    }
    console.log(`✓ Uploaded ${plRecords.length} P&L statement records\n`);

    // Enhanced Cash Flow Statement Data
    console.log('Uploading Cash Flow Statement Records...');
    const cfRecords = [
      // NY Location
      { locationId: 1, periodId: 1, operatingCashFlow: 95000, investingCashFlow: -35000, financingCashFlow: -15000, netCashFlow: 45000, endingCashBalance: 245000 },
      
      // LA Location
      { locationId: 2, periodId: 1, operatingCashFlow: 90000, investingCashFlow: -32000, financingCashFlow: -14000, netCashFlow: 44000, endingCashBalance: 228000 },
      
      // Chicago Location
      { locationId: 3, periodId: 1, operatingCashFlow: 81000, investingCashFlow: -28000, financingCashFlow: -12000, netCashFlow: 41000, endingCashBalance: 205000 },
    ];

    for (const cf of cfRecords) {
      await connection.query(
        `INSERT INTO cashFlowStatement (locationId, periodId, operatingCashFlow, investingCashFlow, financingCashFlow, netCashFlow, endingCashBalance) 
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE netCashFlow = VALUES(netCashFlow)`,
        [cf.locationId, cf.periodId, cf.operatingCashFlow, cf.investingCashFlow, cf.financingCashFlow, cf.netCashFlow, cf.endingCashBalance]
      );
    }
    console.log(`✓ Uploaded ${cfRecords.length} cash flow statement records\n`);

    // Enhanced Working Capital Metrics
    console.log('Uploading Working Capital Metrics...');
    const wcRecords = [
      // NY Location
      { locationId: 1, periodId: 1, dso: 42, dpo: 35, dio: 28, ccc: 35, currentRatio: 1.85, quickRatio: 1.42, currentAssets: 485000, currentLiabilities: 262000, netWorkingCapital: 223000 },
      
      // LA Location
      { locationId: 2, periodId: 1, dso: 40, dpo: 34, dio: 27, ccc: 33, currentRatio: 1.92, quickRatio: 1.48, currentAssets: 452000, currentLiabilities: 235000, netWorkingCapital: 217000 },
      
      // Chicago Location
      { locationId: 3, periodId: 1, dso: 38, dpo: 33, dio: 26, ccc: 31, currentRatio: 1.78, quickRatio: 1.38, currentAssets: 408000, currentLiabilities: 229000, netWorkingCapital: 179000 },
    ];

    for (const wc of wcRecords) {
      await connection.query(
        `INSERT INTO workingCapitalMetrics (locationId, periodId, dso, dpo, dio, ccc, currentRatio, quickRatio, currentAssets, currentLiabilities, netWorkingCapital) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE dso = VALUES(dso), ccc = VALUES(ccc)`,
        [wc.locationId, wc.periodId, wc.dso, wc.dpo, wc.dio, wc.ccc, wc.currentRatio, wc.quickRatio, wc.currentAssets, wc.currentLiabilities, wc.netWorkingCapital]
      );
    }
    console.log(`✓ Uploaded ${wcRecords.length} working capital metric records\n`);

    console.log('✅ Data upload completed successfully!');
    console.log('\nData Summary:');
    console.log('- AR Aging Records: 20');
    console.log('- Transaction Records: 12');
    console.log('- P&L Statements: 3');
    console.log('- Cash Flow Statements: 3');
    console.log('- Working Capital Metrics: 3');
    console.log('\nTotal Records Uploaded: 41');
    console.log('\nAll dashboards should now display comprehensive financial data.');

  } catch (error) {
    console.error('Error uploading data:', error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

uploadData();
