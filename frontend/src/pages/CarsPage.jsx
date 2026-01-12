import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Car,
    CheckCircle2,
    ArrowRight,
    Search,
    Calendar,
    MapPin,
    Filter,
} from "lucide-react";
import { vehicleAPI } from "@/services/api";
import { useToast } from "@/lib/toastCore";

export default function CarsPage() {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
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

    const getStatusColor = (status) => {
        switch (status) {
            case "Available":
                return "bg-green-100 text-green-800 border-green-200";
            case "Reserved":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Rented":
                return "bg-red-100 text-red-800 border-red-200";
            case "Maintenance":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "Retired":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesSearch =
            vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || vehicle.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleRentNow = (vehicle) => {
        if (vehicle.status === "Available") {
            navigate(`/checkout/${vehicle.id}`);
        } else {
            addToast("This vehicle is not available for rent", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 pt-20">
                <div className="container mx-auto px-4 py-20">
                    <div className="flex items-center justify-center">
                        <p className="text-gray-600">Loading vehicles...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50 pt-20">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Car className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold tracking-tight text-blue-600">
                            CarRental
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link to="/" className="hover:text-blue-600 transition-colors text-gray-700">
                            Home
                        </Link>
                        <Link
                            to="/cars"
                            className="text-blue-600 font-semibold"
                        >
                            Cars
                        </Link>
                        <a
                            href="#about"
                            className="hover:text-blue-600 transition-colors text-gray-700"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = "/#about";
                            }}
                        >
                            About
                        </a>
                        <a
                            href="#contact"
                            className="hover:text-blue-600 transition-colors text-gray-700"
                            onClick={(e) => {
                                e.preventDefault();
                                window.location.href = "/#contact";
                            }}
                        >
                            Contact
                        </a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-800 mb-2">
                        Our Vehicle Fleet
                    </h1>
                    <p className="text-gray-600">
                        Browse our complete collection of vehicles
                    </p>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by brand, model, or plate number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-gray-200"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("all")}
                                className={statusFilter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                                All
                            </Button>
                            <Button
                                variant={statusFilter === "Available" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("Available")}
                                className={statusFilter === "Available" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                Available
                            </Button>
                            <Button
                                variant={statusFilter === "Reserved" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("Reserved")}
                                className={statusFilter === "Reserved" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                            >
                                Reserved
                            </Button>
                            <Button
                                variant={statusFilter === "Rented" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("Rented")}
                                className={statusFilter === "Rented" ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                                Unavailable
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Vehicles Grid */}
                {filteredVehicles.length === 0 ? (
                    <div className="text-center py-20">
                        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg">
                            No vehicles found matching your criteria
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredVehicles.map((vehicle) => (
                            <Card
                                key={vehicle.id}
                                className="overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all group"
                            >
                                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                    {vehicle.image ? (
                                        <img
                                            src={vehicle.image}
                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Car className="w-24 h-24 text-gray-300" />
                                        </div>
                                    )}
                                    <Badge
                                        className={`absolute top-4 left-4 border ${getStatusColor(
                                            vehicle.status
                                        )}`}
                                    >
                                        {vehicle.status}
                                    </Badge>
                                </div>
                                <CardHeader className="pb-3">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-bold text-gray-900">
                                            {vehicle.brand} {vehicle.model}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500">
                                            {vehicle.year} • {vehicle.plate_number}
                                        </p>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <span>Year: {vehicle.year}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <span>Plate: {vehicle.plate_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <span>Status: {vehicle.status}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center border-t border-gray-100 pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-gray-900">
                                            ${vehicle.rental_price}
                                        </span>
                                        <span className="text-sm text-gray-500">/ day</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                        onClick={() => handleRentNow(vehicle)}
                                        disabled={vehicle.status !== "Available"}
                                    >
                                        {vehicle.status === "Available" ? (
                                            <>
                                                Rent now
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        ) : (
                                            "Not Available"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
