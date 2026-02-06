// PaymentVerificationPage.jsx - Fixed version with reject payment
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  AlertTriangle,
  RefreshCw,
  Home,
  Ban,
} from "lucide-react";
import api from "../utils/api";

const PaymentVerificationPage = () => {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [lastPolled, setLastPolled] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // Use refs to prevent multiple polling instances
  const pollingIntervalRef = useRef(null);
  const isPollingRef = useRef(false);

  // Cleanup function to clear polling
  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    isPollingRef.current = false;
  };

  // Single polling function with better control
  const pollStatus = async () => {
    if (window.location.pathname !== `/payment-verification/${orderNumber}`) {
      console.log('User navigated away, stopping polling');
      clearPolling();
      return;
    }

    // Prevent multiple simultaneous calls
    if (isPollingRef.current) {
      console.log('Polling already in progress, skipping...');
      return;
    }

    if (!order || !orderNumber) {
      console.log('No order data available for polling');
      return;
    }

    // Check if payment is already verified or failed
    const currentStatus = order.payment?.paymentStatus;
    if (currentStatus === "verified" || currentStatus === "verification_failed") {
      console.log('Payment already processed, stopping polling');
      clearPolling();
      return;
    }

    isPollingRef.current = true;
    console.log('Polling payment status...');

    try {
      const response = await api.get(`/api/orders/number/${orderNumber}`);

      if (response.data.success) {
        const updatedOrder = response.data.order;
        const paymentStatus = updatedOrder.payment?.paymentStatus;

        console.log('Poll result:', paymentStatus);
        setLastPolled(new Date().toLocaleTimeString());

        if (paymentStatus === "verified") {
          setVerificationStatus("verified");
          setOrder(updatedOrder);
          clearPolling();
          
          // Auto-redirect after verification
          setTimeout(() => {
            navigate(`/order-confirmation/${orderNumber}`, {
              state: { order: updatedOrder, fromVerification: true },
            });
          }, 2000);
        } else if (paymentStatus === "verification_failed") {
          setVerificationStatus("failed");
          setOrder(updatedOrder);
          clearPolling();
        } else {
          // Update order but continue polling
          setOrder(updatedOrder);
        }
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
    } finally {
      isPollingRef.current = false;
    }
  };

  // Start polling with better control
  const startPolling = () => {
    // Clear any existing polling first
    clearPolling();

    // Only start polling if we have an order and it needs verification
    if (!order || !order.payment || order.payment.paymentStatus === "verified" || order.payment.paymentStatus === "verification_failed") {
      return;
    }

    console.log('Starting payment verification polling...');

    // Initial check
    pollStatus();

    // Set up interval (60 seconds to reduce server load)
    pollingIntervalRef.current = setInterval(pollStatus, 60000);
  };

  // Effect to start polling when component mounts or order changes
  useEffect(() => {
    if (order && order.payment?.paymentStatus === "pending_verification") {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      clearPolling();
    };
  }, [order?.payment?.paymentStatus, orderNumber]);

  // Stop polling when navigating away
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, []);

  const handleRefreshStatus = async () => {
    if (loading) return;
    
    setLoading(true);
    console.log('Manual refresh triggered');
    
    try {
      const response = await api.get(`/api/orders/number/${orderNumber}`);

      if (response.data.success) {
        const updatedOrder = response.data.order;
        setOrder(updatedOrder);
        
        const paymentStatus = updatedOrder.payment?.paymentStatus;
        
        if (paymentStatus === "verified") {
          setVerificationStatus("verified");
          clearPolling();
        } else if (paymentStatus === "verification_failed") {
          setVerificationStatus("failed");
          clearPolling();
        }
        
        setLastPolled(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
      alert("Failed to refresh status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    if (rejecting) return;

    const confirmed = window.confirm(
      "Are you sure you want to reject this payment? This action cannot be undone."
    );

    if (!confirmed) return;

    setRejecting(true);
    console.log('Rejecting payment for order:', orderNumber);

    try {
      const response = await api.post(
        `/api/orders/${order._id}/reject-payment`,
        {
          reason: rejectReason,
          orderNumber: orderNumber
        }
      );

      if (response.data.success) {
        const updatedOrder = response.data.order;
        setOrder(updatedOrder);
        setVerificationStatus("failed");
        setShowRejectModal(false);
        setRejectReason("");
        clearPolling();
        
        alert("Payment has been rejected successfully");
      } else {
        alert(response.data.message || "Failed to reject payment");
      }
    } catch (error) {
      console.error("Error rejecting payment:", error);
      alert(
        error.response?.data?.message || 
        "Failed to reject payment. Please try again."
      );
    } finally {
      setRejecting(false);
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              verificationStatus === "verified"
                ? "bg-green-100"
                : verificationStatus === "failed"
                ? "bg-red-100"
                : "bg-yellow-100"
            }`}
          >
            {verificationStatus === "verified" ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : verificationStatus === "failed" ? (
              <XCircle className="w-12 h-12 text-red-600" />
            ) : (
              <Clock className="w-12 h-12 text-divine-orange" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {verificationStatus === "verified"
              ? "Payment Verified!"
              : verificationStatus === "failed"
              ? "Payment Verification Failed"
              : "Payment Verification Pending"}
          </h1>

          <p className="text-xl text-gray-600 mb-2">Order #{orderNumber}</p>

          {/* Polling Status Indicator */}
          {verificationStatus === "pending" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-blue-800 text-sm">
                    Auto-checking status every 60 seconds
                  </span>
                </div>
                {lastPolled && (
                  <span className="text-blue-600 text-xs">
                    Last checked: {lastPolled}
                  </span>
                )}
              </div>
            </div>
          )}

          {verificationStatus === "pending" && (
            <div className="bg-white border-gray-200 rounded-lg p-4 mt-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold text-orange-600">
                    Verification in Progress
                  </h3>
                  <p className="text-divine-orange text-sm">
                    We are verifying your payment details. This usually takes
                    1-2 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === "verified" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold text-green-800">
                    Payment Verified Successfully!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Your order has been confirmed and will be processed soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus === "failed" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-3" />
                <div className="text-left">
                  <h3 className="font-semibold text-red-800">
                    Payment Verification Failed
                  </h3>
                  <p className="text-red-700 text-sm">
                    We could not verify your payment. Please contact support for
                    assistance.
                  </p>
                  {order.payment?.verificationNotes && (
                    <p className="text-red-600 text-sm mt-1">
                      <strong>Note:</strong> {order.payment.verificationNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Order Details
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Order Total</p>
              <p className="font-semibold text-lg">
                ₹{order.total?.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium">{order.payment?.method || "UPI"}</p>
            </div>
            <div>
              <p className="text-gray-600">Transaction ID</p>
              <p className="font-mono text-sm">
                {order.payment?.transactionId || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Submitted</p>
              <p className="font-medium">
                {order.payment?.submittedAt
                  ? new Date(order.payment.submittedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleRefreshStatus}
            disabled={loading || verificationStatus !== "pending"}
            className="flex items-center justify-center px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:scale-[1.02] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Checking..." : "Refresh Status"}
          </button>

          {/* Reject Payment Button - Only show if pending */}
          {verificationStatus === "pending" && (
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={rejecting}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Ban className={`w-5 h-5 mr-2`} />
              Reject Payment
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:scale-[1.02] transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Continue Shopping
          </button>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What happens next?
          </h3>

          <p className="text-gray-600 mb-2">
            Your payment is being processed. You will receive a confirmation
            email once the payment is verified.
          </p>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your payment or order, feel free to
            contact us.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
            <a
              href="tel:+919589773525"
              className="flex items-center text-divine-orange hover:underline"
            >
              <Phone className="w-4 h-4 mr-2" />
              +91 95897 73525
            </a>
            <a
              href="mailto:lionbidicompany@gmail.com"
              className="flex items-center text-divine-orange hover:underline"
            >
              <Mail className="w-4 h-4 mr-2" />
              lionbidi company@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Reject Payment Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Reject Payment
              </h3>
            </div>

            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this payment. The customer will be notified.
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[100px]"
              maxLength={500}
            />

            <div className="text-sm text-gray-500 mb-4">
              {rejectReason.length}/500 characters
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectPayment}
                disabled={rejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                disabled={rejecting}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerificationPage;