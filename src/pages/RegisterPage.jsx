import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Check,
  X,
  Crown,
  Sparkles,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { login, setCurrentPage } = useAppContext();
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState(["", "", "", "", "", ""]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailResendCooldown, setEmailResendCooldown] = useState(0);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const calculatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    setPasswordRequirements(requirements);
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);
  };

  useEffect(() => {
    calculatePasswordStrength(formData.password);
  }, [formData.password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  const handleEmailOtpChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`email-otp-${index + 1}`)?.focus();
    }
  };

  const handleEmailOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
      document.getElementById(`email-otp-${index - 1}`)?.focus();
    }
  };
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (formData.name.trim().length > 50) {
      setError("Name cannot be more than 50 characters");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return false;
    }
    if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Please enter your phone number");
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError(
        "Please enter a valid Indian phone number (10 digits starting with 6-9)"
      );
      return false;
    }
    if (!formData.password.trim()) {
      setError("Please enter a password");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        setError("You must be at least 18 years old to register");
        return false;
      }
    }
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return false;
    }
    if (!ageVerified) {
      setError("Please verify that you are 18 or older");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.zipCode && !/^\d{6}$/.test(formData.zipCode)) {
      setError("Please enter a valid 6-digit PIN code");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSendEmailOtp();
    }
  };

  const handleSendEmailOtp = async () => {
    setError("");
    setLoading(true);

    try {
      // First check if email/phone already exists
      const checkResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/check-availability`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone,
          }),
        }
      );

      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        setError(checkData.message || "Email or phone number already exists");
        setLoading(false);
        return;
      }

      // Send Email OTP
      const emailOtpResponse = await fetch(
        `${API_BASE_URL}/api/auth/send-registration-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.toLowerCase().trim(),
            name: formData.name.trim(),
          }),
        }
      );

      const emailOtpData = await emailOtpResponse.json();

      if (emailOtpResponse.ok) {
        setStep(3);
        setEmailOtpSent(true);
        alert("Verification code sent to your email");

        // Start countdown
        setEmailResendCooldown(30);
        const timer = setInterval(() => {
          setEmailResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(
          emailOtpData.message || "Failed to send email verification code"
        );
      }
    } catch (err) {
      console.error("Email OTP error:", err);
      setError("Network error occurred. Please try again.");
      setEmailOtpSent(false);
    } finally {
      setLoading(false);
    }
  };

  const resendEmailOtp = async () => {
    if (emailResendCooldown > 0) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/auth/send-email-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            type: "verification",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEmailOtp(["", "", "", "", "", ""]);
        alert("Email OTP resent successfully");

        // Start countdown
        setEmailResendCooldown(30);
        const timer = setInterval(() => {
          setEmailResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || "Failed to resend email OTP");
      }
    } catch (err) {
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (step < 3) {
      handleNextStep();
      return;
    }

    // Final Registration with Email OTP
    const emailOtpValue = emailOtp.join("");
    if (emailOtpValue.length !== 6) {
      setError("Please enter the complete 6-digit email verification code");
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        password: formData.password,
        emailOtp: emailOtpValue,
        dateOfBirth: formData.dateOfBirth || null,
        // Address data (optional)
        address: formData.street
          ? {
              street: formData.street,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: "India",
            }
          : null,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        localStorage.setItem("token", data.token);

        // Update app context with user data
        login({
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          isAdmin: data.user.isAdmin || data.user.role === "admin",
          role: data.user.role,
          avatar: data.user.avatar,
          isEmailVerified: data.user.isEmailVerified,
          isPhoneVerified: data.user.isPhoneVerified,
          addresses: data.user.addresses,
          wishlist: data.user.wishlist,
          cartItemsCount: 0,
        });

        // Show success message and redirect
        alert("Registration successful! Welcome to Lion Bidi!");
        setCurrentPage("home");
      } else {
        setError(data.message || "Registration failed. Please try again.");
        // Reset OTPs on failed registration
        setEmailOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      if (step === 3) {
        setEmailOtpSent(false);
        setEmailOtp(["", "", "", "", "", ""]);
        setEmailResendCooldown(0);
      }
      setStep(step - 1);
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
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
              <span className="hidden sm:inline">
                {step > 1 ? "Back" : "Back to Home"}
              </span>
              <span className="sm:hidden">{step > 1 ? "Back" : "Home"}</span>
            </button>

            {/* Mobile Progress Dots */}
            <div className="flex items-center space-x-2 sm:hidden">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-2 h-2 rounded-full ${
                    num < step
                      ? "bg-green-500"
                      : num === step
                      ? "bg-orange-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
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

            {/* Step Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Address Details"
                : "Verify Email"}
            </h2>

            <p className="text-gray-600 text-sm sm:text-base px-2">
              {step === 1
                ? "Join Lion Bidi for premium quality products"
                : step === 2
                ? "Add your address (optional)"
                : "Enter the verification code sent to your email"}
            </p>

            {/* Premium Badge - Mobile Optimized */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg mt-3 sm:mt-4">
              <Crown size={14} className="sm:w-4 sm:h-4" />
              <span>Premium Experience</span>
              <Sparkles size={14} className="sm:w-4 sm:h-4" />
            </div>

            {/* Desktop Progress Indicator */}
            <div className="hidden sm:flex items-center justify-center mt-6 space-x-4">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    num < step
                      ? "bg-green-500 text-white"
                      : num === step
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {num < step ? <Check size={16} /> : num}
                </div>
              ))}
            </div>

            {/* Mobile Step Indicator */}
            <div className="sm:hidden mt-4">
              <div className="text-xs text-gray-500 mb-2">Step {step} of 3</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
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
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <>
                  {/* Name Field - Mobile Optimized */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User
                          size={18}
                          className="text-gray-400 sm:w-5 sm:h-5"
                        />
                      </div>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="Enter your full name"
                        maxLength={50}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum 50 characters
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail
                          size={18}
                          className="text-gray-400 sm:w-5 sm:h-5"
                        />
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

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm font-medium">
                          +91
                        </span>
                      </div>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-12 pr-3 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter phone number starting with 6, 7, 8, or 9
                    </p>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock
                          size={18}
                          className="text-gray-400 sm:w-5 sm:h-5"
                        />
                      </div>
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="Create a strong password"
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
                          <Eye
                            size={18}
                            className="text-gray-500 sm:w-5 sm:h-5"
                          />
                        )}
                      </button>
                    </div>

                    {/* Enhanced Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength <= 2
                                ? "text-red-500"
                                : passwordStrength <= 3
                                ? "text-yellow-500"
                                : "text-green-500"
                            }`}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>

                        {/* Mobile-Optimized Password Requirements */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs">
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordRequirements.length
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {passwordRequirements.length ? (
                              <Check size={12} />
                            ) : (
                              <X size={12} />
                            )}
                            6+ characters
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordRequirements.number
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {passwordRequirements.number ? (
                              <Check size={12} />
                            ) : (
                              <X size={12} />
                            )}
                            Number
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordRequirements.lowercase
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {passwordRequirements.lowercase ? (
                              <Check size={12} />
                            ) : (
                              <X size={12} />
                            )}
                            Lowercase
                          </div>
                          <div
                            className={`flex items-center gap-1.5 ${
                              passwordRequirements.uppercase
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {passwordRequirements.uppercase ? (
                              <Check size={12} />
                            ) : (
                              <X size={12} />
                            )}
                            Uppercase
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock
                          size={18}
                          className="text-gray-400 sm:w-5 sm:h-5"
                        />
                      </div>
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-12 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff
                            size={18}
                            className="text-gray-400 sm:w-5 sm:h-5"
                          />
                        ) : (
                          <Eye
                            size={18}
                            className="text-gray-500 sm:w-5 sm:h-5"
                          />
                        )}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <p
                        className={`text-xs mt-1.5 flex items-center gap-1 ${
                          formData.password === formData.confirmPassword
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <Check size={12} />
                            Passwords match
                          </>
                        ) : (
                          <>
                            <X size={12} />
                            Passwords do not match
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Checkboxes for Mobile */}
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={ageVerified}
                        onChange={(e) => setAgeVerified(e.target.checked)}
                        className="w-4 h-4 mt-1 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium leading-relaxed">
                        I confirm that I am 18 years of age or older *
                      </span>
                    </label>

                    <label className="flex items-start space-x-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 mt-1 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 font-medium leading-relaxed">
                        I agree to the{" "}
                        <button
                          type="button"
                          className="text-orange-600 underline hover:text-orange-500 font-semibold"
                        >
                          Terms of Service
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          className="text-orange-600 underline hover:text-orange-500 font-semibold"
                        >
                          Privacy Policy
                        </button>{" "}
                        *
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Step 2: Address (Optional) */}
              {step === 2 && (
                <>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Account Details
                  </button>
                  <div className="text-center mb-4 p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      Adding an address helps with faster deliveries
                    </p>
                  </div>

                  {/* Street */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin
                          size={18}
                          className="text-gray-400 sm:w-5 sm:h-5"
                        />
                      </div>
                      <input
                        name="street"
                        type="text"
                        value={formData.street}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 sm:py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="Enter your street address"
                      />
                    </div>
                  </div>

                  {/* City and State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full py-3 sm:py-3.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full py-3 sm:py-3.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                        placeholder="State"
                      />
                    </div>
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code
                    </label>
                    <input
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full py-3 sm:py-3.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-base"
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      pattern="\d{6}"
                    />
                    {formData.zipCode && !/^\d{6}$/.test(formData.zipCode) && (
                      <p className="text-xs text-red-500 mt-1">
                        PIN code must be 6 digits
                      </p>
                    )}
                  </div>

                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Note:</strong> You can skip this step and add your
                      address later from your profile.
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: Enhanced Email OTP Verification */}
              {step === 3 && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Address
                  </button>
                  <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Email Verification
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      We've sent a 6-digit verification code to:
                    </p>
                    <p className="text-sm font-semibold text-orange-600 break-all">
                      {formData.email}
                    </p>
                  </div>

                  {/* ------- Loading or Sent Message ------- */}
                  <div className="text-center mb-4">
                    {!emailOtpSent ? (
                      <div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                        <p className="text-gray-600">
                          Sending verification code...
                        </p>
                      </div>
                    ) : (
                      <p className="text-green-600">
                        ✓ Verification code sent to {formData.email}
                      </p>
                    )}
                  </div>

                  {/* ------- OTP Input and Actions only when Sent ------- */}
                  {emailOtpSent && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Enter Verification Code
                      </label>
                      {/* Enhanced OTP Input for Mobile */}
                      <div className="flex space-x-2 sm:space-x-3 justify-center mb-6">
                        {emailOtp.map((digit, index) => (
                          <input
                            key={index}
                            id={`email-otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                              handleEmailOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                            className="w-10 h-12 sm:w-12 sm:h-14 text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg sm:text-xl font-bold transition-all"
                          />
                        ))}
                      </div>

                      {/* Resend & Change Email Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                        <button
                          type="button"
                          onClick={resendEmailOtp}
                          disabled={emailResendCooldown > 0 || loading}
                          className="text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                          {emailResendCooldown > 0
                            ? `Resend Code (${emailResendCooldown}s)`
                            : "Resend Email Code"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setEmailOtpSent(false);
                            setEmailOtp(["", "", "", "", "", ""]);
                            setEmailResendCooldown(0);
                          }}
                          disabled={loading}
                          className="text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors font-medium"
                        >
                          Change Email
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={
                  loading || (step === 1 && (!agreedToTerms || !ageVerified))
                }
                className="w-full py-3.5 sm:py-4 px-4 bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 hover:from-orange-500 hover:via-red-500 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>
                      {step === 1
                        ? "Checking..."
                        : step === 2
                        ? "Sending Email OTP..."
                        : "Creating Account..."}
                    </span>
                  </>
                ) : (
                  <span>
                    {step === 1
                      ? "Continue"
                      : step === 2
                      ? "Send Email OTP"
                      : "Create Account"}
                  </span>
                )}
              </button>

              {/* Skip Address Button (Step 2 only) */}
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => handleSendEmailOtp()}
                  disabled={loading}
                  className="w-full py-3 sm:py-3.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 text-base"
                >
                  Skip Address & Continue
                </button>
              )}

              {/* Sign In link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600 font-medium">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setCurrentPage("login")}
                    disabled={loading}
                    className="text-orange-600 hover:text-orange-500 font-bold transition-colors disabled:opacity-50"
                  >
                    Sign in here
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

export default RegisterPage;
