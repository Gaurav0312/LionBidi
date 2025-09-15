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

const AdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for development
      setAnalyticsData({
        salesData: [
          { _id: { day: 1 }, revenue: 15000, orders: 12 },
          { _id: { day: 2 }, revenue: 18000, orders: 15 },
          { _id: { day: 3 }, revenue: 22000, orders: 18 },
          { _id: { day: 4 }, revenue: 19000, orders: 14 },
          { _id: { day: 5 }, revenue: 25000, orders: 20 }
        ],
        topProducts: [
          { _id: 'iPhone 14', totalSold: 45, revenue: 135000 },
          { _id: 'Samsung Galaxy', totalSold: 38, revenue: 95000 },
          { _id: 'MacBook Air', totalSold: 22, revenue: 220000 },
          { _id: 'iPad Pro', totalSold: 33, revenue: 99000 },
          { _id: 'AirPods', totalSold: 67, revenue: 134000 }
        ],
        userGrowth: [
          { _id: { day: 1 }, newUsers: 5 },
          { _id: { day: 2 }, newUsers: 8 },
          { _id: { day: 3 }, newUsers: 12 },
          { _id: { day: 4 }, newUsers: 6 },
          { _id: { day: 5 }, newUsers: 15 }
        ],
        paymentStats: [
          { _id: 'UPI', count: 120, revenue: 450000 },
          { _id: 'Bank Transfer', count: 45, revenue: 180000 },
          { _id: 'Cash', count: 12, revenue: 24000 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalRevenue = () => {
    if (!analyticsData?.salesData) return 0;
    return analyticsData.salesData.reduce((total, day) => total + day.revenue, 0);
  };

  const calculateTotalOrders = () => {
    if (!analyticsData?.salesData) return 0;
    return analyticsData.salesData.reduce((total, day) => total + day.orders, 0);
  };

  const calculateAverageOrderValue = () => {
    const totalRevenue = calculateTotalRevenue();
    const totalOrders = calculateTotalOrders();
    return totalOrders > 0 ? totalRevenue / totalOrders : 0;
  };

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
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

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
                {analyticsData?.userGrowth?.reduce((total, day) => total + day.newUsers, 0) || 0}
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
          <div className="space-y-3">
            {analyticsData?.salesData?.slice(0, 5).map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                    {day._id?.day || index + 1}
                  </div>
                  <span className="text-sm text-gray-600">
                    Day {day._id?.day || index + 1}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{day.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{day.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {analyticsData?.topProducts?.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {product._id}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{product.totalSold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods & User Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {analyticsData?.paymentStats?.map((method, index) => {
              const total = analyticsData.paymentStats.reduce((sum, m) => sum + m.count, 0);
              const percentage = Math.round((method.count / total) * 100);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {method._id || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {method.count} ({percentage}%)
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
        </div>

        {/* User Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-3">
            {analyticsData?.userGrowth?.slice(0, 5).map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-medium">
                    {day._id?.day || index + 1}
                  </div>
                  <span className="text-sm text-gray-600">
                    Day {day._id?.day || index + 1}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{day.newUsers}</p>
                  <p className="text-sm text-gray-500">new users</p>
                </div>
              </div>
            ))}
          </div>
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
              {analyticsData?.salesData?.map((day, index) => {
                const userGrowthForDay = analyticsData.userGrowth?.find(
                  u => u._id?.day === day._id?.day
                )?.newUsers || 0;
                const avgOrderValue = day.orders > 0 ? day.revenue / day.orders : 0;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Day {day._id?.day || index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{day.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {day.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{Math.round(avgOrderValue).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {userGrowthForDay}
                    </td>
                  </tr>
                );
              })}
              
              {(!analyticsData?.salesData || analyticsData.salesData.length === 0) && (
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
    </div>
  );
};

export default AdminAnalytics;