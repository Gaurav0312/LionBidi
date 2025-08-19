import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Crown,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate(); // ✅ Add this hook
  const { login } = useAppContext();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleChange = (e) => {
    setError(""); // Clear error on input change
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const loginData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
      };

      // Login API call
      const loginResponse = await fetch(
        "https://lion-bidi-backend.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        }
      );

      const responseData = await loginResponse.json();

      if (loginResponse.ok) {
        // Store token
        localStorage.setItem("token", responseData.token);

        // Update app context with user data
        login({
          id: responseData.user._id || responseData.user.id,
          name: responseData.user.name,
          email: responseData.user.email,
          phone: responseData.user.phone,
          isAdmin:
            responseData.user.isAdmin || responseData.user.role === "admin",
          role: responseData.user.role,
          avatar: responseData.user.avatar,
          isEmailVerified: responseData.user.isEmailVerified,
          isPhoneVerified: responseData.user.isPhoneVerified,
          addresses: responseData.user.addresses,
          wishlist: responseData.user.wishlist,
          cartItemsCount: responseData.user.cart
            ? responseData.user.cart.length
            : 0,
        });

        // Update last login on successful login
        if (responseData.user._id) {
          fetch(
            `https://lion-bidi-backend.onrender.com/api/users/${responseData.user._id}/update-login`,
            {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${responseData.token}`,
                "Content-Type": "application/json",
              },
            }
          ).catch(() => {}); // Silent fail for this update
        }

        // Show success message and redirect
        alert("Login successful! Welcome back to Lion Bidi!");
        navigate("/");
      } else {
        setError(
          responseData.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Network error occurred. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      // This would typically redirect to OAuth provider
      window.location.href = `https://lion-bidi-backend.onrender.com/api/auth/${provider}`;
    } catch (err) {
      setError(`${provider} login is currently unavailable`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Enhanced Mobile Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-orange-50"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Better Mobile Spacing */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-md w-full">
          {/* Enhanced Header */}
          <div className="text-center mb-6 sm:mb-8">
            {/* Logo Section - Responsive */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <img
                src="/lion.png"
                alt="Lion Bidi"
                className="h-12 sm:h-16 w-auto"
              />
              <div className="ml-2 sm:ml-3">
                <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
                  Lion Bidi
                </h1>
                <p className="text-xs text-orange-500 font-medium tracking-wide">
                  Premium Quality
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-gray-600 text-sm sm:text-base px-2">
              Sign in to continue your premium shopping experience
            </p>

            {/* Premium Badge - Mobile Optimized */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg mt-3 sm:mt-4">
              <Crown size={14} className="sm:w-4 sm:h-4" />
              <span>Premium Experience</span>
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
            </div>
          </div>

          {/* Enhanced Form Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400 sm:w-5 sm:h-5" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                    placeholder="Enter your password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff
                        size={18}
                        className="text-gray-400 sm:w-5 sm:h-5"
                      />
                    ) : (
                      <Eye size={18} className="text-gray-500 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 hover:from-orange-500 hover:via-red-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Forgot Password Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-orange-600 hover:text-orange-500 font-medium transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Social Login */}
              <div className="mt-4 sm:mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500 font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("google")}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="ml-2">Google</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("facebook")}
                    disabled={loading}
                    className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span className="ml-2">Facebook</span>
                  </button>
                </div>
              </div>

              {/* Register Section */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 font-medium">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    disabled={loading}
                    className="text-orange-600 hover:text-orange-500 font-bold transition-colors disabled:opacity-50"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* Enhanced Footer */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-sm text-gray-500 mb-3 sm:mb-4">
              Join thousands of happy customers
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="text-green-500 text-sm">✓</span> Premium
                Quality
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-green-500 text-sm">✓</span> Fast Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-green-500 text-sm">✓</span> 24/7 Support
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
