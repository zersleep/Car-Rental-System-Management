import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Car,
    Calendar,
    CreditCard,
    User,
    Phone,
    Mail,
    MapPin,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import api, { vehicleAPI, bookingAPI } from "@/services/api";
import { useToast } from "@/lib/toastCore";

export default function CheckoutPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        start_date: "",
        end_date: "",
        payment_method: "Card",
        card_number: "",
        card_name: "",
        card_expiry: "",
        card_cvv: "",
    });

    useEffect(() => {
        fetchVehicle();
    }, [id]);

    const fetchVehicle = async () => {
        try {
            const response = await vehicleAPI.getOne(id);
            setVehicle(response.data);
        } catch (error) {
            console.error("Error fetching vehicle:", error);
            addToast("Failed to load vehicle details", "error");
            navigate("/cars");
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        if (!formData.start_date || !formData.end_date || !vehicle) return 0;
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return days > 0 ? days * parseFloat(vehicle.rental_price) : 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create booking
            const bookingData = {
                vehicle_id: vehicle.id,
                start_date: formData.start_date,
                end_date: formData.end_date,
                total_price: calculateTotal(),
                customer_info: {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip_code: formData.zip_code,
                },
                payment_info: {
                    method: formData.payment_method,
                    card_number: formData.card_number,
                    card_name: formData.card_name,
                    card_expiry: formData.card_expiry,
                    card_cvv: formData.card_cvv,
                },
            };

            // Use public booking endpoint
            await api.post("/bookings/public", bookingData);
            addToast("Booking confirmed successfully!", "success");
            navigate("/cars");
        } catch (error) {
            console.error("Error creating booking:", error);
            addToast(
                error.response?.data?.message || "Failed to create booking",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-blue-50 pt-20">
                <div className="container mx-auto px-4 py-20">
                    <div className="flex items-center justify-center">
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!vehicle) {
        return null;
    }

    const total = calculateTotal();
    const days = formData.start_date && formData.end_date
        ? Math.ceil(
            (new Date(formData.end_date) - new Date(formData.start_date)) /
            (1000 * 60 * 60 * 24)
        )
        : 0;

    return (
        <div className="min-h-screen bg-blue-50 pt-20">
            {/* Header */}
            <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <Car className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold tracking-tight text-blue-600">
                            CarRental
                        </span>
                    </Link>
                    <Link to="/cars">
                        <Button variant="ghost" size="sm" className="text-gray-700">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Cars
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-800 mb-2">
                        Complete Your Rental
                    </h1>
                    <p className="text-gray-600">
                        Please fill in your information to complete the booking
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Vehicle Summary */}
                            <Card className="border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-xl">Vehicle Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        {vehicle.image ? (
                                            <img
                                                src={vehicle.image}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                className="w-24 h-24 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Car className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {vehicle.brand} {vehicle.model}
                                            </h3>
                                            <p className="text-gray-600">
                                                {vehicle.year} • {vehicle.plate_number}
                                            </p>
                                            <p className="text-blue-600 font-semibold mt-1">
                                                ${vehicle.rental_price} / day
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rental Dates */}
                            <Card className="border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <Calendar className="w-5 h-5" />
                                        Rental Period
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Pick-up Date</Label>
                                            <Input
                                                type="date"
                                                id="start_date"
                                                name="start_date"
                                                value={formData.start_date}
                                                onChange={handleChange}
                                                required
                                                min={new Date().toISOString().split("T")[0]}
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">Return Date</Label>
                                            <Input
                                                type="date"
                                                id="end_date"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                required
                                                min={formData.start_date || new Date().toISOString().split("T")[0]}
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card className="border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name</Label>
                                        <Input
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                            placeholder="John Doe"
                                            className="border-gray-200"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="john@example.com"
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                placeholder="+1 (555) 123-4567"
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            placeholder="123 Main Street"
                                            className="border-gray-200"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                placeholder="New York"
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                type="text"
                                                id="state"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleChange}
                                                required
                                                placeholder="NY"
                                                className="border-gray-200"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="zip_code">ZIP Code</Label>
                                            <Input
                                                type="text"
                                                id="zip_code"
                                                name="zip_code"
                                                value={formData.zip_code}
                                                onChange={handleChange}
                                                required
                                                placeholder="10001"
                                                className="border-gray-200"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Information */}
                            <Card className="border-blue-200">
                                <CardHeader>
                                    <CardTitle className="text-xl flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Payment Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method">Payment Method</Label>
                                        <select
                                            id="payment_method"
                                            name="payment_method"
                                            value={formData.payment_method}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md"
                                        >
                                            <option value="Card">Credit/Debit Card</option>
                                            <option value="Cash">Cash on Pickup</option>
                                        </select>
                                    </div>
                                    {formData.payment_method === "Card" && (
                                        <>
                                            <div className="space-y-2">
                                                <Label htmlFor="card_name">Cardholder Name</Label>
                                                <Input
                                                    type="text"
                                                    id="card_name"
                                                    name="card_name"
                                                    value={formData.card_name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="John Doe"
                                                    className="border-gray-200"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="card_number">Card Number</Label>
                                                <Input
                                                    type="text"
                                                    id="card_number"
                                                    name="card_number"
                                                    value={formData.card_number}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    className="border-gray-200"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="card_expiry">Expiry Date</Label>
                                                    <Input
                                                        type="text"
                                                        id="card_expiry"
                                                        name="card_expiry"
                                                        value={formData.card_expiry}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        className="border-gray-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="card_cvv">CVV</Label>
                                                    <Input
                                                        type="text"
                                                        id="card_cvv"
                                                        name="card_cvv"
                                                        value={formData.card_cvv}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="123"
                                                        maxLength="4"
                                                        className="border-gray-200"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={submitting}
                            >
                                {submitting ? "Processing..." : "Confirm Booking"}
                            </Button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-xl">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Daily Rate</span>
                                        <span className="font-semibold">${vehicle.rental_price}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Rental Days</span>
                                        <span className="font-semibold">{days || 0} days</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-blue-600">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span>Free cancellation</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span>24/7 support</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        <span>Insurance included</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
