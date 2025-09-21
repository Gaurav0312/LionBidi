import React, { useState, useEffect } from "react";
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
import SocialLogin from "../components/SocialLogin";

import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../store/userSlice";
// your thunk (NOT asyncThunk)
import { mergeCart } from "../store/cartSlice"; // asyncThunk for merging

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const localCartItems = useSelector((state) => state.cart.items);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  
  useEffect(() => {
  // Handle OAuth redirect errors
  const urlParams = new URLSearchParams(window.location.search);
  const errorParam = urlParams.get('error');
  const messageParam = urlParams.get('message');
  
  if (errorParam) {
    let errorMessage = 'Login failed';
    
    switch (errorParam) {
      case 'oauth_cancelled':
        errorMessage = 'Google login was cancelled';
        break;
      case 'auth_failed':
        errorMessage = messageParam ? decodeURIComponent(messageParam) : 'Authentication failed';
        break;
      case 'security_error':
        errorMessage = 'Security error occurred during login';
        break;
      case 'no_authorization_code':
        errorMessage = 'Authorization failed - please try again';
        break;
      case 'oauth_failed':
        errorMessage = 'Google login failed';
        break;
      default:
        errorMessage = messageParam ? decodeURIComponent(messageParam) : 'Login failed';
    }
    
    setError(errorMessage);
    
    // Clear the URL parameters to prevent the error from persisting on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}, []);

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
  setError('');
  
  if (!validateForm()) return;
  
  setLoading(true);
  try {
    const loginData = {
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
    };

    // Remove .unwrap() - let Redux handle the state
    const result = await dispatch(loginUser(loginData));
    
    if (loginUser.fulfilled.match(result)) {
      // Merge local cart with server cart
      if (localCartItems.length > 0) {
        await dispatch(mergeCart(localCartItems));
      }
      
      alert('Login successful! Welcome back to Lion Bidi!');
      navigate('/');
    } else {
      // Handle rejection
      setError(result.payload || 'Login failed. Please check your credentials.');
    }
  } catch (err) {
    console.error('Login error:', err);
    setError('Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-divine-orange transition-colors p-2 -ml-2 rounded-lg hover:bg-orange-50"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <img
                src="/lion.png"
                alt="Lion Bidi"
                className="h-12 sm:h-16 w-auto"
              />
              <div className="ml-2 sm:ml-3">
                <h1 className="text-3xl sm:text-2xl font-extrabold bg-[#FF6B35] bg-clip-text text-transparent">
                  LION BIDI
                </h1>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm sm:text-base font-serif px-2">
              Sign in to continue your premium shopping experience
            </p>
            <div className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium font-serif shadow-lg mt-3 sm:mt-4">
              <Crown size={14} className="sm:w-4 sm:h-4" />
              <span>Special Bidi</span>
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8">
            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Email */}
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
                    className="w-full pl-10 pr-3 py-3 sm:py-3.5 font-serif border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                    className="w-full pl-10 pr-12 py-3 sm:py-3.5 font-serif border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 sm:py-4 px-4 bg-[#FF6B35] text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base"
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

              {/* Forgot Password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-divine-orange hover:text-divine-orange font-medium transition-colors"
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
                <div className="mt-4 sm:mt-6">
                  <SocialLogin />
                </div>
              </div>

              {/* Register */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 font-medium">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    disabled={loading}
                    className="text-divine-orange hover:text-orange-600 font-bold transition-colors disabled:opacity-50"
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
