import { db } from './db.ts';
import { locations, customers, arAging, timePeriods } from '../drizzle/schema.ts';

const realData = {
  locations: [
    { name: 'Riyadh Head Office', code: 'RUH-HO', region: 'Central', country: 'Saudi Arabia', status: 'active' },
    { name: 'Jeddah Branch', code: 'JED-BR', region: 'West', country: 'Saudi Arabia', status: 'active' },
    { name: 'Dammam Warehouse', code: 'DMM-WH', region: 'East', country: 'Saudi Arabia', status: 'active' },
    { name: 'NEOM Site', code: 'NEOM-ST', region: 'North West', country: 'Saudi Arabia', status: 'active' },
    { name: 'Medina Office', code: 'MED-OF', region: 'West', country: 'Saudi Arabia', status: 'inactive' },
  ],
  customers: [
    { name: 'Al Noor Trading', code: 'CUST001', locationId: 1, creditLimit: '150000', paymentTerms: 30, status: 'active' },
    { name: 'Red Sea Logistics', code: 'CUST002', locationId: 2, creditLimit: '300000', paymentTerms: 30, status: 'active' },
    { name: 'Gulf Medical Supplies', code: 'CUST003', locationId: 3, creditLimit: '200000', paymentTerms: 30, status: 'active' },
    { name: 'Desert Construction Co', code: 'CUST004', locationId: 1, creditLimit: '500000', paymentTerms: 30, status: 'active' },
    { name: 'Blue Horizon Services', code: 'CUST005', locationId: 2, creditLimit: '100000', paymentTerms: 30, status: 'inactive' },
  ],
  arRecords: [
    { customerId: 1, locationId: 1, amount0_30: '45000', amount31_60: '0', amount61_90: '0', amount90_plus: '0', totalAR: '45000' },
    { customerId: 2, locationId: 2, amount0_30: '0', amount31_60: '120000', amount61_90: '0', amount90_plus: '0', totalAR: '120000' },
    { customerId: 3, locationId: 3, amount0_30: '0', amount31_60: '0', amount61_90: '78000', amount90_plus: '0', totalAR: '78000' },
    { customerId: 1, locationId: 4, amount0_30: '56000', amount31_60: '0', amount61_90: '0', amount90_plus: '0', totalAR: '56000' },
    { customerId: 4, locationId: 1, amount0_30: '0', amount31_60: '0', amount61_90: '0', amount90_plus: '210000', totalAR: '210000' },
  ],
};

async function seedData() {
  try {
    console.log('🌱 Starting real data seeding...');
    
    // Insert locations
    console.log('📍 Inserting locations...');
    for (const loc of realData.locations) {
      await db.insert(locations).values(loc).catch(() => {
        // Ignore duplicate key errors
      });
    }
    console.log(`✓ Processed ${realData.locations.length} locations`);
    
    // Insert customers
    console.log('👥 Inserting customers...');
    for (const cust of realData.customers) {
      await db.insert(customers).values(cust).catch(() => {
        // Ignore duplicate key errors
      });
    }
    console.log(`✓ Processed ${realData.customers.length} customers`);
    
    console.log('✅ Real data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
