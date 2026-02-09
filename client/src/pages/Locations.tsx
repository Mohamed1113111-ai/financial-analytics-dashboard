import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface LocationFormData {
  name: string;
  code: string;
  region: string;
  country: string;
  status: "active" | "inactive";
}

export default function Locations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    name: "",
    code: "",
    region: "",
    country: "",
    status: "active",
  });

  // Fetch locations
  const { data: locations = [], isLoading, refetch } = trpc.locations.list.useQuery();

  // Mutations
  const createMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success("Location created successfully");
      setIsCreateOpen(false);
      setFormData({ name: "", code: "", region: "", country: "", status: "active" });
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const updateMutation = trpc.locations.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      setIsEditOpen(false);
      setEditingId(null);
      setFormData({ name: "", code: "", region: "", country: "", status: "active" });
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const deleteMutation = trpc.locations.delete.useMutation({
    onSuccess: () => {
      toast.success("Location deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Filter locations
  const filteredLocations = locations.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || loc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (location: any) => {
    setFormData({
      name: location.name,
      code: location.code,
      region: location.region || "",
      country: location.country || "",
      status: location.status,
    });
    setEditingId(location.id);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.code) {
      toast.error("Name and code are required");
      return;
    }
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteMutation.mutate({ id });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", code: "", region: "", country: "", status: "active" });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Locations Management</h1>
          <p className="text-gray-600 mt-1">Manage all business locations and their details</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Location Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Riyadh Head Office"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location Code *</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., RUH-HO"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Region</label>
                <Input
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="e.g., Central"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="e.g., Saudi Arabia"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Location"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations ({filteredLocations.length})</CardTitle>
          <CardDescription>
            {filteredLocations.length} of {locations.length} locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No locations found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Code</th>
                    <th className="text-left py-3 px-4 font-medium">Region</th>
                    <th className="text-left py-3 px-4 font-medium">Country</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.map((location) => (
                    <tr key={location.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{location.name}</td>
                      <td className="py-3 px-4 font-mono text-sm">{location.code}</td>
                      <td className="py-3 px-4">{location.region || "-"}</td>
                      <td className="py-3 px-4">{location.country || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={location.status === "active" ? "default" : "secondary"}>
                          {location.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(location)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(location.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Location Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location Code *</label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Region</label>
              <Input
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Country</label>
              <Input
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate} className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
