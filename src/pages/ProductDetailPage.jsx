// ProductDetailPage.jsx
import React, { useState, useEffect } from "react";
import {
  Heart,
  Star,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Share,
  MessageCircle,
  ThumbsUp,
  ChevronLeft,
  ChevronRight,
  Check,
  Flame,
  Leaf,
  Crown,
  Phone,
  Gem,
  X,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { generateSlug } from "../utils/slugify";
import ProductCard from "../components/ProductCard";
import HandCraftedIcon from "../components/HandCraftedIcon";

// Updated product data structure - using slugs as keys
const productData = {
  "special-lion-bidi-big": {
    id: 1,
    name: "SPECIAL LION BIDI ( BIG )",
    slug: generateSlug("special-lion-bidi-big"),
    price: 280,
    originalPrice: 400,
    discount: 30,
    rating: 4.5,
    reviewCount: 54,
    minQuantity: 2,
    bulkPricing: [
      { minQty: 10, discount: 10, label: "Buy 10+ pieces: Save ₹10 each" },
      { minQty: 20, discount: 15, label: "Buy 20+ pieces: Save ₹15 each" },
      { minQty: 30, discount: 20, label: "Buy 30+ pieces: Save ₹20 each" },
    ],
    inStock: true,
    stockCount: 10000,
    description:
      "Experience the authentic natural taste with our Premium Special Lion Bidi (Big). Handcrafted with the finest tobacco leaves for the ultimate smoking experience. Each bidi is hand-rolled by skilled artisans, guaranteeing a consistent and impeccably crafted product.",
    images: [
      "/LionBidi.jpg",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817964/Pack_sn7kgz.png", // In real app, these would be different angles
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817922/Bidi_iz0x7a.jpg",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817934/Big_niemxu.jpg",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817983/Top_qpiobl.jpg",
    ],
    features: [
      "Superior Quality: Hand-rolled by skilled artisans",
      "Rich Flavor: Bold and distinctive taste blend",
      "Smooth Smoke: Superior quality tobacco leaves",
      "Slow Burn: Designed to burn slowly for extended sessions",
      "Authentic Feel: Traditional hand-rolled experience",
    ],
    specifications: {
      Type: "Premium Bidi (Big)",
      Quantity: "20 pieces per pack",
      "Tobacco Type": "Natural Tobacco Leaves",
      Size: "Large (Big)",
      Manufacturing: "Hand-rolled",
      Origin: "India",
    },
    benefits: [
      {
        icon: <Star className="w-6 h-6 text-yellow-600" />,
        title: "Premium Quality",
        description: "Made from finest tobacco leaves",
      },
      {
        icon: <Flame className="w-6 h-6 text-orange-600" />,
        title: "Slow Burning",
        description: "Extended smoking sessions",
      },
      {
        icon: <HandCraftedIcon className="w-6 h-6 text-amber-700" />,
        title: "Hand Crafted",
        description: "Skilled artisan rolled",
      },
      {
        icon: <Leaf className="w-6 h-6 text-green-600" />,
        title: "Natural Taste",
        description: "Authentic tobacco flavor",
      },
    ],
  },
  "special-lion-bidi-small": {
    id: 2,
    name: "Special Lion Bidi ( Small )",
    slug: generateSlug("special-lion-bidi-small"),
    price: 210,
    originalPrice: 300,
    discount: 30,
    rating: 4.3,
    reviewCount: 89,
    minQuantity: 2,
    bulkPricing: [
      { minQty: 10, discount: 10, label: "Buy 10+ pieces: Save ₹10 each" },
      { minQty: 20, discount: 15, label: "Buy 20+ pieces: Save ₹15 each" },
      { minQty: 30, discount: 20, label: "Buy 30+ pieces: Save ₹20 each" },
    ],
    inStock: true,
    stockCount: 20000,
    description:
      "Compact version of our premium bidi collection. Perfect for those who want to try our premium quality in a smaller quantity. Hand-rolled with the same attention to detail as our larger packs.",
    images: [
      "/LionBidi.jpg",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817964/Pack_sn7kgz.png",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817974/Small_qo6ylj.jpg",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817922/Bidi_iz0x7a.jpg",
      "https://res.cloudinary.com/dxqerqng1/image/upload/v1754817983/Top_qpiobl.jpg",
    ],
    features: [
      "Superior Quality: Hand-rolled by skilled artisans",
      "Rich Flavor: Bold and distinctive taste blend",
      "Smooth Smoke: Superior quality tobacco leaves",
      "Slow Burn: Designed to burn slowly for extended sessions",
      "Authentic Feel: Traditional hand-rolled experience",
    ],
    specifications: {
      Type: "Premium Bidi (Big)",
      Quantity: "20 pieces per pack",
      "Tobacco Type": "Natural Tobacco Leaves",
      Size: "Large (Big)",
      Manufacturing: "Hand-rolled",
      Origin: "India",
    },
    benefits: [
      {
        icon: <Star className="w-6 h-6 text-yellow-600" />,
        title: "Premium Quality",
        description: "Made from finest tobacco leaves",
      },
      {
        icon: <Flame className="w-6 h-6 text-orange-600" />,
        title: "Slow Burning",
        description: "Extended smoking sessions",
      },
      {
        icon: <Gem className="w-6 h-6 text-orange-600" />,
        title: "Value Pack",
        description: "Perfect for trying",
      },
      {
        icon: <Leaf className="w-6 h-6 text-green-600" />,
        title: "Natural Taste",
        description: "Authentic tobacco flavor",
      },
    ],
  },
};

// Sample reviews data
const reviewsData = [
  {
    id: 1,
    user: "Rajesh Kumar",
    rating: 5,
    date: "2 days ago",
    comment:
      "Excellent quality! The taste is authentic and burns slowly. Worth every penny.",
    verified: true,
    helpful: 12,
    isHelpful: false,
  },
  {
    id: 2,
    user: "Anil Singh",
    rating: 4,
    date: "5 days ago",
    comment: "Good product, nice packaging. Fast delivery too. Recommended!",
    verified: true,
    helpful: 8,
    isHelpful: false,
  },
  {
    id: 3,
    user: "Mohit Sharma",
    rating: 5,
    date: "1 week ago",
    comment: "Best bidi I've tried. Premium quality at reasonable price.",
    verified: false,
    helpful: 6,
    isHelpful: false,
  },
];

// Updated similar products data with slugs

const ProductDetailPage = () => {
  const { slug } = useParams(); // Get product slug from URL
  const navigate = useNavigate();

  // Get context functions
  const { addToCart, addToWishlist, wishlist, user, openAuthModal } =
    useAppContext();

  // Component state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState(reviewsData);
  const [showShareModal, setShowShareModal] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentProduct, setCurrentProduct] = useState(null);
  //  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const similarProducts = React.useMemo(() => {
    if (!currentProduct) return [];
    return Object.values(productData)
      .filter((p) => p.slug !== currentProduct.slug)
      .map((p) => ({
        ...p,
        image: p.images?.[0] || "/placeholder-image.jpg", // ✅ pick first image
      }));
  }, [currentProduct]);

  // Check if product is in wishlist
  // const isWishlisted = currentProduct
  //   ? wishlist.some((item) => item.id === currentProduct.id)
  //   : false;

  // Or better, update it in useEffect when product loads:
  useEffect(() => {
    if (currentProduct) {
      setQuantity(currentProduct.minQuantity || 1);
    }
  }, [currentProduct]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch product data when component mounts or slug changes
  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);

      const product = productData[slug];

      if (product) {
        setCurrentProduct(product);
      } else {
        // Product not found, redirect to home or show error
        setCurrentProduct(null);
      }

      setLoading(false);
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"
            aria-hidden="true"
          ></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Calculate savings
  const savings = currentProduct.originalPrice
    ? currentProduct.originalPrice - currentProduct.price
    : 0;
  const discountPercent = currentProduct.originalPrice
    ? Math.round((savings / currentProduct.originalPrice) * 100)
    : 0;

  // Handle quantity changes with minimum quantity validation
  const incrementQuantity = () => {
    console.log("Current quantity:", quantity);
    console.log("Stock count:", currentProduct.stockCount);
    console.log("Stock count type:", typeof currentProduct.stockCount);

    const maxStock = parseInt(currentProduct.stockCount) || 10000;
    console.log("Max stock after parsing:", maxStock);
    console.log("Can increment?", quantity < maxStock);

    if (quantity < maxStock) {
      setQuantity(quantity + 1);
      console.log("Quantity incremented to:", quantity + 1);
    }
  };

  const decrementQuantity = () => {
    const minQty = currentProduct.minQuantity || 1;
    if (quantity > minQty) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    const minQty = currentProduct.minQuantity || 1;
    if (quantity < minQty) {
      setCartMessage(`Minimum order quantity is ${minQty} pieces`);
      setTimeout(() => setCartMessage(""), 3000);
      return;
    }

    setIsAddingToCart(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Calculate bulk pricing
      const bulkCalc = calculateBulkPrice(
        quantity,
        currentProduct.price,
        currentProduct.bulkPricing
      );

      // Create product with bulk pricing applied - FIXED VERSION
      const productToAdd = {
        ...currentProduct,
        _id: currentProduct.id, // Ensure consistent ID
        id: currentProduct.id,
        price: currentProduct.price, // Use discounted price if applicable
        discountPrice: currentProduct.price,
        originalPrice: currentProduct.originalPrice,
        image: currentProduct.images?.[0] || currentProduct.image,
        // Remove React nodes from the product object
        benefits: undefined,
        specifications: undefined,
        features: currentProduct.features?.filter((f) => typeof f === "string"),
      };

      console.log("Adding to cart:", { product: productToAdd, quantity });

      // ✅ FIXED: Add once with the correct quantity
      await addToCart(productToAdd, quantity, true);

      const message =
        bulkCalc.savings > 0
          ? `${quantity} items added to cart! You saved ₹${bulkCalc.savings} with bulk pricing!`
          : `${quantity} items added to cart successfully!`;

      setCartMessage(message);
      setTimeout(() => setCartMessage(""), 4000);
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartMessage("Failed to add product to cart");
      setTimeout(() => setCartMessage(""), 3000);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!user) {
      openAuthModal();
      return;
    }

    addToWishlist(currentProduct);
  };

  // Handle review helpful
  const handleReviewHelpful = (reviewId) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              helpful: review.isHelpful
                ? review.helpful - 1
                : review.helpful + 1,
              isHelpful: !review.isHelpful,
            }
          : review
      )
    );
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentProduct.name,
          text: `Check out this amazing product: ${currentProduct.name}`,
          url: window.location.href,
        });
      } catch (error) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  // Helper function to clean product data
  const cleanProductForCart = (product) => {
    const {
      benefits, // Remove React nodes
      specifications, // Keep this as it's just strings
      ...cleanProduct
    } = product;

    return {
      ...cleanProduct,
      // Ensure we have proper image
      image: product.images?.[0] || product.image,
      // Filter out any React nodes from features if they exist
      features: product.features?.filter((f) => typeof f === "string"),
    };
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCartMessage("Link copied to clipboard!");
    setTimeout(() => setCartMessage(""), 2000);
    setShowShareModal(false);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle similar product click - CORRECTED to use slug
  const handleSimilarProductClick = (productSlug) => {
    navigate(`/product/${productSlug}`);
  };

  // Calculate bulk pricing discount
  const calculateBulkPrice = (quantity, basePrice, bulkPricing) => {
    if (!bulkPricing || bulkPricing.length === 0) {
      return { price: basePrice, discount: 0, savings: 0 };
    }

    // Find the applicable bulk discount (highest quantity threshold met)
    const applicableDiscount = bulkPricing
      .filter((tier) => quantity >= tier.minQty)
      .sort((a, b) => b.minQty - a.minQty)[0]; // Get highest threshold met

    if (applicableDiscount) {
      const discountedPrice = basePrice - applicableDiscount.discount;
      const totalSavings = applicableDiscount.discount * quantity;
      return {
        price: discountedPrice,
        discount: applicableDiscount.discount,
        savings: totalSavings,
        tier: applicableDiscount,
      };
    }

    return { price: basePrice, discount: 0, savings: 0 };
  };

  const getBulkDiscount = (qty) => {
    const applicable = currentProduct.bulkPricing
      .filter((bulk) => qty >= bulk.minQty)
      .sort((a, b) => b.minQty - a.minQty);
    return applicable.length > 0 ? applicable[0] : null;
  };
  const calculateDiscountedPrice = () => {
    const bulkDiscount = getBulkDiscount(quantity);
    return bulkDiscount
      ? currentProduct.price - bulkDiscount.discount
      : currentProduct.price;
  };

  // Inside ProductDetailPage component
  const handleBuyNow = () => {
    if (!user) {
      openAuthModal();
      return;
    }

    const bulkCalc = calculateBulkPrice(
      quantity,
      currentProduct.price,
      currentProduct.bulkPricing
    );

    // Create a safe product object without React nodes
    const productToBuy = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: bulkCalc.price,
      quantity,
      image: currentProduct.images
        ? currentProduct.images[0]
        : currentProduct.image,
    };

    console.log("💳 Buy Now - Product data for address page:", productToBuy);

    // 🔥 Navigate to ADDRESS page first (same as cart flow)
    navigate("/address", {
      state: {
        product: productToBuy,
        fromBuyNow: true, // Optional flag to identify buy now flow
      },
    });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50">
      {/* Cart Message */}
      {cartMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>{cartMessage}</span>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Share Product</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close share modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => copyToClipboard(window.location.href)}
                className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
              >
                Copy Link
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  )
                }
                className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
              >
                Share on WhatsApp
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://t.me/share/url?url=${encodeURIComponent(
                      window.location.href
                    )}`,
                    "_blank"
                  )
                }
                className="w-full text-left p-3 hover:bg-gray-100 rounded-lg"
              >
                Share on Telegram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav
            className="text-sm text-gray-600 flex items-center"
            aria-label="Breadcrumb"
          >
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 hover:text-orange-600 mr-4 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="hover:text-orange-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 rounded px-1"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-orange-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-300 rounded px-1"
            >
              Products
            </button>
            <span className="mx-2">/</span>
            <span className="hover:text-orange-600 cursor-pointer px-1">
              Bidi
            </span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium px-1">
              {currentProduct.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="flex flex-col lg:sticky lg:top-24">
            {/* Main Image */}
            <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-square">
                <img
                  src={
                    currentProduct.images
                      ? currentProduct.images[selectedImageIndex]
                      : currentProduct.image
                  }
                  alt={currentProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Image Navigation */}
              {currentProduct.images && currentProduct.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    disabled={selectedImageIndex === 0}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      setSelectedImageIndex(
                        Math.min(
                          (currentProduct.images?.length || 1) - 1,
                          selectedImageIndex + 1
                        )
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    disabled={
                      selectedImageIndex ===
                      (currentProduct.images?.length || 1) - 1
                    }
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {currentProduct.images && currentProduct.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto -mx-1 px-1">
                {currentProduct.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View image ${index + 1}`}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-orange-200 ${
                      selectedImageIndex === index
                        ? "border-orange-500 ring-2 ring-orange-200"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Product view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                {currentProduct.name}
              </h1>

              {/* Rating and Reviews */}
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className="flex items-center space-x-1"
                  title={`${currentProduct.rating} out of 5`}
                >
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(currentProduct.rating || 4.5)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-lg font-semibold text-gray-700 ml-2">
                    {currentProduct.rating || 4.5}
                  </span>
                </div>
                <div className="text-gray-500">
                  ({currentProduct.reviewCount || 127} reviews)
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-orange-600">
                  ₹{currentProduct.price}
                </span>
                {currentProduct.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      ₹{currentProduct.originalPrice}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                      Save ₹{savings}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2 mb-6">
                {currentProduct.inStock !== false ? (
                  <>
                    <div
                      className="w-3 h-3 bg-green-500 rounded-full"
                      aria-hidden="true"
                    ></div>
                    <span className="text-green-700 font-medium">
                      Available In Stock
                    </span>
                  </>
                ) : (
                  <>
                    <div
                      className="w-3 h-3 bg-red-500 rounded-full"
                      aria-hidden="true"
                    ></div>
                    <span className="text-red-700 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 gap-3">
              {currentProduct.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl" aria-hidden="true">
                      {benefit.icon}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {benefit.title}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {benefit.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              {/* Bulk Pricing Info - Add this BEFORE quantity selector */}
              {currentProduct.bulkPricing &&
                currentProduct.bulkPricing.length > 0 && (
                  <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl p-6 border border-orange-200">
                    <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                      <Crown className="w-5 h-5 mr-2" />
                      Bulk Pricing Available
                    </h3>
                    <ul className="text-orange-700 text-sm space-y-2">
                      {currentProduct.bulkPricing.map((tier, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span>• {tier.label}</span>
                          {quantity >= tier.minQty && (
                            <span className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              ACTIVE
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-800 font-medium">Quantity:</span>
                  <div className="flex items-center border-2 border-orange-200 rounded-full overflow-hidden">
                    <button
                      onClick={decrementQuantity}
                      className="p-3 hover:bg-orange-50 transition-colors duration-200"
                      disabled={quantity <= (currentProduct.minQuantity || 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-orange-600" />
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold text-gray-800 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      className="p-3 hover:bg-orange-50 transition-colors duration-200"
                      disabled={quantity >= (currentProduct.stockCount || 100)}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-orange-600" />
                    </button>
                  </div>
                </div>

                {/* Enhanced pricing display with bulk calculations */}
                <div className=" text-lg font-bold text-gray-800">
                  {(() => {
                    const bulkCalc = calculateBulkPrice(
                      quantity,
                      currentProduct.price,
                      currentProduct.bulkPricing
                    );

                    return (
                      <div>
                        {/* Discount / Normal Total */}
                        <div>
                          {bulkCalc.discount > 0 ? (
                            <>
                              <span className="line-through text-gray-800 text-base font-bold">
                                ₹{currentProduct.price * quantity}
                              </span>
                              <span className="ml-2 text-orange-600">
                                ₹{bulkCalc.price * quantity}
                              </span>
                            </>
                          ) : (
                            <span>
                              Total: ₹{currentProduct.price * quantity}
                            </span>
                          )}
                        </div>

                        {/* Savings Message */}
                        {bulkCalc.savings > 0 && (
                          <div className="text-orange-600 text-xs font-medium mt-1">
                            You save ₹{bulkCalc.savings}!
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Quick quantity buttons for bulk orders */}
              {currentProduct.bulkPricing && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-600 text-sm mr-2">
                    Quick select:
                  </span>
                  {currentProduct.bulkPricing.map((tier, index) => (
                    <button
                      key={index}
                      onClick={() => setQuantity(tier.minQty)}
                      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                        quantity === tier.minQty
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-green-700 border-green-300 hover:bg-green-50"
                      }`}
                      aria-pressed={quantity === tier.minQty}
                    >
                      {tier.minQty}+ pcs
                    </button>
                  ))}
                </div>
              )}

              {/* Minimum quantity notice */}
              {currentProduct.minQuantity > 1 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>Minimum order:</strong> {currentProduct.minQuantity}{" "}
                    pieces required
                  </p>
                </div>
              )}

              {/* Add to Cart Button with bulk pricing consideration */}
              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={
                    isAddingToCart ||
                    !currentProduct.inStock ||
                    quantity < (currentProduct.minQuantity || 1)
                  }
                  className="flex-1 bg-divine-orange hover:bg-divine-orange/90 text-white font-bold py-4 px-6 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    {isAddingToCart
                      ? "Adding..."
                      : (() => {
                          const bulkCalc = calculateBulkPrice(
                            quantity,
                            currentProduct.price,
                            currentProduct.bulkPricing
                          );
                          return bulkCalc.discount > 0
                            ? `Add to Cart - ₹${bulkCalc.price * quantity}`
                            : "Add to Cart";
                        })()}
                  </span>
                </button>

                {/* Keep existing wishlist and share buttons */}
                <button
                  onClick={handleWishlistToggle}
                  className={`p-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-200 ${
                    isWishlisted
                      ? "bg-red-50 border-red-300 text-red-600"
                      : "bg-white border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600"
                  }`}
                  aria-pressed={isWishlisted}
                  aria-label={
                    isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <Heart
                    className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                  />
                </button>

                <button
                  onClick={handleShare}
                  className="p-4 bg-white border-2 border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  aria-label="Share product"
                >
                  <Share className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleBuyNow}
                  disabled={!currentProduct.inStock}
                  className="w-full bg-divine-orange hover:bg-divine-orange/90 text-white font-bold py-4 px-6 rounded-full text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Buy Now
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button className="flex items-center justify-center space-x-2 p-3 border-2 border-orange-200 rounded-full hover:bg-orange-50 transition-colors duration-200">
                  <Share className="w-5 h-5 text-divine-orange" />
                  <span className="text-sm text-divine-orange font-medium">
                    Share
                  </span>
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="flex items-center justify-center space-x-2 p-3 border-2 border-orange-200 rounded-full hover:bg-orange-50 transition-colors duration-200"
                >
                  <MessageCircle className="w-5 h-5 text-divine-orange" />
                  <span className="text-sm text-divine-orange font-medium">
                    Ask
                  </span>
                </button>
                <a
                  href="tel:+919589773525"
                  className="flex items-center justify-center space-x-2 p-3 border-2 border-orange-200 rounded-full hover:bg-orange-50 transition-colors duration-200"
                >
                  <Phone className="w-5 h-5 text-divine-orange" />
                  <span className="text-sm text-divine-orange font-medium">
                    Call
                  </span>
                </a>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold text-gray-900 text-lg mb-4">
                Delivery & Services
              </h3>

              <div className="grid grid-cols-3 text-center sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-8 h-8 text-orange-500 mx-auto" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Free Delivery
                    </div>
                    <div className="text-sm text-gray-600">
                      On orders above ₹1000
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="w-8 h-8 text-green-500 mx-auto" />

                  <div>
                    <div className="font-medium text-gray-900">
                      Secure Payment
                    </div>
                    <div className="text-sm text-gray-600">
                      100% safe & secure
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-8 h-8 text-blue-500 mx-auto" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Easy Returns
                    </div>
                    <div className="text-sm text-gray-600">
                      7 days return policy
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav
              className="flex space-x-8"
              role="tablist"
              aria-label="Product tabs"
            >
              {["description", "specifications", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === "description" && (
              <div className="max-w-4xl">
                <div className="bg-white p-8 rounded-2xl border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Product Description
                  </h3>
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">
                    {currentProduct.description}
                  </p>

                  <h4 className="text-xl font-bold text-gray-900 mb-4">
                    ✨ Key Features:
                  </h4>
                  <ul className="space-y-3">
                    {currentProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === "specifications" && (
              <div className="max-w-4xl">
                <div className="bg-white p-8 rounded-2xl border border-gray-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentProduct.specifications).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-3 border-b border-gray-100"
                        >
                          <span className="font-medium text-gray-700">
                            {key}:
                          </span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="max-w-4xl space-y-6">
                {/* Reviews Summary */}
                <div className="bg-white p-8 rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Customer Reviews
                    </h3>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors">
                      Write a Review
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">
                        {currentProduct.rating || 4.5}
                      </div>
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(currentProduct.rating || 4.5)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-gray-600">
                        Based on {currentProduct.reviewCount || 127} reviews
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const percentage = Math.floor(Math.random() * 50) + 20;
                        return (
                          <div
                            key={stars}
                            className="flex items-center space-x-3 mb-2"
                          >
                            <span className="text-sm font-medium w-8">
                              {stars}★
                            </span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white p-6 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {review.user.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 flex items-center">
                              {review.user}
                              {review.verified && (
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                                  Verified Purchase
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-gray-500 text-sm">
                                {review.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleReviewHelpful(review.id)}
                          className={`flex items-center space-x-1 transition-colors ${
                            review.isHelpful
                              ? "text-green-600"
                              : "text-gray-600 hover:text-green-600"
                          }`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${
                              review.isHelpful ? "fill-current" : ""
                            }`}
                          />
                          <span className="text-sm">
                            Helpful ({review.helpful})
                          </span>
                        </button>
                        <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">Reply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Similar Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover more premium bidi products from our collection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
