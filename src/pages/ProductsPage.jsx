import React, { useState } from "react";
import { sampleProducts, categories } from "../data/sampleProducts";
import ProductCard from "../components/ProductCard";

const ProductsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [priceRange, setPriceRange] = useState([0, 500]);

  const filteredProducts = sampleProducts.filter((product) => {
    const matchesCategory = selectedCategory === "" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "discount":
        return b.discount - a.discount;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
            All Products
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our premium collection of authentic tobacco products
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-md sticky top-8">
              <h3 className="font-bold text-lg mb-4 text-gray-800">
                Categories
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-300 ${
                    selectedCategory === ""
                      ? "bg-divine-orange text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-300 ${
                      selectedCategory === category.name
                        ? "bg-divine-orange text-white"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:border-divine-orange focus:outline-none"
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount">Best Discount</option>
                </select>
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-4 text-gray-800">
                  Price Range
                </h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full accent-divine-orange"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      ₹{priceRange[0]} - ₹{priceRange[1]}
                    </span>
                    <span className="font-semibold text-divine-orange">
                      ₹{priceRange[1]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-md">
              <p className="text-gray-700 font-medium">
                Showing{" "}
                <span className="text-divine-orange font-bold">
                  {sortedProducts.length}
                </span>{" "}
                of <span className="font-bold">{sampleProducts.length}</span>{" "}
                products
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-md">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  No products found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setPriceRange([0, 500]);
                  }}
                  className="bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
