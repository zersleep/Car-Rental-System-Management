import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Car,
  Shield,
  DollarSign,
  Headphones,
  Star,
  Truck,
  Zap,
  Sun,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/lib/toastCore";
import { useEffect, useState } from "react";
import { settingsAPI } from "@/services/settingsAPI";

export default function HomePage() {
  const { addToast } = useToast();
  // Try to show last-known hero immediately (helps when Admin uploads and then refreshes their browser)
  const [hero, setHero] = useState(() => {
    try {
      return localStorage.getItem("hero_image") || null;
    } catch (e) {
      return null;
    }
  });
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = () => {
      settingsAPI
        .getSettings()
        .then((res) => {
          if (!mounted) return;
          const newHero = res.data.hero_image || null;
          setHero(newHero);
          try {
            if (newHero) localStorage.setItem("hero_image", newHero);
            else localStorage.removeItem("hero_image");
          } catch (e) {
            // ignore
          }
          setSettingsLoaded(true);
        })
        .catch(() => {
          setSettingsLoaded(true);
        });
    };

    fetch();
    // Poll for changes every 30 seconds to reduce network churn while still updating reasonably
    const interval = setInterval(fetch, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header/Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-blue-600">CarRental</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors text-gray-700">
              Home
            </Link>
            <a
              href="#cars"
              className="hover:text-blue-600 transition-colors text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Cars
            </a>
            <a
              href="#best-sellers"
              className="hover:text-blue-600 transition-colors text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('best-sellers')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Best Sellers
            </a>
            <a
              href="#about"
              className="hover:text-blue-600 transition-colors text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About
            </a>
            <a
              href="#contact"
              className="hover:text-blue-600 transition-colors text-gray-700"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {/* Signed-in state */}
            {(() => {
              try {
                const raw = localStorage.getItem("user");
                const u = raw ? JSON.parse(raw) : null;
                if (u) {
                  const base =
                    u.role === "Customer"
                      ? "/dashboard"
                      : `/${u.role?.toLowerCase()}`;
                  return (
                    <>
                      <Link to={base}>
                        <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300"
                        onClick={async () => {
                          try {
                            await (
                              await import("@/services/api")
                            ).authAPI.logout();
                            addToast("Logged out successfully", "success");
                          } catch (e) {
                            addToast("Logout failed", "error");
                          }
                          localStorage.removeItem("token");
                          localStorage.removeItem("user");
                          document.cookie = "auth_token=;path=/;max-age=0";
                          document.cookie = "auth_user=;path=/;max-age=0";
                          setTimeout(() => window.location.reload(), 600);
                        }}
                      >
                        Sign Out
                      </Button>
                    </>
                  );
                }
              } catch (e) {
                // ignore
              }
              return (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                  </Link>
                </>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Hero Section - full width image */}
      <section className="relative pt-16 overflow-hidden">
        <div
          className="w-full h-[68vh] md:h-[78vh] bg-center bg-cover flex items-center"
          style={{
            backgroundImage: `url(${hero ||
              "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1920&q=80"
              })`,
          }}
        >
          <div className="absolute inset-0 bg-black/10" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <Badge variant="secondary" className="mb-4 py-1 px-3 bg-blue-100 text-blue-700 border-blue-200">
              Now available in 20+ cities
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
              Find Your Dream Car
            </h1>
            <p className="text-lg text-white max-w-2xl mx-auto mb-6 opacity-90">
              That you can rent the perfect vehicle for your lifestyle
            </p>

            {/* Search Bar (overlay) */}
            <div className="max-w-4xl mx-auto bg-white/95 border border-blue-100 rounded-2xl shadow-xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-blue-600" /> Location
                </label>
                <Input
                  placeholder="City, Airport, Zip"
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Calendar className="w-4 h-4 text-blue-600" /> Pick-up Date
                </label>
                <Input type="date" className="bg-gray-50 border-gray-200" />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-blue-600" /> Return Date
                </label>
                <Input type="date" className="bg-gray-50 border-gray-200" />
              </div>
              <Button
                size="lg"
                className="w-full gap-2 font-bold shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-5 h-5" /> Search Cars
              </Button>
            </div>

            <div className="mt-10">
              <a
                href="#cars"
                className="inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('cars')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Button
                  variant="default"
                  size="lg"
                  className="rounded-full text-lg font-bold px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
                >
                  Explore Our Collection
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section id="cars" className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">
                Popular Fleet
              </h2>
              <p className="text-gray-600">
                Chosen by thousands of happy travelers
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Mercedes-Benz E220d 4Matic",
                type: "Sedan",
                price: "$120",
                specs: [
                  "145 kW+17 kW",
                  "4Matic",
                  "0/100 km/h 7,5 s",
                  "4,5 - 6,1 l/100 km",
                  "Automatic",
                  "Diesel"
                ],
                image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "AUDI A6 50TDI quattro",
                type: "Sedan",
                price: "$120",
                specs: [
                  "210 kW",
                  "quattro®",
                  "0/100 km/h 5,5 s",
                  "5,1 - 6,1 l/100 km",
                  "Automatic",
                  "Diesel"
                ],
                image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "BMW 520 xd",
                type: "Sedan",
                price: "$120",
                specs: [
                  "145 kW",
                  "xDrive",
                  "0/100 km/h 7,3 s",
                  "5,5 - 6 l/100 km",
                  "Automatic",
                  "Diesel"
                ],
                image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
              },
            ].map((car, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all group"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-gray-900">{car.name}</CardTitle>
                    <p className="text-sm text-gray-500">{car.type}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {car.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{car.price}</span>
                    <span className="text-sm text-gray-500">/ day</span>
                  </div>
                  <Link to="/cars">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      Rent now
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-gray-800">
              The Best Rental Experience
            </h2>
            <p className="text-gray-600">
              We focus on comfort, safety, and a seamless process.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Best Price Guarantee</h3>
              <p className="text-gray-600">
                We offer competitive prices on our 100,000+ vehicle inventory.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Trusted &amp; Secure</h3>
              <p className="text-gray-600">
                Our secure transaction process ensures your peace of mind.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">24/7 Support</h3>
              <p className="text-gray-600">
                Our team is always here to help with any questions or concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Type */}
      <section id="browse-by-type" className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Browse by Type</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { name: "SUV", Icon: Truck },
              { name: "Sedan", Icon: Car },
              { name: "Hatchback", Icon: Car },
              { name: "Coupe", Icon: Star },
              { name: "Hybrid", Icon: Zap },
              { name: "Convertible", Icon: Sun },
              { name: "Van", Icon: Truck },
              { name: "Truck", Icon: Truck },
              { name: "Electric", Icon: Zap },
            ].map(({ name, Icon }) => (
              <div key={name} className="w-24 text-center">
                <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-3 border border-blue-100">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-sm font-semibold text-gray-700">{name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section id="best-sellers" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">
              Best Sellers
            </h2>
            <p className="text-gray-600">
              Our most popular rental choices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "BMW 5 Series",
                type: "Sedan",
                price: "$199",
                specs: [
                  "185 kW",
                  "xDrive",
                  "0/100 km/h 6,1 s",
                  "6,2 - 7,5 l/100 km",
                  "Automatic",
                  "Petrol"
                ],
                image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "Mercedes-Benz GLE",
                type: "SUV",
                price: "$249",
                specs: [
                  "270 kW",
                  "4Matic",
                  "0/100 km/h 5,3 s",
                  "8,1 - 9,8 l/100 km",
                  "Automatic",
                  "Petrol"
                ],
                image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
              },
              {
                name: "Audi A4",
                type: "Sedan",
                price: "$179",
                specs: [
                  "140 kW",
                  "Front-wheel",
                  "0/100 km/h 8,5 s",
                  "5,1 - 6,2 l/100 km",
                  "Automatic",
                  "Diesel"
                ],
                image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80"
              },
            ].map((car, i) => (
              <Card
                key={i}
                className="overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all group"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-gray-900">{car.name}</CardTitle>
                    <p className="text-sm text-gray-500">{car.type}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {car.specs.map((spec, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{car.price}</span>
                    <span className="text-sm text-gray-500">/ day</span>
                  </div>
                  <Link to="/cars">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/cars">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                View All Vehicles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800">
                About Us
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At CarRental, we're passionate about providing you with the best car rental experience possible. With years of industry expertise and a commitment to customer satisfaction, we've become a trusted name in the automotive rental market.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Our extensive fleet of vehicles caters to all your needs, whether you're looking for a compact car for a city trip or a luxurious SUV for a family vacation. We pride ourselves on our transparent pricing, flexible rental options, and exceptional customer service.
              </p>
              <Button size="lg" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Learn More
              </Button>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1200&q=80"
                  alt="Luxury car"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-2 text-gray-800">
                Contact Us
              </h2>
              <p className="text-gray-600">
                Get in touch with our team
              </p>
            </div>

            <Card className="p-8 border border-gray-200 shadow-md">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">First Name</label>
                    <Input placeholder="John" className="border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Last Name</label>
                    <Input placeholder="Doe" className="border-gray-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email</label>
                  <Input type="email" placeholder="john.doe@example.com" className="border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <textarea
                    className="w-full min-h-[120px] px-3 py-2 text-sm bg-white border border-gray-200 rounded-md resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    placeholder="Your message here..."
                  />
                </div>
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Car className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">CarRental</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Making car rentals simple, fast, and accessible for everyone.
                Join thousands of travelers worldwide.
              </p>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <nav className="flex flex-col gap-3">
                <a
                  href="#about"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  About Us
                </a>
                <a
                  href="#careers"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Careers
                </a>
                <a
                  href="#press"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Press
                </a>
              </nav>
            </div>

            {/* Resources */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <nav className="flex flex-col gap-3">
                <a
                  href="#blog"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
                <a
                  href="#help"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Help Center
                </a>
                <a
                  href="#contact"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Contact
                </a>
              </nav>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold mb-4">Newsletter</h3>
              <p className="text-gray-400 text-sm mb-4">
                Get travel tips and exclusive deals.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Your email"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus-visible:ring-white/50"
                />
                <Button variant="secondary" className="shrink-0">
                  Join
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              © 2026 CarRental Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
