import { Buffer } from "buffer";
import * as XLSX from "xlsx";
import Papa from "papaparse";
const pdfParse = require("pdf-parse");

export type FileFormat = "excel" | "csv" | "json" | "pdf";

export interface ParsedFileData {
  format: FileFormat;
  data: Record<string, any>[];
  headers: string[];
  rowCount: number;
  errors: string[];
  warnings: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Parse Excel file (.xlsx, .xls)
 */
export async function parseExcelFile(buffer: Buffer): Promise<ParsedFileData> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
      errors.push("Excel file contains no sheets");
      return {
        format: "excel",
        data: [],
        headers: [],
        rowCount: 0,
        errors,
        warnings,
      };
    }

    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      blankrows: false,
    }) as Record<string, any>[];

    // Get headers from first row
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Validate data
    if (data.length === 0) {
      warnings.push("Excel sheet contains no data rows");
    }

    // Check for empty columns
    headers.forEach((header) => {
      const emptyCount = data.filter((row) => !row[header] || row[header] === "").length;
      if (emptyCount === data.length) {
        warnings.push(`Column "${header}" contains all empty values`);
      }
    });

    return {
      format: "excel",
      data,
      headers,
      rowCount: data.length,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
    return {
      format: "excel",
      data: [],
      headers: [],
      rowCount: 0,
      errors,
      warnings,
    };
  }
}

/**
 * Parse CSV file
 */
export async function parseCSVFile(
  buffer: Buffer,
  options?: { delimiter?: string; header?: boolean }
): Promise<ParsedFileData> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const csvText = buffer.toString("utf-8");

    // Use PapaParse for robust CSV parsing
    const result = Papa.parse(csvText, {
      header: options?.header !== false,
      dynamicTyping: false,
      skipEmptyLines: true,
      delimiter: options?.delimiter || ",",
    });

    if (result.errors && result.errors.length > 0) {
      result.errors.forEach((err: any) => {
        warnings.push(`CSV parsing warning at row ${err.row}: ${err.message}`);
      });
    }

    const data = result.data as Record<string, any>[];
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    if (data.length === 0) {
      warnings.push("CSV file contains no data rows");
    }

    // Check for inconsistent column counts
    const columnCounts = data.map((row) => Object.keys(row).length);
    const minColumns = Math.min(...columnCounts);
    const maxColumns = Math.max(...columnCounts);

    if (minColumns !== maxColumns) {
      warnings.push(
        `CSV has inconsistent column counts: ${minColumns} to ${maxColumns} columns`
      );
    }

    return {
      format: "csv",
      data,
      headers,
      rowCount: data.length,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to parse CSV file: ${error instanceof Error ? error.message : "Unknown error"}`);
    return {
      format: "csv",
      data: [],
      headers: [],
      rowCount: 0,
      errors,
      warnings,
    };
  }
}

/**
 * Parse JSON file
 */
export async function parseJSONFile(buffer: Buffer): Promise<ParsedFileData> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const jsonText = buffer.toString("utf-8");
    const parsed = JSON.parse(jsonText);

    // Handle both array and object formats
    let data: Record<string, any>[] = [];

    if (Array.isArray(parsed)) {
      data = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      // Check if it has a data property
      if (Array.isArray(parsed.data)) {
        data = parsed.data;
      } else if (Array.isArray(parsed.records)) {
        data = parsed.records;
      } else if (Array.isArray(parsed.items)) {
        data = parsed.items;
      } else {
        // Treat single object as array of one
        data = [parsed];
      }
    } else {
      errors.push("JSON file must contain an array or object with array data");
      return {
        format: "json",
        data: [],
        headers: [],
        rowCount: 0,
        errors,
        warnings,
      };
    }

    // Validate all items are objects
    const invalidItems = data.filter((item) => typeof item !== "object" || item === null);
    if (invalidItems.length > 0) {
      errors.push(`JSON contains ${invalidItems.length} non-object items`);
    }

    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    if (data.length === 0) {
      warnings.push("JSON file contains no data items");
    }

    return {
      format: "json",
      data: data.filter((item) => typeof item === "object" && item !== null),
      headers,
      rowCount: data.length,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to parse JSON file: ${error instanceof Error ? error.message : "Unknown error"}`);
    return {
      format: "json",
      data: [],
      headers: [],
      rowCount: 0,
      errors,
      warnings,
    };
  }
}

/**
 * Parse PDF file and extract text/tables
 */
