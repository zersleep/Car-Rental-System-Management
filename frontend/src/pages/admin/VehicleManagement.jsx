import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Save, XCircle, Pencil, RefreshCw, Search, Car } from "lucide-react";
import { vehicleAPI } from "../../services/api";
import { useToast } from "@/lib/toastCore";

export default function VehicleManagement() {
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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
      setFilteredVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      addToast("Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVehicles(vehicles);
    } else {
      const filtered = vehicles.filter((vehicle) => {
        const search = searchTerm.toLowerCase();
        return (
          vehicle.brand?.toLowerCase().includes(search) ||
          vehicle.model?.toLowerCase().includes(search) ||
          vehicle.plate_number?.toLowerCase().includes(search) ||
          vehicle.year?.toString().includes(search) ||
          vehicle.status?.toLowerCase().includes(search)
        );
      });
      setFilteredVehicles(filtered);
    }
  }, [searchTerm, vehicles]);

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
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {['Available', 'Reserved', 'Rented', 'Maintenance', 'Retired'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle List</CardTitle>
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by brand, model, plate, year, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No vehicles match your search." : "No vehicles found. Add your first vehicle to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="border hover:shadow-md transition-shadow">
                  <div className="relative">
                    {vehicle.image ? (
                      <img
                        src={vehicle.image}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="w-full h-32 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-32 bg-gray-100 rounded-t-lg flex items-center justify-center ${vehicle.image ? 'hidden' : ''}`}
                    >
                      <Car className="w-12 h-12 text-gray-400" />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </div>
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight">
                        {vehicle.brand} {vehicle.model}
                      </h3>
                      <p className="text-xs text-muted-foreground">Plate: {vehicle.plate_number}</p>
                      <p className="text-xs text-muted-foreground">Year: {vehicle.year}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${vehicle.status === 'Available' ? 'bg-green-100 text-green-800' :
                          vehicle.status === 'Reserved' ? 'bg-blue-100 text-blue-800' :
                            vehicle.status === 'Rented' ? 'bg-purple-100 text-purple-800' :
                              vehicle.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                          }`}>
                          {vehicle.status}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          ${parseFloat(vehicle.rental_price || 0).toFixed(2)}/day
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}