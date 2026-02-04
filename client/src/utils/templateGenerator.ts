import * as XLSX from 'xlsx';

/**
 * Template definitions for each data type
 */
export const TEMPLATES = {
  customers: {
    filename: 'customers-template',
    columns: ['name', 'code', 'locationId', 'creditLimit', 'paymentTerms'],
    description: 'Customer data import template',
    exampleRows: [
      {
        name: 'Acme Corporation',
        code: 'ACME-001',
        locationId: 1,
        creditLimit: 50000,
        paymentTerms: 30,
      },
      {
        name: 'Tech Solutions Inc',
        code: 'TECH-001',
        locationId: 2,
        creditLimit: 75000,
        paymentTerms: 45,
      },
    ],
  },
  locations: {
    filename: 'locations-template',
    columns: ['code', 'name', 'city', 'country'],
    description: 'Location data import template',
    exampleRows: [
      {
        code: 'LOC-001',
        name: 'Main Office',
        city: 'New York',
        country: 'USA',
      },
      {
        code: 'LOC-002',
        name: 'Regional Office',
        city: 'Los Angeles',
        country: 'USA',
      },
    ],
  },
  arRecords: {
    filename: 'ar-records-template',
    columns: ['customerId', 'locationId', 'periodId', 'amount0_30', 'amount31_60', 'amount61_90', 'amount90_plus'],
    description: 'AR Records (Accounts Receivable Aging) import template',
    exampleRows: [
      {
        customerId: 1,
        locationId: 1,
        periodId: 1,
        amount0_30: 25000,
        amount31_60: 15000,
        amount61_90: 8000,
        amount90_plus: 2000,
      },
      {
        customerId: 2,
        locationId: 2,
        periodId: 1,
        amount0_30: 35000,
        amount31_60: 12000,
        amount61_90: 5000,
        amount90_plus: 1000,
      },
    ],
  },
  budgets: {
    filename: 'budgets-template',
    columns: ['locationId', 'periodId', 'category', 'budgetAmount', 'notes'],
    description: 'Budget data import template',
    exampleRows: [
      {
        locationId: 1,
        periodId: 1,
        category: 'Revenue',
        budgetAmount: 500000,
        notes: 'Q1 Revenue Target',
      },
      {
        locationId: 1,
        periodId: 1,
        category: 'Operating Expenses',
        budgetAmount: 150000,
        notes: 'Q1 Operating Budget',
      },
    ],
  },
};

/**
 * Generate Excel template for a data type
 */
export function generateExcelTemplate(dataType: keyof typeof TEMPLATES) {
  const template = TEMPLATES[dataType];
  
  // Create worksheet with headers and example data
  const wsData = [
    template.columns,
    ...template.exampleRows.map(row => template.columns.map(col => row[col as keyof typeof row])),
  ];
  
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  
  // Style header row
  const headerStyle = {
    font: { bold: true, color: 'FFFFFF' },
    fill: { fgColor: { rgb: 'FF4472C4' } },
    alignment: { horizontal: 'center', vertical: 'center' },
  };
  
  // Apply header styling
  for (let i = 0; i < template.columns.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (ws[cellRef]) {
      ws[cellRef].s = headerStyle;
    }
  }
  
  // Set column widths
  ws['!cols'] = template.columns.map(() => ({ wch: 20 }));
  
  // Create workbook and add worksheet
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  
  // Add instructions sheet
  const instructionsWs = XLSX.utils.aoa_to_sheet([
    ['Import Template Instructions'],
    [],
    ['Description:', template.description],
    [],
    ['Required Columns:'],
    ...template.columns.map(col => [col]),
    [],
    ['Notes:'],
    ['1. Do not modify column headers'],
    ['2. Fill in data starting from row 3'],
    ['3. Ensure all required fields are populated'],
    ['4. Save file as .xlsx before importing'],
  ]);
  
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
  
  return { wb, filename: `${template.filename}.xlsx` };
}

/**
 * Generate CSV template for a data type
 */
export function generateCSVTemplate(dataType: keyof typeof TEMPLATES): { content: string; filename: string } {
  const template = TEMPLATES[dataType];
  
  // Create CSV content
  let csvContent = template.columns.join(',') + '\n';
  
  template.exampleRows.forEach((row: any) => {
    const values = template.columns.map(col => {
      const value = row[col];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    });
    csvContent += values.join(',') + '\n';
  });
  
  return {
    content: csvContent,
    filename: `${template.filename}.csv`,
  };
}

/**
 * Download Excel template
 */
export function downloadExcelTemplate(dataType: keyof typeof TEMPLATES) {
  try {
    const { wb, filename } = generateExcelTemplate(dataType);
    XLSX.writeFile(wb, filename);
  } catch (error) {
    console.error('Failed to generate Excel template:', error);
    throw new Error('Failed to generate Excel template');
  }
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate(dataType: keyof typeof TEMPLATES) {
  try {
    const { content, filename } = generateCSVTemplate(dataType);
    
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to generate CSV template:', error);
    throw new Error('Failed to generate CSV template');
  }
}

/**
 * Get template information
 */
export function getTemplateInfo(dataType: keyof typeof TEMPLATES) {
  return TEMPLATES[dataType];
}
