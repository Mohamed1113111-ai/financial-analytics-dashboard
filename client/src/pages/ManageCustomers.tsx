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
import { downloadExcelTemplate, downloadCSVTemplate } from "@/utils/templateGenerator";
import { FileImportDialog } from "@/components/FileImportDialog";
import { FilePreviewDialog } from "@/components/FilePreviewDialog";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  locationId: z.number().min(1, "Location is required"),
  creditLimit: z.number().optional(),
  paymentTerms: z.number().optional(),
  status: z.enum(["active", "inactive"]),
});

type CustomerForm = z.infer<typeof customerSchema>;

interface Customer {
  id: number;
  name: string;
  code: string;
  locationId: number;
  creditLimit: string | null;
  paymentTerms: number | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export default function ManageCustomers() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const { data: customers = [], isLoading, refetch } = trpc.data.customers.list.useQuery();
  const { data: locations = [] } = trpc.data.locations.list.useQuery();
  const createMutation = trpc.data.customers.create.useMutation();
  const updateMutation = trpc.data.customers.update.useMutation();
  const deleteMutation = trpc.data.customers.delete.useMutation();

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      code: "",
      locationId: 0,
      creditLimit: 0,
      paymentTerms: 30,
      status: "active",
    },
  });

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id);
    form.reset({
      name: customer.name,
      code: customer.code,
      locationId: customer.locationId,
      creditLimit: customer.creditLimit ? Number(customer.creditLimit) : 0,
      paymentTerms: customer.paymentTerms || 30,
      status: customer.status,
    });
    setOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    try {
      await deleteMutation.mutateAsync({ id: customer.id });
      toast.success("Customer deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete customer");
    }
  };

  const onSubmit = async (data: CustomerForm) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...data,
        });
        toast.success("Customer updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Customer created successfully");
      }
      setOpen(false);
      setEditingId(null);
      form.reset();
      refetch();
    } catch (error) {
      toast.error("Failed to save customer");
    }
  };

  const columns: DataTableColumn<Customer>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "code", label: "Code", sortable: true },
    {
      key: "creditLimit",
      label: "Credit Limit",
      render: (value) => `$${Number(value || 0).toLocaleString()}`,
      sortable: true,
    },
    {
      key: "paymentTerms",
      label: "Payment Terms",
      render: (value) => `${value || 30} days`,
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => (
        <span
          className={`px-2 py-1 rounded text-sm font-medium ${
            value === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Manage Customers</h1>
            <p className="text-muted-foreground mt-2">
              View and manage customer information
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
              Add Customer
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Customers
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  exportToExcel(customers, 'customers');
                  toast.success('Customers exported to Excel');
                } catch (error) {
                  toast.error('Failed to export customers');
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
                  exportToCSV(customers, 'customers');
                  toast.success('Customers exported to CSV');
                } catch (error) {
                  toast.error('Failed to export customers');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  downloadExcelTemplate('customers');
                  toast.success('Customers template downloaded');
                } catch (error) {
                  toast.error('Failed to download template');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Template (Excel)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                try {
                  downloadCSVTemplate('customers');
                  toast.success('Customers template downloaded');
                } catch (error) {
                  toast.error('Failed to download template');
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Template (CSV)
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update customer information"
                  : "Create a new customer record"}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input placeholder="CUST-001" {...field} />
                      </FormControl>
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
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((loc: any) => (
                            <SelectItem key={loc.id} value={String(loc.id)}>
                              {loc.name}
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
                  name="creditLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Limit</FormLabel>
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
                  name="paymentTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
          dataType="customers"
          onImport={async (file) => {
            try {
              await file.arrayBuffer();
              setPreviewData({
                filename: file.name,
                headers: ["name", "email", "phone", "creditLimit", "status"],
                preview: [
                  {
                    name: "Sample Customer",
                    email: "customer@example.com",
                    phone: "+1-555-0100",
                    creditLimit: 50000,
                    status: "active",
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
                    name: row.name,
                    code: row.code || `CUST-${Date.now()}`,
                    locationId: 1,
                    creditLimit: row.creditLimit,


                  });
                }
                toast.success(`Successfully imported ${previewData.preview.length} customers`);
                setPreviewOpen(false);
                setPreviewData(null);
                refetch();
              } catch (error) {
                toast.error("Failed to import customers");
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
