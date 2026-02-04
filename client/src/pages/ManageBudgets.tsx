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

const budgetSchema = z.object({
  locationId: z.number().min(1, "Location is required"),
  periodId: z.number().min(1, "Period is required"),
  accountId: z.number().min(1, "Account is required"),
  budgetAmount: z.number().min(0, "Amount must be positive"),
});

type BudgetForm = z.infer<typeof budgetSchema>;

interface Budget {
  id: number;
  locationId: number;
  periodId: number;
  accountId: number;
  budgetedAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function ManageBudgets() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const { data: budgets = [], isLoading, refetch } = trpc.data.budgets.list.useQuery({});
  const { data: locations = [] } = trpc.data.locations.list.useQuery();
  const createMutation = trpc.data.budgets.create.useMutation();
  const updateMutation = trpc.data.budgets.update.useMutation();
  const deleteMutation = trpc.data.budgets.delete.useMutation();

  const form = useForm<BudgetForm>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      locationId: 0,
      periodId: 1,
      accountId: 0,
      budgetAmount: 0,
    },
  });

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    form.reset({
      locationId: budget.locationId,
      periodId: budget.periodId,
      accountId: budget.accountId,
      budgetAmount: Number(budget.budgetedAmount || 0),
    });
    setOpen(true);
  };

  const handleDelete = async (budget: Budget) => {
    try {
      await deleteMutation.mutateAsync({ id: budget.id });
      toast.success("Budget deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  const onSubmit = async (data: BudgetForm) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          budgetAmount: data.budgetAmount,
        });
        toast.success("Budget updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Budget created successfully");
      }
      setOpen(false);
      setEditingId(null);
      form.reset();
      refetch();
    } catch (error) {
      toast.error("Failed to save budget");
    }
  };

  const getLocationName = (locationId: number) => {
    const location = locations.find((l: any) => l.id === locationId);
    return location?.name || "Unknown";
  };

  const columns: DataTableColumn<Budget>[] = [
    {
      key: "locationId",
      label: "Location",
      render: (value: any) => getLocationName(value),
      sortable: true,
    },
    {
      key: "periodId",
      label: "Period ID",
      sortable: true,
    },
    {
      key: "accountId",
      label: "Account ID",
      sortable: true,
    },
    {
      key: "budgetedAmount",
      label: "Budget Amount",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manage Budgets</h1>
            <p className="text-muted-foreground mt-2">
              View and manage budget allocations
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
              Add Budget
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Budgets
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  exportToExcel(budgets, 'budgets');
                  toast.success('Budgets exported to Excel');
                } catch (error) {
                  toast.error('Failed to export budgets');
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
                  exportToCSV(budgets, 'budgets');
                  toast.success('Budgets exported to CSV');
                } catch (error) {
                  toast.error('Failed to export budgets');
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
          data={budgets}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Budget" : "Add New Budget"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update budget information"
                  : "Create a new budget record"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="periodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={!!editingId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account ID</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={!!editingId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budgetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Amount</FormLabel>
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
          dataType="budgets"
          onImport={async (file) => {
            try {
              await file.arrayBuffer();
              setPreviewData({
                filename: file.name,
                headers: ["locationId", "periodId", "accountId", "budgetAmount"],
                preview: [
                  {
                    locationId: 1,
                    periodId: 1,
                    accountId: 1,
                    budgetAmount: 50000,
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
                    locationId: row.locationId,
                    periodId: row.periodId,
                    accountId: row.accountId,
                    budgetAmount: row.budgetAmount,
                  });
                }
                toast.success(`Successfully imported ${previewData.preview.length} budgets`);
                setPreviewOpen(false);
                setPreviewData(null);
                refetch();
              } catch (error) {
                toast.error("Failed to import budgets");
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
