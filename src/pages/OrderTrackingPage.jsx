import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Calendar,
  IndianRupee
} from 'lucide-react';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTrackingData();
  }, [user, orderId, navigate]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/orders/${orderId}/track`);
      
      if (response.data.success) {
        setTrackingData(response.data.tracking);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch tracking data');
      }
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      setError(err.response?.data?.message || 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, completed) => {
    if (!completed) return 'text-gray-400 bg-gray-100';
    
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'payment_submitted': 'text-blue-600 bg-blue-100',
      'confirmed': 'text-green-600 bg-green-100',
      'processing': 'text-purple-600 bg-purple-100',
      'shipped': 'text-indigo-600 bg-indigo-100',
      'delivered': 'text-emerald-600 bg-emerald-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': Clock,
      'payment_submitted': CreditCard,
      'confirmed': CheckCircle,
      'processing': Package,
      'shipped': Truck,
      'delivered': CheckCircle
    };
    return icons[status] || Clock;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-divine-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Tracking</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Orders
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Track Order #{trackingData?.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Current Status: <span className="font-semibold capitalize text-orange-600">
                  {trackingData?.currentStatus?.replace('_', ' ')}
                </span>
              </p>
            </div>
            
            <button
              onClick={fetchTrackingData}
              className="flex items-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Order Timeline</h2>
            <p className="text-gray-600">Track your order progress</p>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {trackingData?.timeline?.map((step, index) => {
                const StatusIcon = getStatusIcon(step.status);
                const isCompleted = step.completed;
                const isActive = trackingData.currentStatus === step.status;
                
                return (
                  <div key={index} className="flex items-center">
                    {/* Timeline Connector */}
                    <div className="flex flex-col items-center mr-6">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2
                        ${isCompleted 
                          ? 'bg-[#FF6B35] border-orange-500 text-white' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                        }
                        ${isActive ? 'ring-4 ring-orange-200 bg-[#FF6B35] border-orange-500 text-white' : ''}
                      `}>
                        <StatusIcon size={20} />
                      </div>
                      
                      {index < trackingData.timeline.length - 1 && (
                        <div className={`
                          w-0.5 h-8 mt-2
                          ${isCompleted ? 'bg-[#FF6B35]' : 'bg-gray-300'}
                        `} />
                      )}
                    </div>

                    {/* Timeline Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </h3>
                          {step.date && (
                            <p className={`text-sm mt-1 flex items-center ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                              <Calendar size={14} className="mr-1" />
                              {new Date(step.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        
                        {isActive && (
                          <div className="text-orange-600 font-semibold text-sm">
                            Current Status
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <CreditCard size={18} className="mr-2" />
              Payment Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold capitalize px-2 py-1 rounded-full text-sm ${
                  trackingData?.paymentStatus === 'verified' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-yellow-600 bg-yellow-50'
                }`}>
                  {trackingData?.paymentStatus || 'Pending'}
                </span>
              </div>
              
              {trackingData?.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {trackingData.trackingNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Truck size={18} className="mr-2" />
              Delivery Information
            </h3>
            
            <div className="space-y-3">
              {trackingData?.estimatedDelivery ? (
                <div>
                  <span className="text-gray-600 text-sm">Estimated Delivery:</span>
                  <p className="font-semibold text-gray-800">
                    {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-gray-600 text-sm">Estimated Delivery:</span>
                  <p className="text-gray-500">
                    Will be updated once shipped
                  </p>
                </div>
              )}
              
              <div>
                <span className="text-gray-600 text-sm">Delivery Method:</span>
                <p className="font-medium text-gray-800">Standard Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <AlertCircle size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-3">
                If you have any questions about your order or need assistance, we're here to help.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors"
                >
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;