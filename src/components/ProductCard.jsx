// src/components/ProductCard.jsx - Fixed wishlist heart icon update
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { 
    addToCart, 
    toggleWishlist, 
    wishlist, 
    user, 
    openAuthModal
  } = useAppContext();

  // Add local state to track wishlist status with optimistic updates
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  // Check if product is in wishlist with more robust comparison
  const isInWishlist = React.useMemo(() => {
    if (!product || (!product.id && !product._id)) return false;
    
    const productId = (product._id || product.id)?.toString();
    const found = wishlist.some((item) => {
      const itemId = (item._id || item.id || item.productId)?.toString();
      return itemId === productId;
    });
    
    console.log(`Product ${productId} in wishlist:`, found, "Wishlist items:", wishlist.map(w => ({ id: w._id || w.id, name: w.name })));
    return found;
  }, [wishlist, product]);

  // Fixed handleToggleWishlist with proper state management
  const handleToggleWishlist = React.useCallback(async (e) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    
    if (!product || isTogglingWishlist) return;
    
    try {
      setIsTogglingWishlist(true);
      console.log("Starting wishlist toggle...", product.name);
      
      const priceDetails = calculatePriceDetails();
      const productForWishlist = {
        _id: product._id || product.id,
        id: product.id || product._id,
        name: product.name,
        price: priceDetails.finalPrice,
        discountPrice: priceDetails.finalPrice,
        originalPrice: priceDetails.originalPrice,
        image: product.image,
        category: product.category,
        brand: product.brand,
      };
      
      console.log("Toggling wishlist for:", productForWishlist.name, "Currently in wishlist:", isInWishlist);
      await toggleWishlist(productForWishlist);
      console.log("Wishlist toggle completed");
      
    } catch (error) {
      console.error("Error toggling wishlist:", error);
    } finally {
      // Add a small delay to ensure state has propagated
      setTimeout(() => {
        setIsTogglingWishlist(false);
      }, 100);
    }
  }, [product, toggleWishlist, user, openAuthModal, isInWishlist, isTogglingWishlist]);

  // Early return AFTER all hooks
  if (!product || (!product.id && !product._id)) {
    return null;
  }

  // Calculate discount amount and final price
  const calculatePriceDetails = () => {
    if (product.discount > 0 && product.originalPrice) {
      const originalPrice = product.originalPrice;
      const discountAmount = (originalPrice * product.discount) / 100;
      const finalPrice = originalPrice - discountAmount;
      
      return {
        originalPrice,
        discountAmount: Math.round(discountAmount),
        finalPrice: Math.round(finalPrice),
        hasDiscount: true
      };
    }
    
    return {
      originalPrice: product.price,
      discountAmount: 0,
      finalPrice: product.price,
      hasDiscount: false
    };
  };

  const priceDetails = calculatePriceDetails();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    
    const productToAdd = {
      _id: product._id || product.id,
      id: product.id || product._id,
      name: product.name,
      price: priceDetails.finalPrice,
      discountPrice: priceDetails.finalPrice,
      originalPrice: priceDetails.originalPrice,
      image: product.image,
      stock: product.stock || 999,
      discount: product.discount || 0,
      description: product.description,
      category: product.category,
      brand: product.brand,
    };
    
    console.log("Adding product to cart:", productToAdd.name);
    addToCart(productToAdd);
  };

  const handleProductClick = () => {
    navigate(`/product/${product.slug}`);
  };

  return (
    <div 
      className="group bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={handleProductClick}
    >
      {/* Product image */}
      <div className="relative overflow-hidden">
        <div className="aspect-square">
          <img
            src={product.image || '/placeholder-image.jpg'}
            alt={product.name || 'Product'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        </div>

        {/* Discount badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist button with improved state handling */}
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
            isInWishlist
              ? "bg-red-500 text-white shadow-lg transform scale-110"
              : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 shadow-md"
          } ${isTogglingWishlist ? 'opacity-70' : ''}`}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            fill={isInWishlist ? "currentColor" : "none"}
            className={`transition-all duration-200 ${isInWishlist ? "text-white" : ""} ${
              isTogglingWishlist ? 'animate-pulse' : ''
            }`}
          />
        </button>
      </div>

      {/* Product info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-divine-orange transition-colors duration-300">
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-divine-orange">
              ₹{priceDetails.finalPrice}
            </span>
            {priceDetails.hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₹{priceDetails.originalPrice}
              </span>
            )}
          </div>
          
          {priceDetails.hasDiscount && (
            <div className="text-xs text-green-600 font-semibold">
              You save ₹{priceDetails.discountAmount} ({product.discount}% off)
            </div>
          )}
        </div>

        {/* Stock status */}
        <div className="mb-3">
          {product.inStock || product.stock > 0 ? (
            <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
              ✓ In Stock
            </span>
          ) : (
            <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">
              ✗ Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock && !(product.stock > 0)}
          className={`w-full py-3 font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 ${
            product.inStock || product.stock > 0
              ? "bg-divine-orange hover:bg-divine-orange/90 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <ShoppingCart size={16} />
          {product.inStock || product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;