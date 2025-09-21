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

  // Fallback text receipt function
  const downloadTextReceipt = () => {
    const receiptContent = `
LION BIDI
+91 9589773525
lionbidicompany@gmail.com

ORDER RECEIPT
==================

Receipt No. : ${order.orderNumber || "N/A"}
Transaction ID : ${order.payment?.transactionId || "N/A"}
Receipt Date : ${
      order.orderDate
        ? new Date(order.orderDate).toLocaleDateString("en-CA")
        : new Date().toLocaleDateString("en-CA")
    }
Transaction Date : ${
      order.orderDate
        ? new Date(order.orderDate).toLocaleDateString("en-CA")
        : new Date().toLocaleDateString("en-CA")
    }
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

  // Update the OrderConfirmationPage component's downloadReceipt function
const downloadReceipt = () => {
  if (!order) return;

  // Dynamically import jsPDF
  import('jspdf').then(({ jsPDF }) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    doc.setFont('helvetica');
    
    // Load and add logo
    const logoUrl = 'https://res.cloudinary.com/dxqerqng1/image/upload/v1754660338/campaign_covers/brixv4aazfsuzq27kfbc.png';
    
    // Create image element to load logo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
      try {
        generateProfessionalReceipt(doc, true);
      } catch (error) {
        console.error('Error adding logo:', error);
        generateProfessionalReceipt(doc, false);
      }
    };
    
    img.onerror = function() {
      console.warn('Logo failed to load, generating receipt without logo');
      generateProfessionalReceipt(doc, false);
    };
    
    // Set logo source
    img.src = logoUrl;
    
    // Professional Receipt Generator Function
    function generateProfessionalReceipt(doc, hasLogo) {
      // Calculate GST (28% included in total)
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
        // Add logo
        const logoWidth = 30;
        const logoHeight = 20;
        const logoX = 15;
        const logoY = yPosition;
        
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        
        // Company name next to logo
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 107, 53); // Divine orange color
        doc.text('LION BIDI', 50, yPosition + 8);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Premium Quality Bidi Manufacturer', 50, yPosition + 15);
        
        yPosition += 25;
      } else {
        // Company header without logo
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 107, 53);
        doc.text('LION BIDI COMPANY', 105, yPosition + 5, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Premium Quality Bidi Manufacturer', 105, yPosition + 12, { align: 'center' });
        
        yPosition += 20;
      }
      
      // Company contact information
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text('Phone: +91 9589773525', 15, yPosition);
      doc.text('Email: lionbidicompany@gmail.com', 15, yPosition + 5);
      doc.text('GST No: [23BKNPV1683G1ZS]', 15, yPosition + 10); // Add actual GST number
      
      // Receipt date on right
      doc.text(`Date: ${orderDate.toLocaleDateString('en-IN')}`, 150, yPosition);
      doc.text(`Time: ${orderDate.toLocaleTimeString('en-IN')}`, 150, yPosition + 5);
      
      // Decorative line
      yPosition += 18;
      doc.setLineWidth(0.8);
      doc.setDrawColor(255, 107, 53);
      doc.line(15, yPosition, 195, yPosition);
      yPosition += 8;
      
      // Receipt Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('TAX INVOICE / PAYMENT RECEIPT', 105, yPosition, { align: 'center' });
      yPosition += 12;
      
      // Receipt details in professional box format
      doc.setFillColor(248, 249, 250);
      doc.rect(15, yPosition - 2, 180, 35, 'F');
      doc.setLineWidth(0.3);
      doc.setDrawColor(200, 200, 200);
      doc.rect(15, yPosition - 2, 180, 35);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      // Left column
      doc.text('Receipt No:', 20, yPosition + 5);
      doc.text('Transaction ID:', 20, yPosition + 12);
      doc.text('Order Date:', 20, yPosition + 19);
      doc.text('Payment Method:', 20, yPosition + 26);
      
      // Right column - values
      doc.setFont('helvetica', 'normal');
      doc.text(order.orderNumber || 'N/A', 60, yPosition + 5);
      doc.text(order.payment?.transactionId || 'N/A', 60, yPosition + 12);
      doc.text(order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN'), 60, yPosition + 19);
      doc.text((paymentMethod || 'UPI').toUpperCase(), 60, yPosition + 26);
      
      // Status and amount on right side
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Status:', 120, yPosition + 5);
      doc.text('Total Amount:', 120, yPosition + 19);
      
      doc.setFont('helvetica', 'bold');
      const statusColor = paymentStatus === 'verified' ? [47, 181, 29] : [234, 179, 8];
      doc.setTextColor(...statusColor);
      doc.text(paymentStatus.toUpperCase(), 165, yPosition + 5);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(formatRupee(totalWithGst), 165, yPosition + 19);
      
      yPosition += 45;
      
      // Billing Information Section
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 107, 53);
      doc.text('BILL TO:', 20, yPosition);
      yPosition += 8;
      
      // Customer details box
      doc.setFillColor(252, 252, 252);
      doc.rect(15, yPosition - 2, 180, 30, 'F');
      doc.setLineWidth(0.3);
      doc.setDrawColor(220, 220, 220);
      doc.rect(15, yPosition - 2, 180, 35);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text((shippingAddress.name || 'N/A').toUpperCase(), 20, yPosition + 5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Mobile: ${shippingAddress.phone || 'N/A'}`, 20, yPosition + 12);
      doc.text(`Email: ${shippingAddress.email || user?.email || 'N/A'}`, 20, yPosition + 18);
      
      // Address formatting
      let addressLine = '';
      if (shippingAddress.street) addressLine += shippingAddress.street + ', ';
      if (shippingAddress.city) addressLine += shippingAddress.city + ', ';
      if (shippingAddress.state) addressLine += shippingAddress.state + ' - ';
      if (shippingAddress.zipCode) addressLine += shippingAddress.zipCode;
      
      if (addressLine) {
        doc.text(`Address: ${addressLine}`, 20, yPosition + 24);
      }
      
      yPosition += 40;
      
      // Items Table Header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 107, 53);
      doc.text('ITEM DETAILS:', 20, yPosition);
      yPosition += 10;
      
      // Table header with better styling
      doc.setFillColor(255, 107, 53);
      doc.rect(15, yPosition - 2, 180, 10, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('S.No', 18, yPosition + 4);
      doc.text('Item Description', 35, yPosition + 4);
      doc.text('HSN Code', 90, yPosition + 4);
      doc.text('Qty', 120, yPosition + 4);
      doc.text('Rate', 140, yPosition + 4);
      doc.text('Amount', 170, yPosition + 4);
      
      yPosition += 12;
      
      // Items with professional formatting
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'semibold');
      let itemCounter = 1;
      
      orderItems.forEach((item, index) => {
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250);
          doc.rect(15, yPosition - 2, 180, 8, 'F');
        }
        
        const itemName = (item.name || 'Unknown Item').toUpperCase();
        const itemQty = item.quantity || 0;
        const itemHSN = item.hsn || '24031921';
        const itemRate = item.price || 0;
        const itemTotal = itemRate * itemQty;
        
        doc.text(itemCounter.toString(), 18, yPosition + 3);
        doc.text(itemName, 35, yPosition + 3);
        doc.text(itemHSN, 90, yPosition + 3);
        doc.text(itemQty.toString(), 125, yPosition + 3, { align: 'center' });
        doc.text(formatRupee(itemRate), 155, yPosition + 3, { align: 'right' });
        doc.text(formatRupee(itemTotal), 185, yPosition + 3, { align: 'right' });
        
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
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Subtotal (before GST)
      doc.text('Subtotal (Excl. GST):', totalsStartX, yPosition);
      doc.text(formatRupee(baseAmount), valuesStartX, yPosition, { align: 'right' });
      yPosition += 6;
      
      // GST breakdown
      doc.text(`GST @ 28% (Included):`, totalsStartX, yPosition);
      doc.text(formatRupee(gstAmount), valuesStartX, yPosition, { align: 'right' });
      yPosition += 6;
      
      // Shipping if applicable
      if (shippingAmount > 0) {
        doc.text('Shipping Charges:', totalsStartX, yPosition);
        doc.text(formatRupee(shippingAmount), valuesStartX, yPosition, { align: 'right' });
        yPosition += 6;
      }
      
      // Total line with emphasis
      doc.setLineWidth(0.5);
      doc.setDrawColor(255, 107, 53);
      doc.line(totalsStartX, yPosition + 2, 190, yPosition + 2);
      yPosition += 8;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 107, 53);
      doc.text('TOTAL AMOUNT:', totalsStartX, yPosition);
      doc.text(formatRupee(totalWithGst), valuesStartX, yPosition, { align: 'right' });
      yPosition += 10;
      
      // Amount in words with professional formatting
      // doc.setTextColor(0, 0, 0);
      // doc.setFont('helvetica', 'bold');
      // doc.setFontSize(9);
      // doc.text('Amount in Words:', 20, yPosition);
      // yPosition += 5;
      
      // const amountInWords = convertNumberToWords(totalWithGst);
      // doc.setFont('helvetica', 'normal');
      // doc.setFontSize(9);
      
      // // Word wrap for amount in words
      // const words = amountInWords.split(' ');
      // let line = '';
      // const maxWidth = 170;
      
      // for (let word of words) {
      //   const testLine = line + word + ' ';
      //   const testWidth = doc.getTextWidth(testLine);
        
      //   if (testWidth > maxWidth && line !== '') {
      //     doc.text(line.trim(), 20, yPosition);
      //     line = word + ' ';
      //     yPosition += 5;
      //   } else {
      //     line = testLine;
      //   }
      // }
      // if (line) {
      //   doc.text(line.trim(), 20, yPosition);
      //   yPosition += 10;
      // }
      
      // // Terms and Conditions Section
      // yPosition += 5;
      // doc.setFillColor(248, 249, 250);
      // doc.rect(15, yPosition - 2, 180, 25, 'F');
      // doc.setLineWidth(0.3);
      // doc.setDrawColor(200, 200, 200);
      // doc.rect(15, yPosition - 2, 180, 25);
      
      // doc.setFont('helvetica', 'bold');
      // doc.setFontSize(9);
      // doc.text('TERMS & CONDITIONS:', 20, yPosition + 4);
      
      // doc.setFont('helvetica', 'normal');
      // doc.setFontSize(8);
      // doc.text('• This is a computer generated receipt and does not require physical signature.', 20, yPosition + 10);
      // doc.text('• Goods once sold cannot be returned or exchanged.', 20, yPosition + 15);
      // doc.text('• All disputes subject to local jurisdiction only.', 20, yPosition + 20);
      
      // yPosition += 30;
      
      // Footer Section
      doc.setFillColor(255, 107, 53);
      doc.rect(15, yPosition, 180, 20, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('THANK YOU FOR YOUR BUSINESS!', 105, yPosition + 8, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('For queries: +91 9589773525 | lionbidicompany@gmail.com', 105, yPosition + 15, { align: 'center' });
      
      // Outer professional border
      doc.setLineWidth(1);
      doc.setDrawColor(255, 107, 53);
      doc.rect(10, 10, 190, yPosition + 15);
      
      // Save the PDF
      doc.save(`Professional-Receipt-${order.orderNumber || 'order'}.pdf`);
    }
    
  }).catch(error => {
    console.error('Error loading jsPDF:', error);
    // Fallback to text file if jsPDF fails to load
    downloadTextReceipt();
  });
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
            className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#FF6B35] transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-10 px-4">
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-divine-orange" />
          </div>

          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Thank you for your purchase, {user?.name || "Valued Customer"}!
          </p>
          <p className="text-lg text-gray-500">
            Your order{" "}
            <span className="font-mono font-bold text-divine-orange">
              #{order.orderNumber}
            </span>{" "}
            has been placed successfully.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
          {/* Card Header */}
          <div className="bg-[#FF6B35] px-6 py-4">
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
              <Home className="w-6 h-6 text-divine-orange mr-3" />
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
              <Package className="w-6 h-6 text-divine-orange mr-3" />
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
                      ? "bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 text-divine-orange"
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
                      ? "bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 text-divine-orange"
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
              <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center relative z-10">
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
                <div className="w-8 h-8 bg-[#FF6B35] rounded-full flex items-center justify-center relative z-10">
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
              className="flex items-center px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35] transition-colors"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </button>

            <button
              onClick={shareOrder}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
              className="flex items-center px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35] transition-colors"
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
              className="flex items-center font-semibold text-divine-orange hover:underline"
            >
              <Phone className="w-4 h-4 mr-1" />
              +91 95897 73525
            </a>
            <a
              href="mailto:lionbidicompany@gmail.com"
              className="flex items-center font-semibold text-divine-orange hover:underline"
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
