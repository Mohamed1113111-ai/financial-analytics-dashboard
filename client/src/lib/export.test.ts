import { describe, expect, it, vi } from "vitest";
import {
  formatCurrencyForExport,
  formatPercentageForExport,
  copyToClipboard,
} from "./export";

describe("export utilities", () => {
  describe("formatCurrencyForExport", () => {
    it("should format number as currency", () => {
      const result = formatCurrencyForExport(1234.56);
      expect(result).toContain("1,234.56");
    });

    it("should format large numbers with commas", () => {
      const result = formatCurrencyForExport(1000000);
      expect(result).toContain("1,000,000");
    });

    it("should handle string input", () => {
      const result = formatCurrencyForExport("$1,000");
      expect(result).toBe("$1,000");
    });

    it("should handle zero", () => {
      const result = formatCurrencyForExport(0);
      expect(result).toContain("0.00");
    });

    it("should handle negative numbers", () => {
      const result = formatCurrencyForExport(-1234.56);
      expect(result).toContain("1,234.56");
    });
  });

  describe("formatPercentageForExport", () => {
    it("should format decimal as percentage", () => {
      const result = formatPercentageForExport(0.42);
      expect(result).toBe("42.00%");
    });

    it("should format zero percentage", () => {
      const result = formatPercentageForExport(0);
      expect(result).toBe("0.00%");
    });

    it("should format 100 percent", () => {
      const result = formatPercentageForExport(1);
      expect(result).toBe("100.00%");
    });

    it("should handle small decimals", () => {
      const result = formatPercentageForExport(0.001);
      expect(result).toBe("0.10%");
    });
  });

  describe("copyToClipboard", () => {
    it("should copy text to clipboard", async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const result = await copyToClipboard("test text");
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith("test text");
    });

    it("should handle clipboard errors", async () => {
      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard error")),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const result = await copyToClipboard("test text");
      expect(result).toBe(false);
    });
  });
});
