// AppContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AppContext = createContext();

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    console.error("useAppContext must be used within an AppProvider");
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return ctx;
};

export const AppProvider = ({ children }) => {
  console.log("🚀 AppProvider initializing...");

  /* Core state */
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /* Auth modal */
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const openAuthModal = () => {
    console.log("🔐 Opening auth modal");
    setAuthModalOpen(true);
  };
  const closeAuthModal = () => {
    console.log("🔐 Closing auth modal");
    setAuthModalOpen(false);
  };

  /* ─────────── WISHLIST (MongoDB) ─────────── */
  const loadWishlist = async () => {
    if (!user) {
      console.log("❤️ No user logged in, skipping wishlist load");
      return;
    }

    console.log("❤️ Loading wishlist for user:", user.id || user._id);
    try {
      const res = await axios.get("/api/wishlist", { withCredentials: true });
      console.log(
        "❤️ Wishlist loaded successfully:",
        res.data.wishlist?.length || 0,
        "items"
      );
      setWishlist(res.data.wishlist || []);
    } catch (err) {
      console.error(
        "❤️ Failed to fetch wishlist:",
        err.response?.data?.message || err.message
      );
      setWishlist([]);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("👤 User changed, loading wishlist...");
      loadWishlist();
    } else {
      console.log("👤 User logged out, clearing wishlist");
      setWishlist([]);
    }
  }, [user]);



  /* ─────────── CART (Persistence) ─────────── */
  const loadCart = async () => {
    console.log("🛒 Loading cart...");

    if (user) {
      console.log("🛒 User logged in, loading from server");
      try {
        const res = await axios.get("/api/cart", { withCredentials: true });
        const serverCart = res.data.cart || [];
        console.log("🛒 Server cart loaded:", serverCart.length, "items");

        const mappedCart = serverCart.map((item) => ({
          ...(item.product || item),
          quantity: item.quantity || 1,
          _id: (item.product && item.product._id) || item._id || item.id,
        }));

        console.log("🛒 Mapped cart:", mappedCart);
        setCartItems(mappedCart);
      } catch (err) {
        console.error(
          "🛒 Failed to fetch cart from server:",
          err.response?.data?.message || err.message
        );
        loadCartFromLocalStorage();
      }
    } else {
      console.log("🛒 No user, loading from localStorage");
      loadCartFromLocalStorage();
    }
  };

  const loadCartFromLocalStorage = () => {
    console.log("🛒 Loading cart from localStorage");
    try {
      let savedCart = localStorage.getItem("cart");

      // ✅ If primary cart is missing, try backup
      if (!savedCart) {
        console.log("🛒 Primary cart not found, trying backup");
        const backup = localStorage.getItem("cart_backup");
        if (backup) {
          const backupData = JSON.parse(backup);
          // Use backup if it's less than 7 days old
          if (Date.now() - backupData.timestamp < 7 * 24 * 60 * 60 * 1000) {
            savedCart = JSON.stringify(backupData.items);
          }
        }
      }

      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        console.log("🛒 LocalStorage cart loaded:", parsed.length, "items");
        setCartItems(parsed);
      } else {
        console.log("🛒 No cart found in localStorage");
        setCartItems([]);
      }
    } catch (e) {
      console.error("🛒 Failed to load cart from localStorage:", e);
      setCartItems([]);
    }
  };

  const saveCartToLocalStorage = (items) => {
    console.log("🛒 Saving cart to localStorage:", items.length, "items");
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      // ✅ Also save a backup with timestamp
      localStorage.setItem(
        "cart_backup",
        JSON.stringify({
          items: items,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.error("🛒 Failed to save cart to localStorage:", e);
    }
  };

  const saveCartToServer = async (items) => {
    if (!user) {
      console.log("🛒 No user, skipping server save");
      return;
    }

    console.log("🛒 Saving cart to server:", items.length, "items");
    try {
      await axios.post("/api/cart", { items }, { withCredentials: true });
      console.log("🛒 Cart saved to server successfully");
    } catch (err) {
      console.error(
        "🛒 Failed to save cart to server:",
        err.response?.data?.message || err.message
      );
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      console.log("🛒 User not logged in, opening auth modal");
      openAuthModal();
      return;
    }

    const productId = product.id || product._id;
    console.log("🛒 Adding to cart:", productId, product.name);

    try {
      // ✅ Use correct API endpoint and send complete product data
      const response = await axios.post(
        "/api/cart/add",
        {
          productId: productId,
          quantity: 1,
          productData: {
            _id: productId,
            id: productId,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice || product.price,
            image: product.image,
            stock: product.stock || 999,
            discount: product.discount,
            originalPrice: product.originalPrice,
          },
        },
        { withCredentials: true }
      );

      if (response.data.success) {
      // Ensure each cart item has consistent ID fields
      const updatedCart = (response.data.cart || []).map(item => ({
        ...item,
        _id: item._id || item.id || item.productId,
        id: item.id || item._id || item.productId,
      }));
      
      setCartItems(updatedCart);
      console.log("🛒 Cart updated from server:", updatedCart);
    }
    } catch (err) {
      console.error(
        "🛒 Failed to add to cart:",
        err.response?.data?.message || err.message
      );

      // Fallback to localStorage for error cases
      setCartItems((prev) => {
        const existing = prev.find(
          (p) => p._id === productId || p.id === productId
        );

        let updated;
        if (existing) {
          updated = prev.map((p) =>
            p._id === productId || p.id === productId
              ? { ...p, quantity: (p.quantity || 0) + 1 }
              : p
          );
        } else {
          updated = [...prev, { ...product, quantity: 1, _id: productId }];
        }

        saveCartToLocalStorage(updated);
        return updated;
      });
    }
  };

  // Fixed updateCartQuantity function
  const updateCartQuantity = async (id, qty) => {
    console.log("🛒 Updating cart quantity:", id, "to", qty);

    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    if (user) {
      try {
        const response = await axios.put(
          `/api/cart/update/${id}`,
          { quantity: qty },
          { withCredentials: true }
        );

        if (response.data.success) {
          setCartItems(response.data.cart || []);
        }
      } catch (err) {
        console.error("🛒 Failed to update cart quantity:", err);
      }
    } else {
      // Local storage fallback
      setCartItems((prev) => {
        const updated = prev.map((p) => {
          if (p._id === id || p.id === id) {
            return { ...p, quantity: qty };
          }
          return p;
        });
        saveCartToLocalStorage(updated);
        return updated;
      });
    }
  };

  // Fixed updateCartItemQuantity function - this was the main issue
  const updateCartItemQuantity = (id, qty) => {
    console.log("🛒 updateCartItemQuantity called:", id, qty);
    updateCartQuantity(id, qty);
  };

  const removeFromCart = (id) => {
    console.log("🛒 Removing from cart:", id);

    setCartItems((prev) => {
      const updated = prev.filter((p) => p._id !== id && p.id !== id);
      console.log("🛒 Cart after removal:", updated.length, "items remaining");
      saveCartToLocalStorage(updated);
      saveCartToServer(updated);
      return updated;
    });
  };

  const clearCart = () => {
    console.log("🛒 Clearing entire cart");
    setCartItems([]);
    localStorage.removeItem("cart");
    if (user) {
      console.log("🛒 User logged in, clearing server cart too");
      saveCartToServer([]);
    }
  };

  const getCartTotal = () => {
    const total = cartItems.reduce(
      (t, p) => t + (p.price || 0) * (p.quantity || 0),
      0
    );
    console.log("🛒 Cart total calculated:", total);
    return total;
  };

  const getCartItemsCount = () => {
    const count = cartItems.reduce((t, p) => t + (p.quantity || 0), 0);
    console.log("🛒 Cart items count:", count);
    return count;
  };

  /* ─────────── USER MANAGEMENT ─────────── */
  const login = async (userData) => {
    console.log("👤 Logging in user:", userData.email || userData.username);

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    closeAuthModal();

    try {
      const localCart = cartItems;
      console.log("👤 Local cart items to merge:", localCart.length);

      if (localCart.length > 0) {
        console.log("👤 Merging local cart with server cart");
        await axios.post(
          "/api/cart/merge",
          { items: localCart },
          { withCredentials: true }
        );
      }

      console.log("👤 Loading user data after login");
      await loadCart();
      await loadWishlist();
    } catch (err) {
      console.error(
        "👤 Failed to merge cart after login:",
        err.response?.data?.message || err.message
      );
    }
  };

  const logout = (preserveCart = false) => {
    console.log("👤 Logging out user, preserve cart:", preserveCart);
    setUser(null);
    setWishlist([]);
    localStorage.removeItem("user");

    if (!preserveCart) {
      setCartItems([]);
      localStorage.removeItem("cart");
    }

    console.log("👤 User logged out and data cleared");
  };

  /* Initial data loading */
  // Replace the user initialization logic in useEffect with this:
  useEffect(() => {
    // Move functions inside useEffect to avoid dependency issues
    const loadCartFromLocalStorage = () => {
      console.log("🛒 Loading cart from localStorage");
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          console.log("🛒 LocalStorage cart loaded:", parsed.length, "items");
          setCartItems(parsed);
        } else {
          console.log("🛒 No cart found in localStorage");
          setCartItems([]);
        }
      } catch (e) {
        console.error("🛒 Failed to load cart from localStorage:", e);
        setCartItems([]);
      }
    };

    const loadCartFromServer = async () => {
      console.log("🛒 Loading cart from server");
      try {
        const res = await axios.get("/api/cart", { withCredentials: true });
        const serverCart = res.data.cart || [];
        console.log("🛒 Server cart loaded:", serverCart.length, "items");

        const mappedCart = serverCart.map((item) => ({
          ...(item.product || item),
          quantity: item.quantity || 1,
          _id: (item.product && item.product._id) || item._id || item.id,
        }));

        console.log("🛒 Mapped cart:", mappedCart);
        setCartItems(mappedCart);
      } catch (err) {
        console.error(
          "🛒 Failed to fetch cart from server:",
          err.response?.data?.message || err.message
        );
        loadCartFromLocalStorage();
      }
    };

    const loadWishlistFromServer = async () => {
      console.log("❤️ Loading wishlist from server");
      try {
        const res = await axios.get("/api/wishlist", { withCredentials: true });
        console.log(
          "❤️ Wishlist loaded successfully:",
          res.data.wishlist?.length || 0,
          "items"
        );
        setWishlist(res.data.wishlist || []);
      } catch (err) {
        console.error(
          "❤️ Failed to fetch wishlist:",
          err.response?.data?.message || err.message
        );
        setWishlist([]);
      }
    };

    const initializeData = async () => {
      console.log("🔄 Initializing app data...");

      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          console.log("🔄 Found saved user in localStorage");
          const userData = JSON.parse(savedUser);
          setUser(userData);

          try {
            console.log("🔄 Verifying user session with server");
            await axios.get("/api/auth/verify", { withCredentials: true });
            console.log("🔄 User session verified, loading user data");
            await loadCartFromServer();
            await loadWishlistFromServer();
          } catch (verifyError) {
            console.error(
              "🔄 User verification failed:",
              verifyError.response?.data?.message || verifyError.message
            );
            console.log("🔄 User session expired, but preserving cart data");

            // ✅ FIXED: Don't call logout(), just clear user data
            setUser(null);
            setWishlist([]);
            localStorage.removeItem("user");

            // ✅ Load cart from localStorage instead of clearing it
            console.log(
              "🔄 Loading cart from localStorage after session expiry"
            );
            loadCartFromLocalStorage();
          }
        } else {
          console.log("🔄 No saved user found, loading cart from localStorage");
          loadCartFromLocalStorage();
        }
      } catch (e) {
        console.error("🔄 Failed to initialize data:", e);

        // ✅ FIXED: Don't clear everything, just load from localStorage
        console.log(
          "🔄 Loading cart from localStorage due to initialization error"
        );
        loadCartFromLocalStorage();
      }
    };

    initializeData();
  }, []); // Empty dependency array is now correct
  // Empty dependency array is correct here

  /* Derived state with logging */
  const isLoggedIn = !!user;
  const cartCount = getCartItemsCount();
  const wishlistCount = wishlist.length;
  const cartTotal = getCartTotal();

  // Debug logging for derived state
  useEffect(() => {
    console.log(
      "📊 State updated - Cart items:",
      cartItems.length,
      "Wishlist:",
      wishlist.length,
      "User:",
      user?.email || "none"
    );
  }, [cartItems, wishlist, user]);

  const contextValue = {
    // State
    cartItems,
    wishlist,
    user,
    isAuthModalOpen,
    selectedProduct,

    // Derived state
    isLoggedIn,
    cartCount,
    wishlistCount,
    cartTotal,

    // Cart functions
    addToCart,
    updateCartQuantity,
    updateCartItemQuantity, // Fixed function
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    setCartItems, // Exposed for debugging/testing

   

    // Auth functions
    login,
    logout,

    // Modal functions
    openAuthModal,
    closeAuthModal,

    // Utility functions
    setSelectedProduct,
    loadCart,
    loadWishlist,
  };

  console.log(
    "🔧 Context value created with functions:",
    Object.keys(contextValue)
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export default AppContext;
