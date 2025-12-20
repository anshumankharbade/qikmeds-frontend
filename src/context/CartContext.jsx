import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  // loadCart function
  const loadCart = useCallback(async () => {
    if (!user) {
      // Guest user - load from localStorage
      return;
    }

    // Logged-in user
    try {
      setLoading(true);
      const response = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Convert backend items to frontend format
        const frontendCartItems = response.data.items.map((item) => {
          // Use productId as _id for frontend
          return {
            _id: item.productId || item._id,
            name: item.name,
            price: item.price,
            qty: item.qty,
            image: item.image || "",
            dosage: item.dosage || "",
            manufacturer: item.manufacturer || "",
          };
        });

        // Check for duplicate IDs
        const ids = frontendCartItems.map((item) => item._id);
        const uniqueIds = [...new Set(ids)];

        if (uniqueIds.length === 1 && frontendCartItems.length > 1) {
        }

        setCart(frontendCartItems);
        localStorage.setItem(
          `cart_${user.id}`,
          JSON.stringify(frontendCartItems)
        );
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      // Fallback logic...
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // Helper function for localStorage fallback
  const fallbackToLocalStorage = (userId) => {
    const localCart = localStorage.getItem(`cart_${userId}`);
    if (localCart) {
      try {
        const parsedCart = JSON.parse(localCart);
        setCart(parsedCart);
      } catch (parseError) {
        console.error("Error parsing local cart:", parseError);
      }
    }
  };

  // Save cart to backend or localStorage
  const saveCart = useCallback(
    async (cartItems) => {
      if (!user) {
        localStorage.setItem("guest_cart", JSON.stringify(cartItems));
        return;
      }

      try {
        await api.post(
          "/cart",
          { items: cartItems },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Error saving cart to backend:", error.message);
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
      }
    },
    [user, token]
  );

  // Merge guest cart with user cart on login
  const mergeGuestCart = useCallback(async () => {
    if (!user) return;

    const guestCart = localStorage.getItem("guest_cart");
    if (!guestCart) return;

    try {
      const guestItems = JSON.parse(guestCart);

      // Get current user cart from backend
      const userCartResponse = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userItems = userCartResponse.data.items || [];

      // Merge items
      const mergedItems = [...userItems];

      guestItems.forEach((guestItem) => {
        const existingIndex = mergedItems.findIndex(
          (item) => item._id === guestItem._id
        );

        if (existingIndex >= 0) {
          mergedItems[existingIndex].qty += guestItem.qty;
        } else {
          mergedItems.push(guestItem);
        }
      });

      // Save merged cart to backend
      await api.post(
        "/cart",
        { items: mergedItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setCart(mergedItems);

      // Clear guest cart
      localStorage.removeItem("guest_cart");
    } catch (error) {
      console.error("Error merging carts:", error);
    }
  }, [user, token]);

  // Initial cart load and merge on login
  useEffect(() => {
    if (user) {
      loadCart();
      mergeGuestCart();
    } else {
      setCart([]);
    }
  }, [user, loadCart, mergeGuestCart]);

  // Auto-save cart when it changes
  useEffect(() => {
    const saveCartData = async () => {
      if (cart.length > 0) {
        await saveCart(cart);
      }
    };

    if (cart.length > 0) {
      saveCartData();
    }
  }, [cart]);

  // Add item to cart
  const addToCart = async (item) => {
    // Update local state immediately
    setCart((prevCart) => {
      const existingItem = prevCart.find((i) => i._id === item._id);
      let newCart;

      if (existingItem) {
        newCart = prevCart.map((i) =>
          i._id === item._id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        newCart = [...prevCart, { ...item, qty: 1 }];
      }

      return newCart;
    });
  };

  // Remove item from cart
  const removeFromCart = async (id) => {
    // Store current cart before modification
    const currentCart = [...cart];
    const newCart = currentCart.filter((item) => item._id !== id);

    setCart(newCart);

    // Save to backend/localStorage
    if (!user) {
      localStorage.setItem("guest_cart", JSON.stringify(newCart));
      return;
    }

    try {
      await api.post(
        "/cart",
        { items: newCart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      // Revert to original cart if backend fails
      setCart(currentCart);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(currentCart));
    }
  };

  // Update item quantity
  const updateQty = async (id, qty) => {
    if (qty < 1) {
      await removeFromCart(id);
      return;
    }

    const currentCart = [...cart];
    const newCart = currentCart.map((item) =>
      item._id === id ? { ...item, qty } : item
    );

    setCart(newCart);

    // Save to backend/localStorage
    if (!user) {
      localStorage.setItem("guest_cart", JSON.stringify(newCart));
      return;
    }

    try {
      await api.post(
        "/cart",
        { items: newCart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      // Revert on error
      setCart(currentCart);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(currentCart));
    }
  };

  const clearCart = async () => {
    // Store current cart before clearing
    const currentCart = [...cart];

    // Update UI immediately
    setCart([]);

    if (user) {
      try {
        await api.delete("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Also clear localStorage backup
        localStorage.removeItem(`cart_${user.id}`);
      } catch (error) {
        // Revert if backend fails
        setCart(currentCart);
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(currentCart));
      }
    } else {
      // Clear guest cart
      localStorage.removeItem("guest_cart");
    }
  };

  // function to place order
  const placeOrder = async (shippingInfo) => {
    try {
      if (cart.length === 0) {
        throw new Error("Your cart is empty");
      }

      // Validate shipping info
      if (!shippingInfo || !shippingInfo.address || !shippingInfo.phone) {
        throw new Error("Shipping information is required");
      }

      const response = await api.post(
        "/orders",
        {
          cart,
          shippingInfo,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      // Clear backend cart after successful order
      try {
        await api.delete("/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Backend cart cleared after order");
      } catch (clearError) {
        console.error("Error clearing backend cart:", clearError);
      }

      // Clear frontend cart after successful order
      setCart([]);

      return response.data;
    } catch (error) {
      console.error("Order placement error details:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        throw new Error("Please login to place an order");
      } else if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout. Please try again.");
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Invalid order data");
      } else if (error.message === "Network Error") {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error(
          error.response?.data?.message || "Failed to place order"
        );
      }
    }
  };

  // Calculate cart totals
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        orders,
        cartTotal,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        placeOrder,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
