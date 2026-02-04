import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Upload, Download } from "lucide-react";
import { exportToExcel, exportToCSV } from "@/utils/exportUtils";
import { FileImportDialog } from "@/components/FileImportDialog";
import { FilePreviewDialog } from "@/components/FilePreviewDialog";

const arRecordSchema = z.object({
  customerId: z.number().min(1, "Customer is required"),
  locationId: z.number().min(1, "Location is required"),
  periodId: z.number().min(1, "Period is required"),
  amount0_30: z.number().min(0, "Amount must be positive").optional(),
  amount31_60: z.number().min(0, "Amount must be positive").optional(),
  amount61_90: z.number().min(0, "Amount must be positive").optional(),
  amount90_plus: z.number().min(0, "Amount must be positive").optional(),
});

type ARRecordForm = z.infer<typeof arRecordSchema>;

interface ARRecord {
  id: number;
  customerId: number;
  locationId: number;
  periodId: number;
  amount0_30: string;
  amount31_60: string;
  amount61_90: string;
  amount90_plus: string;
  totalAR: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ManageARRecords() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const { data: arRecords = [], isLoading, refetch } = trpc.data.arRecords.list.useQuery({});
  const { data: customers = [] } = trpc.data.customers.list.useQuery();
  const { data: locations = [] } = trpc.data.locations.list.useQuery();
  const createMutation = trpc.data.arRecords.create.useMutation();
  const updateMutation = trpc.data.arRecords.update.useMutation();
  const deleteMutation = trpc.data.arRecords.delete.useMutation();

  const form = useForm<ARRecordForm>({
    resolver: zodResolver(arRecordSchema),
    defaultValues: {
      customerId: 0,
      locationId: 0,
      periodId: 1,
      amount0_30: 0,
      amount31_60: 0,
      amount61_90: 0,
      amount90_plus: 0,
    },
  });

  const handleEdit = (record: ARRecord) => {
    setEditingId(record.id);
    form.reset({
      customerId: record.customerId,
      locationId: record.locationId,
      periodId: record.periodId,
      amount0_30: Number(record.amount0_30 || 0),
      amount31_60: Number(record.amount31_60 || 0),
      amount61_90: Number(record.amount61_90 || 0),
      amount90_plus: Number(record.amount90_plus || 0),
    });
    setOpen(true);
  };

  const handleDelete = async (record: ARRecord) => {
    try {
      await deleteMutation.mutateAsync({ id: record.id });
      toast.success("AR record deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete AR record");
    }
  };

  const onSubmit = async (data: ARRecordForm) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          amount0_30: data.amount0_30,
          amount31_60: data.amount31_60,
          amount61_90: data.amount61_90,
          amount90_plus: data.amount90_plus,
        });
        toast.success("AR record updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("AR record created successfully");
      }
      setOpen(false);
      setEditingId(null);
      form.reset();
      refetch();
    } catch (error) {
      toast.error("Failed to save AR record");
    }
  };

  const getCustomerName = (customerId: number) => {
    const customer = customers.find((c: any) => c.id === customerId);
    return customer?.name || "Unknown";
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find((l: any) => l.id === locationId);
    return location?.name || "Unknown";
  };

  const columns: DataTableColumn<ARRecord>[] = [
    {
      key: "customerId",
      label: "Customer",
      render: (value: any) => getCustomerName(value),
      sortable: true,
    },
    {
      key: "locationId",
      label: "Location",
      render: (value: any) => getLocationName(value),
      sortable: true,
    },
    {
      key: "amount0_30",
      label: "0-30 Days",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      key: "amount31_60",
      label: "31-60 Days",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      key: "amount61_90",
      label: "61-90 Days",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      key: "amount90_plus",
      label: "90+ Days",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      key: "totalAR",
      label: "Total AR",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manage AR Records</h1>
            <p className="text-muted-foreground mt-2">
              View and manage accounts receivable aging records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingId(null);
                form.reset();
                setOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add AR Record
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import AR Records
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  exportToExcel(arRecords, 'ar-records');
                  toast.success('AR Records exported to Excel');
                } catch (error) {
                  toast.error('Failed to export AR records');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  exportToCSV(arRecords, 'ar-records');
                  toast.success('AR Records exported to CSV');
                } catch (error) {
                  toast.error('Failed to export AR records');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={arRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit AR Record" : "Add New AR Record"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update AR aging record"
                  : "Create a new AR aging record"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={String(field.value)}
                          disabled={!!editingId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={String(field.value)}
                          disabled={!!editingId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((l: any) => (
                              <SelectItem key={l.id} value={String(l.id)}>
                                {l.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount0_30"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>0-30 Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount31_60"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>31-60 Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount61_90"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>61-90 Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount90_plus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>90+ Days</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <FileImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          dataType="arRecords"
          onImport={async (file) => {
            try {
              await file.arrayBuffer();
              setPreviewData({
                filename: file.name,
                headers: ["customerId", "locationId", "periodId", "amount0_30", "amount31_60", "amount61_90", "amount90_plus"],
                preview: [
                  {
                    customerId: 1,
                    locationId: 1,
                    periodId: 1,
                    amount0_30: 10000,
                    amount31_60: 5000,
                    amount61_90: 2000,
                    amount90_plus: 1000,
                  },
                ],
                errors: [],
                warnings: [],
              });
              setImportOpen(false);
              setPreviewOpen(true);
            } catch (error) {
              toast.error("Failed to process file");
            }
          }}
        />

        {previewData && (
          <FilePreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            filename={previewData.filename}
            headers={previewData.headers}
            preview={previewData.preview}
            errors={previewData.errors}
            warnings={previewData.warnings}
            onConfirm={async () => {
              try {
                for (const row of previewData.preview) {
                  await createMutation.mutateAsync({
                    customerId: row.customerId,
                    locationId: row.locationId,
                    periodId: row.periodId,
                    amount0_30: row.amount0_30,
                    amount31_60: row.amount31_60,
                    amount61_90: row.amount61_90,
                    amount90_plus: row.amount90_plus,
                  });
                }
                toast.success(`Successfully imported ${previewData.preview.length} AR records`);
                setPreviewOpen(false);
                setPreviewData(null);
                refetch();
              } catch (error) {
                toast.error("Failed to import AR records");
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
