import React, { useState} from "react";
import { Truck, ShoppingCart, Star, Shield } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { sampleProducts } from "../data/sampleProducts";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

// Home Page Component with Divine Hindu Theme
const HomePage = () => {
  const navigate = useNavigate();
  const { setCurrentPage } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const bestsellers = sampleProducts.filter((p) => p.bestseller);

  const handleNavigate = async (path) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigate(path);
    } catch (error) {
      window.location.href = path;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      {/* Hero Section */}
      <section className="hero-section relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
        {/* Hero Content */}
        <div className="relative z-20 flex items-center w-full h-full min-h-screen px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:text-left">
              {/* Text Content */}
              <div className="w-full space-y-6 sm:space-y-8 pt-20 sm:pt-16 lg:pt-0">
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-800">
                    <span className="text-divine-orange font-extrabold block">
                      SPECIAL LION BIDI
                    </span>
                    <span className="text-divine-orange">.</span>
                  </h1>

                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-600 tracking-wide px-2 sm:px-0">
                    Experience the Authentic Natural Taste
                  </h2>

                  <p className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed px-4 sm:px-2 lg:px-0 lg:max-w-xl">
                    Handcrafted with finest tobacco leaves for the ultimate
                    smoking experience
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-0 lg:justify-start justify-center">
                  <button
                    onClick={() => handleNavigate("/product/special-lion-bidi-big")}
                    className="group relative bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold py-4 sm:py-4 px-6 sm:px-8 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg w-full sm:w-auto"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      Shop Now
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 text-sm px-4 sm:px-0 text-gray-600">
                  <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                    <div className="w-4 h-4 text-green-600">🌿</div>
                    <span>Best Natural Tobacco</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                    <div className="w-4 h-4 text-blue-600">⚡</div>
                    <span>Fast Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border">
                    <div className="w-4 h-4 text-yellow-600">🏆</div>
                    <span>Premium Quality Bidi</span>
                  </div>
                </div>
              </div>

              {/* Product Showcase */}
              <div className="w-full flex justify-center mt-6 sm:mt-8 lg:mt-2 px-3 sm:px-4 lg:px-6">
                <div className="relative group w-full max-w-xs sm:max-w-sm md:max-w-md">
                  {/* Card */}
                  <div className="bg-white border border-orange-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    {/* Product Image */}
                    <div className="mb-6 flex justify-center">
                      <img
                        src="/LionBidi.jpg"
                        alt="Lion Bidi Pack"
                        className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="text-center space-y-4">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 leading-tight">
                        Special Lion Bidi ( Big )
                      </h3>

                      <div className="space-y-2">
                        <p className="text-2xl sm:text-3xl font-bold text-divine-orange">
                          ₹280
                        </p>
                        <span className="block text-sm text-gray-600">
                          per pack
                        </span>
                      </div>

                      {/* Ratings */}
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">(4.5/5)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Bestsellers Section */}
          <section className="mb-16 sm:mb-20 lg:mb-24">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
                Shop Our Best Seller
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed px-4 sm:px-2 lg:px-0">
                Most loved products by our community - handpicked for
                exceptional quality, authentic taste, and customer satisfaction
              </p>
            </div>

            {/* Bestsellers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {bestsellers.map((product, index) => (
                <div
                  key={product.id}
                  className="transform hover:scale-[1.02] transition-transform duration-300"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12 sm:mt-16 px-4 sm:px-0">
              <button
                onClick={() => handleNavigate("/products")}
                className="bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold py-4 px-8 sm:px-12 rounded-lg text-base sm:text-lg transition-all duration-300 hover:shadow-lg"
              >
                View All Products
              </button>
            </div>
          </section>

          {/* Trust Badges Section */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 sm:p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
                Why Choose Lion Bidi?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed">
                Experience the perfect blend of tradition and quality with our
                premium tobacco products and exceptional service standards
              </p>
            </div>

            {/* Trust Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Delivery */}
              <div className="text-center p-6 bg-gray-50 rounded-xl border">
                <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Fast Delivery
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Lightning-fast delivery across all major cities in India with
                  discreet packaging and real-time tracking
                </p>
              </div>

              {/* Authentic Products */}
              <div className="text-center p-6 bg-gray-50 rounded-xl border">
                <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Authentic Products
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  100% genuine tobacco products from verified sources with
                  traditional crafting methods and quality assurance
                </p>
              </div>

              {/* 24/7 Support */}
              <div className="text-center p-6 bg-gray-50 rounded-xl border">
                <div className="w-16 h-16 bg-divine-orange rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  Secure Shopping
                </h3>
                <p className="text-gray-600 leading-relaxed">
                   Safe and encrypted payments with multiple options including UPI, PayTM, PhonePe, Google Pay and wallets
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
