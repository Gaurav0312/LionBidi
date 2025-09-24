// pages/AdminOrders.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Edit,
  MoreHorizontal,
} from "lucide-react";
import { BASE_URL } from "../utils/api"; // Add this import

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log("📄 Fetching orders from admin API...");

      const token = localStorage.getItem("adminToken");
      console.log("🎫 Admin token exists:", !!token);

      const response = await fetch(`${BASE_URL}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers));

      // Handle non-JSON responses (like HTML error pages)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await response.text();
        console.error("❌ Non-JSON response received:", textResponse);
        throw new Error(
          `Server returned ${response.status}: Expected JSON but got ${contentType}`
        );
      }

      const data = await response.json();
      console.log("📦 Response data:", data);

      if (data.success && data.orders) {
        setOrders(data.orders);
        console.log(`✅ Loaded ${data.orders.length} orders from database`);
      } else {
        console.error("❌ API returned unsuccessful response:", data.message);
        // Fall back to empty array instead of mock data
        setOrders([]);
        alert(`Failed to fetch orders: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      alert(
        `Failed to fetch orders: ${error.message}. Check console for details.`
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`📄 Updating order ${orderId} status to ${newStatus}`);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${BASE_URL}/api/orders/${orderId}/admin/update-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();
      console.log("📡 Update response:", data);

      if (data.success) {
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        setShowStatusModal(false);
        setSelectedOrder(null);
        alert("Order status updated successfully!");
        console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      } else {
        console.error("❌ Failed to update order status:", data.message);
        alert(`Failed to update order status: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Error updating order status:", error);
      alert(`Error occurred while updating order status: ${error.message}`);
    }
  };

  // Add receipt download functionality - copied from OrdersPage
  const canDownloadReceipt = (order) => {
    const downloadableStatuses = [
      "confirmed",
      "processing", 
      "shipped",
      "delivered",
      "payment_submitted",
    ];
    return downloadableStatuses.includes(order.status);
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

  // Download receipt with full order data
  const downloadReceiptWithFullData = async (orderId) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const fullOrder = data.order;
          downloadReceipt(fullOrder);
        } else {
          console.error("Failed to fetch order details for receipt");
          alert("Failed to fetch order details. Please try again.");
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching order details for receipt:", error);
      alert("Error loading order details. Please try again.");
    }
  };

  // Receipt download function - adapted from OrdersPage
  const downloadReceipt = (order) => {
    if (!order) return;

    // Dynamically import jsPDF
    import("jspdf")
      .then(({ jsPDF }) => {
        const doc = new jsPDF("p", "mm", "a4");
        doc.setFont("helvetica");

        const logoUrl =
          "https://res.cloudinary.com/dxqerqng1/image/upload/v1754660338/campaign_covers/brixv4aazfsuzq27kfbc.png";

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

        img.src = logoUrl;
      })
      .catch((error) => {
        console.error("Error loading jsPDF:", error);
        downloadTextReceipt(order);
      });
  };

  // Professional Receipt Generator Function
  const generateProfessionalReceipt = (doc, order, hasLogo, logoImg) => {
    const paymentStatus = order.payment?.paymentStatus || "pending";
    const paymentMethod = order.payment?.method || "UPI";
    const orderTotal = order.total || 0;
    const orderSubtotal = order.subtotal || order.total || 0;
    const orderShipping = order.shipping || 0;
    const orderItems = order.items || [];
    const shippingAddress = order.shippingAddress || {};

    const gstRate = 0.28;
    const totalWithGst = orderTotal;
    const baseAmount = totalWithGst / (1 + gstRate);
    const gstAmount = totalWithGst - baseAmount;
    const shippingAmount = orderShipping || 0;

    let yPosition = 15;
    const formatRupee = (amount) => `Rs. ${amount.toFixed(2)}`;
    const orderDate = order.orderDate ? new Date(order.orderDate) : new Date();

    // Header Section with Company Branding
    if (hasLogo) {
      const logoWidth = 30;
      const logoHeight = 20;
      const logoX = 15;
      const logoY = yPosition;

      doc.addImage(logoImg, "PNG", logoX, logoY, logoWidth, logoHeight);

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 107, 53);
      doc.text("LION BIDI", 50, yPosition + 8);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text("Premium Quality Bidi Manufacturer", 50, yPosition + 15);

      yPosition += 25;
    } else {
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
      `Email: ${shippingAddress.email || order.user?.email || "N/A"}`,
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
    doc.save(`Receipt-${order.orderNumber || "order"}-ADMIN.pdf`);
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

ORDER RECEIPT (ADMIN COPY)
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
${shippingAddress.email || order.user?.email || "N/A"}
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
GST(28%)                           ₹ ${(
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
This is an admin-generated receipt and does not require a signature

Thank you for your business!
For support: +91 95897 73525 | lionbidicompany@gmail.com
  `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-receipt-${order.orderNumber || "order"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending_payment":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <Package className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending_payment":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600">{orders.length} total orders</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Orders Found
            </h3>
            <p className="text-gray-500">
              No orders match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.items?.length || 0} item(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {order.user?.name || "N/A"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">
                        ₹{order.total?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">
                          {order.status?.replace("_", " ")}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {/* Download Receipt Button - NEW */}
                        {canDownloadReceipt(order) && (
                          <button
                            onClick={() => downloadReceiptWithFullData(order._id)}
                            className="text-orange-600 hover:text-orange-900"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Order Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-medium">
                        {selectedOrder.orderNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-bold text-lg">
                        ₹{selectedOrder.total?.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1 capitalize">
                          {selectedOrder.status?.replace("_", " ")}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Date:</span>
                      <span>
                        {new Date(selectedOrder.orderDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {selectedOrder.user?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOrder.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedOrder.shippingAddress?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span>
                        {selectedOrder.shippingAddress?.city},{" "}
                        {selectedOrder.shippingAddress?.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Order Items
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                {/* Download Receipt Button in Modal */}
                {canDownloadReceipt(selectedOrder) && (
                  <button
                    onClick={() => downloadReceipt(selectedOrder)}
                    className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Receipt
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Update Order Status
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: {selectedOrder.orderNumber}
              </p>

              <div className="space-y-2 mb-6">
                {[
                  "pending_payment",
                  "confirmed",
                  "shipped",
                  "delivered",
                  "cancelled",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(selectedOrder._id, status)}
                    className={`w-full flex items-center px-4 py-2 rounded-lg text-left ${
                      selectedOrder.status === status
                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : "hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {getStatusIcon(status)}
                    <span className="ml-2 capitalize">
                      {status.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;