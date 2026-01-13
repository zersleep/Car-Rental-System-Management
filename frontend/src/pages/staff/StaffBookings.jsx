import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bookingAPI } from "@/services/api";
import { RefreshCw, Search, CheckCircle2, Car, XCircle } from "lucide-react";
import { useToast } from "@/lib/toastCore";

const StatusBadge = ({ status }) => {
    const colors = {
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
        CheckedOut: "bg-purple-100 text-purple-800 border-purple-200",
        Returned: "bg-green-100 text-green-800 border-green-200",
        Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
        <Badge className={`border ${colors[status] || "bg-gray-100 text-gray-800"}`}>
            {status}
        </Badge>
    );
};

export default function StaffBookings() {
    const { addToast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingAPI.getAll();
            setBookings(response.data || []);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            addToast("Failed to load bookings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action, bookingId) => {
        setActionLoading({ ...actionLoading, [bookingId]: true });
        try {
            if (action === "approve") {
                await bookingAPI.approve(bookingId);
                addToast("Booking approved successfully", "success");
            } else if (action === "cancel") {
                await bookingAPI.cancel(bookingId);
                addToast("Booking cancelled successfully", "success");
            }
            fetchBookings();
        } catch (error) {
            addToast(error.response?.data?.message || "Action failed", "error");
        } finally {
            setActionLoading({ ...actionLoading, [bookingId]: false });
        }
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.vehicle?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.id?.toString().includes(searchTerm);
        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Loading bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
                    <p className="text-muted-foreground">View and manage all rental bookings</p>
                </div>
                <Button variant="outline" onClick={fetchBookings} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Search by customer, vehicle, or booking ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            {['all', 'Pending', 'Confirmed', 'CheckedOut', 'Returned', 'Cancelled'].map((status) => (
                                <Button
                                    key={status}
                                    variant={statusFilter === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status === "all" ? "All" : status}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        Bookings ({filteredBookings.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredBookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No bookings found.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="py-2 pr-4">Booking ID</th>
                                        <th className="py-2 pr-4">Customer</th>
                                        <th className="py-2 pr-4">Vehicle</th>
                                        <th className="py-2 pr-4">Pickup Date</th>
                                        <th className="py-2 pr-4">Return Date</th>
                                        <th className="py-2 pr-4">Total Price</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-2 pr-4 font-medium">#{booking.id}</td>
                                            <td className="py-2 pr-4">{booking.customer?.full_name || "N/A"}</td>
                                            <td className="py-2 pr-4">
                                                {booking.vehicle
                                                    ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                                                    : "N/A"}
                                            </td>
                                            <td className="py-2 pr-4">{booking.start_date || "—"}</td>
                                            <td className="py-2 pr-4">{booking.end_date || "—"}</td>
                                            <td className="py-2 pr-4">${booking.total_price || "0.00"}</td>
                                            <td className="py-2 pr-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="py-2 pr-4">
                                                <div className="flex gap-2">
                                                    {booking.status === "Pending" && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAction("approve", booking.id)}
                                                            disabled={actionLoading[booking.id]}
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Approve
                                                        </Button>
                                                    )}
                                                    {(booking.status === "Pending" || booking.status === "Confirmed") && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAction("cancel", booking.id)}
                                                            disabled={actionLoading[booking.id]}
                                                        >
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                            Cancel
                                                        </Button>
                                                    )}
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
        </div>
    );
}
