//App.js - Updated with Orders route
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectIsLoggedIn, logoutUser } from "./store/userSlice";

import {
  fetchWishlist,
  saveWishlist,
  mergeWishlist,
  addToWishlist as addToWishlistRedux,
  removeFromWishlist as removeFromWishlistRedux,
  toggleWishlist as toggleWishlistRedux,
} from "./store/wishlistSlice";

import api from "./utils/api";
import AppContext from "./context/AppContext";
import { Toaster, toast } from "react-hot-toast";
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import PaymentVerificationPage from "./pages/PaymentVerificationPage";

import ScrollToTop from "./components/ScrollToTop";
import AuthModal from "./components/AuthModal";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";

import AdminLogin from "./pages/AdminLogin";
import AdminPaymentVerification from "./pages/AdminPaymentVerification";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminSettings from "./pages/AdminSettings";
import AdminAnalytics from "./pages/AdminAnalytics";

import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RefundPolicy from "./components/RefundPolicy/RefundPolicy";
import Profile from "./components/user/Profile";
import AddressPage from "./pages/AddressPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import Layout from "./components/Layout";

// Backend API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const reduxUser = useSelector(selectUser);
  const reduxIsLoggedIn = useSelector(selectIsLoggedIn);
  const reduxCartItems = useSelector((state) => state.cart.items);
  const reduxWishlistItems = useSelector((state) => state.wishlist.items);

  /* ═══════════════════════════ LOCAL STATE ═══════════════════════════ */
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState(null);

  /* ═══════════════════════════ AUTH-MODAL STATE ═══════════════════════════ */
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const openAuthModal = () => setAuthModalOpen(true);
  const closeAuthModal = () => setAuthModalOpen(false);

  // Helper to make authenticated API calls
  const apiCall = async (method, endpoint, data = null) => {
    const token = localStorage.getItem("token");
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
      ...(data && { data }),
    };

    console.log(`API Call: ${method} ${endpoint}`, data);
    const response = await axios(config);
    console.log(`API Response:`, response.data);
    return response;
  };

  /* ═══ Fetch cart from server ═══ */
  const fetchCartFromServer = async () => {
    if (!user && !reduxIsLoggedIn) return;
    try {
      const response = await api.get("/api/cart");
      if (response.data.success) {
        setCartItems(response.data.cart || []);
        console.log("Cart loaded from server:", response.data.cart);
      }
    } catch (error) {
      console.error("Error fetching cart from server:", error);
      if (error.response?.status !== 401) {
        // toast.error("Failed to load cart from server");
      }
    }
  };

  const fetchUserAddress = async () => {
    if (!user && !reduxIsLoggedIn) return;

    try {
      const response = await api.get("/api/address");
      if (response.data.success && response.data.address) {
        setUserAddress(response.data.address);
      }
    } catch (error) {
      console.error("Error fetching user address:", error);
    }
  };

  /* ═══ Fetch wishlist from server ═══ */
  const fetchWishlistFromServer = async () => {
    if (!user && !reduxIsLoggedIn) return;
    try {
      console.log("Fetching wishlist from server...");
      const response = await api.get("/api/wishlist");
      console.log("Wishlist fetch response:", response.data);

      if (response.data.success) {
        const wishlistData = response.data.wishlist || [];
        console.log("Setting wishlist state to:", wishlistData);
        setWishlist(wishlistData);
        console.log(
          "Wishlist state updated with",
          wishlistData.length,
          "items"
        );
      } else {
        console.error("Wishlist fetch failed:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error fetching wishlist from server:",
        error.response?.data || error
      );
      if (error.response?.status !== 401) {
        // toast.error("Failed to load wishlist from server");
      }
    }
  };

  /* ═══ Initialize app ═══ */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        console.log("Initializing app - User:", !!savedUser, "Token:", !!token);

        if (savedUser && token) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log("User restored from localStorage:", userData);
        } else {
          // Guest user - load cart and wishlist from localStorage
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              const cartData = JSON.parse(savedCart);
              setCartItems(cartData);
              console.log("Guest cart loaded:", cartData);
            } catch (e) {
              console.error("Error parsing saved cart:", e);
              localStorage.removeItem("cart");
            }
          }

          const savedWishlist = localStorage.getItem("wishlist");
          if (savedWishlist) {
            try {
              const wishlistData = JSON.parse(savedWishlist);
              setWishlist(wishlistData);
              console.log("Guest wishlist loaded:", wishlistData);
            } catch (e) {
              console.error("Error parsing saved wishlist:", e);
              localStorage.removeItem("wishlist");
            }
          }
        }
      } catch (err) {
        console.error("Error restoring state:", err);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Fetch cart and wishlist from server when user logs in
  useEffect(() => {
    if (user || reduxIsLoggedIn) {
      console.log("User logged in, fetching data from server...");
      fetchCartFromServer();
      fetchWishlistFromServer();
    }
  }, [user, reduxIsLoggedIn]);

  useEffect(() => {
    if (user || reduxIsLoggedIn) {
      console.log("User logged in, fetching data from server...");
      fetchCartFromServer();
      fetchWishlistFromServer();
      fetchUserAddress(); // Add this line
    }
  }, [user, reduxIsLoggedIn]);

  // Sync Redux state with local state
  useEffect(() => {
    if (reduxUser && !user) {
      setUser(reduxUser);
    } else if (!reduxUser && user) {
      setUser(null);
      setCartItems([]);
      setWishlist([]);
    }
  }, [reduxUser, user]);

  // Sync Redux cart with local cart state
  useEffect(() => {
    if (reduxCartItems.length > 0) {
      setCartItems(reduxCartItems);
    }
  }, [reduxCartItems]);

  // Sync Redux wishlist with local wishlist state
  useEffect(() => {
    if (reduxWishlistItems.length > 0) {
      setWishlist(reduxWishlistItems);
    }
  }, [reduxWishlistItems]);

  /* ═══════════════════════════ AUTH HELPERS ═══════════════════════════ */
  // In App.js - Update your login function
  const login = async (userData) => {
    console.log("=== LOGIN FUNCTION CALLED ===");
    console.log("User data received:", userData);

    try {
      // Force a complete new object reference to trigger re-renders
      const newUserData = {
        ...userData,
        _timestamp: Date.now(), // Add timestamp to ensure object reference changes
      };

      // Update state first
      setUser(newUserData);
      localStorage.setItem("user", JSON.stringify(newUserData));

      // Force a small delay to ensure state is updated
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Rest of your login logic...
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      const guestWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      if (guestCart.length > 0) {
        try {
          const response = await api.post("/api/cart/merge", {
            items: guestCart,
          });
          localStorage.removeItem("cart");
          // toast.success("Cart synced with your account");
          await fetchCartFromServer();
        } catch (error) {
          console.error("Error merging cart:", error);
          // toast.error("Failed to sync cart, but login successful");
        }
      }

      if (guestWishlist.length > 0) {
        try {
          const response = await api.post("/api/wishlist/merge", {
            items: guestWishlist,
          });
          localStorage.removeItem("wishlist");
          // toast.success("Wishlist synced with your account");
          await fetchWishlistFromServer();
        } catch (error) {
          console.error("Error merging wishlist:", error);
          // toast.error("Failed to sync wishlist, but login successful");
        }
      }

      if (guestCart.length === 0) await fetchCartFromServer();
      if (guestWishlist.length === 0) await fetchWishlistFromServer();

      closeAuthModal();
      toast.success("Login successful!");

      console.log("Login function completed, user set to:", newUserData);
    } catch (error) {
      console.error("Error in login function:", error);
      //toast.error("Login completed but some features may not work properly");
    }
  };

  // Update logout function
  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    setCartItems([]);
    setWishlist([]);
    toast.success("Logged out successfully");
  };

  /* ═══════════════════════════ CART HELPERS ═══════════════════════════ */
  const addToCart = async (product, quantity = 1) => {
    if (user || reduxIsLoggedIn) {
      try {
        const productId = product._id || product.id;
        console.log("Adding to server cart - Product ID:", productId);

        const response = await api.post("/api/cart/add", {
          productId: productId,
          quantity: quantity,
          productData: {
            _id: productId,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice || product.price,
            image: product.image,
            stock: product.stock || 99999,
            discount: product.discount,
            originalPrice: product.originalPrice,
          },
        });

        if (response.data.success) {
          setCartItems(response.data.cart || []);
        } else {
          // toast.error(response.data.message || "Failed to add to cart");
        }
      } catch (error) {
        console.error("Add to cart error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to add to cart";
        toast.error(errorMessage);
      }
    } else {
      // Guest user logic
      setCartItems((prev) => {
        const productId = product._id || product.id;
        const existing = prev.find((i) => (i._id || i.id) === productId);
        let updated;

        if (existing) {
          updated = prev.map((i) =>
            (i._id || i.id) === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          updated = [
            ...prev,
            {
              ...product,
              quantity: quantity,
              id: productId,
              _id: productId,
            },
          ];
        }

        localStorage.setItem("cart", JSON.stringify(updated));
        toast.success(`${quantity} x ${product.name} added to cart`);
        return updated;
      });
    }
  };

  const updateCartItemQuantity = async (id, qty) => {
    console.log(`🔄 updateCartItemQuantity called: ID=${id}, Quantity=${qty}`);

    if (qty <= 0) {
      console.log("📉 Quantity <= 0, calling removeFromCart");
      return removeFromCart(id);
    }

    if (user || reduxIsLoggedIn) {
      try {
        console.log("📡 Making API call to update cart quantity");
        const response = await api.put(`/api/cart/update/${id}`, {
          quantity: qty,
        });

        if (response.data.success) {
          console.log("✅ Cart updated successfully on server");
          setCartItems(response.data.cart || []);
        } else {
          console.error("❌ Server returned error:", response.data.message);
        }
      } catch (error) {
        console.error("❌ Error updating cart on server:", error);
      }
    } else {
      // Guest user logic
      setCartItems((prev) => {
        const updated = prev.map((i) =>
          (i._id || i.id) === id ? { ...i, quantity: qty } : i
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateCartQuantity = async (id, qty) => {
    if (qty <= 0) return removeFromCart(id);

    if (user || reduxIsLoggedIn) {
      try {
        const response = await api.put(`/api/cart/update/${id}`, {
          quantity: qty,
        });

        if (response.data.success) {
          setCartItems(response.data.cart || []);
        }
      } catch (error) {
        console.error("Error updating cart:", error);
      }
    } else {
      // Guest user logic
      setCartItems((prev) => {
        const updated = prev.map((i) =>
          (i._id || i.id) === id ? { ...i, quantity: qty } : i
        );
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (id) => {
    if (user || reduxIsLoggedIn) {
      try {
        const response = await api.delete(`/api/cart/remove/${id}`);

        if (response.data.success) {
          setCartItems(response.data.cart || []);
          toast.success("Item removed from cart");
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    } else {
      // Guest user logic
      setCartItems((prev) => {
        const item = prev.find((i) => (i._id || i.id) === id);
        if (item) toast.success(`${item.name} removed from cart`);
        const updated = prev.filter((i) => (i._id || i.id) !== id);
        localStorage.setItem("cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Update clearCart
  const clearCart = async () => {
    if (user || reduxIsLoggedIn) {
      try {
        await api.delete("/api/cart/clear");
        setCartItems([]);

        toast.success("Cart cleared", {
          id: "cart-cleared",
        });
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem("cart");

      toast.success("Cart cleared", {
        id: "cart-cleared",
      });
    }
  };

  const getCartTotal = () =>
    cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);

  const getCartItemsCount = () =>
    cartItems.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  /* ═══════════════════════════ WISHLIST HELPERS ═══════════════════════════ */
  const addToWishlist = async (product) => {
    if (user || reduxIsLoggedIn) {
      try {
        const productId = product._id || product.id;
        console.log("Adding to server wishlist - Product ID:", productId);

        const response = await api.post("/api/wishlist/add", {
          productId: productId,
          productData: {
            _id: productId,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice || product.price,
            image: product.image,
            category: product.category,
            brand: product.brand,
          },
        });

        if (response.data.success) {
          setWishlist(response.data.wishlist || []);
          toast.success(`${product.name} added to wishlist`);
        } else {
          toast.error(response.data.message || "Failed to add to wishlist");
        }
      } catch (error) {
        console.error("Add to wishlist error:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to add to wishlist";
        toast.error(errorMessage);
      }
    } else {
      // Guest user logic
      setWishlist((prev) => {
        const productId = product._id || product.id;
        if (prev.some((i) => (i._id || i.id) === productId)) return prev;
        toast.success(`${product.name} added to wishlist`);
        const updated = [
          ...prev,
          {
            ...product,
            id: productId,
            _id: productId,
          },
        ];
        localStorage.setItem("wishlist", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromWishlist = async (id) => {
    if (user || reduxIsLoggedIn) {
      try {
        const response = await api.delete(`/api/wishlist/remove/${id}`);

        if (response.data.success) {
          setWishlist(response.data.wishlist || []);
          toast.success("Item removed from wishlist");
        }
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    } else {
      // Guest user logic
      setWishlist((prev) => {
        const item = prev.find((i) => (i._id || i.id) === id);
        if (item) toast.success(`${item.name} removed from wishlist`);
        const updated = prev.filter((i) => (i._id || i.id) !== id);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Fixed toggleWishlist function for App.js
  const toggleWishlist = async (product) => {
    const productId = product._id || product.id;
    const isInWishlist = wishlist.some(
      (i) =>
        (i._id || i.id || i.productId)?.toString() === productId?.toString()
    );

    console.log("=== TOGGLE WISHLIST DEBUG ===");
    console.log("Product ID:", productId);
    console.log("Product Name:", product.name);
    console.log("Current wishlist state:", wishlist);
    console.log("Is in wishlist:", isInWishlist);
    console.log("User logged in:", !!(user || reduxIsLoggedIn));

    if (user || reduxIsLoggedIn) {
      try {
        console.log("Making API call to toggle wishlist...");

        const response = await api.post("/api/wishlist/toggle", {
          productId: productId,
          productData: {
            _id: productId,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice || product.price,
            image: product.image,
            category: product.category,
            brand: product.brand,
          },
        });

        if (response.data.success) {
          // Create a completely new array to force React re-render
          const newWishlist = [...(response.data.wishlist || [])];
          console.log("Setting new wishlist state:", newWishlist);

          setWishlist(newWishlist);

          // Verify state was set
          setTimeout(() => {
            console.log("Wishlist state after update:", wishlist);
          }, 100);

          // Optional Redux dispatch
          try {
            if (response.data.action === "added") {
              dispatch(addToWishlistRedux(product));
            } else {
              dispatch(removeFromWishlistRedux(productId));
            }
          } catch (reduxError) {
            console.log("Redux dispatch error (non-critical):", reduxError);
          }
        } else {
          console.error("API call unsuccessful:", response.data.message);
        }
      } catch (error) {
        console.error(
          "Toggle wishlist API error:",
          error.response?.data || error
        );
      }
    } else {
      // Guest user logic
      console.log("Guest user - updating local storage...");

      if (isInWishlist) {
        setWishlist((prev) => {
          const item = prev.find(
            (i) => (i._id || i.id)?.toString() === productId?.toString()
          );
          if (item) toast.success(`${item.name} removed from wishlist`);
          const updated = prev.filter(
            (i) => (i._id || i.id)?.toString() !== productId?.toString()
          );
          localStorage.setItem("wishlist", JSON.stringify(updated));
          console.log("Guest wishlist updated (removed):", updated);
          return updated;
        });
      } else {
        setWishlist((prev) => {
          if (
            prev.some(
              (i) => (i._id || i.id)?.toString() === productId?.toString()
            )
          )
            return prev;
          toast.success(`${product.name} added to wishlist`);
          const updated = [
            ...prev,
            {
              ...product,
              id: productId,
              _id: productId,
            },
          ];
          localStorage.setItem("wishlist", JSON.stringify(updated));
          console.log("Guest wishlist updated (added):", updated);
          return updated;
        });
      }
    }
  };

  /* ═══════════════════════════ CONTEXT VALUE ═══════════════════════════ */
  const contextValue = {
    user: user || reduxUser,
    cartItems,
    wishlist,
    userAddress,
    isAuthModalOpen,

    login,
    logout,
    openAuthModal,
    closeAuthModal,

    addToCart,
    updateCartQuantity,
    updateCartItemQuantity: updateCartQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,

    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    fetchUserAddress,

    showToast: (msg, type = "success") =>
      type === "error" ? toast.error(msg) : toast.success(msg),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/address"
            element={
              user || reduxIsLoggedIn ? (
                <AddressPage />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route
              path="/payment-verification/:orderNumber"
              element={<PaymentVerificationPage />}
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/address" element={<AddressPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/auth/google/callback"
              element={<GoogleAuthCallback />}
            />
            <Route path="/admin" element={<Navigate to="/admin/login" />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/*"
              element={
                <AdminProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route
                        path="payment-verification"
                        element={<AdminPaymentVerification />}
                      />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route
                        path=""
                        element={<Navigate to="/admin/dashboard" />}
                      />
                    </Routes>
                  </AdminLayout>
                </AdminProtectedRoute>
              }
            />

            <Route
              path="/order-confirmation/:orderNumber"
              element={<OrderConfirmationPage />}
            />
            <Route path="/product/:slug" element={<ProductDetailPage />} />

            {/* ✅ Add Orders Route */}
            <Route
              path="/orders"
              element={
                user || reduxIsLoggedIn ? (
                  <OrdersPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/orders/:orderId/track"
              element={
                user || reduxIsLoggedIn ? (
                  <OrderTrackingPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route
              path="/wishlist"
              element={
                user || reduxIsLoggedIn ? (
                  <WishlistPage />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/profile"
              element={
                user || reduxIsLoggedIn ? (
                  <Profile user={user || reduxUser} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/refund-policy" element={<RefundPolicy />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      <AuthModal />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            style: {
              background: "#10B981",
            },
          },
          error: {
            style: {
              background: "#EF4444",
            },
          },
        }}
      />
    </AppContext.Provider>
  );
};

export default App;
