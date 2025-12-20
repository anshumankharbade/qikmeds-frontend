import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

const MedicineCard = ({ medicine }) => {
  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // Check if this medicine is already in cart
  useEffect(() => {
    if (medicine?._id && cart) {
      const itemInCart = cart.find((item) => item._id === medicine._id);
      setIsInCart(!!itemInCart);
    }
  }, [medicine, cart]);

  // If no medicine data, show loader
  if (!medicine) {
    return (
      <div className="bg-white shadow-md rounded-lg overflow-hidden h-72 animate-pulse border border-gray-100">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if medicine has ID
  const medicineId = medicine._id;
  if (!medicineId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600 font-semibold">Error Loading Medicine</p>
        <p className="text-red-500 text-sm">{medicine.name || "Unknown"}</p>
      </div>
    );
  }

  // Destructure with default values
  const {
    name = "Medicine",
    price = 0,
    dosage = "Not specified",
    manufacturer = "Generic",
    image = "",
    category = "General",
    stock = 100,
  } = medicine;

  // Get quantity from cart if item exists
  const cartItem = cart.find((item) => item._id === medicineId);
  const cartQuantity = cartItem ? cartItem.qty : 0;

  // Generate fallback image
  const getImageUrl = () => {
    if (image && image.trim() !== "") {
      return image;
    }

    const colors = [
      "FF6B6B",
      "4ECDC4",
      "45B7D1",
      "96CEB4",
      "FFEAA7",
      "DDA0DD",
      "98D8C8",
      "F7DC6F",
      "BB8FCE",
      "85C1E9",
    ];
    const color = colors[name.length % colors.length];

    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="%23${color}" opacity="0.2"/>
      <rect x="100" y="80" width="200" height="140" rx="10" fill="white" stroke="%23${color}" stroke-width="2"/>
      <circle cx="200" cy="110" r="15" fill="%23${color}"/>
      <rect x="140" y="140" width="120" height="10" rx="5" fill="%23${color}"/>
      <rect x="140" y="160" width="80" height="8" rx="4" fill="%23${color}"/>
      <text x="200" y="230" font-family="Arial, sans-serif" font-size="18" fill="%23334" text-anchor="middle" font-weight="bold">${encodeURIComponent(
        name.substring(0, 20)
      )}</text>
      <text x="200" y="260" font-family="Arial, sans-serif" font-size="16" fill="%23${color}" text-anchor="middle" font-weight="bold">₹${price}</text>
    </svg>`;
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    // Check if stock is defined and available
    if (stock !== undefined && stock !== null) {
      if (stock < 1) {
        toast.error(`${name} is out of stock`);
        return;
      }

      // Check if requested quantity exceeds stock
      const currentQty = cartItem ? cartItem.qty : 0;

      if (currentQty >= stock) {
        toast.error(`Only ${stock} units available`);
        return;
      }
    }

    setIsAdding(true);

    try {
      const cartItemData = {
        _id: medicineId,
        name: name,
        price: price,
        qty: 1,
        image: getImageUrl(),
        dosage: dosage,
        manufacturer: manufacturer,
        category: category,
        stock: stock || 0,
      };

      await addToCart(cartItemData);
      toast.success(`Added ${name} to cart`);

      // Update isInCart state
      setIsInCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  const handleButtonClick = () => {
    if (isInCart) {
      handleGoToCart();
    } else {
      handleAddToCart();
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
      {/* Product image with category badge */}
      <div className="relative w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={getImageUrl()}
          alt={`${name} medicine`}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f1f5f9"/><text x="200" y="150" font-family="Arial" font-size="16" fill="%236b7280" text-anchor="middle">${encodeURIComponent(
              name.substring(0, 30)
            )}</text></svg>`;
          }}
        />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            {category}
          </span>
        </div>

        {/* Stock badge */}
        {stock !== undefined && stock !== null ? (
          <div
            className={`absolute bottom-3 left-3 ${
              stock < 10
                ? "bg-red-100 text-red-800"
                : stock < 30
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            } text-xs font-semibold px-2.5 py-1 rounded-full`}
          >
            {stock < 10
              ? `⚠️ ${stock} left`
              : stock < 30
              ? `${stock} left`
              : "In Stock"}
          </div>
        ) : (
          <div className="absolute bottom-3 left-3 bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Stock: N/A
          </div>
        )}

        {/* Already in cart badge */}
        {isInCart && (
          <div className="absolute top-3 right-3">
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
              {cartQuantity} in cart
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="p-4 flex flex-col grow">
        <div className="grow">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-medium">Dosage:</span> {dosage}
          </p>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">By:</span> {manufacturer}
          </p>
          <div className="mt-auto">
            <p className="text-xl font-bold text-blue-600">
              ₹{price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quantity display if in cart */}
        {isInCart && cartQuantity > 0 && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700 font-medium">
                In cart: {cartQuantity} item{cartQuantity > 1 ? "s" : ""}
              </span>
              <span className="text-green-600 font-bold">
                ₹{(price * cartQuantity).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Add to cart or go to cart button */}
        <button
          onClick={handleButtonClick}
          disabled={isAdding}
          className={`w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg ${
            isAdding
              ? "bg-blue-400 cursor-not-allowed text-white"
              : isInCart
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isAdding ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Adding...
            </span>
          ) : isInCart ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Go to Cart
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add to Cart
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;
