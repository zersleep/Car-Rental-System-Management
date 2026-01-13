import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { dashboardAPI, bookingAPI, rentalAPI } from "@/services/api";
import { RefreshCw, CheckCircle2, Car, XCircle, Calendar } from "lucide-react";
import { useToast } from "@/lib/toastCore";

const StatCard = ({ title, value }) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    CheckedOut: "bg-purple-100 text-purple-800 border-purple-200",
    Returned: "bg-green-100 text-green-800 border-green-200",
    Cancelled: "bg-red-100 text-red-800 border-red-200",
    Active: "bg-green-100 text-green-800 border-green-200",
  };
  return (
    <Badge className={`border ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </Badge>
  );
};

const Table = ({ title, columns, rows, rowKey, onAction }) => {
  const { addToast } = useToast();
  const [actionLoading, setActionLoading] = useState({});

  const handleAction = async (action, id, bookingId) => {
    setActionLoading({ ...actionLoading, [id]: true });
    try {
      if (action === "approve") {
        await bookingAPI.approve(bookingId || id);
        addToast("Booking approved successfully", "success");
      } else if (action === "checkout") {
        await rentalAPI.checkout(bookingId || id);
        addToast("Vehicle checked out successfully", "success");
      } else if (action === "return") {
        await rentalAPI.returnVehicle(id);
        addToast("Vehicle returned successfully", "success");
      }
      if (onAction) onAction();
    } catch (error) {
      addToast(error.response?.data?.message || "Action failed", "error");
    } finally {
      setActionLoading({ ...actionLoading, [id]: false });
    }
  };

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
                  <th className="py-2 pr-4">Actions</th>
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
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        {r.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("approve", r.id, r.id)}
                            disabled={actionLoading[r.id]}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {(r.status === "Pending" || r.status === "Confirmed") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("checkout", r.id, r.id)}
                            disabled={actionLoading[r.id]}
                          >
                            <Car className="w-3 h-3 mr-1" />
                            Check Out
                          </Button>
                        )}
                        {r.status === "Active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction("return", r.id)}
                            disabled={actionLoading[r.id]}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Return
                          </Button>
                        )}
                      </div>
                    </td>
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

export default function StaffDashboard() {
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const interval = setInterval(fetchData, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

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

  if (!data || data.role !== "Staff") {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
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

  const pickups = data.today_pickups || [];
  const returns = data.today_returns || [];
  const overdue = data.overdue_rentals || [];
  const counts = data.counts || {};

  const columnsPickups = [
    { key: "id", label: "Booking ID" },
    {
      key: "customer",
      label: "Customer",
      render: (r) => r.customer?.full_name || "N/A",
    },
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

  const columnsReturns = [
    { key: "id", label: "Rental ID" },
    { key: "booking_id", label: "Booking ID" },
    {
      key: "customer",
      label: "Customer",
      render: (r) => r.booking?.customer?.full_name || "N/A",
    },
    {
      key: "vehicle",
      label: "Vehicle",
      render: (r) =>
        r.booking?.vehicle
          ? `${r.booking.vehicle.brand} ${r.booking.vehicle.model}`
          : "N/A",
    },
    {
      key: "due",
      label: "Due Date",
      render: (r) => r.booking?.end_date || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <StatusBadge status={r.status} />,
    },
  ];

  const columnsOverdue = columnsReturns;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            Today's operational tasks — pickups, returns, and overdue rentals.
          </p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Today's Pickups" value={counts.today_pickups ?? 0} />
        <StatCard title="Today's Returns" value={counts.today_returns ?? 0} />
        <StatCard title="Overdue Rentals" value={counts.overdue_rentals ?? 0} />
      </div>

      <div className="space-y-6">
        <Table
          title="Today's Pickups"
          columns={columnsPickups}
          rows={pickups}
          rowKey="id"
          onAction={fetchData}
        />

        <Table
          title="Today's Returns"
          columns={columnsReturns}
          rows={returns}
          rowKey="id"
          onAction={fetchData}
        />

        <Table
          title="Overdue Rentals"
          columns={columnsOverdue}
          rows={overdue}
          rowKey="id"
          onAction={fetchData}
        />
      </div>
    </div>
  );
}
