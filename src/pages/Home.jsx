import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Shield,
  Truck,
  Clock,
  Pill,
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Award,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [featuredMedicines, setFeaturedMedicines] = useState([
    {
      id: 1,
      name: "Paracetamol",
      price: 50,
      category: "Pain Relief",
      image: "💊",
    },
    { id: 2, name: "Vitamin C", price: 299, category: "Immunity", image: "🥝" },
    { id: 3, name: "Cetirizine", price: 89, category: "Allergy", image: "🌿" },
    { id: 4, name: "Omeprazole", price: 120, category: "Acidity", image: "💊" },
  ]);

  const stats = [
    {
      label: "Happy Customers",
      value: "10K+",
      icon: <Users className="w-6 h-6" />,
    },
    {
      label: "Medicines Available",
      value: "500+",
      icon: <Pill className="w-6 h-6" />,
    },
    {
      label: "Cities Delivered",
      value: "50+",
      icon: <Truck className="w-6 h-6" />,
    },
    {
      label: "Avg Delivery Time",
      value: "30 min",
      icon: <Clock className="w-6 h-6" />,
    },
  ];

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "100% Authentic Medicines",
      description: "Verified and sourced directly from licensed pharmacies",
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: "Quick Delivery",
      description: "Get medicines delivered to your doorstep within hours",
    },
    {
      icon: <Award className="w-8 h-8 text-purple-600" />,
      title: "Best Prices Guaranteed",
      description: "Lowest prices with regular discounts and offers",
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Care Team Support",
      description: "24/7 expert guidance for your medical needs",
    },
  ];

  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Regular Customer",
      content:
        "QikMeds saved me during a late-night fever. Delivery was super fast!",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Senior Citizen",
      content:
        "Easy to use app, great prices, and reliable service. Highly recommended!",
      rating: 5,
    },
    {
      name: "Dr. Arvind Kumar",
      role: "Cardiologist",
      content:
        "As a doctor, I trust QikMeds for genuine medicines and timely delivery.",
      rating: 4,
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <CheckCircle className="w-4 h-4" />
                Trusted by 10,000+ families
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Health,
                <span className="text-blue-600 block">Our Priority</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                India's most trusted online pharmacy. Get genuine medicines
                delivered to your doorstep with 100% quality guarantee.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/medicines"
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                    >
                      Shop Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    {cartCount > 0 && (
                      <Link
                        to="/cart"
                        className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-green-700 transition-all hover:scale-105 shadow-lg"
                      >
                        View Cart ({cartCount})
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/medicines"
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                    >
                      Shop Medicines
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-all"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Free delivery above ₹499</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="grid grid-cols-2 gap-4">
                  {featuredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-lg transition-shadow"
                    >
                      <div className="text-3xl mb-2">{medicine.image}</div>
                      <h3 className="font-semibold text-gray-800">
                        {medicine.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {medicine.category}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{medicine.price}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t text-center">
                  <p className="text-gray-600">
                    And 500+ more medicines available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose QikMeds?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to making healthcare accessible, affordable, and
              convenient for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Trusted by thousands of happy customers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-lg transition-all"
              >
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* call to action Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Hassle-Free Medicine Shopping?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands who trust QikMeds for their healthcare needs
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/medicines"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  Browse Medicines
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 transition-all"
                  >
                    Already have an account? Login
                  </Link>
                </>
              )}
            </div>

            <p className="mt-8 text-blue-200 text-sm">
              No credit card required • 7-day return policy • 24/7 support
            </p>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <div className="py-8 border-t text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} QikMeds. All rights reserved.</p>
          <p className="mt-2">
            All medicines are dispensed in accordance with the Drugs and
            Cosmetics Act, 1940
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
