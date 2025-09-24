import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  Truck,
  Factory,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Layers,
  Archive
} from 'lucide-react';

const AdminInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockUpdate, setShowStockUpdate] = useState(false);
  const [stockUpdateData, setStockUpdateData] = useState({ type: 'add', quantity: '', notes: '' });

  // Mock data - replace with API calls
  useEffect(() => {
    setTimeout(() => {
      setProducts([
        {
          id: 1,
          name: 'Lion Bidi Classic',
          sku: 'LB-CLASSIC-001',
          category: 'Classic',
          currentStock: 2450,
          minStock: 500,
          maxStock: 5000,
          reorderPoint: 750,
          unitCost: 2.50,
          sellingPrice: 4.00,
          supplier: 'Local Supplier A',
          lastRestocked: '2024-12-15',
          status: 'active',
          location: 'Warehouse A - Section 1',
          batchNumber: 'LB240115001',
          expiryDate: '2025-06-15',
          quality: 'A',
          monthlyConsumption: 800,
          image: '/placeholder-bidi.jpg'
        },
        {
          id: 2,
          name: 'Lion Bidi Premium',
          sku: 'LB-PREMIUM-002',
          category: 'Premium',
          currentStock: 150,
          minStock: 200,
          maxStock: 1500,
          reorderPoint: 300,
          unitCost: 3.75,
          sellingPrice: 6.00,
          supplier: 'Premium Leaf Co.',
          lastRestocked: '2024-12-10',
          status: 'low_stock',
          location: 'Warehouse A - Section 2',
          batchNumber: 'LB240110002',
          expiryDate: '2025-05-10',
          quality: 'A+',
          monthlyConsumption: 250,
          image: '/placeholder-bidi.jpg'
        },
        {
          id: 3,
          name: 'Lion Bidi Economy',
          sku: 'LB-ECONOMY-003',
          category: 'Economy',
          currentStock: 0,
          minStock: 300,
          maxStock: 3000,
          reorderPoint: 450,
          unitCost: 1.80,
          sellingPrice: 2.75,
          supplier: 'Budget Materials Ltd',
          lastRestocked: '2024-12-01',
          status: 'out_of_stock',
          location: 'Warehouse B - Section 1',
          batchNumber: 'LB241201003',
          expiryDate: '2025-04-01',
          quality: 'B',
          monthlyConsumption: 600,
          image: '/placeholder-bidi.jpg'
        },
        {
          id: 4,
          name: 'Raw Tobacco Leaves',
          sku: 'RAW-TOBACCO-001',
          category: 'Raw Materials',
          currentStock: 875,
          minStock: 500,
          maxStock: 2000,
          reorderPoint: 750,
          unitCost: 45.00,
          sellingPrice: 0, // Raw materials don't have selling price
          supplier: 'Tobacco Farmers Coop',
          lastRestocked: '2024-12-12',
          status: 'active',
          location: 'Raw Materials Storage',
          batchNumber: 'TB241212001',
          expiryDate: '2025-08-12',
          quality: 'A',
          monthlyConsumption: 400,
          image: '/placeholder-tobacco.jpg'
        },
        {
          id: 5,
          name: 'Packaging Papers',
          sku: 'PKG-PAPER-001',
          category: 'Packaging',
          currentStock: 45,
          minStock: 100,
          maxStock: 1000,
          reorderPoint: 150,
          unitCost: 0.15,
          sellingPrice: 0,
          supplier: 'Paper Mills Inc',
          lastRestocked: '2024-12-08',
          status: 'critical',
          location: 'Packaging Storage',
          batchNumber: 'PP241208001',
          expiryDate: '2025-12-08',
          quality: 'A',
          monthlyConsumption: 200,
          image: '/placeholder-paper.jpg'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status, currentStock, minStock, reorderPoint) => {
    if (status === 'out_of_stock' || currentStock === 0) {
      return 'bg-red-100 text-red-800';
    } else if (status === 'critical' || currentStock < minStock) {
      return 'bg-red-100 text-red-800';
    } else if (status === 'low_stock' || currentStock <= reorderPoint) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-green-100 text-green-800';
    }
  };

  const getStatusIcon = (status, currentStock, minStock) => {
    if (status === 'out_of_stock' || currentStock === 0) {
      return <XCircle className="w-4 h-4" />;
    } else if (status === 'critical' || currentStock < minStock) {
      return <AlertTriangle className="w-4 h-4" />;
    } else if (status === 'low_stock') {
      return <AlertCircle className="w-4 h-4" />;
    } else {
      return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getStockLevel = (currentStock, minStock, reorderPoint) => {
    if (currentStock === 0) return 'Out of Stock';
    if (currentStock < minStock) return 'Critical';
    if (currentStock <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  };

  const updateStock = (productId, type, quantity, notes) => {
    setProducts(products.map(product => {
      if (product.id === productId) {
        const newStock = type === 'add' 
          ? product.currentStock + parseInt(quantity)
          : product.currentStock - parseInt(quantity);
        
        let newStatus = 'active';
        if (newStock === 0) newStatus = 'out_of_stock';
        else if (newStock < product.minStock) newStatus = 'critical';
        else if (newStock <= product.reorderPoint) newStatus = 'low_stock';

        return {
          ...product,
          currentStock: Math.max(0, newStock),
          status: newStatus,
          lastRestocked: new Date().toISOString().split('T')[0]
        };
      }
      return product;
    }));
    
    setShowStockUpdate(false);
    setSelectedProduct(null);
    setStockUpdateData({ type: 'add', quantity: '', notes: '' });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'in_stock' && product.currentStock > product.reorderPoint) ||
      (filterStatus === 'low_stock' && product.currentStock <= product.reorderPoint && product.currentStock > 0) ||
      (filterStatus === 'out_of_stock' && product.currentStock === 0) ||
      (filterStatus === 'critical' && product.currentStock < product.minStock);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(products.map(p => p.category))];
  
  // Analytics calculations
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.currentStock <= p.reorderPoint && p.currentStock > 0).length;
  const outOfStockItems = products.filter(p => p.currentStock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">{totalProducts} products in inventory</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowAddProduct(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{totalProducts}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Total Products</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-yellow-600">{lowStockItems}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Low Stock Items</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-red-600">{outOfStockItems}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">₹{totalValue.toLocaleString()}</span>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Total Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products, SKU, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover bg-gray-200"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                        <div className="text-xs text-gray-400">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.currentStock} units</div>
                    <div className="text-xs text-gray-500">Min: {product.minStock} | Reorder: {product.reorderPoint}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          product.currentStock <= product.minStock ? 'bg-red-500' : 
                          product.currentStock <= product.reorderPoint ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((product.currentStock / product.maxStock) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status, product.currentStock, product.minStock, product.reorderPoint)}`}>
                      {getStatusIcon(product.status, product.currentStock, product.minStock)}
                      <span className="ml-1">{getStockLevel(product.currentStock, product.minStock, product.reorderPoint)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{(product.currentStock * product.unitCost).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Cost: ₹{product.unitCost} {product.sellingPrice > 0 && `| Sale: ₹${product.sellingPrice}`}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.supplier}</div>
                    <div className="text-xs text-gray-500">Restocked: {new Date(product.lastRestocked).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.location}</div>
                    <div className="text-xs text-gray-500">Batch: {product.batchNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowStockUpdate(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Update Stock"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {selectedProduct && !showStockUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">SKU:</span>
                        <span className="font-medium">{selectedProduct.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span>{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quality Grade:</span>
                        <span className="font-medium">{selectedProduct.quality}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch Number:</span>
                        <span className="font-mono text-xs">{selectedProduct.batchNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Cost:</span>
                        <span className="font-medium">₹{selectedProduct.unitCost}</span>
                      </div>
                      {selectedProduct.sellingPrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Selling Price:</span>
                          <span className="font-medium">₹{selectedProduct.sellingPrice}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Value:</span>
                        <span className="font-bold">₹{(selectedProduct.currentStock * selectedProduct.unitCost).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Stock Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-bold text-lg">{selectedProduct.currentStock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Stock:</span>
                        <span>{selectedProduct.minStock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reorder Point:</span>
                        <span>{selectedProduct.reorderPoint} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maximum Stock:</span>
                        <span>{selectedProduct.maxStock} units</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Consumption:</span>
                        <span>{selectedProduct.monthlyConsumption} units/month</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Supplier & Location</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Supplier:</span>
                        <span>{selectedProduct.supplier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{selectedProduct.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Restocked:</span>
                        <span>{new Date(selectedProduct.lastRestocked).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date:</span>
                        <span>{new Date(selectedProduct.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => {
                    setShowStockUpdate(true);
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Stock
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockUpdate && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Update Stock - {selectedProduct.name}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                  <div className="text-lg font-bold text-gray-900">{selectedProduct.currentStock} units</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                  <select
                    value={stockUpdateData.type}
                    onChange={(e) => setStockUpdateData({...stockUpdateData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="add">Add Stock (Restock)</option>
                    <option value="subtract">Subtract Stock (Consumption)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={stockUpdateData.quantity}
                    onChange={(e) => setStockUpdateData({...stockUpdateData, quantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={stockUpdateData.notes}
                    onChange={(e) => setStockUpdateData({...stockUpdateData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Reason for stock update..."
                  />
                </div>

                {stockUpdateData.quantity && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm">
                      <strong>Preview:</strong><br />
                      Current: {selectedProduct.currentStock} units<br />
                      {stockUpdateData.type === 'add' ? 'After adding' : 'After subtracting'} {stockUpdateData.quantity}: {' '}
                      <span className="font-bold">
                        {stockUpdateData.type === 'add' 
                          ? selectedProduct.currentStock + parseInt(stockUpdateData.quantity || 0)
                          : Math.max(0, selectedProduct.currentStock - parseInt(stockUpdateData.quantity || 0))
                        } units
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowStockUpdate(false);
                    setStockUpdateData({ type: 'add', quantity: '', notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStock(selectedProduct.id, stockUpdateData.type, stockUpdateData.quantity, stockUpdateData.notes)}
                  disabled={!stockUpdateData.quantity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
