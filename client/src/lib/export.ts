import { format } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExportOptions {
  filename: string;
  title?: string;
  subtitle?: string;
  date?: Date;
}

/**
 * Export table data to Excel
 */
export async function exportToExcel(
  data: Record<string, any>[],
  columns: { key: string; label: string }[],
  options: ExportOptions
) {
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((row) => {
      const newRow: Record<string, any> = {};
      columns.forEach((col) => {
        newRow[col.label] = row[col.key];
      });
      return newRow;
    })
  );

  // Set column widths
  const colWidths = columns.map(() => 15);
  worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const filename = `${options.filename}-${format(options.date || new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Export HTML element to PDF
 */
export async function exportToPDF(
  elementId: string,
  options: ExportOptions
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // Add title
    if (options.title) {
      pdf.setFontSize(16);
      pdf.text(options.title, 10, 10);
      position = 20;
    }

    // Add subtitle
    if (options.subtitle) {
      pdf.setFontSize(10);
      pdf.text(options.subtitle, 10, position);
      position += 5;
    }

    // Add date
    if (options.date) {
      pdf.setFontSize(9);
      pdf.text(`Generated: ${format(options.date, "PPP")}`, 10, position);
      position += 8;
    }

    // Add image
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - position - 10;

    let page = 1;
    while (heightLeft >= 0) {
      page += 1;
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const filename = `${options.filename}-${format(options.date || new Date(), "yyyy-MM-dd")}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

/**
 * Export financial statement data to Excel with formatting
 */
export async function exportFinancialStatementToExcel(
  data: {
    title: string;
    rows: {
      label: string;
      value: string | number;
      level?: "header" | "subheader" | "total" | "data";
    }[];
  },
  options: ExportOptions
) {
  const worksheet = XLSX.utils.aoa_to_sheet([
    [options.title],
    [options.subtitle || ""],
    [`Generated: ${format(options.date || new Date(), "PPP")}`],
    [],
    ["Line Item", "Amount"],
    ...data.rows.map((row) => [row.label, row.value]),
  ]);

  // Set column widths
  worksheet["!cols"] = [{ wch: 40 }, { wch: 20 }];

  // Format header rows
  const headerStyle = {
    font: { bold: true, size: 14 },
    alignment: { horizontal: "center" },
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");

  const filename = `${options.filename}-${format(options.date || new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(value: number | string): string {
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage for export
 */
export function formatPercentageForExport(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
