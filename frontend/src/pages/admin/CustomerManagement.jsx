import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Search, Pencil, Trash2, Save, XCircle } from "lucide-react";
import { useToast } from "@/lib/toastCore";
import api from "@/services/api";

const customerAPI = {
    getAll: () => api.get("/customers"),
    create: (data) => api.post("/customers", data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    delete: (id) => api.delete(`/customers/${id}`),
};

export default function CustomerManagement() {
    const { addToast } = useToast();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await customerAPI.getAll();
            setCustomers(response.data || []);
        } catch (error) {
            console.error("Error fetching customers:", error);
            addToast("Failed to load customers", "error");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditing(null);
        setForm({
            full_name: "",
            email: "",
            phone: "",
        });
    };

    const handleEdit = (customer) => {
        setEditing(customer.id);
        setForm({
            full_name: customer.full_name || "",
            email: customer.email || "",
            phone: customer.phone || "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await customerAPI.update(editing, form);
                addToast("Customer updated successfully", "success");
            } else {
                await customerAPI.create(form);
                addToast("Customer created successfully", "success");
            }
            resetForm();
            fetchCustomers();
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to save customer", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this customer?")) return;
        try {
            await customerAPI.delete(id);
            addToast("Customer deleted successfully", "success");
            fetchCustomers();
        } catch (error) {
            addToast(error.response?.data?.message || "Failed to delete customer", "error");
        }
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
                    <p className="text-muted-foreground">Manage customer accounts and information</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchCustomers} disabled={loading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={resetForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Customer
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{editing ? "Edit Customer" : "Add Customer"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <Input
                                required
                                value={form.full_name}
                                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
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
                            <label className="text-sm font-medium">Phone</label>
                            <Input
                                required
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-3 flex gap-2">
                            <Button type="submit" disabled={saving}>
                                <Save className="w-4 h-4 mr-2" />
                                {editing ? "Update Customer" : "Create Customer"}
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
                    <CardTitle>Search Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <p>Loading customers...</p>
            ) : filteredCustomers.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {searchTerm ? "No customers found matching your search." : "No customers found. Add your first customer to get started."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-muted-foreground">
                                    <tr className="border-b">
                                        <th className="py-2 pr-4">ID</th>
                                        <th className="py-2 pr-4">Full Name</th>
                                        <th className="py-2 pr-4">Email</th>
                                        <th className="py-2 pr-4">Phone</th>
                                        <th className="py-2 pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-2 pr-4 font-medium">#{customer.id}</td>
                                            <td className="py-2 pr-4">{customer.full_name}</td>
                                            <td className="py-2 pr-4">{customer.email}</td>
                                            <td className="py-2 pr-4">{customer.phone}</td>
                                            <td className="py-2 pr-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                                                        <Pencil className="w-4 h-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={() => handleDelete(customer.id)}>
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
