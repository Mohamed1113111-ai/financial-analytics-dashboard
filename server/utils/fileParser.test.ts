import { describe, it, expect } from "vitest";
import {
  parseExcelFile,
  parseCSVFile,
  parseJSONFile,
  detectFileFormat,
  validateData,
  transformData,
} from "./fileParser";
import { Buffer } from "buffer";
import * as XLSX from "xlsx";

describe("File Parser Utilities", () => {
  describe("detectFileFormat", () => {
    it("should detect Excel format", () => {
      expect(detectFileFormat("data.xlsx")).toBe("excel");
      expect(detectFileFormat("data.xls")).toBe("excel");
    });

    it("should detect CSV format", () => {
      expect(detectFileFormat("data.csv")).toBe("csv");
    });

    it("should detect JSON format", () => {
      expect(detectFileFormat("data.json")).toBe("json");
    });

    it("should detect PDF format", () => {
      expect(detectFileFormat("data.pdf")).toBe("pdf");
    });

    it("should return null for unknown format", () => {
      expect(detectFileFormat("data.txt")).toBeNull();
      expect(detectFileFormat("data.doc")).toBeNull();
    });

    it("should be case insensitive", () => {
      expect(detectFileFormat("DATA.XLSX")).toBe("excel");
      expect(detectFileFormat("Data.CSV")).toBe("csv");
    });
  });

  describe("parseCSVFile", () => {
    it("should parse valid CSV data", async () => {
      const csvData = "name,email,phone\nJohn Doe,john@example.com,555-0100\nJane Smith,jane@example.com,555-0101";
      const buffer = Buffer.from(csvData);

      const result = await parseCSVFile(buffer);

      expect(result.format).toBe("csv");
      expect(result.rowCount).toBe(2);
      expect(result.headers).toEqual(["name", "email", "phone"]);
      expect(result.data[0].name).toBe("John Doe");
      expect(result.data[1].email).toBe("jane@example.com");
      expect(result.errors).toHaveLength(0);
    });

    it("should handle CSV with different delimiters", async () => {
      const csvData = "name;email;phone\nJohn Doe;john@example.com;555-0100";
      const buffer = Buffer.from(csvData);

      const result = await parseCSVFile(buffer, { delimiter: ";" });

      expect(result.rowCount).toBe(1);
      expect(result.headers).toEqual(["name", "email", "phone"]);
    });

    it("should warn on empty CSV", async () => {
      const csvData = "name,email,phone";
      const buffer = Buffer.from(csvData);

      const result = await parseCSVFile(buffer);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.rowCount).toBe(0);
    });

    it("should handle CSV with inconsistent columns", async () => {
      const csvData = "name,email,phone\nJohn,john@example.com\nJane,jane@example.com,555-0101";
      const buffer = Buffer.from(csvData);

      const result = await parseCSVFile(buffer);

      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("parseJSONFile", () => {
    it("should parse JSON array", async () => {
      const jsonData = JSON.stringify([
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
      ]);
      const buffer = Buffer.from(jsonData);

      const result = await parseJSONFile(buffer);

      expect(result.format).toBe("json");
      expect(result.rowCount).toBe(2);
      expect(result.headers).toEqual(["name", "email"]);
      expect(result.data[0].name).toBe("John");
    });

    it("should parse JSON object with data property", async () => {
      const jsonData = JSON.stringify({
        data: [
          { name: "John", email: "john@example.com" },
          { name: "Jane", email: "jane@example.com" },
        ],
      });
      const buffer = Buffer.from(jsonData);

      const result = await parseJSONFile(buffer);

      expect(result.rowCount).toBe(2);
      expect(result.data[0].name).toBe("John");
    });

    it("should parse JSON object with records property", async () => {
      const jsonData = JSON.stringify({
        records: [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" },
        ],
      });
      const buffer = Buffer.from(jsonData);

      const result = await parseJSONFile(buffer);

      expect(result.rowCount).toBe(2);
    });

    it("should handle single JSON object", async () => {
      const jsonData = JSON.stringify({ name: "John", email: "john@example.com" });
      const buffer = Buffer.from(jsonData);

      const result = await parseJSONFile(buffer);

      expect(result.rowCount).toBe(1);
      expect(result.data[0].name).toBe("John");
    });

    it("should error on invalid JSON", async () => {
      const jsonData = "{ invalid json }";
      const buffer = Buffer.from(jsonData);

      const result = await parseJSONFile(buffer);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.rowCount).toBe(0);
    });

    it("should error on non-array/object JSON", async () => {
      const jsonData = JSON.stringify("just a string");
      const buffer = Buffer.from(jsonData);

      const result = await parseJSONFile(buffer);

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validateData", () => {
    it("should validate required fields", () => {
      const data = [
        { name: "John", email: "john@example.com" },
        { name: "", email: "jane@example.com" },
      ];

      const schema = {
        name: { type: "string", required: true },
        email: { type: "string", required: false },
      };

      const result = validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate number types", () => {
      const data = [
        { id: 1, amount: 100 },
        { id: 2, amount: "invalid" },
      ];

      const schema = {
        id: { type: "number" },
        amount: { type: "number" },
      };

      const result = validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("not a valid number"))).toBe(true);
    });

    it("should validate number ranges", () => {
      const data = [
        { id: 1, score: 50 },
        { id: 2, score: 150 },
      ];

      const schema = {
        id: { type: "number" },
        score: { type: "number", min: 0, max: 100 },
      };

      const result = validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("greater than maximum"))).toBe(true);
    });

    it("should validate date types", () => {
      const data = [
        { id: 1, date: "2024-01-01" },
        { id: 2, date: "invalid-date" },
      ];

      const schema = {
        id: { type: "number" },
        date: { type: "date" },
      };

      const result = validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("not a valid date"))).toBe(true);
    });

    it("should pass validation with valid data", () => {
      const data = [
        { name: "John", email: "john@example.com", age: 30 },
        { name: "Jane", email: "jane@example.com", age: 25 },
      ];

      const schema = {
        name: { type: "string", required: true },
        email: { type: "string", required: true },
        age: { type: "number", min: 0, max: 150 },
      };

      const result = validateData(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle empty data", () => {
      const data: Record<string, any>[] = [];
      const schema = { name: { type: "string", required: true } };

      const result = validateData(data, schema);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("No data rows"))).toBe(true);
    });
  });

  describe("transformData", () => {
    it("should transform data with custom functions", () => {
      const data = [
        { name: "john", email: "JOHN@EXAMPLE.COM" },
        { name: "jane", email: "JANE@EXAMPLE.COM" },
      ];

      const transforms = {
        name: (value: string) => value.toUpperCase(),
        email: (value: string) => value.toLowerCase(),
      };

      const result = transformData(data, transforms);

      expect(result[0].name).toBe("JOHN");
      expect(result[0].email).toBe("john@example.com");
      expect(result[1].name).toBe("JANE");
      expect(result[1].email).toBe("jane@example.com");
    });

    it("should handle missing fields in transform", () => {
      const data = [{ name: "John" }, { name: "Jane" }];

      const transforms = {
        name: (value: string) => value.toUpperCase(),
        email: (value: string) => value.toLowerCase(),
      };

      const result = transformData(data, transforms);

      expect(result[0].name).toBe("JOHN");
      expect(result[0].email).toBeUndefined();
    });

    it("should preserve original data structure", () => {
      const data = [
        { id: 1, name: "John", active: true },
        { id: 2, name: "Jane", active: false },
      ];

      const transforms = {
        name: (value: string) => value.toUpperCase(),
      };

      const result = transformData(data, transforms);

      expect(result[0].id).toBe(1);
      expect(result[0].active).toBe(true);
      expect(result[0].name).toBe("JOHN");
    });

    it("should handle transform errors gracefully", () => {
      const data = [{ value: "test" }];

      const transforms = {
        value: () => {
          throw new Error("Transform error");
        },
      };

      const result = transformData(data, transforms);

      // Should not throw, error is logged
      expect(result).toBeDefined();
    });
  });
});