export async function parsePDFFile(buffer: Buffer): Promise<ParsedFileData> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const pdfData = await pdfParse.default(buffer);

    // Extract text
    const text = pdfData.text || "";

    if (!text || text.trim().length === 0) {
      warnings.push("PDF contains no extractable text");
    }

    // Try to parse as CSV-like data
    const lines = text.split("\n").filter((line: string) => line.trim().length > 0);

    if (lines.length === 0) {
      warnings.push("PDF contains no data lines");
      return {
        format: "pdf",
        data: [],
        headers: [],
        rowCount: 0,
        errors,
        warnings,
      };
    }

    // Attempt to parse lines as structured data
    const data: Record<string, any>[] = [];
    const headers: string[] = [];

    // Try to identify headers from first line
    const firstLine = lines[0];
    const potentialHeaders = firstLine.split(/\s{2,}|\t/).map((h: string) => h.trim());

    if (potentialHeaders.length > 1) {
      headers.push(...potentialHeaders);

      // Parse remaining lines
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/\s{2,}|\t/).map((v: string) => v.trim());
        if (values.length === headers.length) {
          const row: Record<string, any> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
          });
          data.push(row);
        }
      }
    } else {
      // If no clear structure, treat each line as a row
      warnings.push("PDF structure could not be automatically detected - treating as raw text");
      data.push({
        content: text,
        pageCount: pdfData.numpages || 1,
      });
      headers.push("content", "pageCount");
    }

    return {
      format: "pdf",
      data,
      headers,
      rowCount: data.length,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Failed to parse PDF file: ${error instanceof Error ? error.message : "Unknown error"}`);
    return {
      format: "pdf",
      data: [],
      headers: [],
      rowCount: 0,
      errors,
      warnings,
    };
  }
}

/**
 * Detect file format from filename or buffer
 */
export function detectFileFormat(filename: string): FileFormat | null {
  const ext = filename.toLowerCase().split(".").pop();

  switch (ext) {
    case "xlsx":
    case "xls":
      return "excel";
    case "csv":
      return "csv";
    case "json":
      return "json";
    case "pdf":
      return "pdf";
    default:
      return null;
  }
}

/**
 * Parse file based on format
 */
export async function parseFile(
  buffer: Buffer,
  format: FileFormat,
  options?: any
): Promise<ParsedFileData> {
  switch (format) {
    case "excel":
      return parseExcelFile(buffer);
    case "csv":
      return parseCSVFile(buffer, options);
    case "json":
      return parseJSONFile(buffer);
    case "pdf":
      return parsePDFFile(buffer);
    default:
      return {
        format,
        data: [],
        headers: [],
        rowCount: 0,
        errors: ["Unsupported file format"],
        warnings: [],
      };
  }
}

/**
 * Validate parsed data against schema
 */
export function validateData(
  data: Record<string, any>[],
  schema: Record<string, { type: string; required?: boolean; min?: number; max?: number }>
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.length === 0) {
    errors.push("No data rows to validate");
    return { isValid: false, errors, warnings };
  }

  // Check required fields
  Object.entries(schema).forEach(([field, rules]) => {
    if (rules.required) {
      const missingCount = data.filter((row) => !row[field] || row[field] === "").length;
      if (missingCount > 0) {
        errors.push(`Field "${field}" is required but missing in ${missingCount} rows`);
      }
    }
  });

  // Validate data types and ranges
  data.forEach((row, idx) => {
    Object.entries(schema).forEach(([field, rules]) => {
      const value = row[field];

      if (value === "" || value === null || value === undefined) {
        return; // Skip empty values
      }

      // Type validation
      if (rules.type === "number") {
        if (isNaN(Number(value))) {
          errors.push(`Row ${idx + 1}: Field "${field}" is not a valid number`);
        } else if (rules.min !== undefined && Number(value) < rules.min) {
          errors.push(`Row ${idx + 1}: Field "${field}" is less than minimum ${rules.min}`);
        } else if (rules.max !== undefined && Number(value) > rules.max) {
          errors.push(`Row ${idx + 1}: Field "${field}" is greater than maximum ${rules.max}`);
        }
      }

      if (rules.type === "date") {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`Row ${idx + 1}: Field "${field}" is not a valid date`);
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Transform and clean data
 */
export function transformData(
  data: Record<string, any>[],
  transforms: Record<string, (value: any) => any>
): Record<string, any>[] {
  return data.map((row) => {
    const transformed: Record<string, any> = { ...row };

    Object.entries(transforms).forEach(([field, transform]) => {
      if (field in transformed) {
        try {
          transformed[field] = transform(transformed[field]);
        } catch (error) {
          console.error(`Error transforming field ${field}:`, error);
        }
      }
    });

    return transformed;
  });
}
