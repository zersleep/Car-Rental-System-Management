import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookingAPI } from "@/services/api";
import { useToast } from "@/lib/toastCore";
import { XCircle, RefreshCw } from "lucide-react";

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

export default function CustomerBookings() {
    const { addToast } = useToast();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState({});

    const fetchBookings = () => {
        setLoading(true);
        bookingAPI
            .getMine()
            .then((res) => setBookings(res.data || []))
            .catch((err) => {
                console.error(err);
                addToast("Failed to load bookings", "error");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (bookingId) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        setCancelling({ ...cancelling, [bookingId]: true });
        try {
            await bookingAPI.cancel(bookingId);
            addToast("Booking cancelled successfully", "success");
            fetchBookings();
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to cancel booking", "error");
        } finally {
            setCancelling({ ...cancelling, [bookingId]: false });
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
                    <p className="text-muted-foreground">
                        View and manage all your bookings
                    </p>
                </div>
                <Button variant="outline" onClick={fetchBookings} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    {bookings.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="py-2 pr-4">Booking ID</th>
                                        <th className="py-2 pr-4">Vehicle</th>
                                        <th className="py-2 pr-4">Pickup Date</th>
                                        <th className="py-2 pr-4">Return Date</th>
                                        <th className="py-2 pr-4">Status</th>
                                        <th className="py-2 pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-2 pr-4 font-medium">#{booking.id}</td>
                                            <td className="py-2 pr-4">
                                                {booking.vehicle
                                                    ? `${booking.vehicle.brand} ${booking.vehicle.model}`
                                                    : "N/A"}
                                            </td>
                                            <td className="py-2 pr-4">{booking.start_date}</td>
                                            <td className="py-2 pr-4">{booking.end_date}</td>
                                            <td className="py-2 pr-4">
                                                <StatusBadge status={booking.status} />
                                            </td>
                                            <td className="py-2 pr-4">
                                                {booking.status === "Pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={cancelling[booking.id]}
                                                    >
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No bookings found. Start by booking a vehicle!
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
