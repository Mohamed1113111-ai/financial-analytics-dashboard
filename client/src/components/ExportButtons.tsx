import React, { useState } from "react";
import { FileDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { toast } from "sonner";

interface ExportButtonsProps {
  filename: string;
  title: string;
  subtitle?: string;
  elementId?: string;
  data?: Record<string, any>[];
  columns?: { key: string; label: string }[];
}

export function ExportButtons({
  filename,
  title,
  subtitle,
  elementId,
  data,
  columns,
}: ExportButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExportExcel = async () => {
    if (!data || !columns) {
      toast.error("No data available for export");
      return;
    }

    setIsLoading(true);
    try {
      await exportToExcel(data, columns, {
        filename,
        title,
        subtitle,
        date: new Date(),
      });
      toast.success("Excel file downloaded successfully");
    } catch (error) {
      toast.error("Failed to export to Excel");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!elementId) {
      toast.error("No element specified for PDF export");
      return;
    }

    setIsLoading(true);
    try {
      await exportToPDF(elementId, {
        filename,
        title,
        subtitle,
        date: new Date(),
      });
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to export to PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="gap-2"
        >
          <FileDown className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {data && columns && (
          <DropdownMenuItem onClick={handleExportExcel} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export to Excel
          </DropdownMenuItem>
        )}
        {elementId && (
          <DropdownMenuItem onClick={handleExportPDF} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            Export to PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
