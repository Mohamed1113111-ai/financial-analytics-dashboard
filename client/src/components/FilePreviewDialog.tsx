import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
  headers: string[];
  preview: Record<string, any>[];
  errors: string[];
  warnings: string[];
  onConfirm: (mappings?: Record<string, string>) => void;
  isLoading?: boolean;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  filename,
  headers,
  preview,
  errors,
  warnings,
  onConfirm,
  isLoading = false,
}: FilePreviewDialogProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [showMappings, setShowMappings] = useState(false);

  const expectedFields: Record<string, string[]> = {
    customers: ["name", "email", "phone", "creditLimit", "status"],
    locations: ["name", "code", "region", "country", "status"],
    arRecords: ["customerId", "locationId", "invoiceNumber", "amount", "daysOutstanding"],
    budgets: ["locationId", "category", "amount", "period"],
  };

  const handleMapping = (sourceField: string, targetField: string) => {
    setMappings((prev) => {
      const newMappings = { ...prev };
      if (targetField === "__skip__") {
        delete newMappings[sourceField];
      } else {
        newMappings[sourceField] = targetField;
      }
      return newMappings;
    });
  };

  const handleConfirm = () => {
    onConfirm(Object.keys(mappings).length > 0 ? mappings : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {filename}</DialogTitle>
          <DialogDescription>
            Review the data before importing. {preview.length} rows will be imported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Errors */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="font-medium mb-1">Errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, idx) => (
                    <li key={idx} className="text-sm">
                      {error}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="font-medium mb-1">Warnings:</div>
                <ul className="list-disc list-inside space-y-1">
                  {warnings.map((warning, idx) => (
                    <li key={idx} className="text-sm">
                      {warning}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Data Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Data Preview</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMappings(!showMappings)}
              >
                {showMappings ? "Hide" : "Show"} Field Mapping
              </Button>
            </div>

            {/* Field Mapping */}
            {showMappings && headers.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <p className="text-sm font-medium text-gray-700">Map file columns to database fields:</p>
                {headers.map((header) => (
                  <div key={header} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 min-w-[150px]">{header}</span>
                    <span className="text-gray-400">→</span>
                    <Select
                      value={mappings[header] || ""}
                      onValueChange={(value) => handleMapping(header, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select target field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__skip__">Skip this column</SelectItem>
                        {headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Table Preview */}
            {preview.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      {headers.map((header) => (
                        <TableHead key={header} className="min-w-[150px]">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-gray-500">{idx + 1}</TableCell>
                        {headers.map((header) => (
                          <TableCell key={`${idx}-${header}`} className="text-sm">
                            {row[header] !== undefined && row[header] !== null
                              ? String(row[header]).substring(0, 50)
                              : "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No data to preview
              </div>
            )}
          </div>

          {/* Summary */}
          {errors.length === 0 && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File is valid and ready to import. {preview.length} rows will be imported.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading || errors.length > 0}
              className="flex-1"
            >
              {isLoading ? "Importing..." : "Import Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
