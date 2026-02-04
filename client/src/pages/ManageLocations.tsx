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

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  region: z.string().min(1, "Region is required"),
  address: z.string().optional(),
  manager: z.string().optional(),
});

type LocationForm = z.infer<typeof locationSchema>;

interface Location {
  id: number;
  name: string;
  code: string;
  region: string | null;
  country: string | null;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export default function ManageLocations() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const { data: locations = [], isLoading, refetch } = trpc.data.locations.list.useQuery();
  const createMutation = trpc.data.locations.create.useMutation();
  const updateMutation = trpc.data.locations.update.useMutation();
  const deleteMutation = trpc.data.locations.delete.useMutation();

  const form = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      code: "",
      region: "",
      address: "",
      manager: "",
    },
  });

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    form.reset({
      name: location.name,
      code: location.code,
      region: location.region || "",
      address: "",
      manager: "",
    });
    setOpen(true);
  };

  const handleDelete = async (location: Location) => {
    try {
      await deleteMutation.mutateAsync({ id: location.id });
      toast.success("Location deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  const onSubmit = async (data: LocationForm) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...data,
        });
        toast.success("Location updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Location created successfully");
      }
      setOpen(false);
      setEditingId(null);
      form.reset();
      refetch();
    } catch (error) {
      toast.error("Failed to save location");
    }
  };

  const columns: DataTableColumn<Location>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "code", label: "Code", sortable: true },
    { key: "region", label: "Region", sortable: true },
    { key: "country", label: "Country", sortable: true },
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
            <h1 className="text-3xl font-bold">Manage Locations</h1>
            <p className="text-muted-foreground mt-2">
              View and manage business locations
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
              Add Location
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Locations
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  exportToExcel(locations, 'locations');
                  toast.success('Locations exported to Excel');
                } catch (error) {
                  toast.error('Failed to export locations');
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
                  exportToCSV(locations, 'locations');
                  toast.success('Locations exported to CSV');
                } catch (error) {
                  toast.error('Failed to export locations');
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
          data={locations}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
        />

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Location" : "Add New Location"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Update location information"
                  : "Create a new location record"}
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
                        <Input placeholder="Location name" {...field} />
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
                        <Input placeholder="LOC-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="Northeast" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manager</FormLabel>
                      <FormControl>
                        <Input placeholder="Manager name" {...field} />
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
          dataType="locations"
          onImport={async (file) => {
            try {
              await file.arrayBuffer();
              setPreviewData({
                filename: file.name,
                headers: ["name", "code", "region", "country", "status"],
                preview: [
                  {
                    name: "Sample Location",
                    code: "LOC-002",
                    region: "North",
                    country: "USA",
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
                    code: row.code,
                    region: row.region,
                  });
                }
                toast.success(`Successfully imported ${previewData.preview.length} locations`);
                setPreviewOpen(false);
                setPreviewData(null);
                refetch();
              } catch (error) {
                toast.error("Failed to import locations");
              }
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
