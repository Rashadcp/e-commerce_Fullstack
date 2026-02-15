import { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const isInitialCartLoad = useRef(true);
  const isInitialWishlistLoad = useRef(true);

  // Initialize user synchronously from localStorage to avoid a flash redirect
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch (e) {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("isAdmin") === "true";
  });

  // Fetch cart and wishlist on login or refresh
  useEffect(() => {
    if (user && user.token && !isAdmin) {
      fetchUserCart();
      fetchWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user, isAdmin]);

  // Sync cart to backend whenever it changes (debounced or strictly after load)
  useEffect(() => {
    if (isInitialCartLoad.current) {
      isInitialCartLoad.current = false;
      return;
    }
    if (user && user.token && !isAdmin) {
      const timer = setTimeout(() => {
        saveUserCart(cart);
      }, 500); // Debounce saves
      return () => clearTimeout(timer);
    }
  }, [cart]);

  // Sync wishlist to backend whenever it changes
  useEffect(() => {
    if (isInitialWishlistLoad.current) {
      isInitialWishlistLoad.current = false;
      return;
    }
    if (user && user.token && !isAdmin) {
      const timer = setTimeout(() => {
        saveWishlist(wishlist);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [wishlist]);

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!user || isAdmin;
  };

  // Fetch cart based on logged-in user
  const fetchUserCart = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/cart`, config);
      const formattedCart = res.data.map(item => {
        const productInfo = typeof item.productId === 'object' ? item.productId : {};
        const productId = item.productId?._id || item.productId?.id || (typeof item.productId === 'string' ? item.productId : null);

        return {
          ...productInfo,
          id: productId,
          _id: productId,
          quantity: item.quantity
        };
      });

      isInitialCartLoad.current = true; // Prevent the next useEffect from saving back immediately
      setCart(formattedCart);
    } catch (err) {
      console.error("Error fetching user cart:", err);
      if (err.response?.status === 401) {
        logoutUser();
      }
    }
  };

  // Save updated cart
  const saveUserCart = async (updatedCart) => {
    if (!user || isAdmin) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      const cartToSave = updatedCart.map(item => ({
        productId: item.id || item._id,
        quantity: item.quantity || 1
      }));

      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/cart`, { cart: cartToSave }, config);
    } catch (err) {
      console.error("Error saving cart to backend:", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/wishlist`, config);
      const formatted = res.data.map(item => {
        const productInfo = typeof item.productId === 'object' ? item.productId : {};
        const productId = item.productId?._id || item.productId?.id || (typeof item.productId === 'string' ? item.productId : null);

        return {
          ...productInfo,
          id: productId,
          _id: productId
        };
      });
      isInitialWishlistLoad.current = true;
      setWishlist(formatted);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      if (err.response?.status === 401) {
        logoutUser();
      }
    }
  };

  const saveWishlist = async (updatedWishlist) => {
    if (!user || isAdmin) return;
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const wishlistToSave = updatedWishlist.map(item => ({
        productId: item.id || item._id
      }));
      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/wishlist`, { wishlist: wishlistToSave }, config);
    } catch (err) {
      console.error("Error saving wishlist to backend:", err);
    }
  };

  const initializeUserCart = (loggedInUser) => {
    setUser(loggedInUser);
    setIsAdmin(false);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    localStorage.removeItem("isAdmin");
  };

  const loginAdmin = () => {
    setIsAdmin(true);
    setUser(null);
    localStorage.setItem("isAdmin", "true");
    localStorage.removeItem("user");
    setCart([]);
  };

  const logoutUser = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("isAdmin");
    setCart([]);
    setWishlist([]);
  };

  // --- CART OPERATIONS ---
  const addToCart = (product, qty = 1) => {
    const productId = product.id || product._id;
    setCart((prev) => {
      const existing = prev.find((p) => (p.id || p._id) === productId);
      if (existing) {
        return prev.map((p) =>
          (p.id || p._id) === productId ? { ...p, quantity: (p.quantity || 1) + qty } : p
        );
      } else {
        return [...prev, { ...product, id: productId, quantity: qty }];
      }
    });
    toast.success(`${product.name} added to cart!`);
  };

  const decreaseQuantity = (productId) => {
    setCart((prev) => {
      return prev
        .map((p) =>
          (p.id || p._id) === productId ? { ...p, quantity: (p.quantity || 1) - 1 } : p
        )
        .filter((p) => p.quantity > 0);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((p) => (p.id || p._id) !== productId));
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  const addToWishlist = (product) => {
    const productId = product.id || product._id;
    if (wishlist.some((p) => (p.id || p._id) === productId)) {
      toast.info("Already in wishlist");
      return;
    }
    setWishlist((prev) => [...prev, { ...product, id: productId }]);
    toast.success("Added to wishlist ❤️");
  };

  const removeFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((p) => (p.id || p._id) !== productId));
  };

  const toggleWishlist = (product) => {
    const productId = product.id || product._id;
    const exists = wishlist.some((p) => (p.id || p._id) === productId);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => (p.id || p._id) !== productId));
    } else {
      setWishlist((prev) => [...prev, { ...product, id: productId }]);
      toast.success("Added to wishlist ❤️");
    }
  };

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <CartContext.Provider
      value={{
        user,
        isAdmin,
        cart,
        wishlist,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        initializeUserCart,
        loginAdmin,
        logoutUser,
        searchTerm,
        toggleWishlist,
        setSearchTerm,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
