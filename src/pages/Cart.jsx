import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import OrderSummary from "../components/OrderSummary";

const Cart = () => {
  const { cart, updateQty, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleIncrement = (id, currentQty) => {
    updateQty(id, currentQty + 1);
  };

  const handleDecrement = (id, currentQty) => {
    if (currentQty > 1) updateQty(id, currentQty - 1);
  };

  const handleRemove = (item) => {
    removeFromCart(item._id);
    toast.success(`Removed ${item.name} from cart`);
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8 text-center max-w-md">
          Looks like you haven't added any medicines to your cart yet.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/medicines")}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse Medicines
          </button>
          <button
            onClick={() => navigate("/")}
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border mb-6 overflow-hidden">
              <div className="p-4 sm:p-6 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold">
                    Your Items ({cart.length})
                  </h2>
                  <button
                    onClick={() => {
                      if (window.confirm("Clear entire cart?")) {
                        clearCart();
                        toast.success("Cart cleared");
                      }
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1 self-end sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="divide-y">
                {cart.map((item) => (
                  <div key={`${item._id}-${item.qty}`} className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Product Image */}
                      <div className="w-full sm:w-32 sm:shrink-0">
                        <img
                          src={item.image || "/placeholder.png"}
                          alt={item.name}
                          className="w-full h-48 sm:w-32 sm:h-32 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        {/* Top row: Name & Price */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-gray-500 text-sm mt-1">
                              {item.manufacturer && `By ${item.manufacturer}`}
                              {item.dosage && ` • ${item.dosage}`}
                            </p>
                          </div>

                          {/* Price */}
                          <div className="sm:text-right mt-2 sm:mt-0">
                            <p className="text-lg font-bold text-gray-900">
                              ₹{(item.price * item.qty).toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{item.price} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                          {/* Quantity buttons and Remove */}
                          <div className="flex items-center justify-between sm:justify-start gap-4">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() =>
                                  handleDecrement(item._id, item.qty)
                                }
                                disabled={item.qty <= 1}
                                className="p-2 sm:p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 font-medium min-w-12 text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  handleIncrement(item._id, item.qty)
                                }
                                className="p-2 sm:p-2 hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => handleRemove(item)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-medium sm:ml-4"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>

                          {/* Mobile only total display */}
                          <div className="sm:hidden border-t pt-4">
                            <div className="flex justify-between">
                              <span className="font-medium">Total:</span>
                              <span className="font-bold">
                                ₹{(item.price * item.qty).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() => navigate("/medicines")}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </button>
              <p className="text-gray-600 text-sm sm:text-base text-center sm:text-right">
                Need help?{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <OrderSummary
              cart={cart}
              showCheckout
              onCheckout={() => navigate("/checkout")}
            />

            {/* Additional */}
            <div className="bg-white border rounded-lg shadow-sm p-6 mt-4">
              <h4 className="font-semibold mb-3">🛡️ Secure Checkout</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  100% Secure Payment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Free Delivery on orders above ₹499
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Easy Returns within 7 days
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
