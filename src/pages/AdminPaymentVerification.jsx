// AdminPaymentVerification.jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Phone, 
  Mail,
  Search
} from 'lucide-react';
import { BASE_URL } from '../utils/api';

const AdminPaymentVerification = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch pending verifications
  useEffect(() => {
    fetchPendingVerifications();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchPendingVerifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingVerifications = async () => {
  try {
    console.log('🔄 Fetching pending verifications...');
    console.log('🔗 API URL:', `${BASE_URL}/api/orders/admin/pending-verifications`);
    
    const token = localStorage.getItem('adminToken');
    console.log('🎫 Admin token exists:', !!token);
    
    const response = await fetch(`${BASE_URL}/api/orders/admin/pending-verifications`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers));
    
    // Handle non-JSON responses (like HTML error pages)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('❌ Non-JSON response received:', textResponse);
      throw new Error(`Server returned ${response.status}: Expected JSON but got ${contentType}`);
    }
    
    const data = await response.json();
    console.log('📊 Parsed data:', data);
    
    if (data.success) {
      setPendingOrders(data.orders || []);
      console.log(`✅ Found ${data.orders?.length || 0} pending orders`);
    } else {
      console.error('❌ API returned error:', data.message);
      // Don't throw here, just show empty state
    }
  } catch (error) {
    console.error('❌ Error fetching pending verifications:', error);
    // Don't throw here, just show empty state
  } finally {
    setLoading(false);
  }
};


  const verifyPayment = async (orderId, verified) => {
    try {
      console.log(`🔍 ${verified ? 'Verifying' : 'Rejecting'} payment for order: ${orderId}`);
      
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${BASE_URL}/api/orders/${orderId}/admin/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verified,
          notes: verificationNotes
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Payment ${verified ? 'verified' : 'rejected'} successfully!`);
        setSelectedOrder(null);
        setVerificationNotes('');
        fetchPendingVerifications(); // Refresh list
      } else {
        alert('Failed to update payment status: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      alert('Error occurred while updating payment status');
    }
  };

  const filteredOrders = pendingOrders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.payment?.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Verification</h1>
          <p className="text-gray-600">
            {pendingOrders.length} payment{pendingOrders.length !== 1 ? 's' : ''} pending verification
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order number, transaction ID, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full md:w-96 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Verifications</h3>
              <p className="text-gray-500">All payments have been verified!</p>
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
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.shippingAddress?.email || order.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{order.total?.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {order.payment?.transactionId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.payment?.submittedAt ? 
                            new Date(order.payment.submittedAt).toLocaleString() : 
                            'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Payment Verification - {selectedOrder.orderNumber}
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
                    <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Number:</span>
                        <span className="font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold text-lg">₹{selectedOrder.total?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Date:</span>
                        <span>{new Date(selectedOrder.orderDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span>{selectedOrder.payment?.method || 'UPI'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-mono text-xs">{selectedOrder.payment?.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Submitted:</span>
                        <span>
                          {selectedOrder.payment?.submittedAt ? 
                            new Date(selectedOrder.payment.submittedAt).toLocaleString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Name:</strong> {selectedOrder.user?.name || selectedOrder.shippingAddress?.name}</p>
                        <p><strong>Email:</strong> {selectedOrder.user?.email || selectedOrder.shippingAddress?.email}</p>
                      </div>
                      <div>
                        <p><strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}</p>
                        <p><strong>City:</strong> {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={item.image || '/placeholder.jpg'} 
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Screenshot Display */}
                {selectedOrder.payment?.screenshot && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Payment Screenshot</h4>
                    <img 
                      src={selectedOrder.payment.screenshot} 
                      alt="Payment screenshot"
                      className="max-w-full h-auto border rounded-lg"
                    />
                  </div>
                )}

                {/* Verification Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Notes (Optional)
                  </label>
                  <textarea
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add notes about the verification (optional)..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => verifyPayment(selectedOrder._id, true)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Confirm Payment
                  </button>
                  
                  <button
                    onClick={() => verifyPayment(selectedOrder._id, false)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Payment
                  </button>

                  <button
                    onClick={() => {
                      setSelectedOrder(null);
                      setVerificationNotes('');
                    }}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${selectedOrder.shippingAddress?.phone}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call Customer
                    </a>
                    <a
                      href={`mailto:${selectedOrder.shippingAddress?.email || selectedOrder.user?.email}`}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Mail className="w-3 h-3 mr-1" />
                      Email Customer
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentVerification;