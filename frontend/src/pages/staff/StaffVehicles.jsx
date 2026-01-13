import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { vehicleAPI } from "@/services/api";
import { useToast } from "@/lib/toastCore";
import { RefreshCw, Search, Wrench, CheckCircle2, Car } from "lucide-react";

const StatusBadge = ({ status }) => {
    const colors = {
        Available: "bg-green-100 text-green-800 border-green-200",
        Reserved: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Rented: "bg-red-100 text-red-800 border-red-200",
        Maintenance: "bg-orange-100 text-orange-800 border-orange-200",
        Retired: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
        <Badge className={`border ${colors[status] || "bg-gray-100 text-gray-800"}`}>
            {status}
        </Badge>
    );
};

export default function StaffVehicles() {
    const { addToast } = useToast();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await vehicleAPI.getAll();
            setVehicles(res.data || []);
        } catch (err) {
            console.error(err);
            addToast("Failed to load vehicles", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const updateStatus = async (vehicle, status) => {
        setSavingId(vehicle.id);
        try {
            await vehicleAPI.update(vehicle.id, { status });
            addToast(`Vehicle set to ${status}`, "success");
            fetchVehicles();
        } catch (err) {
            addToast(err.response?.data?.message || "Failed to update status", "error");
        } finally {
            setSavingId(null);
        }
    };

    const filteredVehicles = vehicles.filter((v) => {
        const matchesSearch =
            v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.plate_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || v.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehicle Status</h1>
                    <p className="text-muted-foreground">
                        Quickly mark cars as available or under maintenance.
                    </p>
                </div>
                <Button variant="outline" onClick={fetchVehicles} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by brand, model, or plate number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {["all", "Available", "Reserved", "Rented", "Maintenance"].map((s) => (
                                <Button
                                    key={s}
                                    variant={statusFilter === s ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(s)}
                                >
                                    {s === "all" ? "All" : s}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <p>Loading vehicles...</p>
            ) : filteredVehicles.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            No vehicles found. Try adjusting your filters.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicles ({filteredVehicles.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="py-2 pr-4">Plate</th>
                                        <th className="py-2 pr-4">Vehicle</th>
                                        <th className="py-2 pr-4">Year</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Price / day</th>
                                        <th className="py-2 pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVehicles.map((v) => (
                                        <tr
                                            key={v.id}
                                            className="border-b last:border-0 hover:bg-muted/50"
                                        >
                                            <td className="py-2 pr-4 font-medium">{v.plate_number}</td>
                                            <td className="py-2 pr-4">
                                                {v.brand} {v.model}
                                            </td>
                                            <td className="py-2 pr-4">{v.year}</td>
                                            <td className="py-2 pr-4">
                                                <StatusBadge status={v.status} />
                                            </td>
                                            <td className="py-2 pr-4">${v.rental_price}</td>
                                            <td className="py-2 pr-4">
                                                <div className="flex gap-2">
                                                    {v.status !== "Maintenance" && v.status !== "Rented" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateStatus(v, "Maintenance")}
                                                            disabled={savingId === v.id}
                                                        >
                                                            <Wrench className="w-3 h-3 mr-1" />
                                                            Maintenance
                                                        </Button>
                                                    )}
                                                    {v.status === "Maintenance" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => updateStatus(v, "Available")}
                                                            disabled={savingId === v.id}
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Available
                                                        </Button>
                                                    )}
                                                    {v.status === "Rented" && (
                                                        <Button size="sm" variant="ghost" disabled>
                                                            <Car className="w-3 h-3 mr-1" />
                                                            Rented
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

