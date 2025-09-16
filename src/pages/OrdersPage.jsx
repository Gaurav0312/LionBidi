import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import api from "../utils/api";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  Eye,
  AlertCircle,
  RefreshCw,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Trash2,
  X,
} from "lucide-react";

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders?page=${page}&limit=10`);

      if (response.data.success) {
        setOrders(response.data.orders);
        setPagination(
          response.data.pagination || {
            current: page,
            pages: 1,
            total: response.data.orders.length,
          }
        );
        setError(null);
      } else {
        throw new Error(response.data.message || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Check if order can be deleted
  const canDeleteOrder = (order) => {
    const deletableStatuses = ['pending', 'payment_failed', 'cancelled'];
    return deletableStatuses.includes(order.status);
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      setDeleteLoading(true);
      const response = await api.delete(`/api/orders/${orderId}`);
      
      if (response.data.success) {
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        setPagination(prev => ({
          ...prev,
          total: prev.total - 1
        }));
        alert('Order deleted successfully');
        setShowDeleteConfirm(false);
        setOrderToDelete(null);
      } else {
        throw new Error(response.data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      alert(err.response?.data?.message || "Failed to delete order");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Confirm delete modal
  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setShowDeleteConfirm(true);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "text-yellow-600 bg-yellow-50 border-yellow-200",
      payment_submitted: "text-blue-600 bg-blue-50 border-blue-200",
      confirmed: "text-green-600 bg-green-50 border-green-200",
      processing: "text-purple-600 bg-purple-50 border-purple-200",
      shipped: "text-indigo-600 bg-indigo-50 border-indigo-200",
      delivered: "text-emerald-600 bg-emerald-50 border-emerald-200",
      cancelled: "text-red-600 bg-red-50 border-red-200",
      payment_failed: "text-red-600 bg-red-50 border-red-200",
    };
    return statusColors[status] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      payment_submitted: CreditCard,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: AlertCircle,
      payment_failed: AlertCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusText = (status) => {
    const statusTexts = {
      pending: "Pending Payment",
      payment_submitted: "Payment Submitted",
      confirmed: "Order Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      payment_failed: "Payment Failed",
    };
    return statusTexts[status] || status;
  };

  const handleCompletePayment = async (order) => {
    try {
      const response = await api.get(`/api/orders/${order._id}`);
      if (response.data.success) {
        const fullOrder = response.data.order;

        navigate("/checkout", {
          state: {
            staticCart: {
              items: fullOrder.items,
              total: fullOrder.total,
              subtotal: fullOrder.subtotal,
              savings: fullOrder.discount || 0,
              itemCount: fullOrder.items.length,
              isFromOrder: true,
            },
            address: {
              name: fullOrder.shippingAddress.name,
              mobileNumber: fullOrder.shippingAddress.phone,
              emailAddress: fullOrder.shippingAddress.email,
              address: fullOrder.shippingAddress.street,
              city: fullOrder.shippingAddress.city,
              state: fullOrder.shippingAddress.state,
              pinCode: fullOrder.shippingAddress.zipCode,
              country: fullOrder.shippingAddress.country || "India",
            },
            existingOrder: fullOrder,
            savedToDb: true,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      navigate(`/payment-verification/${order.orderNumber}`);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.order);
        setShowOrderDetails(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const OrderCard = ({ order }) => {
    const StatusIcon = getStatusIcon(order.status);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="p-4 sm:p-6">
          {/* Order Header */}
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center justify-between mb-4">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 truncate">
                Order #{order.orderNumber}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                <Calendar size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">
                  {new Date(order.orderDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <div
                className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                <StatusIcon size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate">{getStatusText(order.status)}</span>
              </div>
            </div>
          </div>

          {/* Order Summary - Mobile Optimized Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                Items
              </p>
              <p className="font-semibold text-sm sm:text-base text-gray-800">
                {order.itemCount || order.items?.length || 0}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                Total
              </p>
              <p className="font-semibold text-sm sm:text-base text-gray-800 flex items-center">
                <IndianRupee size={12} className="flex-shrink-0" />
                <span className="truncate">{order.total?.toLocaleString() || 0}</span>
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                Payment
              </p>
              <p className="font-semibold text-sm sm:text-base text-gray-800 capitalize truncate">
                {order.paymentStatus || "Pending"}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide truncate">
                Delivery
              </p>
              <p className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                {order.shippingAddress?.city || "N/A"}
              </p>
            </div>
          </div>

          {/* Items Preview - Mobile Optimized */}
          {order.items && order.items.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
              <div className="space-y-2">
                {/* Show first 2 items on mobile, 3 on desktop */}
                {order.items.slice(0, window.innerWidth < 640 ? 2 : 3).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 rounded-lg px-3 py-2 text-sm"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-6 h-6 rounded object-cover mr-2 flex-shrink-0"
                      />
                    )}
                    <span className="text-gray-700 font-medium truncate">
                      {item.name} (x{item.quantity})
                    </span>
                  </div>
                ))}
                {order.items.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <div className="text-xs text-gray-500 px-3 py-1 text-center">
                    +{order.items.length - (window.innerWidth < 640 ? 2 : 3)} more items
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions - Mobile Optimized */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Primary action always full width on mobile */}
            <button
              onClick={() => viewOrderDetails(order._id)}
              className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-4 py-3 sm:py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium text-sm"
            >
              <Eye size={16} />
              <span>View Details</span>
            </button>

            {/* Secondary actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {order.status === "pending" && (
                <button
                  onClick={() => handleCompletePayment(order)}
                  className="flex-1 bg-[#FF6B35] text-white px-4 py-2.5 sm:py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium text-sm"
                >
                  Complete Payment
                </button>
              )}

              {["shipped", "processing", "confirmed"].includes(order.status) && (
                <button
                  onClick={() => navigate(`/orders/${order._id}/track`)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <Truck size={16} />
                  <span>Track Order</span>
                </button>
              )}

              {canDeleteOrder(order) && (
                <button
                  onClick={() => confirmDelete(order)}
                  className="flex-1 flex items-center justify-center gap-2 border border-red-300 text-red-600 px-4 py-2.5 sm:py-2 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal - Mobile Optimized
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirm || !orderToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Order
            </h3>
            
            <p className="text-sm text-gray-500 mb-6 px-2">
              Are you sure you want to delete order #{orderToDelete.orderNumber}? 
              This action cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 sm:py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleDeleteOrder(orderToDelete._id)}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {deleteLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Order'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Order Details Modal - Mobile Optimized
  const OrderDetailsModal = () => {
    if (!showOrderDetails || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-white border-b p-4 sm:p-6 rounded-t-2xl z-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate mr-4">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Order Status & Info - Mobile Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Order Status
                  </h3>
                  <div
                    className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-full font-medium text-sm ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {React.createElement(getStatusIcon(selectedOrder.status), {
                      size: 16,
                      className: "mr-2 flex-shrink-0",
                    })}
                    <span>{getStatusText(selectedOrder.status)}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Order Date
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {new Date(selectedOrder.orderDate).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Payment Status
                  </h3>
                  <p
                    className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      selectedOrder.payment?.paymentStatus === "verified"
                        ? "text-green-600 bg-green-50"
                        : "text-yellow-600 bg-yellow-50"
                    }`}
                  >
                    {selectedOrder.payment?.paymentStatus || "Pending"}
                  </p>
                </div>

                {selectedOrder.payment?.transactionId && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                      Transaction ID
                    </h3>
                    <p className="text-gray-600 font-mono text-xs sm:text-sm bg-gray-100 px-3 py-2 rounded break-all">
                      {selectedOrder.payment.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items - Mobile Optimized */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address - Mobile Optimized */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center text-sm sm:text-base">
                <MapPin size={16} className="mr-2 flex-shrink-0" />
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="font-medium text-gray-800 text-sm sm:text-base">
                  {selectedOrder.shippingAddress?.name}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {selectedOrder.shippingAddress?.street}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} -{" "}
                  {selectedOrder.shippingAddress?.zipCode}
                </p>
                <p className="text-gray-600 text-sm sm:text-base">
                  Phone: {selectedOrder.shippingAddress?.phone}
                </p>
                <p className="text-gray-600 text-sm sm:text-base break-all">
                  Email: {selectedOrder.shippingAddress?.email}
                </p>
              </div>
            </div>

            {/* Order Summary - Mobile Optimized */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
                Order Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm sm:text-base">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-base sm:text-lg">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Delete button in order details modal */}
            {canDeleteOrder(selectedOrder) && (
              <div className="border-t pt-4">
                <button
                  onClick={() => {
                    setShowOrderDetails(false);
                    confirmDelete(selectedOrder);
                  }}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm sm:text-base"
                >
                  <Trash2 size={16} />
                  Delete This Order
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="animate-spin text-divine-orange mx-auto mb-4"
          />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 font-medium text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Track and manage your orders</p>
            </div>

            <button
              onClick={() => fetchOrders(pagination.current)}
              className="flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-4 py-2.5 sm:py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium text-sm self-start sm:self-auto"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center text-sm sm:text-base">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <Package size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#FF6B35] text-white px-6 py-3 sm:py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium text-sm sm:text-base"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6 sm:mb-8">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination - Mobile Optimized */}
            {pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => fetchOrders(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-sm"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-xs sm:text-sm text-gray-600 order-first sm:order-none">
                  Page {pagination.current} of {pagination.pages}
                </span>

                <button
                  onClick={() => fetchOrders(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <OrderDetailsModal />
      <DeleteConfirmationModal />
    </div>
  );
};

export default OrdersPage;
