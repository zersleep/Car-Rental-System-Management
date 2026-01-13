import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import { AuthContext, useAuth } from "./lib/AuthContext";
import { ToastProvider } from "./lib/ToastContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import VehicleManagement from "./pages/admin/VehicleManagement";
import BookingManagement from "./pages/admin/BookingManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import StaffManagement from "./pages/admin/StaffManagement";
import HeroImageSettings from "./pages/admin/HeroImageSettings";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBookings from "./pages/customer/CustomerBookings";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffBookings from "./pages/staff/StaffBookings";
import StaffVehicles from "./pages/staff/StaffVehicles";
import CarsPage from "./pages/CarsPage";
import CheckoutPage from "./pages/CheckoutPage";
import { authAPI } from "./services/api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authAPI.me();
        const u = response.data;
        setUser(u);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  // Note: declare ProtectedRoute outside of component render to avoid recreating it each render
  function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    return children;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Provide auth & toast to the whole app */}
      <AuthContext.Provider value={{ user, setUser }}>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/checkout/:id" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin/login"
              element={<AdminLoginPage setUser={setUser} />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <DashboardLayout user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="staff" element={<StaffManagement />} />
              <Route
                path="settings/hero-image"
                element={<HeroImageSettings />}
              />
            </Route>

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={["Staff"]}>
                  <DashboardLayout user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            >
              <Route index element={<StaffDashboard />} />
              <Route path="bookings" element={<StaffBookings />} />
              <Route path="vehicles" element={<StaffVehicles />} />
            </Route>

            {/* Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Customer"]}>
                  <DashboardLayout user={user} setUser={setUser} />
                </ProtectedRoute>
              }
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="bookings" element={<CustomerBookings />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;
