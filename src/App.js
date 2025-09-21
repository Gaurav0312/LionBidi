//App.js
import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";

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
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://lion-bidi-backend.onrender.com";
const BASE_URL =
  process.env.REACT_APP_API_URL || "https://lion-bidi-backend.onrender.com";

const App = () => {
  const navigate = useNavigate();

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
    if (!user) return;
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
    if (!user) return;

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
    if (!user) return;
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

  useEffect(() => {
    if (user) {
      console.log("User logged in, fetching data from server...");
      fetchCartFromServer();
      fetchWishlistFromServer();
      fetchUserAddress();
    }
  }, [user]);

  const handleGuestDataMerging = async () => {
    try {
      const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
      const guestWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

      console.log(
        "Guest data - Cart:",
        guestCart.length,
        "Wishlist:",
        guestWishlist.length
      );

      // Handle cart merging
      if (guestCart.length > 0) {
        try {
          const response = await api.post("/api/cart/merge", {
            items: guestCart,
          });
          if (response.data.success) {
            localStorage.removeItem("cart");
            await fetchCartFromServer();
            console.log("Cart merged successfully");
          }
        } catch (error) {
          console.error("Error merging cart:", error);
          // Don't fail login for cart merge errors
        }
      }

      // Handle wishlist merging
      if (guestWishlist.length > 0) {
        try {
          const response = await api.post("/api/wishlist/merge", {
            items: guestWishlist,
          });
          if (response.data.success) {
            localStorage.removeItem("wishlist");
            await fetchWishlistFromServer();
            console.log("Wishlist merged successfully");
          }
        } catch (error) {
          console.error("Error merging wishlist:", error);
          // Don't fail login for wishlist merge errors
        }
      }

      // Fetch fresh data if no guest data to merge
      if (guestCart.length === 0) {
        await fetchCartFromServer();
      }
      if (guestWishlist.length === 0) {
        await fetchWishlistFromServer();
      }

      // Always fetch user address
      await fetchUserAddress();
    } catch (error) {
      console.error("Error in guest data merging:", error);
      // Don't fail login for data merging errors
    }
  };

  /* ═══════════════════════════ AUTH HELPERS ═══════════════════════════ */
  const login = async (userData) => {
    console.log("=== LOGIN FUNCTION CALLED ===");
    console.log("User data received:", userData);

    try {
      // Case 1: Manual login with email + password (no token, no _id)
      if (
        userData.email &&
        userData.password &&
        !userData.token &&
        !userData._id &&
        !userData.user
      ) {
        console.log("Processing login credentials via API...");

        const response = await fetch(`${BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: userData.email.toLowerCase().trim(),
            password: userData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }

        // Store token
        localStorage.setItem("token", data.token);

        // Create user object from API response
        const newUserData = {
          id: data.user._id || data.user.id,
          _id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          isAdmin: data.user.isAdmin || data.user.role === "admin",
          role: data.user.role || "customer",
          avatar: data.user.avatar,
          isEmailVerified: data.user.isEmailVerified,
          isPhoneVerified: data.user.isPhoneVerified,
          addresses: data.user.addresses || [],
          wishlist: data.user.wishlist || [],
          token: data.token,
          _loginTimestamp: Date.now(),
          _forceUpdate: Math.random().toString(36),
        };

        // Update only local state (NO REDUX)
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));

        console.log(
          "Manual login successful, user state updated:",
          newUserData
        );

        // Handle guest data merging
        await handleGuestDataMerging();

        return newUserData;
      }
      // Case 2: Registration response format { user: {...}, token: "..." }
      else if (userData.user && userData.token) {
        console.log("Processing registration response format...");

        localStorage.setItem("token", userData.token);

        const user = userData.user;
        const newUserData = {
          id: user._id || user.id,
          _id: user._id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          isAdmin: user.isAdmin || user.role === "admin",
          role: user.role || "customer",
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          addresses: user.addresses || [],
          wishlist: user.wishlist || [],
          token: userData.token,
          _loginTimestamp: Date.now(),
          _forceUpdate: Math.random().toString(36),
        };

        // Update only local state (NO REDUX)
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));

        console.log(
          "Registration login successful, user state updated:",
          newUserData
        );

        await handleGuestDataMerging();
        return newUserData;
      }
      // Case 3: OAuth or already authenticated user data { token: "...", email: "...", _id: "..." }
      else if (
        userData.token &&
        userData.email &&
        (userData._id || userData.id)
      ) {
        console.log("Processing OAuth/authenticated user data...");

        localStorage.setItem("token", userData.token);

        const newUserData = {
          id: userData._id || userData.id,
          _id: userData._id || userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          isAdmin: userData.isAdmin || userData.role === "admin",
          role: userData.role || "customer",
          avatar: userData.avatar,
          isEmailVerified: userData.isEmailVerified,
          isPhoneVerified: userData.isPhoneVerified,
          addresses: userData.addresses || [],
          wishlist: userData.wishlist || [],
          token: userData.token,
          _loginTimestamp: Date.now(),
          _forceUpdate: Math.random().toString(36),
        };

        // Update only local state (NO REDUX)
        setUser(newUserData);
        localStorage.setItem("user", JSON.stringify(newUserData));

        console.log("OAuth login successful, user state updated:", newUserData);

        await handleGuestDataMerging();
        return newUserData;
      } else {
        console.error("Invalid user data format received:", userData);
        throw new Error("Invalid user data format - missing required fields");
      }
    } catch (error) {
      console.error("Login failed:", error);

      // Clear any partial auth data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);

      const errorMessage =
        typeof error === "string"
          ? error
          : error.message || "Login failed. Please try again.";

      throw new Error(errorMessage);
    }
  };

  // Update logout function
  const logout = async () => {
    try {
      console.log("Logging out user...");

      // Clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("cart"); // Optional: clear guest cart too
      localStorage.removeItem("wishlist"); // Optional: clear guest wishlist too

      // Clear local state
      setUser(null);
      setCartItems([]);
      setWishlist([]);
      setUserAddress(null);

      console.log("Logout completed successfully");
      toast.success("Logged out successfully");

      // Navigate to home page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      //toast.error("Error during logout");
    }
  };

  /* ═══════════════════════════ CART HELPERS ═══════════════════════════ */
  const addToCart = async (product, quantity = 1) => {
    if (user) {
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

    if (user) {
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

    if (user) {
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
    if (user) {
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
    if (user) {
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
    if (user) {
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
    if (user) {
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
    console.log("User logged in:", !!user);

    if (user) {
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
    user: user,
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
    updateCartItemQuantity: updateCartItemQuantity,
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
              element={user ? <OrdersPage /> : <Navigate to="/login" replace />}
            />

            <Route
              path="/orders/:orderId/track"
              element={
                user ? <OrderTrackingPage /> : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/wishlist"
              element={
                user ? <WishlistPage /> : <Navigate to="/login" replace />
              }
            />
            <Route
              path="/profile"
              element={
                user ? <Profile user={user} /> : <Navigate to="/login" />
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
