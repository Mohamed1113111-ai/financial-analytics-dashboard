import * as XLSX from 'xlsx';

/**
 * Export data to Excel format
 */
export function exportToExcel(data: any[], filename: string) {
  try {
    // Create a new workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate Excel file
    XLSX.writeFile(wb, `${filename}.xlsx`);
  } catch (error) {
    console.error('Export to Excel failed:', error);
    throw new Error('Failed to export to Excel');
  }
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string) {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        // Handle values that contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export to CSV failed:', error);
    throw new Error('Failed to export to CSV');
  }
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any[], filename: string) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Export to JSON failed:', error);
    throw new Error('Failed to export to JSON');
  }
}

/**
 * Generic export function that handles multiple formats
 */
export function exportData(
  data: any[],
  filename: string,
  format: 'excel' | 'csv' | 'json' = 'excel'
) {
  switch (format) {
    case 'excel':
      return exportToExcel(data, filename);
    case 'csv':
      return exportToCSV(data, filename);
    case 'json':
      return exportToJSON(data, filename);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}
