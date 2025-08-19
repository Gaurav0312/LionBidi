import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 

// Sample products for dropdown (you can replace with your actual data)
const sampleSearchProducts = [
  {
    id: 1,
    name: "Special Lion Bidi ( Big )",
    price: "₹400.00",
    salePrice: "₹280.00",
    image: "/LionBidi.jpg",
    slug: "special-lion-bidi-big"
  },
  {
    id: 2,
    name: "Special Lion Bidi ( Small )",
    price: "₹300.00",
    salePrice: "₹210.00",
    image: "/LionBidiSmall.jpg",
    slug: "special-lion-bidi-small"
  }
];

const DesktopSearch = ({ searchQuery, setSearchQuery, handleSearch, isLoading }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState(sampleSearchProducts);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = sampleSearchProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(sampleSearchProducts);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleProductClick = (product) => {
    setSearchQuery(product.name);
    setIsDropdownOpen(false);
    // You can add navigation logic here
    const path = product.slug ? `/product/${product.slug}` : `/product/${product.id}`;
    navigate(path);
    console.log('Selected product:', product);
  };

  return (
    <div className="hidden lg:flex flex-1 mx-4 xl:mx-6 max-w-xl relative">
      <form onSubmit={handleSearch} className="relative flex w-full group">
        <div className="flex w-full rounded-lg bg-white border border-orange-200 focus-within:border-divine-orange focus-within:shadow-md transition-all">
          <div className="flex items-center pl-4 text-gray-400">
            <Search size={18} />
          </div>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleInputFocus}
            placeholder="Search for collection"
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 px-3 py-3 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-divine-orange text-white font-semibold px-4 xl:px-6 py-3 rounded-r-lg hover:bg-divine-orange/90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Sparkles size={16} />
            )}
            <span className="hidden xl:inline text-sm">Search</span>
          </button>
        </div>
      </form>

      {/* Product Dropdown */}
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-orange-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-orange-100">
            <h3 className="font-semibold text-gray-800">PRODUCTS</h3>
          </div>

          {/* Products List */}
          <div className="py-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                >
                  {/* Product Image */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/60/60';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-900 font-medium line-through">
                        {product.price}
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        {product.salePrice}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>No products found matching "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* View All Results Footer */}
          {searchQuery && filteredProducts.length > 0 && (
            <div className="border-t border-orange-100 p-3">
              <button
                onClick={() => {
                  handleSearch();
                  setIsDropdownOpen(false);
                }}
                className="w-full text-center text-divine-orange hover:text-divine-orange/80 font-medium text-sm py-2"
              >
                View all results for "{searchQuery}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DesktopSearch;
