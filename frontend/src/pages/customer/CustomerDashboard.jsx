import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { dashboardAPI, bookingAPI } from "@/services/api";
import { RefreshCw, Car, Calendar, XCircle, ArrowRight } from "lucide-react";
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

const Table = ({ title, columns, rows, rowKey, onCancel }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  {columns.map((c) => (
                    <th key={c.key} className="py-2 pr-4">
                      {c.label}
                    </th>
                  ))}
                  {onCancel && <th className="py-2 pr-4">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[rowKey]} className="border-b last:border-0 hover:bg-muted/50">
                    {columns.map((c) => (
                      <td key={c.key} className="py-2 pr-4">
                        {c.render ? c.render(r) : r[c.key]}
                      </td>
                    ))}
                    {onCancel && r.status === "Pending" && (
                      <td className="py-2 pr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancel(r.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No records.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default function CustomerDashboard() {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchData = () => {
    setLoading(true);
    dashboardAPI
      .get()
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        addToast("Failed to load dashboard data", "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setCancelling(true);
    try {
      await bookingAPI.cancel(bookingId);
      addToast("Booking cancelled successfully", "success");
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data || data.role !== "Customer") {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">
            {!data ? "Failed to load dashboard data." : "You don't have access to this dashboard."}
          </p>
          <Button onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const active = data.active_booking;
  const history = data.booking_history || [];

  const historyColumns = [
    { key: "id", label: "Booking ID" },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (r) =>
        r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : "N/A",
    },
    { key: "start_date", label: "Pickup" },
    { key: "end_date", label: "Return" },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">
            Your bookings and quick actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/cars">
              <Car className="w-4 h-4 mr-2" />
              Book a Car
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Active Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          {active ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="text-lg font-semibold">
                    {active.vehicle
                      ? `${active.vehicle.brand} ${active.vehicle.model}`
                      : "Vehicle"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Pickup: {active.start_date}</div>
                    <div>Return: {active.end_date}</div>
                  </div>
                </div>
                <StatusBadge status={active.status} />
              </div>
              {active.status === "Pending" && (
                <Button
                  variant="outline"
                  onClick={() => handleCancel(active.id)}
                  disabled={cancelling}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                You have no active booking. Book a car to get started.
              </p>
              <Button asChild>
                <Link to="/cars">
                  Browse Vehicles <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Table
        title="Booking History (Last 5)"
        columns={historyColumns}
        rows={history}
        rowKey="id"
        onCancel={handleCancel}
      />
    </div>
  );
}
