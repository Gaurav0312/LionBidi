import React, { useState } from 'react';
import { Heart, ShoppingCart, X, Star, Filter, Grid, List } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, addToCart, user } = useAppContext();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded', 'price', 'name'
  const [filterCategory, setFilterCategory] = useState('all');
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);

  // Helper function to get consistent item ID
  const getItemId = (item) => item._id || item.id;

  // Get unique categories from wishlist items
  const categories = wishlist ? [...new Set(wishlist.map(item => item.category).filter(Boolean))] : [];

  // Filter and sort wishlist items
  const getFilteredAndSortedWishlist = () => {
    if (!wishlist || wishlist.length === 0) return [];

    let filtered = [...wishlist];

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Filter by sale items
    if (showOnSaleOnly) {
      filtered = filtered.filter(item => 
        (item.discountPrice && item.discountPrice < item.price) ||
        (item.discount > 0) ||
        (item.originalPrice && item.originalPrice > item.price)
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = a.discountPrice || a.price || 0;
          const priceB = b.discountPrice || b.price || 0;
          return priceA - priceB;
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'dateAdded':
        default:
          // Use createdAt if available, otherwise assume newer items are at the end
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
      }
    });

    return filtered;
  };

  const filteredWishlist = getFilteredAndSortedWishlist();

  const handleMoveToCart = async (product) => {
    try {
      await addToCart(product);
      await removeFromWishlist(getItemId(product));
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  const handleRemoveFromWishlist = async (product) => {
    try {
      await removeFromWishlist(getItemId(product));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
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

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100 border-b-2 border-orange-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <Heart className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-orange-900 mb-2">My Wishlist</h1>
              <p className="text-lg text-orange-700">Save items you love for later</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-200 p-12">
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-16 w-16 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Your wishlist is empty</h2>
            <p className="text-orange-700 mb-8 max-w-md mx-auto">
              Explore our products and add your favorites to your wishlist. 
              They'll be saved here for easy access later.
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100 border-b-2 border-orange-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-orange-900 mb-2 flex items-center gap-3">
                <Heart className="h-10 w-10 text-orange-600 fill-orange-200" />
                My Wishlist
              </h1>
              <p className="text-lg text-orange-700">
                {filteredWishlist.length} {filteredWishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-orange-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-orange-600 hover:bg-orange-100'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-orange-600 hover:bg-orange-100'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">Filters:</span>
            </div>
            
            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-white border border-orange-300 rounded-lg text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            )}

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border border-orange-300 rounded-lg text-orange-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="dateAdded">Recently Added</option>
              <option value="price">Price: Low to High</option>
              <option value="name">Name: A to Z</option>
            </select>

            {/* On Sale Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnSaleOnly}
                onChange={(e) => setShowOnSaleOnly(e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-orange-900 font-medium">On Sale Only</span>
            </label>
          </div>
        </div>

        {/* Wishlist Items */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((product) => {
              const savings = calculateSavings(product);
              const displayPrice = getDisplayPrice(product);
              const originalPrice = getOriginalPrice(product);

              return (
                <div
                  key={getItemId(product)}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image || '/placeholder-image.jpg'}
                      alt={product.name || 'Product'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    {savings && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {savings.percentage}% OFF
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveFromWishlist(product)}
                      className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-orange-900 mb-2 line-clamp-2 group-hover:text-orange-700">
                      {product.name}
                    </h3>
                    
                    {/* Rating */}
                    {product.ratings && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600">{product.ratings}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-orange-600">
                        ₹{displayPrice}
                      </span>
                      {originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={!product.inStock && !(product.stock > 0)}
                        className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          product.inStock || product.stock > 0
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.inStock || product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-2 text-xs">
                      {product.inStock || product.stock > 0 ? (
                        <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                          ✓ In Stock {product.stock && `(${product.stock})`}
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium bg-red-50 px-2 py-1 rounded">
                          ✗ Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {filteredWishlist.map((product) => {
              const savings = calculateSavings(product);
              const displayPrice = getDisplayPrice(product);
              const originalPrice = getOriginalPrice(product);

              return (
                <div
                  key={getItemId(product)}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-4 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={product.image || '/placeholder-image.jpg'}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                      {savings && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                          {savings.percentage}%
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-orange-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-orange-600">
                            ₹{displayPrice}
                          </span>
                          {originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{originalPrice}
                            </span>
                          )}
                        </div>

                        {product.ratings && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600">{product.ratings}</span>
                          </div>
                        )}

                        <div className="text-xs">
                          {product.inStock || product.stock > 0 ? (
                            <span className="text-green-600 font-medium">
                              In Stock {product.stock && `(${product.stock})`}
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={!product.inStock && !(product.stock > 0)}
                        className={`font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                          product.inStock || product.stock > 0
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.inStock || product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </button>
                      <button
                        onClick={() => handleRemoveFromWishlist(product)}
                        className="p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      >
                        <X className="h-4 w-4 text-red-500" />
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
          <div className="text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200 p-8">
            <Filter className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-orange-900 mb-2">No items match your filters</h3>
            <p className="text-orange-700 mb-4">Try adjusting your filters to see more items.</p>
            <button
              onClick={() => {
                setFilterCategory('all');
                setShowOnSaleOnly(false);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
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