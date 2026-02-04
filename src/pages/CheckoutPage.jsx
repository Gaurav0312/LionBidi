// CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Copy,
  Check,
  Clock,
  Info,
  AlertCircle,
  Trash2,
  X,
  Minus,
  Plus,
  MapPin,
  Edit3,
} from "lucide-react";
import QRCode from "react-qr-code";
import { useAppContext } from "../context/AppContext";
import api from "../utils/api";
import UPITransactionInput from "../components/UPITransactionInput";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cartItems,
    user,
    openAuthModal,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
  } = useAppContext();

  const product = location.state?.product;
  const staticCart = location.state?.cart || location.state?.staticCart;

  const getAddressData = () => {
    if (location.state?.address) return location.state.address;

    const stored = localStorage.getItem("deliveryAddress");
    return stored ? JSON.parse(stored) : null;
  };

  const addressData = getAddressData();
  const deliveryCharges = addressData?.deliveryCharges || 0;
  const deliveryInfo = addressData?.deliveryInfo || null;
  const savedToDb = location.state?.savedToDb;
  const fallback = location.state?.fallback;
  const existingOrder = location.state?.existingOrder;

  const [upiNumberCopied, setUpiNumberCopied] = useState(false);
  const [upiIdCopied, setUpiIdCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Order related states
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [mobilePaymentAttempted, setMobilePaymentAttempted] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [orderCreationError, setOrderCreationError] = useState(null);
  const [paymentTab, setPaymentTab] = useState("upi");
  const [accountCopied, setAccountCopied] = useState(false);
  const [ifscCopied, setIfscCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [showPaymentTimer, setShowPaymentTimer] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Calculate cart data
  const calculateCartData = () => {
    if (product) {
      return {
        items: [product],
        total: product.price * product.quantity,
        savings: 0,
        subtotal: product.price * product.quantity,
        itemCount: 1,
        isFromProduct: true,
      };
    }

    if (cartItems && cartItems.length > 0) {
      let savings = 0;
      let totalQuantity = 0;
      let subtotal = 0;

      cartItems.forEach((item) => {
        const itemQuantity = item.quantity || 0;
        const itemPrice = item.price || 0;
        const originalPrice = item.originalPrice || itemPrice;

        totalQuantity += itemQuantity;
        subtotal += itemPrice * itemQuantity;

        if (originalPrice > itemPrice) {
          savings += (originalPrice - itemPrice) * itemQuantity;
        }
      });

      let bulkDiscountPerPiece = 0;
      if (totalQuantity >= 30) {
        bulkDiscountPerPiece = 20;
      } else if (totalQuantity >= 20) {
        bulkDiscountPerPiece = 15;
      } else if (totalQuantity >= 10) {
        bulkDiscountPerPiece = 10;
      }

      let bulkDiscount = 0;
      if (bulkDiscountPerPiece > 0) {
        bulkDiscount = bulkDiscountPerPiece * totalQuantity;
        savings += bulkDiscount;
      }

      const total = Math.max(0, subtotal - savings);

      return {
        items: cartItems.map((item) => ({
          id: item._id || item.id,
          _id: item._id || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || (item.images ? item.images[0] : null),
        })),
        total,
        savings,
        subtotal,
        itemCount: cartItems.length,
        isFromCart: true,
      };
    }

    if (staticCart && staticCart.items && staticCart.items.length > 0) {
      return {
        ...staticCart,
        isFromStatic: true,
      };
    }

    return null;
  };

  const cart = calculateCartData();

  // Create order when page loads if not already created
  useEffect(() => {
    const createOrder = async () => {
      if (existingOrder) {
        console.log("Using existing order:", existingOrder);
        setCreatedOrder(existingOrder);
        return;
      }
      // More robust validation
      if (!user) {
        console.log("User not authenticated, cannot create order");
        return;
      }

      if (!cart || !cart.items || cart.items.length === 0) {
        console.log("No cart data available");
        setOrderCreationError("Cart is empty");
        return;
      }

      if (!addressData || !addressData.name || !addressData.address) {
        console.log("Incomplete address data");
        setOrderCreationError("Address information is incomplete");
        return;
      }

      if (createdOrder || isCreatingOrder) {
        return; // Already created or in progress
      }

      setIsCreatingOrder(true);
      setOrderCreationError(null);

      try {
        console.log("Creating order with data:", {
          cartData: cart,
          shippingAddress: addressData,
          paymentMethod: "UPI",
        });

        const orderData = {
          cartData: {
            items: cart.items.map((item) => ({
              productId: item._id || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              totalPrice: item.price * item.quantity,
            })),
            total: cart.total,
            subtotal: cart.subtotal || cart.total,
            savings: cart.savings || 0,
            itemCount: cart.items.length,
            deliveryCharges: deliveryCharges,
          },
          shippingAddress: {
            name: addressData.name,
            phone: addressData.mobileNumber || addressData.phone,
            email: addressData.emailAddress || addressData.email,
            street: `${addressData.address}${
              addressData.locality ? ", " + addressData.locality : ""
            }${addressData.landmark ? ", " + addressData.landmark : ""}`,
            city: addressData.city,
            state: addressData.state,
            zipCode: addressData.pinCode,
            country: "India",
          },
          paymentMethod: "UPI",
          deliveryCharges: deliveryCharges,
          deliveryInfo: deliveryInfo,
        };

        console.log("Sending order data:", orderData);

        const response = await api.post("/api/orders/create", orderData);

        console.log("Order creation response:", response.data);

        if (response.data.success) {
          setCreatedOrder(response.data.order);
          console.log(
            "Order created successfully:",
            response.data.order.orderNumber,
          );

          try {
            console.log("🛒 Clearing cart after successful order creation");
            await clearCart();
            console.log("✅ Cart cleared successfully after order creation");
          } catch (clearError) {
            console.error("❌ Error clearing cart:", clearError);
            // Don't fail the order creation if cart clearing fails
          }
        } else {
          throw new Error(response.data.message || "Order creation failed");
        }
      } catch (error) {
        console.error("Error creating order:", error);

        let errorMessage = "Failed to create order. Please try again.";

        if (error.response) {
          // Server responded with error status
          errorMessage =
            error.response.data?.message ||
            `Server error: ${error.response.status}`;
        } else if (error.request) {
          // Network error
          errorMessage =
            "Network error. Please check your internet connection.";
        } else {
          // Other error
          errorMessage = error.message;
        }

        setOrderCreationError(errorMessage);
        alert(errorMessage);
      } finally {
        setIsCreatingOrder(false);
      }
    };

    // Add a small delay to ensure all data is loaded
    const timer = setTimeout(createOrder, 500);

    return () => clearTimeout(timer);
  }, [user, cart?.total, addressData?.name, existingOrder]);

  // Redirect if no data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!product && !cart) {
        console.log(
          "No checkout data available after timeout, redirecting to home",
        );
        navigate("/");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [product, cart, navigate]);

  // Check for user authentication
  useEffect(() => {
    if (!user) {
      console.log("User not logged in, opening auth modal");
      openAuthModal();
    }
  }, [user, openAuthModal]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ["android", "iphone", "ipad", "mobile", "tablet"];
      const isMobileDevice = mobileKeywords.some((k) => userAgent.includes(k));
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (showPaymentTimer && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPaymentTimer, timeRemaining]);

  // Auto-detect when user returns from payment app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mobilePaymentAttempted) {
        setShowPaymentTimer(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mobilePaymentAttempted]);

  // Payment confirmation handlers
  const handlePaymentMade = () => {
    setPaymentStatus("pending");
    setShowPaymentConfirmation(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmPayment = async () => {
    if (!transactionId.trim()) {
      alert("Please enter transaction ID");
      return;
    }

    if (!createdOrder) {
      alert("Order not found. Please try again.");
      return;
    }

    // Enhanced UPI Transaction ID validation
    const cleanTransactionId = transactionId.trim().toUpperCase();

    const upiTransactionPatterns = [
      /^\d{12}$/, // 12 digits only
      /^[A-Z0-9]{12}$/, // 12 alphanumeric
      /^\d{10,16}$/, // 10-16 digits
      /^[A-Z0-9]{10,16}$/, // 10-16 alphanumeric
      /^[A-Z]{2}\d{10,14}$/, // 2 letters followed by 10-14 digits
    ];

    const isValidFormat = upiTransactionPatterns.some((pattern) =>
      pattern.test(cleanTransactionId),
    );

    if (!isValidFormat) {
      alert(
        "Invalid UPI transaction ID format. Please enter a valid 12-digit UPI transaction ID.",
      );
      return;
    }

    setIsConfirmingPayment(true);
    try {
      const response = await api.post(
        `/api/orders/${createdOrder._id}/confirm-payment`,
        {
          transactionId: cleanTransactionId,
          screenshot: paymentScreenshot,
          upiId: upiId,
        },
      );

      if (response.data.success) {
        // Navigate to PaymentVerificationPage (this should work now)
        navigate(`/payment-verification/${response.data.orderNumber}`, {
          state: {
            order: response.data.order,
            message: response.data.message,
          },
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);

      if (error.response?.status === 400) {
        alert(
          error.response.data.message ||
            "Invalid payment details. Please check and try again.",
        );
      } else if (error.response?.status === 403) {
        alert("Access denied. This order doesn't belong to you.");
      } else if (error.response?.status === 404) {
        alert("Order not found. Please try again.");
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Failed to submit payment details. Please try again.");
      }
    } finally {
      setIsConfirmingPayment(false);
    }
  };
  // Delete functionality
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await removeFromCart(itemToDelete.id || itemToDelete._id);
      setShowDeleteModal(false);
      setItemToDelete(null);

      setTimeout(() => {
        const updatedCart = calculateCartData();
        if (!product && (!updatedCart || updatedCart.itemCount === 0)) {
          navigate("/");
        }
      }, 500);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to remove item. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Quantity update functionality
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      const item = cart?.items.find((i) => (i.id || i._id) === itemId);
      if (item) {
        handleDeleteClick(item);
      }
    } else {
      try {
        await updateCartItemQuantity(itemId, newQuantity);
      } catch (error) {
        console.error("Error updating quantity:", error);
        alert("Failed to update quantity. Please try again.");
      }
    }
  };

  // Navigate to edit address
  const handleEditAddress = () => {
    if (cart) {
      navigate("/address", {
        state: {
          cart: staticCart || cart,
          editMode: true,
        },
      });
    } else if (product) {
      navigate("/address", {
        state: {
          product: product,
          editMode: true,
        },
      });
    }
  };

  // Show loading if no data
  if (!product && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  const subtotalPrice = product
    ? product.price * product.quantity
    : cart?.total || 0;
  const totalPrice = subtotalPrice + deliveryCharges;
  const upiId = "9589773525@ptyes";
  const upiNumber = "9589773525";
  const upiName = "Gaurav Verma";
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    upiName,
  )}&am=${totalPrice}&cu=INR&tn=Order%20Payment`;

  const copyUpiNumber = async () => {
    try {
      await navigator.clipboard.writeText(upiNumber);
      setUpiNumberCopied(true);
      setTimeout(() => setUpiNumberCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI Number");
    }
  };

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setUpiIdCopied(true);
      setTimeout(() => setUpiIdCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID");
    }
  };

  // Enhanced copy function with fallback
  const copyToClipboard = async (text, setCopiedState) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Payment Confirmation Modal */}
        {showPaymentConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Payment
              </h3>

              <UPITransactionInput
                transactionId={transactionId}
                setTransactionId={setTransactionId}
                onConfirm={confirmPayment}
                isConfirming={isConfirmingPayment}
                screenshot={paymentScreenshot}
                setScreenshot={setPaymentScreenshot}
                order={createdOrder}
              />

              <button
                onClick={() => {
                  setShowPaymentConfirmation(false);
                  setTransactionId("");
                  setPaymentScreenshot(null);
                }}
                className="w-full mt-4 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isConfirmingPayment}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Remove Item
                  </h3>
                </div>
                <button
                  onClick={cancelDelete}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isDeleting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to remove{" "}
                <strong>{itemToDelete?.name}</strong> from your cart?
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-orange-600 transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Back
          </button>

          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              Secure Checkout
            </h1>
            <p className="text-gray-600 text-lg">
              Complete your purchase with confidence
            </p>
          </div>

          {/* Order Creation Status */}
          {isCreatingOrder && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500 mr-3"></div>
                <span className="text-orange-600 font-medium">
                  Creating your order...
                </span>
              </div>
            </div>
          )}

          {/* Order Created Confirmation */}
          {createdOrder && (
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-orange-600">
                      Order Created Successfully
                    </h3>
                    <p className="text-sm text-divine-orange">
                      Order #{createdOrder.orderNumber} • Total: ₹
                      {createdOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Address Confirmation Banner */}
          {addressData && (
            <div
              className={`mt-6 p-4 rounded-xl border ${
                savedToDb
                  ? "bg-white border-gray-200"
                  : fallback
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin
                    className={`w-5 h-5 mr-3 ${
                      savedToDb
                        ? "text-orange-600"
                        : fallback
                          ? "text-yellow-600"
                          : "text-orange-600"
                    }`}
                  />
                  <div>
                    <h3
                      className={`font-semibold ${
                        savedToDb
                          ? "text-orange-600"
                          : fallback
                            ? "text-yellow-800"
                            : "text-orange-800"
                      }`}
                    >
                      Delivery Address{" "}
                      {savedToDb
                        ? "Saved"
                        : fallback
                          ? "Set (Local)"
                          : "Confirmed"}
                    </h3>
                    <p
                      className={`text-sm ${
                        savedToDb
                          ? "text-divine-orange"
                          : fallback
                            ? "text-yellow-600"
                            : "text-orange-600"
                      }`}
                    >
                      {addressData.name} • {addressData.address},{" "}
                      {addressData.city}, {addressData.state} -{" "}
                      {addressData.pinCode}
                    </p>
                    {fallback && (
                      <p className="text-xs text-yellow-600 mt-1">
                        Address saved locally only. Please check your internet
                        connection.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleEditAddress}
                  className={`p-2 rounded-lg hover:bg-white/50 transition-colors ${
                    savedToDb
                      ? "text-orange-600 hover:text-orange-600"
                      : fallback
                        ? "text-yellow-600 hover:text-yellow-600"
                        : "text-orange-600 hover:text-yellow-600"
                  }`}
                  title="Edit address"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  ✓
                </div>
                <span className="ml-2 text-green-600 font-medium">Address</span>
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-divine-orange font-medium">
                  Payment
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Order Summary */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Order Summary
              </h2>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              {/* Single Product Display */}
              {product && (
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-lg mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Quantity:{" "}
                      <span className="font-medium">{product.quantity}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Unit Price:{" "}
                      <span className="text-orange-600 font-medium">
                        ₹{product.price}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Multiple Products Display */}
              {cart && cart.items && cart.items.length > 0 && (
                <div className="space-y-4 mb-4">
                  {cart.items.map((item, index) => (
                    <div
                      key={item.id || item._id || index}
                      className="relative group"
                    >
                      <div className="flex items-start space-x-4 bg-white p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover shadow-sm"
                        />
                        <div className="flex-1 pr-10">
                          <h4 className="font-semibold text-gray-800">
                            {item.name}
                          </h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × ₹{item.price} = ₹
                              {(item.price * item.quantity).toFixed(2)}
                            </p>

                            {/* Quantity Controls - Only for live cart */}
                            {false && !cart.isFromStatic && !createdOrder && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id || item._id,
                                      item.quantity - 1,
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-medium min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id || item._id,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delete Button - Only show if order not created yet */}
                        {!cart.isFromStatic && !createdOrder && (
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 opacity-70 hover:opacity-100"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Cart summary with savings */}
                  {cart.savings > 0 && (
                    <div className="border-t border-gray-300 pt-3 mt-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₹{cart.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Savings:</span>
                        <span>-₹{cart.savings.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-700">Order Amount:</span>
                  <span className="font-medium">
                    ₹{subtotalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-gray-700">Delivery:</span>
                    {deliveryInfo && (
                      <>
                        {deliveryInfo.isFreeDelivery ? (
                          <div className="mt-1">
                            <p className="text-xs text-green-600 font-semibold">
                              FREE Delivery Applied!
                            </p>
                            <p className="text-xs text-gray-500">
                              Orders above ₹{deliveryInfo.freeDeliveryThreshold}{" "}
                              qualify
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {deliveryInfo.description}
                              {deliveryInfo.state &&
                                ` to ${deliveryInfo.state}`}
                            </p>
                            {deliveryInfo.freeDeliveryThreshold &&
                              subtotalPrice <
                                deliveryInfo.freeDeliveryThreshold && (
                                <p className="text-xs text-orange-600 mt-1">
                                  💡 Add ₹
                                  {(
                                    deliveryInfo.freeDeliveryThreshold -
                                    subtotalPrice
                                  ).toFixed(2)}{" "}
                                  more for FREE delivery!
                                </p>
                              )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <span
                    className={`font-medium ml-3 ${
                      deliveryInfo?.isFreeDelivery
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {deliveryInfo?.isFreeDelivery ? (
                      <span className="flex flex-col items-end">
                        <span className="text-xs text-gray-400 line-through">
                          ₹{deliveryInfo.baseCharges}
                        </span>
                        <span className="font-bold">FREE</span>
                      </span>
                    ) : (
                      `₹${deliveryCharges.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-3 flex justify-between items-center">
                <span className="text-gray-700 font-semibold">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-divine-orange">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-indigo-500 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Payment Options
                </h2>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Timer Alert (if payment attempted) */}
            {showPaymentTimer && paymentStatus === "pending" && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-1">
                      Returned from payment app?
                    </p>
                    <p className="text-xs text-blue-700">
                      If payment successful, click "I Have Made the Payment"
                      below to verify.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                onClick={() => setPaymentTab("upi")}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  paymentTab === "upi"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>UPI</span>
                {isMobile && (
                  <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Fast
                  </span>
                )}
              </button>
              <button
                onClick={() => setPaymentTab("bank")}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  paymentTab === "bank"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Bank Transfer
              </button>
            </div>

            <div className="space-y-6">
              {/* TAB 1: UPI PAYMENT */}
              {paymentTab === "upi" && (
                <>
                  {/* Amount Highlight */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Amount to Pay
                      </span>
                      <span className="text-2xl font-bold text-divine-orange">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const constructUpi = (scheme) => {
                      const params = new URLSearchParams({
                        pa: upiId,
                        pn: upiName,
                        am: totalPrice.toFixed(2),
                        cu: "INR",
                        tn: `Order ${createdOrder?.orderNumber || ""}`,
                      });
                      return `${scheme}?${params.toString()}`;
                    };

                    const gPayLink = constructUpi("tez://pay");
                    const phonePeLink = constructUpi("phonepe://pay");
                    const paytmLink = constructUpi("paytmmp://pay");
                    const genericLink = constructUpi("upi://pay");

                    return (
                      <>
                        {!isMobile ? (
                          /* Desktop QR */
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 text-center border border-indigo-100">
                            <p className="text-sm font-semibold text-gray-700 mb-4">
                              Scan QR Code to Pay
                            </p>
                            <div className="inline-block p-4 bg-white rounded-xl shadow-md border border-indigo-100">
                              <QRCode value={genericLink} size={180} />
                            </div>
                            <div className="mt-4 flex items-center justify-center space-x-2">
                              <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                  GP
                                </div>
                                <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                  PP
                                </div>
                                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                                  PM
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 font-medium">
                                Works with all UPI apps
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Mobile Buttons */
                          <>
                            <p className="text-m font-bold text-gray-800 mb-3">
                              Pay the exact amount shown above using the UPI number or UPI ID below. After making the payment, click “I Have Made the Payment”.
                            </p>
                            {/* <div className="grid grid-cols-2 gap-3">
                              <a
                                href={phonePeLink}
                                onClick={() => {
                                  setMobilePaymentAttempted(true);
                                  setShowPaymentTimer(true);
                                }}
                                className="flex flex-col items-center justify-center bg-[#5f259f] text-white font-bold py-4 px-4 rounded-xl shadow-md active:scale-95 transition-transform hover:shadow-lg"
                              >
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2">
                                  <span className="text-[#5f259f] font-bold text-sm">
                                    Pe
                                  </span>
                                </div>
                                <span className="text-sm">PhonePe</span>
                              </a>
                              <a
                                href={gPayLink}
                                onClick={() => {
                                  setMobilePaymentAttempted(true);
                                  setShowPaymentTimer(true);
                                }}
                                className="flex flex-col items-center justify-center bg-white border-2 border-gray-300 text-gray-800 font-bold py-4 px-4 rounded-xl shadow-sm active:scale-95 transition-transform hover:shadow-md"
                              >
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                                  <span className="text-white font-bold text-sm">
                                    G
                                  </span>
                                </div>
                                <span className="text-sm">Google Pay</span>
                              </a>
                              <a
                                href={paytmLink}
                                onClick={() => {
                                  setMobilePaymentAttempted(true);
                                  setShowPaymentTimer(true);
                                }}
                                className="flex flex-col items-center justify-center bg-[#00baf2] text-white font-bold py-4 px-4 rounded-xl shadow-md active:scale-95 transition-transform hover:shadow-lg"
                              >
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2">
                                  <span className="text-[#00baf2] font-bold text-sm">
                                    Pt
                                  </span>
                                </div>
                                <span className="text-sm">Paytm</span>
                              </a>
                              <a
                                href={genericLink}
                                onClick={() => {
                                  setMobilePaymentAttempted(true);
                                  setShowPaymentTimer(true);
                                }}
                                className="flex flex-col items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-4 rounded-xl shadow-md active:scale-95 transition-transform hover:shadow-lg"
                              >
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-2">
                                  <span className="text-orange-600 font-bold text-sm">
                                    UPI
                                  </span>
                                </div>
                                <span className="text-sm">Other Apps</span>
                              </a>
                            </div> */}
                          </>
                        )}
                      </>
                    );
                  })()}

                  {/* UPI Number Copy Section */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                       Pay to UPI Number
                      </p>
                      <span className="text-xs text-gray-400">Copy UPI Number</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-indigo-300 transition-colors">
                      <span className="font-mono text-gray-800 font-medium text-sm">
                        {upiNumber}
                      </span>
                      <button
                        onClick={copyUpiNumber}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-semibold px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        {upiNumberCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UPI ID Copy Section */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                        Or Pay Manually
                      </p>
                      <span className="text-xs text-gray-400">Copy UPI ID</span>
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-indigo-300 transition-colors">
                      <span className="font-mono text-gray-800 font-medium text-sm">
                        {upiId}
                      </span>
                      <button
                        onClick={copyUpiId}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 text-sm font-semibold px-3 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        {upiIdCopied ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800 space-y-1">
                        <p className="font-semibold">Payment Instructions:</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li>Verify amount: ₹{totalPrice.toFixed(2)}</li>
                          <li>Complete payment in your UPI app</li>
                          <li>
                            Return here and click "I Have Made the Payment"
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* TAB 2: BANK TRANSFER */}
              {paymentTab === "bank" && (
                <>
                  {/* Amount Highlight */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Amount to Transfer
                      </span>
                      <span className="text-2xl font-bold text-divine-orange">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                        Bank Account Details
                      </h3>
                      <p className="text-xs text-gray-500">
                        Transfer via IMPS, NEFT, or RTGS
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Bank Name */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Bank Name
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            State Bank of India
                          </span>
                        </div>
                      </div>

                      {/* Account Name */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Account Name
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            Gaurav Verma
                          </span>
                        </div>
                      </div>

                      {/* Account Number with Copy */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            Account Number
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono font-bold text-gray-900">
                              43075322727
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard("43075322727", setAccountCopied)
                              }
                              className="flex items-center text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                            >
                              {accountCopied ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* IFSC Code with Copy */}
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            IFSC Code
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-mono font-bold text-gray-900">
                              SBIN0000347
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard("SBIN0000347", setIfscCopied)
                              }
                              className="flex items-center text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                            >
                              {ifscCopied ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Processing Note */}
                    <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-yellow-800">
                          <p className="font-semibold mb-1">Processing Time</p>
                          <p className="leading-relaxed">
                            Bank transfers are verified within 2-4 hours during
                            business hours. Please share your transaction
                            reference number after transfer.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CONFIRMATION SECTION */}
              <div className="pt-6 border-t border-gray-100">
                {paymentStatus === "pending" && (
                  <>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-900 font-medium mb-1">
                        ✓ Payment Completed?
                      </p>
                      <p className="text-xs text-blue-700">
                        Click below to notify us and verify your transaction
                      </p>
                    </div>

                    <button
                      onClick={handlePaymentMade}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="mr-2">I Have Made the Payment</span>
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  </>
                )}

                {paymentStatus === "verifying" && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Verifying Payment...
                    </p>
                    <p className="text-xs text-indigo-600 mt-1">
                      Please wait while we confirm your transaction
                    </p>
                  </div>
                )}

                {paymentStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-sm font-bold text-green-900">
                      Payment Confirmed!
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Your order is being processed
                    </p>
                  </div>
                )}
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center text-gray-400 text-xs space-x-2 pt-2">
                <Shield className="w-4 h-4" />
                <span>256-bit SSL Encrypted • 100% Secure Payments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions section */}
        <div className="mt-10 bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            How to Pay
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-xs">
                1
              </div>
              <p>
                {isMobile
                  ? "Click 'Pay Now' button to open UPI app"
                  : "Scan QR code with your UPI app"}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-xs">
                2
              </div>
              <p>Complete payment with your UPI PIN</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-xs">
                3
              </div>
              <p>Click 'I Have Made the Payment' and enter transaction ID</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
