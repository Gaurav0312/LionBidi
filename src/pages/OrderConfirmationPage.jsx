// OrderConfirmationPage.jsx - Fixed version with safe property access
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  Download,
  Share2,
  Copy,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import api from "../utils/api";

const OrderConfirmationPage = () => {
  const { orderNumber } = useParams();
  const { clearCart } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [copied, setCopied] = useState(false);

  const [verificationMessage, setVerificationMessage] = useState(
    location.state?.message || ""
  );
  const [isVerificationPending, setIsVerificationPending] = useState(
    location.state?.requiresVerification || false
  );
  const [pollingForVerification, setPollingForVerification] = useState(false);

  useEffect(() => {
    const pollVerificationStatus = async () => {
      if (
        !order ||
        !isVerificationPending ||
        order.payment?.paymentStatus !== "pending_verification"
      ) {
        return;
      }

      setPollingForVerification(true);
      try {
        const response = await api.get(`/api/orders/number/${orderNumber}`);
        if (response.data.success) {
          const updatedOrder = response.data.order;

          // Check if verification status changed
          if (updatedOrder.payment?.paymentStatus === "verified") {
            setOrder(updatedOrder);
            setIsVerificationPending(false);
            setVerificationMessage(
              "Payment verified! Your order has been confirmed."
            );
          } else if (
            updatedOrder.payment?.paymentStatus === "verification_failed"
          ) {
            setOrder(updatedOrder);
            setIsVerificationPending(false);
            setVerificationMessage(
              "Payment verification failed. Please contact support."
            );
          }
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setPollingForVerification(false);
      }
    };

    // Poll every 30 seconds if verification is pending
    if (isVerificationPending) {
      const interval = setInterval(pollVerificationStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [order, isVerificationPending, orderNumber]);

  // Fetch order details if not provided in state
  useEffect(() => {
    const fetchOrder = async () => {
      if (!order && orderNumber) {
        try {
          const response = await api.get(`/api/orders/number/${orderNumber}`);
          if (response.data.success) {
            setOrder(response.data.order);
          } else {
            console.error("Order not found:", response.data.message);
            navigate("/orders");
          }
        } catch (error) {
          console.error("Error fetching order:", error);
          navigate("/orders");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [order, orderNumber, navigate]);

  // useEffect(() => {
  //   // Clear cart when order confirmation page loads
  //   const clearCartAfterOrder = async () => {
  //     try {
  //       console.log('🛒 Clearing cart after successful order placement');
  //       await clearCart();
  //       localStorage.removeItem('cart');
  //       console.log('✅ Cart cleared successfully');
  //     } catch (error) {
  //       console.error('❌ Error clearing cart:', error);
  //     }
  //   };

  //   if (orderNumber) {
  //     clearCartAfterOrder();
  //   }
  // }, [orderNumber, clearCart]);

  const shareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `Order Confirmation - ${orderNumber}`,
      text: `Your order ${orderNumber} has been confirmed! Total: ₹${(
        order.total || 0
      ).toFixed(2)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy");
      }
    }
  };

  const downloadReceipt = () => {
    if (!order) return;

    const receiptContent = `
ORDER CONFIRMATION
==================

Order Number: ${order.orderNumber || "N/A"}
Date: ${
      order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"
    }
Status: ${(order.status || "pending").toUpperCase()}

ITEMS:
${
  order.items
    ?.map(
      (item) =>
        `${item.name || "Unknown Item"} x${item.quantity || 0} - ₹${(
          (item.price || 0) * (item.quantity || 0)
        ).toFixed(2)}`
    )
    .join("\n") || "No items"
}

DELIVERY ADDRESS:
${order.shippingAddress?.name || "N/A"}
${order.shippingAddress?.street || ""}
${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${
      order.shippingAddress?.zipCode || ""
    }

PAYMENT:
Method: ${order.payment?.method || "N/A"}
Total: ₹${(order.total || 0).toFixed(2)}
Status: ${(order.payment?.paymentStatus || "pending").toUpperCase()}
${
  order.payment?.transactionId
    ? `Transaction ID: ${order.payment.transactionId}`
    : ""
}

Thank you for your order!
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-${order.orderNumber || "unknown"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have access
            to it.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  // Safe access to nested properties with fallbacks
  const paymentStatus = order.payment?.paymentStatus || "pending";
  const paymentMethod = order.payment?.method || "UPI";
  const transactionId = order.payment?.transactionId;
  const orderTotal = order.total || 0;
  const orderSubtotal = order.subtotal || order.total || 0;
  const orderDiscount = order.discount || 0;
  const orderShipping = order.shipping || 0;
  const orderItems = order.items || [];
  const shippingAddress = order.shippingAddress || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* NEW: Verification Status Banner */}
        {isVerificationPending && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Payment Verification in Progress
                </h3>
                <p className="text-yellow-700 text-sm">
                  {verificationMessage ||
                    "We are verifying your payment details. This usually takes 2-24 hours."}
                </p>
                {pollingForVerification && (
                  <p className="text-yellow-600 text-xs mt-1">
                    Checking status... (Auto-refreshes every 30 seconds)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase, {user?.name || "Valued Customer"}!
          </p>
          <p className="text-lg text-gray-500">
            Your order{" "}
            <span className="font-mono font-bold text-green-600">
              #{order.orderNumber}
            </span>{" "}
            has been placed successfully.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold">Order Summary</h2>
                <p className="text-green-100">
                  Placed on{" "}
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{orderTotal.toFixed(2)}</p>
                <p className="text-green-100 capitalize">{paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name || "Product"}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.name || "Unknown Item"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{(item.price || 0).toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No items found
                </div>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{orderSubtotal.toFixed(2)}</span>
              </div>
              {orderDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-₹{orderDiscount.toFixed(2)}</span>
                </div>
              )}
              {orderShipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>₹{orderShipping.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2">
                <span>Total:</span>
                <span>₹{orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Home className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delivery Address
              </h3>
            </div>
            <div className="space-y-1 text-gray-600">
              <p className="font-medium text-gray-900">
                {shippingAddress.name || "N/A"}
              </p>
              <p>{shippingAddress.street || "Address not available"}</p>
              <p>
                {shippingAddress.city || ""}
                {shippingAddress.city && shippingAddress.state ? ", " : ""}
                {shippingAddress.state || ""}
              </p>
              <p>
                {shippingAddress.zipCode || ""}
                {shippingAddress.zipCode && shippingAddress.country ? ", " : ""}
                {shippingAddress.country || "India"}
              </p>
              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-1" />
                  {shippingAddress.phone || "N/A"}
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-1" />
                  {shippingAddress.email || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Order Status
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    order.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "payment_submitted"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status === "payment_submitted"
                    ? "Pending Verification"
                    : order.status || "pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Payment:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    paymentStatus === "verified"
                      ? "bg-green-100 text-green-800"
                      : paymentStatus === "pending_verification"
                      ? "bg-yellow-100 text-yellow-800"
                      : paymentStatus === "verification_failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {paymentStatus === "pending_verification"
                    ? "Being Verified"
                    : paymentStatus}
                </span>
              </div>
              {transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm font-medium">
                    {transactionId}
                  </span>
                </div>
              )}
              {order.trackingNumber && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tracking:</span>
                  <span className="font-mono text-sm font-medium">
                    {order.trackingNumber}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  {paymentStatus === "pending_verification"
                    ? "Verification usually takes 2-24 hours"
                    : "Estimated delivery: 5-7 business days"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Order Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Order Placed */}
            <div className="relative flex items-center mb-6">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center relative z-10">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Order Placed</h4>
                <p className="text-sm text-gray-500">
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleString("en-IN")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Payment Confirmed */}
            {order.confirmedAt && (
              <div className="relative flex items-center mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center relative z-10">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="font-medium text-gray-900">
                    Payment Confirmed
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(order.confirmedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            )}

            {/* Processing */}
            <div className="relative flex items-center mb-6">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                  ["processing", "shipped", "delivered"].includes(order.status)
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              >
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Processing</h4>
                <p className="text-sm text-gray-500">
                  {order.status === "processing"
                    ? "Currently processing your order"
                    : "Pending"}
                </p>
              </div>
            </div>

            {/* Shipped */}
            <div className="relative flex items-center mb-6">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                  ["shipped", "delivered"].includes(order.status)
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              >
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Shipped</h4>
                <p className="text-sm text-gray-500">
                  {order.shippedAt
                    ? new Date(order.shippedAt).toLocaleString("en-IN")
                    : "Will be updated once shipped"}
                </p>
              </div>
            </div>

            {/* Delivered */}
            <div className="relative flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                  order.status === "delivered" ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="font-medium text-gray-900">Delivered</h4>
                <p className="text-sm text-gray-500">
                  {order.deliveredAt
                    ? new Date(order.deliveredAt).toLocaleString("en-IN")
                    : "Estimated: 5-7 business days"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={downloadReceipt}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </button>

            <button
              onClick={shareOrder}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Order
                </>
              )}
            </button>

            <button
              onClick={() => navigate(`/orders/${order._id}/track`)}
              className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Truck className="w-5 h-5 mr-2" />
              Track Order
            </button>

            <button
              onClick={() => navigate("/orders")}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              View All Orders
            </button>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Need help with your order? Contact our support team.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <a
              href="tel:+919589773525"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Phone className="w-4 h-4 mr-1" />
              +91 95897 73525
            </a>
            <a
              href="mailto:lionbidicompany@gmail.com"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Mail className="w-4 h-4 mr-1" />
              lionbidicompany@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
