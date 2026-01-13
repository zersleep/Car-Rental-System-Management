import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, XCircle, Pencil, RefreshCw } from "lucide-react";
import { vehicleAPI } from "../../services/api";
import { useToast } from "@/lib/toastCore";

export default function VehicleManagement() {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    plate_number: "",
    brand: "",
    model: "",
    year: "",
    status: "Available",
    rental_price: "",
    image: "",
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      addToast("Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      plate_number: "",
      brand: "",
      model: "",
      year: "",
      status: "Available",
      rental_price: "",
      image: "",
    });
  };

  const handleEdit = (vehicle) => {
    setEditing(vehicle.id);
    setForm({
      plate_number: vehicle.plate_number || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      status: vehicle.status || "Available",
      rental_price: vehicle.rental_price || "",
      image: vehicle.image || "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await vehicleAPI.update(editing, form);
        addToast("Vehicle updated successfully", "success");
      } else {
        await vehicleAPI.create(form);
        addToast("Vehicle created successfully", "success");
      }
      resetForm();
      fetchVehicles();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to save vehicle", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground">Manage your vehicle fleet</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchVehicles} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => resetForm()}>
            <Plus className="w-4 h-4 mr-2" />
            New Vehicle
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Vehicle" : "Add Vehicle"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plate Number</label>
              <Input
                required
                value={form.plate_number}
                onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand</label>
              <Input
                required
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <Input
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Input
                required
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['Available', 'Reserved', 'Rented', 'Maintenance', 'Retired'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rental Price (per day)</label>
              <Input
                required
                type="number"
                step="0.01"
                value={form.rental_price}
                onChange={(e) => setForm({ ...form, rental_price: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Image URL (optional)</label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://example.com/car.jpg"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {editing ? "Update Vehicle" : "Create Vehicle"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading vehicles...</p>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No vehicles found. Add your first vehicle to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="border">
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>{vehicle.brand} {vehicle.model}</CardTitle>
                  <p className="text-sm text-muted-foreground">Plate: {vehicle.plate_number}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Year: {vehicle.year}</p>
                <p className="text-sm">Status: <span className="font-medium">{vehicle.status}</span></p>
                <p className="text-lg font-bold mt-2">${vehicle.rental_price}/day</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}