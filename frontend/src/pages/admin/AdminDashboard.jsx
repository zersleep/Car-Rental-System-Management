import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { dashboardAPI } from "@/services/api";
import { Car, Calendar, Wrench, Activity, Plus, RefreshCw, ArrowRight } from "lucide-react";
import { useToast } from "@/lib/toastCore";

const StatCard = ({ title, value, icon: Icon, description, color = "blue" }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-${color}-600`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-blue-100 text-blue-800",
    CheckedOut: "bg-purple-100 text-purple-800",
    Returned: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
    Expired: "bg-gray-100 text-gray-800",
  };
  return (
    <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
      {status}
    </Badge>
  );
};

export default function AdminDashboard() {
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

  if (!data?.summary) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground mb-4">
            Please seed the database to see dashboard data.
          </p>
          <Button onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { summary, recent_bookings, vehicle_status } = data;

  const stats = [
    {
      title: "Total Vehicles",
      value: summary.total_vehicles ?? "—",
      icon: Car,
      description: `${summary.available_vehicles ?? 0} available`,
      color: "blue",
    },
    {
      title: "Total Bookings",
      value: summary.total_bookings ?? "—",
      icon: Calendar,
      description: `${summary.active_rentals ?? 0} active rentals`,
      color: "green",
    },
    {
      title: "Available Vehicles",
      value: summary.available_vehicles ?? "—",
      icon: Activity,
      description: "Ready to be rented",
      color: "green",
    },
    {
      title: "Active Rentals",
      value: summary.active_rentals ?? "—",
      icon: Wrench,
      description: "Currently out with customers",
      color: "purple",
    },
  ];

  const statusMap = vehicle_status?.reduce((acc, item) => {
    acc[item.status] = item.total;
    return acc;
  }, {}) || {};

  const statusRows = [
    { label: "Available", value: statusMap.Available || 0, color: "text-green-600" },
    { label: "Rented", value: statusMap.Rented || 0, color: "text-red-600" },
    { label: "Maintenance", value: statusMap.Maintenance || 0, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your car rental business
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/admin/vehicles">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/bookings">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recent_bookings?.length ? (
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
                    </tr>
                  </thead>
                  <tbody>
                    {recent_bookings.map((b) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent bookings.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusRows.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className={`text-lg font-semibold ${s.color}`}>{s.value}</span>
              </div>
            ))}
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/vehicles">Manage Vehicles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
