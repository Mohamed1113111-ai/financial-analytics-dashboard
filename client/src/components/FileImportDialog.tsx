import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle2, Upload, FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dataType: "customers" | "locations" | "arRecords" | "budgets";
  onImport: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export function FileImportDialog({
  open,
  onOpenChange,
  dataType,
  onImport,
  isLoading = false,
}: FileImportDialogProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = [".xlsx", ".xls", ".csv", ".json", ".pdf"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    setError(null);
    setSuccess(false);

    // Validate file format
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
    if (!supportedFormats.includes(fileExt)) {
      setError(`Unsupported file format. Supported formats: ${supportedFormats.join(", ")}`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (10MB)`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setError(null);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await onImport(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setSuccess(false);
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setUploadProgress(0);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import {dataType.charAt(0).toUpperCase() + dataType.slice(1)}</DialogTitle>
          <DialogDescription>
            Upload a file to import data. Supported formats: Excel, CSV, JSON, PDF
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
            className={cn(
              "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleChange}
              accept={supportedFormats.join(",")}
              className="hidden"
            />

            {!selectedFile ? (
              <div className="space-y-2">
                <FileUp className="mx-auto h-8 w-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Drag and drop your file here</p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </div>
                <p className="text-xs text-gray-400">
                  Supported formats: {supportedFormats.join(", ")} (Max 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="mx-auto h-8 w-8 text-blue-500" />
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                File uploaded successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                setError(null);
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading || uploadProgress > 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>

          {/* Template Download */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Need a template?</p>
            <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:text-blue-700">
              Download {dataType} import template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
