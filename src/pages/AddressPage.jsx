// pages/AddressPage.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Mail,
  Home,
  Navigation,
  CheckCircle,
  AlertCircle,
  ShoppingCart,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from "../utils/api"; // Make sure you have this utility

const AddressPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getCartTotal, getCartItemsCount, fetchUserAddress } =
    useAppContext();

  // Get cart data from navigation state
  const cartFromState = location.state?.cart;
  const productFromState = location.state?.product;

  const [formData, setFormData] = useState({
    name: user?.name || "",
    mobileNumber: user?.phone || "",
    emailAddress: user?.email || "",
    address: "",
    locality: "",
    landmark: "",
    pinCode: "",
    city: "",
    state: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPinCodeLoading, setIsPinCodeLoading] = useState(false);
  const [pinCodeSuggestions, setPinCodeSuggestions] = useState([]);
  const [pinCodeStatus, setPinCodeStatus] = useState("");
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  // Redirect if no cart or product data
  useEffect(() => {
    if (!cartFromState && !productFromState) {
      console.log("No checkout data available, redirecting to cart");
      navigate("/");
    }
  }, [cartFromState, productFromState, navigate]);

  // Load existing address data if available
  useEffect(() => {
    const loadExistingAddress = async () => {
      if (user) {
        try {
          const response = await api.get("/api/address");
          if (response.data.success && response.data.address) {
            const addr = response.data.address;
            setFormData((prev) => ({
              ...prev,
              address: addr.street || "",
              city: addr.city || "",
              state: addr.state || "",
              pinCode: addr.zipCode || "",
            }));
          }
        } catch (error) {
          console.error("Error loading existing address:", error);
          // Don't show error to user as this is optional
        }
      }
    };

    loadExistingAddress();
  }, [user]);

  const calculateDeliveryCharges = async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setDeliveryCharges(0);
      setDeliveryInfo(null);
      return;
    }

    setIsCalculatingDelivery(true);
    try {
      // ✅ Calculate order amount
      const orderAmount =
        cartFromState?.total ||
        (productFromState
          ? productFromState.price * productFromState.quantity
          : 0);

      // ✅ Send both pincode AND orderAmount
      const response = await api.post("/api/delivery/calculate", {
        pincode,
        orderAmount, // Add this!
      });

      if (response.data.success) {
        setDeliveryCharges(response.data.deliveryInfo.charges);
        setDeliveryInfo(response.data.deliveryInfo);
        console.log("Delivery charges calculated:", response.data.deliveryInfo);
      }
    } catch (error) {
      console.error("Error calculating delivery charges:", error);
      // Set default charges on error
      setDeliveryCharges(120); // Changed from 150 to 120
      setDeliveryInfo({
        charges: 120,
        description: "Standard delivery charges",
      });
    } finally {
      setIsCalculatingDelivery(false);
    }
  };

  // Debounced pincode lookup
  const fetchLocationFromPincode = useCallback(async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;

    setIsPinCodeLoading(true);
    setPinCodeStatus("");

    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffices = data[0].PostOffice;
        const primaryLocation = postOffices[0];

        setFormData((prev) => ({
          ...prev,
          city: primaryLocation.District || primaryLocation.Block || "",
          state: primaryLocation.State || primaryLocation.Circle || "",
        }));

        setPinCodeStatus("valid");

        if (postOffices.length > 1) {
          setPinCodeSuggestions(
            postOffices.slice(0, 5).map((po) => ({
              name: po.Name,
              district: po.District,
              state: po.State,
              block: po.Block,
            }))
          );
        } else {
          setPinCodeSuggestions([]);
        }

        // Calculate delivery charges after successful pincode validation
        await calculateDeliveryCharges(pincode);
      } else {
        setPinCodeStatus("invalid");
        setFormData((prev) => ({ ...prev, city: "", state: "" }));
        setPinCodeSuggestions([]);
        setDeliveryCharges(0);
        setDeliveryInfo(null);
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
      setPinCodeStatus("invalid");
    } finally {
      setIsPinCodeLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "pinCode") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: numericValue }));

      if (numericValue !== formData.pinCode) {
        setPinCodeSuggestions([]);
        setPinCodeStatus("");
      }

      if (numericValue.length === 6) {
        fetchLocationFromPincode(numericValue);
      } else if (numericValue.length < 6) {
        setFormData((prev) => ({ ...prev, city: "", state: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      city: suggestion.district,
      state: suggestion.state,
      locality: suggestion.name,
    }));
    setPinCodeSuggestions([]);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.mobileNumber.trim())
      newErrors.mobileNumber = "Mobile number is required";
    else if (!/^\d{10}$/.test(formData.mobileNumber))
      newErrors.mobileNumber = "Enter a valid 10-digit number";
    if (!formData.emailAddress.trim())
      newErrors.emailAddress = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.emailAddress))
      newErrors.emailAddress = "Enter a valid email";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.pinCode.trim()) newErrors.pinCode = "Pin code is required";
    else if (!/^\d{6}$/.test(formData.pinCode))
      newErrors.pinCode = "Enter a valid 6-digit pin code";
    else if (pinCodeStatus === "invalid")
      newErrors.pinCode = "Please enter a valid Indian pin code";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log("Saving address to MongoDB...");

      const addressPayload = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        emailAddress: formData.emailAddress,
        address: formData.address,
        locality: formData.locality,
        landmark: formData.landmark,
        pinCode: formData.pinCode,
        city: formData.city,
        state: formData.state,
        deliveryCharges: deliveryCharges, // Include delivery charges
        deliveryInfo: deliveryInfo, // Include delivery info
      };

      const response = await api.post("/api/address/save", addressPayload);

      if (response.data.success) {
        console.log("Address saved successfully to MongoDB");

        if (fetchUserAddress) {
          fetchUserAddress();
        }

        localStorage.setItem(
          "deliveryAddress",
          JSON.stringify({
            ...formData,
            deliveryCharges,
            deliveryInfo,
            timestamp: new Date().toISOString(),
          })
        );

        // Navigate to checkout with delivery charges
        if (cartFromState) {
          navigate("/checkout", {
            state: {
              cart: cartFromState,
              address: { ...formData, deliveryCharges, deliveryInfo },
              savedToDb: true,
            },
          });
        } else if (productFromState) {
          navigate("/checkout", {
            state: {
              product: productFromState,
              address: { ...formData, deliveryCharges, deliveryInfo },
              savedToDb: true,
            },
          });
        }
      } else {
        throw new Error(response.data.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address to MongoDB:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save address. Please try again.";
      alert(errorMessage);

      if (error.response?.status === 400) {
        return;
      }

      // Fallback with delivery charges
      console.log("Falling back to local storage...");
      localStorage.setItem(
        "deliveryAddress",
        JSON.stringify({
          ...formData,
          deliveryCharges,
          deliveryInfo,
          timestamp: new Date().toISOString(),
        })
      );

      if (cartFromState) {
        navigate("/checkout", {
          state: {
            cart: cartFromState,
            address: { ...formData, deliveryCharges, deliveryInfo },
            savedToDb: false,
            fallback: true,
          },
        });
      } else if (productFromState) {
        navigate("/checkout", {
          state: {
            product: productFromState,
            address: { ...formData, deliveryCharges, deliveryInfo },
            savedToDb: false,
            fallback: true,
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate display values
  const cartTotal =
    cartFromState?.total ||
    (productFromState ? productFromState.price * productFromState.quantity : 0);
  const cartCount = cartFromState?.itemCount || (productFromState ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50  py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </button>

          <div className="text-center mb-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              Delivery Address
            </h1>
            <p className="text-gray-600 text-lg">
              Where should we deliver your order?
            </p>
          </div>

          {/* Order Summary Bar */}
          <div className="bg-white border border-orange-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCart className="w-6 h-6 text-divine-orange" />
              <span className="text-divine-orange font-bold">
                {cartCount} items • ₹{cartTotal.toLocaleString()}
              </span>
            </div>
            <span className="text-divine-orange text-sm font-bold">
              Step 1 of 2
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Address Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Delivery Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-divine-orange font-medium text-sm mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors ${
                        errors.mobileNumber
                          ? "border-divine-orange"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                    {errors.mobileNumber && (
                      <p className="text-divine-orange font-medium text-sm mt-1">
                        {errors.mobileNumber}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors ${
                      errors.emailAddress
                        ? "border-divine-orange"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.emailAddress && (
                    <p className="text-divine-orange font-medium text-sm mt-1">
                      {errors.emailAddress}
                    </p>
                  )}
                </div>

                {/* Address Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Home className="w-4 h-4 inline mr-2" />
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors resize-none ${
                      errors.address
                        ? "border-divine-orange"
                        : "border-gray-300"
                    }`}
                    placeholder="House/Flat No., Building Name, Street Name"
                  />
                  {errors.address && (
                    <p className="text-divine-orange font-medium text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Locality/Area
                    </label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors"
                      placeholder="Locality or Area"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Navigation className="w-4 h-4 inline mr-2" />
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors"
                      placeholder="Nearby landmark"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Pin Code *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors ${
                          errors.pinCode
                            ? "border-divine-orange"
                            : pinCodeStatus === "valid"
                            ? "border-green-500"
                            : pinCodeStatus === "invalid"
                            ? "border-divine-orange"
                            : "border-gray-300"
                        }`}
                        placeholder="6-digit PIN code"
                        maxLength={6}
                      />
                      {isPinCodeLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                        </div>
                      )}
                      {pinCodeStatus === "valid" && (
                        <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                      )}
                      {pinCodeStatus === "invalid" && (
                        <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {errors.pinCode && (
                      <p className="text-divine-orange font-medium text-sm mt-1">
                        {errors.pinCode}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors ${
                        errors.city ? "border-divine-orange" : "border-gray-300"
                      }`}
                      placeholder="City"
                      readOnly={pinCodeStatus === "valid"}
                    />
                    {errors.city && (
                      <p className="text-divine-orange font-medium text-sm mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-colors ${
                        errors.state
                          ? "border-divine-orange"
                          : "border-gray-300"
                      }`}
                      placeholder="State"
                      readOnly={pinCodeStatus === "valid"}
                    />
                    {errors.state && (
                      <p className="text-divine-orange font-medium text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pincode Suggestions */}
                {pinCodeSuggestions.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">
                      Select your area:
                    </h4>
                    <div className="space-y-2">
                      {pinCodeSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionSelect(suggestion)}
                          className="block w-full text-left p-2 hover:bg-blue-100 rounded text-sm text-blue-700 transition-colors"
                        >
                          {suggestion.name}, {suggestion.district},{" "}
                          {suggestion.state}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF6B35] text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving Address...
                    </div>
                  ) : (
                    "Continue to Payment"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h3>

              {cartFromState && (
                <div className="space-y-3 mb-4">
                  {cartFromState.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <img
                        src={item.image || "/placeholder.jpg"}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                  {cartFromState.items.length > 3 && (
                    <div className="text-center text-gray-500 text-sm">
                      +{cartFromState.items.length - 3} more items
                    </div>
                  )}
                </div>
              )}

              {productFromState && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={productFromState.image || "/placeholder.jpg"}
                      alt={productFromState.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">
                        {productFromState.name}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        Qty: {productFromState.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{cartCount}</span>
                </div>

                {cartFromState?.savings > 0 && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">
                        ₹{cartFromState.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-600">Savings:</span>
                      <span className="font-medium text-green-600">
                        -₹{cartFromState.savings.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}

                {deliveryInfo && (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="text-gray-600 text-sm">
                          Delivery Charges:
                        </span>
                        {isCalculatingDelivery && (
                          <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
                        )}
                      </div>
                      <span
                        className={`font-medium ${
                          deliveryInfo.isFreeDelivery
                            ? "text-green-600 line-through"
                            : "text-orange-600"
                        }`}
                      >
                        {deliveryInfo.isFreeDelivery ? (
                          <>
                            <span className="mr-2">
                              ₹{deliveryInfo.baseCharges.toFixed(2)}
                            </span>
                            <span className="text-green-600 font-bold no-underline">
                              FREE
                            </span>
                          </>
                        ) : (
                          `₹${deliveryCharges.toFixed(2)}`
                        )}
                      </span>
                    </div>

                    {deliveryInfo.isFreeDelivery ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                        <p className="text-xs text-green-700 font-semibold flex items-center">
                          🎉 Congratulations! You've earned FREE delivery
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Orders above ₹{deliveryInfo.freeDeliveryThreshold}{" "}
                          qualify for free delivery
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-2">
                          {deliveryInfo.description}
                        </p>
                        {deliveryInfo.state && (
                          <p className="text-xs text-gray-500 mb-2">
                            To: {deliveryInfo.district}, {deliveryInfo.state}
                          </p>
                        )}
                        {/* Show how much more needed for free delivery */}
                        {deliveryInfo.freeDeliveryThreshold &&
                          cartTotal < deliveryInfo.freeDeliveryThreshold && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <p className="text-xs text-orange-700">
                                💡 Add ₹
                                {(
                                  deliveryInfo.freeDeliveryThreshold - cartTotal
                                ).toFixed(2)}{" "}
                                more to get FREE delivery!
                              </p>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-divine-orange">
                    ₹{(cartTotal + deliveryCharges).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
