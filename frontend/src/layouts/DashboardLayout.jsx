import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Car,
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { authAPI } from "../services/api";
import { useToast } from "@/lib/toastCore";

export default function DashboardLayout({ user, setUser }) {
  const navigate = useNavigate();

  const { addToast } = useToast();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      addToast("Logged out successfully", "success");
    } catch (error) {
      console.error("Logout error:", error);
      addToast("Logout failed", "error");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/");
    }
  };

  const getNavLinks = () => {
    const role = user?.role;
    const baseUrl =
      role === "Admin" ? "/admin" : role === "Staff" ? "/staff" : "/dashboard";

    if (role === "Admin") {
      return [
        { to: baseUrl, icon: LayoutDashboard, label: "Dashboard" },
        { to: `${baseUrl}/vehicles`, icon: Car, label: "Vehicles" },
        { to: `${baseUrl}/bookings`, icon: Calendar, label: "Bookings" },
        { to: `${baseUrl}/customers`, icon: Users, label: "Customers" },
        { to: `${baseUrl}/staff`, icon: Users, label: "Staff" },
        {
          to: `${baseUrl}/settings/hero-image`,
          icon: Settings,
          label: "Settings",
        },
      ];
    } else if (role === "Staff") {
      return [
        { to: baseUrl, icon: LayoutDashboard, label: "Dashboard" },
        { to: `${baseUrl}/bookings`, icon: Calendar, label: "All Bookings" },
        { to: `${baseUrl}/vehicles`, icon: Car, label: "Vehicles" },
      ];
    } else {
      return [
        { to: baseUrl, icon: LayoutDashboard, label: "Dashboard" },
        { to: `${baseUrl}/bookings`, icon: Calendar, label: "My Bookings" },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-full w-64 bg-background border-r z-40">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">CarRental</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {user?.role} Portal
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {getNavLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-4 px-4">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="mb-3 px-4">
            <Link to="/" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Car className="w-4 h-4 mr-2" />
                Browse site
              </Button>
            </Link>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
