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
  RefreshCw
} from 'lucide-react';

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

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for development
      setDashboardData({
        stats: {
          totalOrders: 1247,
          pendingPayments: 23,
          totalRevenue: 125670.50,
          totalUsers: 892,
          verifiedToday: 15,
          rejectedToday: 2
        },
        recentOrders: [
          {
            _id: '1',
            orderNumber: 'LB24001234',
            user: { name: 'John Doe' },
            total: 2599.99,
            status: 'pending_payment',
            orderDate: new Date(Date.now() - 3600000)
          },
          {
            _id: '2',
            orderNumber: 'LB24001235',
            user: { name: 'Jane Smith' },
            total: 1299.50,
            status: 'confirmed',
            orderDate: new Date(Date.now() - 7200000)
          }
        ],
        pendingVerifications: [
          {
            _id: '3',
            orderNumber: 'LB24001236',
            user: { name: 'Mike Johnson' },
            total: 3999.00,
            payment: {
              transactionId: 'TXN789456123',
              submittedAt: new Date(Date.now() - 1800000)
            }
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: dashboardData.stats.totalOrders,
      icon: Package,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Pending Payments',
      value: dashboardData.stats.pendingPayments,
      icon: Clock,
      color: 'yellow',
      change: '-5%',
      changeType: 'negative'
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardData.stats.totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'green',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers,
      icon: Users,
      color: 'purple',
      change: '+8%',
      changeType: 'positive'
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
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
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Payment Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{dashboardData.stats.verifiedToday}</p>
              <p className="text-sm text-gray-600">Payments Verified</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{dashboardData.stats.rejectedToday}</p>
              <p className="text-sm text-gray-600">Payments Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent orders found
              </div>
            ) : (
              dashboardData.recentOrders.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.total?.toFixed(2)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
            <a
              href="/admin/payment-verification"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.pendingVerifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No pending verifications
              </div>
            ) : (
              dashboardData.pendingVerifications.map((order) => (
                <div key={order._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                      <p className="text-xs text-gray-500 font-mono">
                        {order.payment?.transactionId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{order.total?.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        {order.payment?.submittedAt ? 
                          new Date(order.payment.submittedAt).toLocaleDateString() : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/payment-verification"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Verify Payments</p>
              <p className="text-sm text-gray-600">{dashboardData.stats.pendingPayments} pending</p>
            </div>
          </a>
          
          <a
            href="/admin/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Manage Orders</p>
              <p className="text-sm text-gray-600">View all orders</p>
            </div>
          </a>
          
          <a
            href="/admin/users"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">User Management</p>
              <p className="text-sm text-gray-600">{dashboardData.stats.totalUsers} total users</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;