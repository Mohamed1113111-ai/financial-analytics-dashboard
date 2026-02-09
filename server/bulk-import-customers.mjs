import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

// Create connection pool
const pool = mysql.createPool({
  connectionLimit: 5,
  waitForConnections: true,
  queueLimit: 0,
  uri: dbUrl
});

async function importCustomers() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('✅ Connected to database');

    // Read SQL file
    const sqlFile = '/tmp/bulk_import_all.sql';
    const sqlContent = fs.readFileSync(sqlFile, 'utf-8');

    // Split by ON DUPLICATE KEY UPDATE
    const statements = sqlContent.split('ON DUPLICATE KEY UPDATE status=VALUES(status);')
      .filter(s => s.trim().length > 0)
      .map(s => s.trim() + '\nON DUPLICATE KEY UPDATE status=VALUES(status);');

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    let totalRows = 0;
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i];
      const rowCount = (sql.match(/\(1,/g) || []).length;
      
      console.log(`⏳ Executing batch ${i + 1}/${statements.length} (${rowCount} customers)...`);
      
      await connection.query(sql);
      totalRows += rowCount;
      
      console.log(`✅ Batch ${i + 1} completed`);
    }

    console.log(`\n🎉 Successfully imported ${totalRows} customers!`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

importCustomers();
