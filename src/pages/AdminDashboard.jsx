import React, { useState, useEffect, useContext } from "react";
import AppContext from "../context/AppContext";
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
  Download,
  AlertTriangle,
  Archive,
  Layers,
} from "lucide-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalOrders: 0,
      pendingPayments: 0,
      totalRevenue: 0,
      totalUsers: 0,
      verifiedToday: 0,
      rejectedToday: 0,
    },
    recentOrders: [],
    pendingVerifications: [],
  });

  const [inventoryData, setInventoryData] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    criticalStockItems: 0,
    outOfStockItems: 0,
    totalInventoryValue: 0,
    recentStockMovements: [],
    criticalAlerts: [],
  });

  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  useEffect(() => {
    refreshDashboard();
  }, []);

  useEffect(() => {
    // Generate notifications from inventory alerts
    const inventoryNotifications = inventoryData.criticalAlerts.map(
      (alert, index) => ({
        id: `inv-${index}`,
        type: alert.urgency === "critical" ? "error" : "warning",
        title:
          alert.status === "out_of_stock"
            ? "Out of Stock Alert"
            : "Low Stock Alert",
        message:
          alert.status === "out_of_stock"
            ? `${alert.product} is completely out of stock!`
            : `${alert.product} is running low (${alert.currentStock}/${alert.minStock})`,
        time: new Date(),
        action: "/admin/inventory",
      })
    );

    setNotifications(inventoryNotifications);
  }, [inventoryData]);

  const { fetchAdminDashboardData, fetchProductInventory, showToast } =
    useContext(AppContext);

  const handleVerifyPayment = (order) => {
    window.location.href = `/admin/payment-verification?order=${order._id}`;
  };

  const handleViewOrder = (order) => {
    console.log("Viewing order:", order);
    window.open(`/admin/orders/${order._id}`, "_blank");
  };

  // Add refresh function
  const refreshDashboard = async () => {
    try {
      setLoading(true);

      const adminToken = localStorage.getItem("adminToken");
      const regularToken = localStorage.getItem("token");
      console.log("Admin Token:", adminToken ? "Present" : "Missing");
      console.log("Regular Token:", regularToken ? "Present" : "Missing");

      if (!adminToken && !regularToken) {
        showToast(
          "No authentication token found. Please login as admin.",
          "error"
        );
        return;
      }

      // Fetch dashboard data
      const dashboardResponse = await fetchAdminDashboardData();
      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      }

      // Fetch inventory data
      const inventoryResponse = await fetchProductInventory();
      if (inventoryResponse.success) {
        // Calculate inventory stats from real product data
        const products = inventoryResponse.products;
        const lowStock = products.filter(
          (p) => p.currentStock <= p.reorderPoint && p.currentStock > 0
        );
        const outOfStock = products.filter((p) => p.currentStock === 0);
        const criticalStock = products.filter(
          (p) => p.currentStock < p.minStock
        );
        const totalValue = products.reduce(
          (sum, p) => sum + p.currentStock * p.unitCost,
          0
        );

        // Create critical alerts
        const criticalAlerts = [
          ...outOfStock.map((p) => ({
            product: p.name,
            currentStock: p.currentStock,
            status: "out_of_stock",
            urgency: "critical",
          })),
          ...criticalStock
            .filter((p) => p.currentStock > 0)
            .map((p) => ({
              product: p.name,
              currentStock: p.currentStock,
              minStock: p.minStock,
              status: "low_stock",
              urgency: p.currentStock < p.minStock * 0.5 ? "high" : "medium",
            })),
        ];

        setInventoryData({
          totalProducts: products.length,
          lowStockItems: lowStock.length,
          criticalStockItems: criticalStock.length,
          outOfStockItems: outOfStock.length,
          totalInventoryValue: totalValue,
          recentStockMovements: [],
          criticalAlerts: criticalAlerts,
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Orders",
      value: dashboardData.stats.totalOrders,
      icon: Package,
      color: "blue",
      change: "+12%",
      changeType: "positive",
      subtitle: `${dashboardData.stats.verifiedToday} today`,
    },
    {
      title: "Pending Payments",
      value: dashboardData.stats.pendingPayments,
      icon: Clock,
      color: "yellow",
      change: "-5%",
      changeType: "negative",
      subtitle: "Needs attention",
      urgent: dashboardData.stats.pendingPayments > 10,
    },
    {
      title: "Total Revenue",
      value: `₹${dashboardData.stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "green",
      change: "+18%",
      changeType: "positive",
      subtitle: `₹${Math.floor(
        dashboardData.stats.totalRevenue * 0.1
      ).toLocaleString()} today`,
    },
    {
      title: "Total Users",
      value: dashboardData.stats.totalUsers,
      icon: Users,
      color: "purple",
      change: "+8%",
      changeType: "positive",
      subtitle: `${Math.floor(
        dashboardData.stats.totalUsers * 0.05
      )} active now`,
    },
  ];

  const inventoryStats = [
    {
      title: "Total Products",
      value: inventoryData.totalProducts,
      icon: Archive,
      color: "bg-blue-500",
      description: "In inventory",
    },
    {
      title: "Low Stock Items",
      value: inventoryData.lowStockItems,
      icon: AlertTriangle,
      color: "bg-yellow-500",
      description: "Need restocking",
      urgent: inventoryData.lowStockItems > 0,
    },
    {
      title: "Out of Stock",
      value: inventoryData.outOfStockItems,
      icon: XCircle,
      color: "bg-red-500",
      description: "Critical items",
      urgent: inventoryData.outOfStockItems > 0,
    },
    {
      title: "Inventory Value",
      value: `₹${Math.floor(inventoryData.totalInventoryValue / 1000)}K`,
      icon: DollarSign,
      color: "bg-green-500",
      description: "Total value",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
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
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              refreshDashboard();
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          <button
            onClick={refreshDashboard}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Critical Inventory Alerts */}
      {inventoryData.criticalAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">
              Critical Inventory Alerts
            </h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              {inventoryData.criticalAlerts.length} items need attention
            </span>
          </div>
          <div className="space-y-2">
            {inventoryData.criticalAlerts.slice(0, 3).map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  {alert.status === "out_of_stock" ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <span className="text-red-800">
                    <strong>{alert.product}</strong> -{" "}
                    {alert.status === "out_of_stock"
                      ? "Out of stock!"
                      : `Low stock: ${alert.currentStock}/${alert.minStock}`}
                  </span>
                </div>
                <a
                  href="/admin/inventory"
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Manage →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              Recent Notifications
            </h3>
          </div>
          <div className="space-y-2">
            {notifications.slice(0, 2).map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between text-sm"
              >
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
            blue: "bg-blue-500",
            yellow: "bg-yellow-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
          };

          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${
                stat.urgent ? "ring-2 ring-yellow-400" : ""
              }`}
            >
              {stat.urgent && (
                <div className="flex items-center text-yellow-600 text-xs font-medium mb-2">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  URGENT
                </div>
              )}
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 ${
                    colorClasses[stat.color]
                  } rounded-lg flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className={`flex items-center text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
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

      {/* Inventory Stats Row */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Inventory Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {inventoryStats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                  stat.urgent ? "ring-2 ring-red-400" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
                {stat.urgent && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    Requires immediate attention
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Stock Movements
              </h2>
              <p className="text-sm text-gray-500">Latest inventory updates</p>
            </div>
            <a
              href="/admin/inventory"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {inventoryData.recentStockMovements.map((movement, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        movement.type === "restocked"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {movement.type === "restocked" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {movement.product}
                      </p>
                      <p className="text-sm text-gray-500">
                        {movement.type === "restocked" ? "Added" : "Used"}{" "}
                        {movement.quantity} units
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {movement.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <p className="text-sm text-gray-500">
                Latest {dashboardData.recentOrders.length} orders
              </p>
            </div>
            <a
              href="/admin/orders"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </a>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {dashboardData.recentOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "pending_payment"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status?.replace("_", " ")}
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
                    <p className="font-bold text-gray-900">
                      ₹{order.total?.toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="text-blue-600 hover:text-blue-800 text-xs inline-flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Verifications
              </h2>
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
                <p className="text-xs mt-1">
                  Great job staying on top of verifications
                </p>
              </div>
            ) : (
              dashboardData.pendingVerifications.map((order) => (
                <div
                  key={order._id}
                  className="p-4 hover:bg-yellow-50 transition-colors border-l-4 border-yellow-400"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.user?.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {order.payment?.transactionId}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.payment?.submittedAt
                            ? new Date(
                                order.payment.submittedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-900">
                        ₹{order.total?.toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleVerifyPayment(order)}
                        className="text-yellow-600 hover:text-yellow-800 text-xs inline-flex items-center"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
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
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            href="/admin/inventory"
            className={`flex items-center p-4 border-2 rounded-lg transition-all ${
              inventoryData.criticalAlerts.length > 0
                ? "border-red-200 hover:bg-red-50 hover:border-red-300"
                : "border-green-200 hover:bg-green-50 hover:border-green-300"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                inventoryData.criticalAlerts.length > 0
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >
              <Archive
                className={`w-6 h-6 ${
                  inventoryData.criticalAlerts.length > 0
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-gray-900">Inventory</p>
              <p className="text-sm text-gray-600">
                {inventoryData.criticalAlerts.length > 0
                  ? `${inventoryData.criticalAlerts.length} alerts`
                  : "All good"}
              </p>
            </div>
            {inventoryData.criticalAlerts.length > 0 && (
              <div className="ml-auto">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  {inventoryData.criticalAlerts.length}
                </span>
              </div>
            )}
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
            className="flex items-center p-4 border-2 border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all hover:border-indigo-300"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-600">Reports & insights</p>
            </div>
          </a>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          System Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(
                ((dashboardData.stats.totalOrders -
                  dashboardData.stats.pendingPayments) /
                  dashboardData.stats.totalOrders) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-sm text-gray-600">Payment Success Rate</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((dashboardData.stats.totalOrders -
                      dashboardData.stats.pendingPayments) /
                      dashboardData.stats.totalOrders) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                (dashboardData.stats.verifiedToday /
                  Math.max(
                    dashboardData.stats.verifiedToday +
                      dashboardData.stats.rejectedToday,
                    1
                  )) *
                  100
              )}
              %
            </div>
            <p className="text-sm text-gray-600">Approval Rate Today</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (dashboardData.stats.verifiedToday /
                      Math.max(
                        dashboardData.stats.verifiedToday +
                          dashboardData.stats.rejectedToday,
                        1
                      )) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {dashboardData.stats.pendingPayments === 0
                ? "100%"
                : Math.max(
                    0,
                    100 -
                      (dashboardData.stats.pendingPayments /
                        dashboardData.stats.totalOrders) *
                        100
                  ).toFixed(1) + "%"}
            </div>
            <p className="text-sm text-gray-600">Processing Efficiency</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    dashboardData.stats.pendingPayments === 0
                      ? "100"
                      : Math.max(
                          0,
                          100 -
                            (dashboardData.stats.pendingPayments /
                              dashboardData.stats.totalOrders) *
                              100
                        )
                  }%`,
                }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {(
                ((inventoryData.totalProducts - inventoryData.outOfStockItems) /
                  inventoryData.totalProducts) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-sm text-gray-600">Inventory Health</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    ((inventoryData.totalProducts -
                      inventoryData.outOfStockItems) /
                      inventoryData.totalProducts) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;