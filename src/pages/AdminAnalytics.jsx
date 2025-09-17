// pages/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { BASE_URL } from '../utils/api';

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching analytics data...');
      
      const token = localStorage.getItem('adminToken');
      console.log('🎫 Admin token exists:', !!token);
      
      const response = await fetch(`${BASE_URL}/api/admin/analytics?period=${period}`, {
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
      console.log('📦 Analytics data:', data);
      
      if (data.success && data.data) {
        setAnalyticsData(data.data);
        console.log('✅ Analytics data loaded successfully');
      } else {
        console.error('❌ API returned unsuccessful response:', data.message);
        // Show error message instead of falling back to mock data
        alert(`Failed to fetch analytics: ${data.message || 'Unknown error'}`);
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      alert(`Failed to fetch analytics: ${error.message}. Check console for details.`);
      // Set empty analytics data structure instead of mock data
      setAnalyticsData({
        salesData: [],
        topProducts: [],
        userGrowth: [],
        paymentStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    if (!analyticsData?.salesData) return 0;
    return analyticsData.salesData.reduce((total, day) => total + (day.revenue || 0), 0);
  };

  const calculateTotalOrders = () => {
    if (!analyticsData?.salesData) return 0;
    return analyticsData.salesData.reduce((total, day) => total + (day.orders || 0), 0);
  };

  const calculateAverageOrderValue = () => {
    const totalRevenue = calculateTotalRevenue();
    const totalOrders = calculateTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

  const calculateTotalNewUsers = () => {
    if (!analyticsData?.userGrowth) return 0;
    return analyticsData.userGrowth.reduce((total, day) => total + (day.newUsers || 0), 0);
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    const { year, month, day } = dateObj;
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasData = analyticsData && (
    (analyticsData.salesData && analyticsData.salesData.length > 0) ||
    (analyticsData.topProducts && analyticsData.topProducts.length > 0) ||
    (analyticsData.userGrowth && analyticsData.userGrowth.length > 0) ||
    (analyticsData.paymentStats && analyticsData.paymentStats.length > 0)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600">
            Data insights for the last {period} days
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button 
            disabled={!hasData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data Available</h3>
          <p className="text-gray-500 mb-4">
            No data found for the selected period. Try selecting a different time range or check back later.
          </p>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{calculateTotalRevenue().toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <div className="text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateTotalOrders()}
                  </p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{Math.round(calculateAverageOrderValue()).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Avg Order Value</p>
                </div>
                <div className="text-purple-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-2xl font-bold text-gray-900">
                    {calculateTotalNewUsers()}
                  </p>
                  <p className="text-sm text-gray-600">New Customers</p>
                </div>
                <div className="text-orange-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
              {analyticsData?.salesData && analyticsData.salesData.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.salesData.slice(0, 5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                          {day._id?.day || index + 1}
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(day._id)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{(day.revenue || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{day.orders || 0} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No revenue data available for the selected period
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
              {analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.topProducts.slice(0, 5).map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {product._id || 'Unknown Product'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{(product.revenue || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{product.totalSold || 0} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No product data available for the selected period
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods & User Growth */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
              {analyticsData?.paymentStats && analyticsData.paymentStats.length > 0 ? (
                <div className="space-y-4">
                  {analyticsData.paymentStats.map((method, index) => {
                    const total = analyticsData.paymentStats.reduce((sum, m) => sum + (m.count || 0), 0);
                    const percentage = total > 0 ? Math.round(((method.count || 0) / total) * 100) : 0;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {method._id || 'Unknown Method'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {method.count || 0} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment method data available
                </div>
              )}
            </div>

            {/* User Growth */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              {analyticsData?.userGrowth && analyticsData.userGrowth.length > 0 ? (
                <div className="space-y-3">
                  {analyticsData.userGrowth.slice(0, 5).map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                          {day._id?.day || index + 1}
                        </div>
                        <span className="text-sm text-gray-600">
                          {formatDate(day._id)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{day.newUsers || 0}</p>
                        <p className="text-sm text-gray-500">new users</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No user growth data available
                </div>
              )}
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Daily Summary</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Order Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      New Users
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData?.salesData && analyticsData.salesData.length > 0 ? (
                    analyticsData.salesData.map((day, index) => {
                      const userGrowthForDay = analyticsData.userGrowth?.find(
                        u => u._id?.day === day._id?.day && u._id?.month === day._id?.month && u._id?.year === day._id?.year
                      )?.newUsers || 0;
                      const avgOrderValue = (day.orders || 0) > 0 ? (day.revenue || 0) / (day.orders || 0) : 0;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(day._id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{(day.revenue || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {day.orders || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{Math.round(avgOrderValue).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {userGrowthForDay}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        No data available for the selected period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;