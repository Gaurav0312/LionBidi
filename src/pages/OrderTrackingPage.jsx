import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import api from '../utils/api';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Calendar,
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <RefreshCw size={32} className="animate-spin text-[#FF6B35] mx-auto mb-4" />
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Error Loading Tracking</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => navigate('/orders')}
            className="bg-[#FF6B35] text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 py-4 sm:py-8">
      {/* Mobile-optimized container with overflow prevention */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-hidden">
        
        {/* Mobile-optimized Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-orange-600 hover:text-orange-700 mb-4 font-medium text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Orders
          </button>
          
          {/* Responsive header layout */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 break-words">
                Track Order #{trackingData?.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Current Status: <span className="font-semibold capitalize text-orange-600 break-words">
                  {trackingData?.currentStatus?.replace('_', ' ')}
                </span>
              </p>
            </div>
            
            <button
              onClick={fetchTrackingData}
              className="flex items-center justify-center gap-2 bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors w-full sm:w-auto flex-shrink-0"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Mobile-optimized Tracking Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 sm:mb-8">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Order Timeline</h2>
            <p className="text-gray-600 text-sm sm:text-base">Track your order progress</p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {trackingData?.timeline?.map((step, index) => {
                const StatusIcon = getStatusIcon(step.status);
                const isCompleted = step.completed;
                const isActive = trackingData.currentStatus === step.status;
                
                return (
                  <div key={index} className="flex items-start">
                    {/* Mobile-optimized Timeline Connector */}
                    <div className="flex flex-col items-center mr-4 sm:mr-6 flex-shrink-0">
                      <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2
                        ${isCompleted 
                          ? 'bg-[#FF6B35] border-orange-500 text-white' 
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                        }
                        ${isActive ? 'ring-2 sm:ring-4 ring-orange-200 bg-[#FF6B35] border-orange-500 text-white' : ''}
                      `}>
                        <StatusIcon size={16} />
                      </div>
                      
                      {index < trackingData.timeline.length - 1 && (
                        <div className={`
                          w-0.5 h-6 sm:h-8 mt-2
                          ${isCompleted ? 'bg-[#FF6B35]' : 'bg-gray-300'}
                        `} />
                      )}
                    </div>

                    {/* Mobile-optimized Timeline Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold text-sm sm:text-base ${isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                            {step.label}
                          </h3>
                          {step.date && (
                            <p className={`text-xs sm:text-sm mt-1 flex items-center ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                              <Calendar size={12} className="mr-1 flex-shrink-0" />
                              <span className="break-words">
                                {new Date(step.date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </p>
                          )}
                        </div>
                        
                        {isActive && (
                          <div className="text-orange-600 font-semibold text-xs sm:text-sm flex-shrink-0">
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

        {/* Mobile-optimized Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center text-base sm:text-lg">
              <CreditCard size={16} className="mr-2 flex-shrink-0" />
              Payment Information
            </h3>
            
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                <span className="text-gray-600 text-sm sm:text-base flex-shrink-0">Status:</span>
                <span className={`font-semibold capitalize px-2 py-1 rounded-full text-xs sm:text-sm flex-shrink-0 ${
                  trackingData?.paymentStatus === 'verified' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-yellow-600 bg-yellow-50'
                }`}>
                  {trackingData?.paymentStatus || 'Pending'}
                </span>
              </div>
              
              {trackingData?.trackingNumber && (
                <div className="space-y-1">
                  <span className="text-gray-600 text-sm sm:text-base block">Tracking Number:</span>
                  <div className="font-mono text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded break-all">
                    {trackingData.trackingNumber}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center text-base sm:text-lg">
              <Truck size={16} className="mr-2 flex-shrink-0" />
              Delivery Information
            </h3>
            
            <div className="space-y-3">
              {trackingData?.estimatedDelivery ? (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Estimated Delivery:</span>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                    {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">Estimated Delivery:</span>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Will be updated once shipped
                  </p>
                </div>
              )}
              
              <div>
                <span className="text-gray-600 text-sm block mb-1">Delivery Method:</span>
                <p className="font-medium text-gray-800 text-sm sm:text-base">Standard Delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-optimized Help Section */}
        <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Need Help?</h3>
              <p className="text-blue-700 text-xs sm:text-sm mb-3 leading-relaxed">
                If you have any questions about your order or need assistance, we're here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => navigate('/contact')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-white text-blue-600 border border-blue-300 px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-50 transition-colors"
                >
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing for mobile */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;