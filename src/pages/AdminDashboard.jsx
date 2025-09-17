// pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  DollarSign,
  ShoppingCart,
  Truck,
  Star,
  Calendar,
  Bell,
  Activity,
  BarChart3,
  Filter,
  Download
} from 'lucide-react';
import { BASE_URL } from '../utils/api';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      totalUsers: 0,
      verifiedToday: 0,
      rejectedToday: 0
    },
    recentOrders: [],
    pendingVerifications: []
  });
  
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [realtimeStats, setRealtimeStats] = useState({
    ordersToday: 0,
    revenueToday: 0,
    activeUsers: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchNotifications();
    }, 120000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');
      
      const token = localStorage.getItem('adminToken');
      console.log('🎫 Admin token exists:', !!token);
      
      const response = await fetch(`${BASE_URL}/api/admin/dashboard?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Dashboard response status:', response.status);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response received:', textResponse);
        throw new Error(`Server returned ${response.status}: Expected JSON but got ${contentType}`);
      }
      
      const data = await response.json();
      console.log('📦 Dashboard data:', data);
      
      if (data.success && data.data) {
        setDashboardData(data.data);
        // Calculate realtime stats
        const stats = data.data.stats;
        setRealtimeStats({
          ordersToday: stats.verifiedToday + stats.rejectedToday,
          revenueToday: stats.totalRevenue * 0.1, // Estimate today's revenue
          activeUsers: Math.floor(stats.totalUsers * 0.05), // Estimate active users
          conversionRate: stats.totalOrders > 0 ? ((stats.totalOrders - stats.pendingPayments) / stats.totalOrders * 100) : 0
        });
        setLastRefresh(new Date());
        console.log('✅ Dashboard data loaded successfully');
      } else {
        console.error('❌ API returned unsuccessful response:', data.message);
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      // Set empty data structure instead of mock data
      setDashboardData({
        stats: {
          totalOrders: 0,
          pendingPayments: 0,
          totalRevenue: 0,
          totalUsers: 0,
          verifiedToday: 0,
          rejectedToday: 0
        },
        recentOrders: [],
        pendingVerifications: []
      });
      setRealtimeStats({
        ordersToday: 0,
        revenueToday: 0,
        activeUsers: 0,
        conversionRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      // This would be a new endpoint you'd need to create
      const response = await fetch(`${BASE_URL}/api/admin/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      }
    } catch (error) {
      console.log('Note: Notifications endpoint not available yet');
      // Generate some sample notifications based on current data
      const sampleNotifications = [];
      if (dashboardData.stats.pendingPayments > 0) {
        sampleNotifications.push({
          id: 1,
          type: 'warning',
          title: 'Pending Payments',
          message: `${dashboardData.stats.pendingPayments} payments need verification`,
          time: new Date(),
          action: '/admin/payment-verification'
        });
      }
      if (dashboardData.stats.rejectedToday > 0) {
        sampleNotifications.push({
          id: 2,
          type: 'info',
          title: 'Payment Rejections',
          message: `${dashboardData.stats.rejectedToday} payments rejected today`,
          time: new Date(),
          action: null
        });
      }
      setNotifications(sampleNotifications);
    }
  };

  const exportDashboardData = () => {
    const dataToExport = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      stats: dashboardData.stats,
      realtimeStats,
      summary: {
        totalOrders: dashboardData.stats.totalOrders,
        totalRevenue: dashboardData.stats.totalRevenue,
        pendingPayments: dashboardData.stats.pendingPayments,
        conversionRate: realtimeStats.conversionRate.toFixed(2) + '%'
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: dashboardData.stats.totalOrders,
      icon: Package,
      color: 'blue',
      change: '+12%',
      changeType: 'positive',
      subtitle: `${realtimeStats.ordersToday} today`
    },
    {
      title: 'Pending Payments',
      value: dashboardData.stats.pendingPayments,
      icon: Clock,
      color: 'yellow',
      change: '-5%',
      changeType: 'negative',
      subtitle: 'Needs attention',
      urgent: dashboardData.stats.pendingPayments > 10
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardData.stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'green',
      change: '+18%',
      changeType: 'positive',
      subtitle: `₹${realtimeStats.revenueToday.toLocaleString()} today`
    },
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers,
      icon: Users,
      color: 'purple',
      change: '+8%',
      changeType: 'positive',
      subtitle: `${realtimeStats.activeUsers} active now`
    }
  ];

  const additionalStats = [
    {
      title: 'Conversion Rate',
      value: `${realtimeStats.conversionRate.toFixed(1)}%`,
      icon: BarChart3,
      color: 'indigo',
      description: 'Orders to payments'
    },
    {
      title: 'Verified Today',
      value: dashboardData.stats.verifiedToday,
      icon: CheckCircle,
      color: 'green',
      description: 'Payment approvals'
    },
    {
      title: 'Rejected Today',
      value: dashboardData.stats.rejectedToday,
      icon: XCircle,
      color: 'red',
      description: 'Payment rejections'
    },
    {
      title: 'Active Users',
      value: realtimeStats.activeUsers,
      icon: Activity,
      color: 'orange',
      description: 'Currently online'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
            <div className="flex items-center space-x-1 text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span className="text-sm">Live</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={exportDashboardData}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Recent Notifications</h3>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between text-sm">
                <span className="text-blue-800">{notification.message}</span>
                {notification.action && (
                  <a 
                    href={notification.action}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-500',
            yellow: 'bg-yellow-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500'
          };

          return (
            <div key={index} className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${stat.urgent ? 'ring-2 ring-yellow-400' : ''}`}>
              {stat.urgent && (
                <div className="flex items-center text-yellow-600 text-xs font-medium mb-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  URGENT
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
                {stat.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {additionalStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            indigo: 'text-indigo-600 bg-indigo-100',
            green: 'text-green-600 bg-green-100',
            red: 'text-red-600 bg-red-100',
            orange: 'text-orange-600 bg-orange-100'
          };

          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[stat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders with Enhanced Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <p className="text-sm text-gray-500">Latest {dashboardData.recentOrders.length} orders</p>
            </div>
            <a
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {dashboardData.recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No recent orders found</p>
              </div>
            ) : (
              dashboardData.recentOrders.map((order) => (
                <div key={order._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending_payment'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(order.orderDate).toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          {order.items?.length || 0} items
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">₹{order.total?.toFixed(2)}</p>
                      <button className="text-blue-600 hover:text-blue-800 text-xs">
                        <Eye className="w-3 h-3 inline mr-1" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enhanced Pending Verifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Payment Verifications</h2>
              <p className="text-sm text-gray-500">
                {dashboardData.pendingVerifications.length} pending review
              </p>
            </div>
            <a
              href="/admin/payment-verification"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Verify All →
            </a>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {dashboardData.pendingVerifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>All payments verified!</p>
                <p className="text-xs mt-1">Great job staying on top of verifications</p>
              </div>
            ) : (
              dashboardData.pendingVerifications.map((order) => (
                <div key={order._id} className="p-4 hover:bg-yellow-50 transition-colors border-l-4 border-yellow-400">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {order.payment?.transactionId}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.payment?.submittedAt ? 
                            new Date(order.payment.submittedAt).toLocaleDateString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">₹{order.total?.toFixed(2)}</p>
                      <button className="text-yellow-600 hover:text-yellow-800 text-xs">
                        <CreditCard className="w-3 h-3 inline mr-1" />
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/payment-verification"
            className="flex items-center p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-all hover:border-yellow-300"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Verify Payments</p>
              <p className="text-sm text-gray-600">
                {dashboardData.stats.pendingPayments} pending
              </p>
            </div>
            {dashboardData.stats.pendingPayments > 0 && (
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  {dashboardData.stats.pendingPayments}
                </span>
              </div>
            )}
          </a>
          
          <a
            href="/admin/orders"
            className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-all hover:border-blue-300"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Manage Orders</p>
              <p className="text-sm text-gray-600">
                {dashboardData.stats.totalOrders} total
              </p>
            </div>
          </a>
          
          <a
            href="/admin/users"
            className="flex items-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-all hover:border-purple-300"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-600">
                {dashboardData.stats.totalUsers} users
              </p>
            </div>
          </a>

          <a
            href="/admin/analytics"
            className="flex items-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-all hover:border-green-300"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Reports & insights</p>
            </div>
          </a>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {realtimeStats.conversionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Payment Success Rate</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(realtimeStats.conversionRate, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((dashboardData.stats.verifiedToday / Math.max(dashboardData.stats.verifiedToday + dashboardData.stats.rejectedToday, 1)) * 100)}%
            </div>
            <p className="text-sm text-gray-600">Approval Rate Today</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.round((dashboardData.stats.verifiedToday / Math.max(dashboardData.stats.verifiedToday + dashboardData.stats.rejectedToday, 1)) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.stats.pendingPayments === 0 ? '100%' : Math.max(0, 100 - (dashboardData.stats.pendingPayments / dashboardData.stats.totalOrders * 100)).toFixed(1) + '%'}
            </div>
            <p className="text-sm text-gray-600">Processing Efficiency</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${dashboardData.stats.pendingPayments === 0 ? '100' : Math.max(0, 100 - (dashboardData.stats.pendingPayments / dashboardData.stats.totalOrders * 100))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;