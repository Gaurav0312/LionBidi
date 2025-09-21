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
  Download, // Add this import
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
    // Allow deletion for pending, payment_failed, or cancelled orders
    const deletableStatuses = ["pending", "payment_failed", "cancelled"];
    return deletableStatuses.includes(order.status);
  };

  // Check if receipt can be downloaded
  const canDownloadReceipt = (order) => {
    // Allow download for confirmed, processing, shipped, delivered orders
    const downloadableStatuses = [
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "payment_submitted",
    ];
    return downloadableStatuses.includes(order.status);
  };

  // Download receipt with full order data
  const downloadReceiptWithFullData = async (orderId) => {
    try {
      // First fetch the complete order data
      const response = await api.get(`/api/orders/${orderId}`);
      if (response.data.success) {
        const fullOrder = response.data.order;
        // Now download the receipt with complete data
        downloadReceipt(fullOrder);
      } else {
        console.error("Failed to fetch order details for receipt");
        alert("Failed to fetch order details. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching order details for receipt:", error);
      alert("Error loading order details. Please try again.");
    }
  };

  // Receipt download function - extracted from OrderConfirmationPage
  const downloadReceipt = (order) => {
    if (!order) return;

    // Dynamically import jsPDF
    import("jspdf")
      .then(({ jsPDF }) => {
        const doc = new jsPDF("p", "mm", "a4");

        // Set font
        doc.setFont("helvetica");

        // Load and add logo
        const logoUrl =
          "https://res.cloudinary.com/dxqerqng1/image/upload/v1754660338/campaign_covers/brixv4aazfsuzq27kfbc.png";

        // Create image element to load logo
        const img = new Image();
        img.crossOrigin = "anonymous";

        img.onload = function () {
          try {
            generateProfessionalReceipt(doc, order, true, img);
          } catch (error) {
            console.error("Error adding logo:", error);
            generateProfessionalReceipt(doc, order, false, null);
          }
        };

        img.onerror = function () {
          console.warn("Logo failed to load, generating receipt without logo");
          generateProfessionalReceipt(doc, order, false, null);
        };

        // Set logo source
        img.src = logoUrl;
      })
      .catch((error) => {
        console.error("Error loading jsPDF:", error);
        // Fallback to text file if jsPDF fails to load
        downloadTextReceipt(order);
      });
  };

  // Helper function to convert number to words (Indian format)
  const convertNumberToWords = (amount) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (num) => {
      let result = "";

      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }

      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + " ";
        return result;
      }

      if (num > 0) {
        result += ones[num] + " ";
      }

      return result;
    };

    if (amount === 0) return "Zero Rupees";

    let rupees = Math.floor(amount);
    let paise = Math.round((amount - rupees) * 100);

    let result = "";

    if (rupees >= 10000000) {
      result += convertHundreds(Math.floor(rupees / 10000000)) + "Crore ";
      rupees %= 10000000;
    }

    if (rupees >= 100000) {
      result += convertHundreds(Math.floor(rupees / 100000)) + "Lakh ";
      rupees %= 100000;
    }

    if (rupees >= 1000) {
      result += convertHundreds(Math.floor(rupees / 1000)) + "Thousand ";
      rupees %= 1000;
    }

    if (rupees > 0) {
      result += convertHundreds(rupees);
    }

    result += "Rupees";

    if (paise > 0) {
      result += " And " + convertHundreds(paise) + "Paise";
    }

    return result.trim();
  };

  // Professional Receipt Generator Function
  const generateProfessionalReceipt = (doc, order, hasLogo, logoImg) => {
    // Safe access to nested properties with fallbacks
    const paymentStatus = order.payment?.paymentStatus || "pending";
    const paymentMethod = order.payment?.method || "UPI";
    const orderTotal = order.total || 0;
    const orderSubtotal = order.subtotal || order.total || 0;
    const orderShipping = order.shipping || 0;
    const orderItems = order.items || [];
    const shippingAddress = order.shippingAddress || {};

    // Calculate GST (28% included in total)
    const gstRate = 0.28;
    const totalWithGst = orderTotal;
    const baseAmount = totalWithGst / (1 + gstRate);
    const gstAmount = totalWithGst - baseAmount;
    const shippingAmount = orderShipping || 0;

    let yPosition = 15;

    const formatRupee = (amount) => `Rs. ${amount.toFixed(2)}`;

    // Use order date instead of current date
    const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();

    // Header Section with Company Branding
    if (hasLogo) {
      // Add logo
      const logoWidth = 30;
      const logoHeight = 20;
      const logoX = 15;
      const logoY = yPosition;

      doc.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Company name next to logo
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 53); // Divine orange color
      doc.text("LION BIDI", 50, yPosition + 8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Premium Quality Bidi Manufacturer", 50, yPosition + 15);

      yPosition += 25;
    } else {
      // Company header without logo
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 53);
      doc.text("LION BIDI COMPANY", 105, yPosition + 5, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Premium Quality Bidi Manufacturer", 105, yPosition + 12, {
        align: "center",
      });

      yPosition += 20;
    }

    // Company contact information
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text("Phone: +91 9589773525", 15, yPosition);
    doc.text("Email: lionbidicompany@gmail.com", 15, yPosition + 5);
    doc.text("GST No: [23BKNPV1683G1ZS]", 15, yPosition + 10);

    // FIXED: Use order date and time instead of current date/time
    doc.text(`Date: ${orderDate.toLocaleDateString("en-IN")}`, 150, yPosition);
    doc.text(
      `Time: ${orderDate.toLocaleTimeString("en-IN")}`,
      150,
      yPosition + 5
    );

    // Decorative line
    yPosition += 18;
    doc.setLineWidth(0.8);
    doc.setDrawColor(255, 107, 53);
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 8;

    // Receipt Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("TAX INVOICE / PAYMENT RECEIPT", 105, yPosition, {
      align: "center",
    });
    yPosition += 12;

    // Receipt details in professional box format
    doc.setFillColor(248, 249, 250);
    doc.rect(15, yPosition - 2, 180, 35, "F");
    doc.setLineWidth(0.3);
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, yPosition - 2, 180, 35);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    // Left column
    doc.text("Receipt No:", 20, yPosition + 5);
    doc.text("Transaction ID:", 20, yPosition + 12);
    doc.text("Order Date:", 20, yPosition + 19);
    doc.text("Payment Method:", 20, yPosition + 26);

    // Right column - values
    doc.setFont("helvetica", "normal");
    doc.text(order.orderNumber || "N/A", 60, yPosition + 5);
    doc.text(order.payment?.transactionId || "N/A", 60, yPosition + 12);
    doc.text(orderDate.toLocaleDateString("en-IN"), 60, yPosition + 19);
    doc.text((paymentMethod || "UPI").toUpperCase(), 60, yPosition + 26);

    // Status and amount on right side
    doc.setFont("helvetica", "bold");
    doc.text("Payment Status:", 120, yPosition + 5);
    doc.text("Total Amount:", 120, yPosition + 19);

    doc.setFont("helvetica", "bold");
    const statusColor =
      paymentStatus === "verified" ? [47, 181, 29] : [234, 179, 8];
    doc.setTextColor(...statusColor);
    doc.text(paymentStatus.toUpperCase(), 165, yPosition + 5);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(formatRupee(totalWithGst), 165, yPosition + 19);

    yPosition += 45;

    // Billing Information Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 107, 53);
    doc.text("BILL TO:", 20, yPosition);
    yPosition += 8;

    // Customer details box
    doc.setFillColor(252, 252, 252);
    doc.rect(15, yPosition - 2, 180, 30, "F");
    doc.setLineWidth(0.3);
    doc.setDrawColor(220, 220, 220);
    doc.rect(15, yPosition - 2, 180, 35);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text((shippingAddress.name || "N/A").toUpperCase(), 20, yPosition + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Mobile: ${shippingAddress.phone || "N/A"}`, 20, yPosition + 12);
    doc.text(
      `Email: ${shippingAddress.email || user?.email || "N/A"}`,
      20,
      yPosition + 18
    );

    // Address formatting
    let addressLine = "";
    if (shippingAddress.street) addressLine += shippingAddress.street + ", ";
    if (shippingAddress.city) addressLine += shippingAddress.city + ", ";
    if (shippingAddress.state) addressLine += shippingAddress.state + " - ";
    if (shippingAddress.zipCode) addressLine += shippingAddress.zipCode;

    if (addressLine) {
      doc.text(`Address: ${addressLine}`, 20, yPosition + 24);
    }

    yPosition += 40;

    // Items Table Header
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 107, 53);
    doc.text("ITEM DETAILS:", 20, yPosition);
    yPosition += 10;

    // Table header with better styling
    doc.setFillColor(255, 107, 53);
    doc.rect(15, yPosition - 2, 180, 10, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("S.No", 18, yPosition + 4);
    doc.text("Item Description", 35, yPosition + 4);
    doc.text("HSN Code", 90, yPosition + 4);
    doc.text("Qty", 120, yPosition + 4);
    doc.text("Rate", 140, yPosition + 4);
    doc.text("Amount", 170, yPosition + 4);

    yPosition += 12;

    // Items with professional formatting
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "semibold");
    let itemCounter = 1;

    orderItems.forEach((item, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 249, 250);
        doc.rect(15, yPosition - 2, 180, 8, "F");
      }

      const itemName = (item.name || "Unknown Item").toUpperCase();
      const itemQty = item.quantity || 0;
      const itemHSN = item.hsn || "24031921";
      const itemRate = item.price || 0;
      const itemTotal = itemRate * itemQty;

      doc.text(itemCounter.toString(), 18, yPosition + 3);
      doc.text(itemName, 35, yPosition + 3);
      doc.text(itemHSN, 90, yPosition + 3);
      doc.text(itemQty.toString(), 125, yPosition + 3, { align: "center" });
      doc.text(formatRupee(itemRate), 155, yPosition + 3, { align: "right" });
      doc.text(formatRupee(itemTotal), 185, yPosition + 3, { align: "right" });

      yPosition += 8;
      itemCounter++;
    });

    // Horizontal line after items
    doc.setLineWidth(0.3);
    doc.setDrawColor(180, 180, 180);
    doc.line(15, yPosition + 2, 195, yPosition + 2);
    yPosition += 10;

    // Professional Totals Section
    const totalsStartX = 120;
    const valuesStartX = 185;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // Subtotal (before GST)
    doc.text("Subtotal (Excl. GST):", totalsStartX, yPosition);
    doc.text(formatRupee(baseAmount), valuesStartX, yPosition, {
      align: "right",
    });
    yPosition += 6;

    // GST breakdown
    doc.text(`GST @ 28% (Included):`, totalsStartX, yPosition);
    doc.text(formatRupee(gstAmount), valuesStartX, yPosition, {
      align: "right",
    });
    yPosition += 6;

    // Shipping if applicable
    if (shippingAmount > 0) {
      doc.text("Shipping Charges:", totalsStartX, yPosition);
      doc.text(formatRupee(shippingAmount), valuesStartX, yPosition, {
        align: "right",
      });
      yPosition += 6;
    }

    // Total line with emphasis
    doc.setLineWidth(0.5);
    doc.setDrawColor(255, 107, 53);
    doc.line(totalsStartX, yPosition + 2, 190, yPosition + 2);
    yPosition += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 107, 53);
    doc.text("TOTAL AMOUNT:", totalsStartX, yPosition);
    doc.text(formatRupee(totalWithGst), valuesStartX, yPosition, {
      align: "right",
    });
    yPosition += 10;

    // Footer Section
    doc.setFillColor(255, 107, 53);
    doc.rect(15, yPosition, 180, 20, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("THANK YOU FOR YOUR BUSINESS!", 105, yPosition + 8, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(
      "For queries: +91 9589773525 | lionbidicompany@gmail.com",
      105,
      yPosition + 15,
      { align: "center" }
    );

    // Outer professional border
    doc.setLineWidth(1);
    doc.setDrawColor(255, 107, 53);
    doc.rect(10, 10, 190, yPosition + 15);

    // Save the PDF
    doc.save(`Receipt-${order.orderNumber || "order"}.pdf`);
  };

  // Fallback text receipt function
  const downloadTextReceipt = (order) => {
    const orderTotal = order.total || 0;
    const orderSubtotal = order.subtotal || order.total || 0;
    const orderShipping = order.shipping || 0;
    const orderItems = order.items || [];
    const shippingAddress = order.shippingAddress || {};
    const paymentMethod = order.payment?.method || "UPI";
    const paymentStatus = order.payment?.paymentStatus || "pending";
    const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();

    const receiptContent = `
LION BIDI
+91 9589773525
lionbidicompany@gmail.com

ORDER RECEIPT
==================

Receipt No. : ${order.orderNumber || "N/A"}
Transaction ID : ${order.payment?.transactionId || "N/A"}
Receipt Date : ${orderDate.toLocaleDateString("en-CA")}
Transaction Date : ${orderDate.toLocaleDateString("en-CA")}
Transaction Time : ${orderDate.toLocaleTimeString("en-IN")}
Transaction Amount : ₹ ${orderTotal.toFixed(2)}

Bill to :
${shippingAddress.name || "N/A"}
${shippingAddress.phone || "N/A"}
${shippingAddress.email || user?.email || "N/A"}
${shippingAddress.street || ""}
${shippingAddress.city || ""} ${shippingAddress.state || ""} - ${
      shippingAddress.zipCode || ""
    }

# Item & Description                Amount
${orderItems
  .map(
    (item) =>
      `${item.name || "Unknown Item"} x${item.quantity || 0}              ₹ ${(
        (item.price || 0) * (item.quantity || 0)
      ).toFixed(2)}`
  )
  .join("\n")}

Sub Total                           ₹ ${orderSubtotal.toFixed(2)}
GST(18%)                           ₹ ${(
      orderTotal -
      orderSubtotal -
      orderShipping
    ).toFixed(2)}
${
  orderShipping > 0
    ? `Shipping Charges                   ₹ ${orderShipping.toFixed(2)}`
    : ""
}
Total                              ₹ ${orderTotal.toFixed(2)}
Amount Received                    ₹ ${orderTotal.toFixed(2)}

Amount Received in Words :
${convertNumberToWords(orderTotal)}

Payment Method: ${paymentMethod}
Payment Status: ${paymentStatus.toUpperCase()}

Notes:
This is a computer generated receipt and does not require a signature

Thank you for your business!
For support: +91 95897 73525 | lionbidicompany@gmail.com
  `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.orderNumber || "order"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    try {
      setDeleteLoading(true);
      const response = await api.delete(`/api/orders/${orderId}`);

      if (response.data.success) {
        // Remove the deleted order from the local state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderId)
        );

        // Update pagination total
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));

        // Show success message (you can implement a toast notification here)
        alert("Order deleted successfully");

        // Close confirmation modal
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
            // Change 'cart' to 'staticCart' to match CheckoutPage expectations
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
        <div className="p-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-500 flex items-center">
                <Calendar size={14} className="mr-1" />
                {new Date(order.orderDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="mt-2 sm:mt-0 flex flex-col items-end">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                <StatusIcon size={14} className="mr-1" />
                {getStatusText(order.status)}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Items
              </p>
              <p className="font-semibold text-gray-800">
                {order.itemCount || order.items?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total
              </p>
              <p className="font-semibold text-gray-800 flex items-center">
                <IndianRupee size={14} />
                {order.total?.toLocaleString() || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Payment
              </p>
              <p className="font-semibold text-gray-800 capitalize">
                {order.paymentStatus || "Pending"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Delivery
              </p>
              <p className="font-semibold text-gray-800">
                {order.shippingAddress?.city || "N/A"}
              </p>
            </div>
          </div>

          {/* Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
              <div className="flex flex-wrap gap-2">
                {order.items.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 rounded-lg px-3 py-1 font-medium text-sm"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-6 h-6 rounded object-cover mr-2"
                      />
                    )}
                    <span className="text-gray-700">
                      {item.name} (x{item.quantity})
                    </span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-sm text-gray-500 px-3 py-1">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => viewOrderDetails(order._id)}
              className="flex-1 flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium"
            >
              <Eye size={16} />
              View Details
            </button>

            {order.status === "pending" && (
              <button
                onClick={() => handleCompletePayment(order)}
                className="flex-1 bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium"
              >
                Complete Payment
              </button>
            )}

            {["shipped", "processing", "confirmed"].includes(order.status) && (
              <button
                onClick={() => navigate(`/orders/${order._id}/track`)}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Truck size={16} />
                Track Order
              </button>
            )}

            {/* Download Receipt Button - NEW */}
            {canDownloadReceipt(order) && (
              <button
                onClick={() => downloadReceiptWithFullData(order._id)}
                className="flex items-center justify-center gap-2 border border-divine-orange text-divine-orange px-4 py-2 rounded-lg hover:bg-divine-orange/10 transition-colors font-medium"
              >
                <Download size={16} />
                Download Receipt
              </button>
            )}

            {/* Delete Button - only show for deletable orders */}
            {canDeleteOrder(order) && (
              <button
                onClick={() => confirmDelete(order)}
                className="flex items-center justify-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => {
    if (!showDeleteConfirm || !orderToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Order
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete order #{orderToDelete.orderNumber}
              ? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setOrderToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                onClick={() => handleDeleteOrder(orderToDelete._id)}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  "Delete Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const OrderDetailsModal = () => {
    if (!showOrderDetails || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Order #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Status & Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Order Status
                  </h3>
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {React.createElement(getStatusIcon(selectedOrder.status), {
                      size: 16,
                      className: "mr-2",
                    })}
                    {getStatusText(selectedOrder.status)}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Order Date
                  </h3>
                  <p className="text-gray-600">
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
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Payment Status
                  </h3>
                  <p
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
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
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Transaction ID
                    </h3>
                    <p className="text-gray-600 font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                      {selectedOrder.payment.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.name}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ₹{item.totalPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <MapPin size={18} className="mr-2" />
                Shipping Address
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800">
                  {selectedOrder.shippingAddress?.name}
                </p>
                <p className="text-gray-600">
                  {selectedOrder.shippingAddress?.street}
                </p>
                <p className="text-gray-600">
                  {selectedOrder.shippingAddress?.city},{" "}
                  {selectedOrder.shippingAddress?.state} -{" "}
                  {selectedOrder.shippingAddress?.zipCode}
                </p>
                <p className="text-gray-600">
                  Phone: {selectedOrder.shippingAddress?.phone}
                </p>
                <p className="text-gray-600">
                  Email: {selectedOrder.shippingAddress?.email}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">
                Order Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-3">
                {/* Download Receipt Button in Modal */}
                {canDownloadReceipt(selectedOrder) && (
                  <button
                    onClick={() => downloadReceipt(selectedOrder)}
                    className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#FF6B35]/90 transition-colors font-medium"
                  >
                    <Download size={16} />
                    Download Receipt
                  </button>
                )}

                {/* Track Order Button */}
                {["shipped", "processing", "confirmed"].includes(
                  selectedOrder.status
                ) && (
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      navigate(`/orders/${selectedOrder._id}/track`);
                    }}
                    className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Truck size={16} />
                    Track Order
                  </button>
                )}

                {/* Delete button in order details modal for deletable orders */}
                {canDeleteOrder(selectedOrder) && (
                  <button
                    onClick={() => {
                      setShowOrderDetails(false);
                      confirmDelete(selectedOrder);
                    }}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    Delete This Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
              <p className="text-gray-600 mt-1">Track and manage your orders</p>
            </div>

            <button
              onClick={() => fetchOrders(pagination.current)}
              className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:scale-[1.02] transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No orders found
            </h3>
            <p className="text-gray-500 mb-6">
              You haven't placed any orders yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:scale-[1.02] transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => fetchOrders(pagination.current - 1)}
                  disabled={pagination.current === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {pagination.current} of {pagination.pages}
                </span>

                <button
                  onClick={() => fetchOrders(pagination.current + 1)}
                  disabled={pagination.current === pagination.pages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default OrdersPage;
