import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Search, Pencil, Trash2, Save, XCircle } from "lucide-react";
import { useToast } from "@/lib/toastCore";
import api from "@/services/api";

const staffAPI = {
  getAll: () => api.get("/users?role=Staff"),
  create: (data) => api.post("/users", { ...data, role: "Staff" }),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export default function StaffManagement() {
  const { addToast } = useToast();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const response = await staffAPI.getAll();
      setStaff(response.data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      addToast("Failed to load staff", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      password: "",
    });
  };

  const handleEdit = (staffMember) => {
    setEditing(staffMember.id);
    setForm({
      name: staffMember.name || "",
      email: staffMember.email || "",
      password: "", // Don't pre-fill password
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const submitData = { ...form };
      if (!editing || submitData.password) {
        // Only include password if creating new or updating with new password
        if (!submitData.password && editing) {
          delete submitData.password;
        }
      } else {
        delete submitData.password;
      }

      if (editing) {
        await staffAPI.update(editing, submitData);
        addToast("Staff member updated successfully", "success");
      } else {
        await staffAPI.create(submitData);
        addToast("Staff member created successfully", "success");
      }
      resetForm();
      fetchStaff();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to save staff member", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    try {
      await staffAPI.delete(id);
      addToast("Staff member deleted successfully", "success");
      fetchStaff();
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to delete staff member", "error");
    }
  };

  const filteredStaff = staff.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStaff} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" />
            New Staff Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Staff Member" : "Add Staff Member"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Password {editing && "(leave blank to keep current)"}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required={!editing}
                minLength={6}
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {editing ? "Update Staff Member" : "Create Staff Member"}
              </Button>
              {editing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p>Loading staff...</p>
      ) : filteredStaff.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm ? "No staff members found matching your search." : "No staff members found. Add your first staff member to get started."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({filteredStaff.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-2 pr-4 font-medium">#{s.id}</td>
                      <td className="py-2 pr-4">{s.name}</td>
                      <td className="py-2 pr-4">{s.email}</td>
                      <td className="py-2 pr-4">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {s.role}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(s)}>
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(s.id)}>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
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
