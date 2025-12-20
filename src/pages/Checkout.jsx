import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CreditCard, Truck, Shield, AlertCircle } from "lucide-react";
import OrderSummary from "../components/OrderSummary";

const Checkout = () => {
  const { cart, placeOrder } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "cod",
  });
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Invalid phone number";

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode))
      newErrors.pincode = "Invalid pincode";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateStep2 = () => {
    if (formData.paymentMethod === "card") {
      // Add card validation logic here
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    try {
      setLoading(true);
      await placeOrder(formData);
      toast.success("Order placed successfully!");
      navigate("/orders");
    } catch (error) {
      console.error("Order error:", error);
      toast.error(error.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  // Progress Steps
  const steps = [
    { number: 1, title: "Shipping", active: step === 1, completed: step > 1 },
    { number: 2, title: "Payment", active: step === 2, completed: step > 2 },
    { number: 3, title: "Review", active: step === 3, completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((s) => (
              <div key={s.number} className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                    s.completed
                      ? "bg-green-600 text-white"
                      : s.active
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s.completed ? "✓" : s.number}
                </div>
                <span
                  className={`text-sm font-medium ${
                    s.active || s.completed ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
            <div
              className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold mb-6">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="9876543210"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.pincode ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="560001"
                      />
                      {errors.pincode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.pincode}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.address ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Street address, apartment, suite, etc."
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.city ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Bengaluru"
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Karnataka"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.state}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    {[
                      {
                        id: "cod",
                        title: "Cash on Delivery",
                        desc: "Pay when you receive",
                      },
                      {
                        id: "card",
                        title: "Credit/Debit Card",
                        desc: "Pay securely with card",
                      },
                      {
                        id: "upi",
                        title: "UPI",
                        desc: "Google Pay, PhonePe, etc.",
                      },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                          formData.paymentMethod === method.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={formData.paymentMethod === method.id}
                          onChange={handleInputChange}
                          className="h-5 w-5 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium">{method.title}</div>
                          <div className="text-sm text-gray-500">
                            {method.desc}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {formData.paymentMethod === "card" && (
                    <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-semibold mb-3">Card Details</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Card Number"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="px-4 py-2 border rounded-lg"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="px-4 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold mb-6">Review Your Order</h2>

                  {/* Shipping Info */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Truck className="w-5 h-5" /> Shipping Address
                    </h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium">{formData.fullName}</p>
                      <p>{formData.address}</p>
                      <p>
                        {formData.city}, {formData.state} - {formData.pincode}
                      </p>
                      <p>📞 {formData.phone}</p>
                      <p>✉️ {formData.email}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Payment Method
                    </h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="font-medium capitalize">
                        {formData.paymentMethod.replace(
                          "cod",
                          "Cash on Delivery"
                        )}
                      </p>
                      {formData.paymentMethod === "cod" && (
                        <p className="text-sm text-gray-600 mt-1">
                          Pay ₹{total.toLocaleString()} when you receive your
                          order
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Order Items</h3>
                    <div className="border rounded-lg divide-y">
                      {cart.map((item) => (
                        <div
                          key={item._id}
                          className="p-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              ₹{item.price} × {item.qty}
                            </p>
                          </div>
                          <p className="font-semibold">
                            ₹{(item.price * item.qty).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-start gap-2">
                      <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900">
                          Secure Checkout
                        </p>
                        <p className="text-sm text-blue-800">
                          Your order is protected by our 100% Secure Payment
                          guarantee. By placing this order, you agree to our
                          Terms of Service.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {step > 1 ? (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/cart")}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Return to Cart
                  </button>
                )}

                {step < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || cart.length === 0}
                    className={`px-8 py-3 bg-green-600 text-white rounded-lg font-semibold ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-green-700"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </span>
                    ) : (
                      `Place Order • ₹${total.toLocaleString()}`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <OrderSummary cart={cart} />

            {/* Order Protection */}
            <div className="bg-white border rounded-lg shadow-sm p-6 mt-4">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold">Order Protection</h4>
                  <p className="text-sm text-gray-600">
                    100% Safe & Secure Checkout
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ SSL Encrypted Payment</p>
                <p>✅ 7-Day Return Policy</p>
                <p>✅ Genuine Medicines Guaranteed</p>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
              <p className="text-sm text-blue-800 mb-3">
                Our customer support team is here to help!
              </p>
              <div className="text-sm space-y-1">
                <p>📞 1800-123-4567</p>
                <p>✉️ support@qikmeds.com</p>
                <p>🕒 24/7 Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
