//WishlistPage.jsx
import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  ShoppingCart, 
  X, 
  Star, 
  Grid, 
  List, 
  Package,
  Share2,
  Search,
  Trash2,
  Gift,
  Bell,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, addToCart, user } = useAppContext();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [notifications, setNotifications] = useState({});

  // Helper functions
  const getItemId = (item) => item._id || item.id;

  const isProductInStock = (product) => {
    if (product.inStock === true) return true;
    if (product.inStock === false) return false;
    if (typeof product.stock === 'number' && product.stock > 0) return true;
    if (typeof product.stock === 'number' && product.stock <= 0) return false;
    return true;
  };

  const getStockDisplay = (product) => {
    if (product.inStock === false || (typeof product.stock === 'number' && product.stock <= 0)) {
      return { inStock: false, text: 'Out of Stock', className: 'text-red-600 bg-red-50 border-red-200' };
    }
    
    if (typeof product.stock === 'number' && product.stock > 0) {
      if (product.stock <= 5) {
        return { 
          inStock: true, 
          text: `Only ${product.stock} left`, 
          className: 'text-divine-orange bg-orange-50 border-orange-200' 
        };
      }
      return { 
        inStock: true, 
        text: `${product.stock} in stock`, 
        className: 'text-emerald-600 bg-emerald-50 border-emerald-200' 
      };
    }
    
    return { 
      inStock: true, 
      text: 'In Stock', 
      className: 'text-emerald-600 bg-emerald-50 border-emerald-200' 
    };
  };

  const calculateSavings = (product) => {
    let savings = 0;
    let percentage = 0;

    if (product.originalPrice && product.price < product.originalPrice) {
      savings = product.originalPrice - product.price;
      percentage = Math.round((savings / product.originalPrice) * 100);
    } else if (product.discountPrice && product.price > product.discountPrice) {
      savings = product.price - product.discountPrice;
      percentage = Math.round((savings / product.price) * 100);
    } else if (product.discount > 0 && product.originalPrice) {
      savings = (product.originalPrice * product.discount) / 100;
      percentage = product.discount;
    }

    return savings > 0 ? { amount: Math.round(savings), percentage } : null;
  };

  const getDisplayPrice = (product) => {
    return product.discountPrice || product.price || 0;
  };

  const getOriginalPrice = (product) => {
    if (product.originalPrice && product.originalPrice > getDisplayPrice(product)) {
      return product.originalPrice;
    }
    if (product.price && product.discountPrice && product.price > product.discountPrice) {
      return product.price;
    }
    return null;
  };

  // Get categories and filtered wishlist
  const categories = wishlist ? [...new Set(wishlist.map(item => item.category).filter(Boolean))] : [];

  const filteredWishlist = useMemo(() => {
    if (!wishlist || wishlist.length === 0) return [];

    let filtered = [...wishlist];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Sale filter
    if (showOnSaleOnly) {
      filtered = filtered.filter(item => 
        (item.discountPrice && item.discountPrice < item.price) ||
        (item.discount > 0) ||
        (item.originalPrice && item.originalPrice > item.price)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.discountPrice || a.price || 0) - (b.discountPrice || b.price || 0);
        case 'priceDesc':
          return (b.discountPrice || b.price || 0) - (a.discountPrice || a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'rating':
          return (b.ratings || 0) - (a.ratings || 0);
        case 'dateAdded':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    return filtered;
  }, [wishlist, searchQuery, filterCategory, showOnSaleOnly, sortBy]);

  // Event handlers
  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product);
      await removeFromWishlist(getItemId(product));
      setNotifications(prev => ({
        ...prev,
        [getItemId(product)]: { type: 'success', message: 'Moved to cart!' }
      }));
      setTimeout(() => {
        setNotifications(prev => {
          const newNotifications = { ...prev };
          delete newNotifications[getItemId(product)];
          return newNotifications;
        });
      }, 3000);
    } catch (error) {
      console.error('Error moving to cart:', error);
      setNotifications(prev => ({
        ...prev,
        [getItemId(product)]: { type: 'error', message: 'Failed to move to cart' }
      }));
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(getItemId(product));
      setNotifications(prev => ({
        ...prev,
        [getItemId(product)]: { type: 'success', message: 'Removed from wishlist' }
      }));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleBulkRemove = async () => {
    try {
      for (const itemId of selectedItems) {
        await removeFromWishlist(itemId);
      }
      setSelectedItems([]);
      setNotifications(prev => ({
        ...prev,
        bulk: { type: 'success', message: `${selectedItems.length} items removed` }
      }));
    } catch (error) {
      console.error('Error in bulk remove:', error);
    }
  };

  const handleBulkMoveToCart = async () => {
    try {
      const itemsToMove = wishlist.filter(item => selectedItems.includes(getItemId(item)));
      for (const item of itemsToMove) {
        await addToCart(item);
        await removeFromWishlist(getItemId(item));
      }
      setSelectedItems([]);
      setNotifications(prev => ({
        ...prev,
        bulk: { type: 'success', message: `${itemsToMove.length} items moved to cart` }
      }));
    } catch (error) {
      console.error('Error in bulk move to cart:', error);
    }
  };

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredWishlist.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredWishlist.map(item => getItemId(item)));
    }
  };

  const handleImageError = (e) => {
    e.target.src = '/placeholder-image.jpg';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: window.location.href,
      });
    } else {
      setShowShareModal(true);
    }
  };

  const NotificationToast = ({ notification, onClose }) => (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border-l-4 transform transition-all duration-300 ${
      notification.type === 'success' 
        ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
        : 'bg-red-50 border-red-500 text-red-800'
    }`}>
      <div className="flex items-center gap-3">
        {notification.type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-red-600" />
        )}
        <span className="font-medium">{notification.message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
        {/* Modern Empty State */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-amber-400/10 to-yellow-400/10"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl opacity-10 animate-pulse"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                  <Heart className="h-16 w-16 text-divine-orange" strokeWidth={1.5} />
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Your Wishlist is Empty
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
                Start saving items you love. Create your personalized collection and never lose track of what catches your eye.
              </p>
              
              <div className="space-y-6">
                <button
                  onClick={() => window.location.href = '/products'}
                  className="inline-flex items-center gap-3 bg-[#FF6B35] hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Package className="h-5 w-5" />
                  Discover Products
                </button>
                
                <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-divine-orange" />
                    <span>Save favorites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-divine-orange" />
                    <span>Price alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-divine-orange" />
                    <span>Share with friends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-divine-orange" />
                    <span>Gift ideas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
      {/* Notifications */}
      {Object.entries(notifications).map(([key, notification]) => (
        <NotificationToast 
          key={key} 
          notification={notification} 
          onClose={() => setNotifications(prev => {
            const newNotifications = { ...prev };
            delete newNotifications[key];
            return newNotifications;
          })}
        />
      ))}

      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-orange-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-[#FF6B35] rounded-xl shadow-lg">
                <Heart className="h-6 w-6 text-white" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">My Wishlist</h1>
                <p className="text-slate-600">
                  <span className="font-semibold text-divine-orange">{filteredWishlist.length}</span> 
                  {filteredWishlist.length === 1 ? ' item' : ' items'}
                  {selectedItems.length > 0 && (
                    <span className="ml-2">• <span className="font-semibold">{selectedItems.length}</span> selected</span>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={handleBulkMoveToCart}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBulkRemove}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              )}
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <div className="flex items-center bg-white rounded-xl p-1 shadow-md border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-[#FF6B35] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    viewMode === 'list' 
                      ? 'bg-[#FF6B35] text-white shadow-md' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-orange-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search your wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Bulk Select */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredWishlist.length && filteredWishlist.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-divine-orange border-slate-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-slate-700">Select All</span>
              </label>

              {categories.length > 0 && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              )}

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="dateAdded">Recently Added</option>
                <option value="name">Name A-Z</option>
                <option value="price">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnSaleOnly}
                  onChange={(e) => setShowOnSaleOnly(e.target.checked)}
                  className="w-4 h-4 text-divine-orange border-slate-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-slate-700">On Sale Only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((product) => {
              const savings = calculateSavings(product);
              const displayPrice = getDisplayPrice(product);
              const originalPrice = getOriginalPrice(product);
              const stockInfo = getStockDisplay(product);
              const itemId = getItemId(product);
              const isSelected = selectedItems.includes(itemId);

              return (
                <div
                  key={itemId}
                  className={`group relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    isSelected ? 'border-orange-500 ring-4 ring-orange-100' : 'border-slate-100 hover:border-orange-200'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemSelect(itemId)}
                      className="w-5 h-5 text-divine-orange border-white border-2 rounded shadow-lg focus:ring-orange-500"
                    />
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                    <img
                      src={product.image || '/placeholder-image.jpg'}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      onError={handleImageError}
                    />
                    
                    {savings && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        {savings.percentage}% OFF
                      </div>
                    )}

                    <button
                      onClick={() => handleRemoveFromWishlist(product)}
                      className="absolute bottom-4 right-4 p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:scale-110"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-bold text-slate-800 mb-2 text-lg leading-tight" style={{ 
                      display: '-webkit-box', 
                      WebkitLineClamp: 2, 
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {product.name}
                    </h3>
                    
                    {product.ratings && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(product.ratings) 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-slate-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600 font-medium">
                          {product.ratings} ({product.reviewCount || '0'})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-bold text-slate-800">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      {originalPrice && (
                        <span className="text-lg text-slate-400 line-through">
                          ₹{originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${stockInfo.className}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          stockInfo.inStock ? 'bg-emerald-500' : 'bg-red-500'
                        }`}></div>
                        {stockInfo.text}
                      </span>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={!stockInfo.inStock}
                      className={`w-full py-3.5 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                        stockInfo.inStock
                          ? "bg-[#FF6B35] hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {stockInfo.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Enhanced List View */
          <div className="space-y-4">
            {filteredWishlist.map((product) => {
              const savings = calculateSavings(product);
              const displayPrice = getDisplayPrice(product);
              const originalPrice = getOriginalPrice(product);
              const stockInfo = getStockDisplay(product);
              const itemId = getItemId(product);
              const isSelected = selectedItems.includes(itemId);

              return (
                <div
                  key={itemId}
                  className={`bg-white rounded-2xl shadow-lg border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                    isSelected ? 'border-orange-500 ring-4 ring-orange-100' : 'border-slate-100 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemSelect(itemId)}
                      className="w-5 h-5 text-divine-orange border-slate-300 rounded focus:ring-orange-500"
                    />

                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={product.image || '/placeholder-image.jpg'}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                      {savings && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          {savings.percentage}%
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-xl mb-2 truncate">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-slate-600 mb-3 text-sm" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-6 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-slate-800">
                            ₹{displayPrice.toLocaleString()}
                          </span>
                          {originalPrice && (
                            <span className="text-lg text-slate-400 line-through">
                              ₹{originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        
                        {product.ratings && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${
                                    i < Math.floor(product.ratings) 
                                      ? 'text-yellow-400 fill-yellow-400' 
                                      : 'text-slate-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <span className="text-sm text-slate-600 font-medium">
                              {product.ratings}
                            </span>
                          </div>
                        )}
                        
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${stockInfo.className}`}>
                          <div className={`w-2 h-2 rounded-full ${
                            stockInfo.inStock ? 'bg-emerald-500' : 'bg-red-500'
                          }`}></div>
                          {stockInfo.text}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={!stockInfo.inStock}
                        className={`font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                          stockInfo.inStock
                            ? "bg-[#FF6B35] hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="h-5 w-5" />
                        {stockInfo.inStock ? "Add to Cart" : "Out of Stock"}
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFromWishlist(product)}
                        className="p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 hover:scale-110 shadow-lg"
                      >
                        <X className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {filteredWishlist.length === 0 && wishlist.length > 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">No items found</h3>
            <p className="text-lg text-slate-600 mb-8">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('all');
                setShowOnSaleOnly(false);
              }}
              className="inline-flex items-center gap-2 bg-[#FF6B35] hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
