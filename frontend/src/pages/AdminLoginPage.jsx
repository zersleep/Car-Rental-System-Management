import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";
import { authAPI } from "../services/api";
import { useToast } from "@/lib/toastCore";

export default function AdminLoginPage({ setUser }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const [selectedRole, setSelectedRole] = useState("Admin");

  useEffect(() => {
    const p = location?.pathname?.toLowerCase() ?? "";
    if (p.includes("/admin")) setSelectedRole("Admin");
    else if (p.includes("/staff")) setSelectedRole("Staff");
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);
      const { user, token } = response.data;

      // Only allow Admin and Staff through this portal
      const allowed = ["Admin", "Staff"];
      if (!allowed.includes(user.role)) {
        setError("Access denied. This login is for staff only.");
        setLoading(false);
        return;
      }

      // Require that the user's actual role matches the selected role
      if (user.role !== selectedRole) {
        setError(
          `Your account role is "${user.role}". Please select the matching role to continue.`
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user)); // also set cookies so public pages can detect session
      document.cookie = `auth_token=${token};path=/;max-age=${
        60 * 60 * 24 * 30
      };SameSite=Lax`;
      document.cookie = `auth_user=${encodeURIComponent(
        JSON.stringify(user)
      )};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Lax`;
      setUser(user);
      addToast("Signed in successfully", "success");
      // Navigate to the portal chosen via the role select (admin or staff)
      navigate(`/${selectedRole.toLowerCase()}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">Staff Portal</span>
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Access for Administrators and Staff only
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role (select for destination)
              </label>
              <select
                id="role"
                name="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-md border px-3 py-2 bg-white/5"
                disabled={loading}
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary text-center"
            >
              Back to home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
