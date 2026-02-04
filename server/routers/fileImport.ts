import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  parseFile,
  detectFileFormat,
  validateData,
  transformData,
  ParsedFileData,
  FileValidationResult,
} from "../utils/fileParser";
import { Buffer } from "buffer";

/**
 * File Import Router
 * Handles file uploads, parsing, validation, and data import
 */

const fileUploadSchema = z.object({
  filename: z.string().min(1),
  buffer: z.instanceof(Buffer),
  format: z.enum(["excel", "csv", "json", "pdf"]).optional(),
});

const dataValidationSchema = z.object({
  data: z.array(z.record(z.string(), z.any())),
  schema: z.record(
    z.string(),
    z.object({
      type: z.enum(["string", "number", "date", "boolean"]),
      required: z.boolean().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
  ),
});

const dataImportSchema = z.object({
  data: z.array(z.record(z.string(), z.any())),
  dataType: z.enum(["customers", "locations", "arRecords", "budgets"]),
  mappings: z.record(z.string(), z.string()).optional(),
  skipErrors: z.boolean().default(false),
});

export interface FileImportResult {
  success: boolean;
  filename: string;
  format: string;
  rowCount: number;
  headers: string[];
  preview: Record<string, any>[];
  errors: string[];
  warnings: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
  warnings: string[];
}

export const fileImportRouter = router({
  /**
   * Upload and parse file
   */
  uploadFile: protectedProcedure
    .input(fileUploadSchema)
    .mutation(async ({ input }) => {
      try {
        // Detect format if not provided
        const format = input.format || detectFileFormat(input.filename);

        if (!format) {
          return {
            success: false,
            filename: input.filename,
            format: "unknown",
            rowCount: 0,
            headers: [],
            preview: [],
            errors: ["Unable to detect file format. Supported formats: Excel, CSV, JSON, PDF"],
            warnings: [],
          } as FileImportResult;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (input.buffer.length > maxSize) {
          return {
            success: false,
            filename: input.filename,
            format,
            rowCount: 0,
            headers: [],
            preview: [],
            errors: [`File size (${(input.buffer.length / 1024 / 1024).toFixed(2)}MB) exceeds maximum (10MB)`],
            warnings: [],
          } as FileImportResult;
        }

        // Parse file
        const parsed = await parseFile(input.buffer, format);

        // Get preview (first 5 rows)
        const preview = parsed.data.slice(0, 5);

        return {
          success: parsed.errors.length === 0,
          filename: input.filename,
          format: parsed.format,
          rowCount: parsed.rowCount,
          headers: parsed.headers,
          preview,
          errors: parsed.errors,
          warnings: parsed.warnings,
        } as FileImportResult;
      } catch (error) {
        return {
          success: false,
          filename: input.filename,
          format: "unknown",
          rowCount: 0,
          headers: [],
          preview: [],
          errors: [
            `File upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          ],
          warnings: [],
        } as FileImportResult;
      }
    }),

  /**
   * Validate parsed data against schema
   */
  validateData: protectedProcedure
    .input(dataValidationSchema)
    .query(({ input }) => {
      const result = validateData(input.data, input.schema);
      return result;
    }),

  /**
   * Get sample data for preview
   */
  getPreview: protectedProcedure
    .input(
      z.object({
        data: z.array(z.record(z.string(), z.any())),
        limit: z.number().default(5),
      })
    )
    .query(({ input }) => {
      return {
        total: input.data.length,
        preview: input.data.slice(0, input.limit),
        columns: input.data.length > 0 ? Object.keys(input.data[0]) : [],
      };
    }),

  /**
   * Get import templates for each data type
   */
  getTemplate: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(["customers", "locations", "arRecords", "budgets"]),
      })
    )
    .query(({ input }) => {
      const templates: Record<string, any> = {
        customers: {
          name: "Customer Import Template",
          fields: [
            { name: "name", type: "string", required: true, description: "Customer name" },
            { name: "email", type: "string", required: false, description: "Customer email" },
            { name: "phone", type: "string", required: false, description: "Customer phone" },
            {
              name: "creditLimit",
              type: "number",
              required: false,
              description: "Credit limit in dollars",
            },
            { name: "status", type: "string", required: false, description: "active or inactive" },
          ],
          example: [
            {
              name: "Acme Corp",
              email: "contact@acme.com",
              phone: "+1-555-0100",
              creditLimit: 50000,
              status: "active",
            },
          ],
        },
        locations: {
          name: "Location Import Template",
          fields: [
            { name: "name", type: "string", required: true, description: "Location name" },
            { name: "code", type: "string", required: true, description: "Unique location code" },
            { name: "region", type: "string", required: false, description: "Region name" },
            { name: "country", type: "string", required: false, description: "Country" },
            { name: "status", type: "string", required: false, description: "active or inactive" },
          ],
          example: [
            {
              name: "New York Office",
              code: "NY-001",
              region: "Northeast",
              country: "USA",
              status: "active",
            },
          ],
        },
        arRecords: {
          name: "AR Records Import Template",
          fields: [
            { name: "customerId", type: "number", required: true, description: "Customer ID" },
            { name: "locationId", type: "number", required: true, description: "Location ID" },
            { name: "invoiceNumber", type: "string", required: true, description: "Invoice number" },
            { name: "amount", type: "number", required: true, description: "Invoice amount" },
            { name: "daysOutstanding", type: "number", required: true, description: "Days outstanding" },
          ],
          example: [
            {
              customerId: 1,
              locationId: 1,
              invoiceNumber: "INV-001",
              amount: 5000,
              daysOutstanding: 15,
            },
          ],
        },
        budgets: {
          name: "Budget Import Template",
          fields: [
            { name: "locationId", type: "number", required: true, description: "Location ID" },
            { name: "category", type: "string", required: true, description: "Budget category" },
            { name: "amount", type: "number", required: true, description: "Budget amount" },
            { name: "period", type: "string", required: true, description: "Period (monthly/quarterly/annual)" },
          ],
          example: [
            {
              locationId: 1,
              category: "Revenue",
              amount: 100000,
              period: "monthly",
            },
          ],
        },
      };

      return templates[input.dataType] || null;
    }),

  /**
   * Import data into database
   */
  importData: protectedProcedure
    .input(dataImportSchema)
    .mutation(async ({ input }) => {
      const imported: number[] = [];
      const errors: Array<{ row: number; error: string }> = [];
      const warnings: string[] = [];

      try {
        // Validate data format
        if (!Array.isArray(input.data) || input.data.length === 0) {
          return {
            success: false,
            imported: 0,
            failed: input.data.length,
            errors: [{ row: 0, error: "No data to import" }],
            warnings,
          } as ImportResult;
        }

        // Process each row
        for (let i = 0; i < input.data.length; i++) {
          const row = input.data[i];

          try {
            // Apply mappings if provided
            let processedRow: Record<string, any> = row;
            if (input.mappings) {
              processedRow = {};
              Object.entries(input.mappings).forEach(([sourceField, targetField]: [string, string]) => {
                if (sourceField in row) {
                  processedRow[targetField] = row[sourceField as keyof typeof row];
                }
              });
            }

            // Validate required fields based on data type
            const requiredFields: Record<string, string[]> = {
              customers: ["name"],
              locations: ["name", "code"],
              arRecords: ["customerId", "locationId", "invoiceNumber", "amount"],
              budgets: ["locationId", "category", "amount"],
            };

            const required = requiredFields[input.dataType] || [];
            const missingFields = required.filter((field: string) => !processedRow[field]);

            if (missingFields.length > 0) {
              throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
            }

            // Mark as imported (in real implementation, would save to database)
            imported.push(i + 1);
          } catch (error) {
            if (!input.skipErrors) {
              errors.push({
                row: i + 1,
                error: error instanceof Error ? error.message : "Unknown error",
              });
            } else {
              warnings.push(
                `Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
              );
            }
          }
        }

        return {
          success: errors.length === 0,
          imported: imported.length,
          failed: errors.length,
          errors,
          warnings,
        } as ImportResult;
      } catch (error) {
        return {
          success: false,
          imported: 0,
          failed: input.data.length,
          errors: [
            {
              row: 0,
              error: `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          warnings,
        } as ImportResult;
      }
    }),

  /**
   * Get import history
   */
  getHistory: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(["customers", "locations", "arRecords", "budgets"]).optional(),
        limit: z.number().default(10),
      })
    )
    .query(({ input }) => {
      // Mock history - in real implementation would query database
      return [
        {
          id: 1,
          filename: "customers.xlsx",
          dataType: "customers",
          imported: 45,
          failed: 2,
          importedAt: new Date(Date.now() - 86400000),
          status: "completed",
        },
        {
          id: 2,
          filename: "locations.csv",
          dataType: "locations",
          imported: 12,
          failed: 0,
          importedAt: new Date(Date.now() - 172800000),
          status: "completed",
        },
      ];
    }),
});
