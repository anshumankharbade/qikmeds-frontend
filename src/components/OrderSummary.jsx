const OrderSummary = ({ cart, showCheckout = false, onCheckout }) => {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white border rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">Order Summary</h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className={shipping === 0 ? "text-green-600" : ""}>
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Tax (18% GST)</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>₹{total.toLocaleString()}</span>
          </div>
          {shipping > 0 && (
            <p className="text-sm text-green-600 mt-2">
              🎉 Add ₹{(499 - subtotal).toFixed(2)} more for free shipping!
            </p>
          )}
        </div>
      </div>

      {showCheckout && (
        <button
          onClick={onCheckout}
          className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition duration-200"
        >
          Proceed to Secure Checkout
        </button>
      )}
    </div>
  );
};

export default OrderSummary;
