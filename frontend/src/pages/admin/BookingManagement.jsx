import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookingAPI } from "../../services/api";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/lib/toastCore";

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    CheckedOut: "bg-purple-100 text-purple-800 border-purple-200",
    Returned: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Expired: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return (
    <Badge className={`border ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </Badge>
  );
};

export default function BookingManagement() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const exportCsv = () => {
    if (!bookings.length) {
      addToast("No bookings to export", "error");
      return;
    }

    const headers = [
      "Booking ID",
      "Customer",
      "Vehicle",
      "Status",
      "Pickup Date",
      "Return Date",
      "Total Price",
    ];

    const rows = bookings.map((b) => [
      b.id,
      b.customer?.full_name || "",
      b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "",
      b.status,
      b.start_date,
      b.end_date,
      b.total_price,
    ]);

    const escapeCell = (value) => {
      const str = String(value ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bookings-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchBookings = async () => {
    setLoading(true);
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

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage all rental bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBookings} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={!bookings.length}>
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No bookings found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-4">Booking ID</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Vehicle</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Pickup</th>
                    <th className="py-2 pr-4">Return</th>
                    <th className="py-2 pr-4">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-4 font-medium">#{b.id}</td>
                      <td className="py-2 pr-4">
                        {b.customer?.full_name || "N/A"}
                      </td>
                      <td className="py-2 pr-4">
                        {b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : "N/A"}
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-2 pr-4">{b.start_date}</td>
                      <td className="py-2 pr-4">{b.end_date}</td>
                      <td className="py-2 pr-4">${b.total_price}</td>
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