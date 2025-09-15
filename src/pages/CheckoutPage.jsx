// CheckoutPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  CheckCircle,
  Copy,
  AlertCircle,
  Trash2,
  X,
  Minus,
  Plus,
  MapPin,
  Edit3,
  Upload,
  RefreshCw,
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
    clearCart 
  } = useAppContext();

  const product = location.state?.product;
  const staticCart = location.state?.cart || location.state?.staticCart;

  const addressData = location.state?.address;
  const savedToDb = location.state?.savedToDb;
  const fallback = location.state?.fallback;
  const existingOrder = location.state?.existingOrder;

  const [copied, setCopied] = useState(false);
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
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [orderCreationError, setOrderCreationError] = useState(null);

  // New states for order update functionality
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [orderUpdateError, setOrderUpdateError] = useState(null);
  const [hasOrderChanged, setHasOrderChanged] = useState(false);
  const [originalOrderData, setOriginalOrderData] = useState(null);
  
  // Local cart state to maintain cart even after clearing
  const [localCart, setLocalCart] = useState(null);

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

    // Use local cart if available (after order creation)
    const itemsToUse = localCart?.items || cartItems;

    if (itemsToUse && itemsToUse.length > 0) {
      let savings = 0;
      let totalQuantity = 0;
      let subtotal = 0;

      itemsToUse.forEach((item) => {
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
        items: itemsToUse.map((item) => ({
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
        itemCount: itemsToUse.length,
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

  // Check if order has changed compared to original
  const checkOrderChanged = () => {
    if (!originalOrderData || !cart) {
      return false;
    }

    // Compare total
    if (Math.abs(originalOrderData.total - cart.total) > 0.01) {
      return true;
    }

    // Compare items count
    if (originalOrderData.items.length !== cart.items.length) {
      return true;
    }

    // Compare each item
    for (let i = 0; i < cart.items.length; i++) {
      const currentItem = cart.items[i];
      const originalItem = originalOrderData.items.find(
        item => item.id === (currentItem.id || currentItem._id)
      );

      if (!originalItem) {
        return true; // New item added
      }

      if (originalItem.quantity !== currentItem.quantity) {
        return true; // Quantity changed
      }
    }

    return false;
  };

  // Update existing order
  const updateExistingOrder = async () => {
    if (!createdOrder || !cart) {
      console.log("No order to update or no cart data");
      return;
    }

    setIsUpdatingOrder(true);
    setOrderUpdateError(null);

    try {
      console.log("Updating order:", createdOrder._id);

      const updatedOrderData = {
        cartData: {
          items: cart.items.map((item) => ({
            id: item._id || item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          total: cart.total,
          subtotal: cart.subtotal || cart.total,
          savings: cart.savings || 0,
          itemCount: cart.items.length,
        },
      };

      const response = await api.put(`/api/orders/${createdOrder._id}/update`, updatedOrderData);

      if (response.data.success) {
        const updatedOrder = response.data.order;
        setCreatedOrder(updatedOrder);
        
        // Update original order data to new values
        setOriginalOrderData({
          total: updatedOrder.total,
          items: updatedOrder.items,
        });
        
        setHasOrderChanged(false);
        console.log("Order updated successfully:", updatedOrder.orderNumber);

        // Show success message
        alert("Order updated successfully!");
      } else {
        throw new Error(response.data.message || "Order update failed");
      }
    } catch (error) {
      console.error("Error updating order:", error);
      
      let errorMessage = "Failed to update order. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error. Please check your internet connection.";
      } else {
        errorMessage = error.message;
      }

      setOrderUpdateError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Create order when page loads if not already created
  useEffect(() => {
    const createOrder = async () => {
      if (existingOrder) {
        console.log("Using existing order:", existingOrder);
        setCreatedOrder(existingOrder);
        setOriginalOrderData({
          total: existingOrder.total,
          items: existingOrder.items,
        });
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
              id: item._id || item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            total: cart.total,
            subtotal: cart.subtotal || cart.total,
            savings: cart.savings || 0,
            itemCount: cart.items.length,
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
        };

        console.log("Sending order data:", orderData);

        const response = await api.post("/api/orders/create", orderData);

        console.log("Order creation response:", response.data);

        if (response.data.success) {
          const newOrder = response.data.order;
          setCreatedOrder(newOrder);
          
          // Store original order data for comparison
          setOriginalOrderData({
            total: newOrder.total,
            items: newOrder.items,
          });
          
          // Store current cart items locally before clearing
          setLocalCart({
            items: cart.items,
            total: cart.total,
            subtotal: cart.subtotal,
            savings: cart.savings,
          });
          
          console.log("Order created successfully:", newOrder.orderNumber);

          try {
            console.log('🛒 Clearing cart after successful order creation');
            await clearCart();
            console.log('✅ Cart cleared successfully after order creation');
          } catch (clearError) {
            console.error('❌ Error clearing cart:', clearError);
            // Don't fail the order creation if cart clearing fails
          }
        } else {
          throw new Error(response.data.message || "Order creation failed");
        }
      } catch (error) {
        console.error("Error creating order:", error);

        let errorMessage = "Failed to create order. Please try again.";

        if (error.response) {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = "Network error. Please check your internet connection.";
        } else {
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
  }, [user, cart?.total, addressData?.name, createdOrder, isCreatingOrder, clearCart, existingOrder]);

  // Check for order changes
  useEffect(() => {
    if (createdOrder && cart) {
      const changed = checkOrderChanged();
      setHasOrderChanged(changed);
    }
  }, [cart, originalOrderData, createdOrder]);

  // Redirect if no data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!product && !cart) {
        console.log("No checkout data available after timeout, redirecting to home");
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

  // Payment confirmation handlers
  const handlePaymentMade = () => {
    setShowPaymentConfirmation(true);
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

    // If order has changed, update it first
    if (hasOrderChanged) {
      try {
        await updateExistingOrder();
      } catch (error) {
        console.error("Failed to update order before payment:", error);
        alert("Please update your order first before confirming payment.");
        return;
      }
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
      pattern.test(cleanTransactionId)
    );

    if (!isValidFormat) {
      alert("Invalid UPI transaction ID format. Please enter a valid 12-digit UPI transaction ID.");
      return;
    }

    setIsConfirmingPayment(true);
    try {
      const upiId = "9589773525@ptsbi";
      const response = await api.post(
        `/api/orders/${createdOrder._id}/confirm-payment`,
        {
          transactionId: cleanTransactionId,
          screenshot: paymentScreenshot,
          upiId: upiId,
        }
      );

      if (response.data.success) {
        // Navigate to PaymentVerificationPage
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
        alert(error.response.data.message || "Invalid payment details. Please check and try again.");
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
      // Remove from local cart instead of global cart if order is created
      if (createdOrder && localCart) {
        const updatedItems = localCart.items.filter(
          (item) => (item.id || item._id) !== (itemToDelete.id || itemToDelete._id)
        );
        
        if (updatedItems.length === 0) {
          navigate("/");
          return;
        }
        
        // Recalculate totals
        let subtotal = 0;
        let savings = 0;
        
        updatedItems.forEach((item) => {
          subtotal += item.price * item.quantity;
        });
        
        const total = Math.max(0, subtotal - savings);
        
        setLocalCart({
          items: updatedItems,
          total,
          subtotal,
          savings,
        });
      } else {
        await removeFromCart(itemToDelete.id || itemToDelete._id);
        
        setTimeout(() => {
          const updatedCart = calculateCartData();
          if (!product && (!updatedCart || updatedCart.itemCount === 0)) {
            navigate("/");
          }
        }, 500);
      }
      
      setShowDeleteModal(false);
      setItemToDelete(null);
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
        // Update local cart if order is created
        if (createdOrder && localCart) {
          const updatedItems = localCart.items.map((item) => {
            if ((item.id || item._id) === itemId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          });
          
          // Recalculate totals
          let subtotal = 0;
          let savings = 0;
          
          updatedItems.forEach((item) => {
            subtotal += item.price * item.quantity;
          });
          
          const total = Math.max(0, subtotal - savings);
          
          setLocalCart({
            items: updatedItems,
            total,
            subtotal,
            savings,
          });
        } else {
          await updateCartItemQuantity(itemId, newQuantity);
        }
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
          existingOrder: createdOrder, // Pass the existing order
        },
      });
    } else if (product) {
      navigate("/address", {
        state: {
          product: product,
          editMode: true,
          existingOrder: createdOrder, // Pass the existing order
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

  const totalPrice = product
    ? product.price * product.quantity
    : cart?.total || 0;
  const upiId = "9589773525@ptsbi";
  const upiName = "Gaurav Verma";
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    upiName
  )}&am=${totalPrice}&cu=INR&tn=Order%20Payment`;

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy UPI ID");
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

              {hasOrderChanged && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Your order has been modified. Please update your order before confirming payment.
                  </p>
                </div>
              )}

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

          {/* Order Update Status */}
          {isUpdatingOrder && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
                <span className="text-blue-600 font-medium">
                  Updating your order...
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
                    <p className="text-sm text-orange-600">
                      Order #{createdOrder.orderNumber} • Total: ₹
                      {createdOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {/* Order Changed Indicator and Update Button */}
                {hasOrderChanged && (
                  <div className="flex items-center space-x-2">
                    <div className="text-yellow-600 text-sm">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Modified
                    </div>
                    <button
                      onClick={updateExistingOrder}
                      disabled={isUpdatingOrder}
                      className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${isUpdatingOrder ? 'animate-spin' : ''}`} />
                      {isUpdatingOrder ? 'Updating...' : 'Update Order'}
                    </button>
                  </div>
                )}
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
                          ? "text-orange-600"
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
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="ml-2 text-orange-600 font-medium">
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
              {hasOrderChanged && (
                <div className="ml-auto flex items-center text-yellow-600 text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Modified
                </div>
              )}
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

                            {/* Quantity Controls - Always show for cart items */}
                            {!cart.isFromStatic && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id || item._id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                  disabled={isUpdatingOrder}
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
                                      item.quantity + 1
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                  disabled={isUpdatingOrder}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delete Button - Always show for cart items */}
                        {!cart.isFromStatic && (
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="absolute top-2 right-2 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 opacity-70 hover:opacity-100"
                            title="Remove item"
                            disabled={isUpdatingOrder}
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

              <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Total</span>
                <span className="text-2xl font-bold text-orange-600">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              
              {/* Show update button in order summary if changes detected */}
              {hasOrderChanged && !cart.isFromStatic && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={updateExistingOrder}
                    disabled={isUpdatingOrder}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isUpdatingOrder ? 'animate-spin' : ''}`} />
                    {isUpdatingOrder ? 'Updating Order...' : 'Update Order'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Update your order to reflect the latest changes
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <Shield className="w-6 h-6 text-indigo-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">
                Payment Options
              </h2>
            </div>

            {/* Warning if order has changed */}
            {hasOrderChanged && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Order Modified</h4>
                    <p className="text-sm text-yellow-700">
                      Please update your order before making payment to ensure the correct amount.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* QR Code */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 text-center shadow-inner">
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg border border-indigo-100">
                  <QRCode value={upiLink} size={180} />
                </div>
                <h3 className="mt-4 font-semibold text-gray-800">
                  Scan QR Code to Pay
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Works with all UPI apps
                </p>
              </div>

              {/* UPI ID */}
              <div>
                <p className="text-sm text-gray-600 mb-2">UPI ID</p>
                <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
                  <span className="font-mono text-gray-800">{upiId}</span>
                  <button
                    onClick={copyUpiId}
                    className="text-gray-500 hover:text-green-500 transition"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-xs mt-1">Copied!</p>
                )}
              </div>

              {/* Pay Button */}
              <a
                href={upiLink}
                onClick={handlePaymentMade}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition transform hover:scale-[1.02] shadow-md text-center"
              >
                Pay ₹{totalPrice.toFixed(2)} Now
              </a>

              {/* Payment Made Button */}
              {createdOrder && (
                <button
                  onClick={handlePaymentMade}
                  className="w-full bg-orange-600 hover:bg-orange-700 hover:scale-[1.02] text-white font-bold py-3 px-6 rounded-xl transition-all"
                  disabled={hasOrderChanged}
                >
                  {hasOrderChanged ? 'Update Order First' : 'I Have Made the Payment'}
                </button>
              )}

              <div className="flex items-center justify-center text-gray-500 text-sm">
                <Shield className="w-4 h-4 mr-1" />
                Secured by UPI
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
              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                1
              </div>
              <p>
                {isMobile
                  ? "Click 'Pay Now' button to open UPI app"
                  : "Scan QR code with your UPI app"}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                2
              </div>
              <p>Complete payment with your UPI PIN</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
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