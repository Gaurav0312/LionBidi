// Cart.jsx - FIXED: Navigate to Address Page
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  Truck,
  Shield,
  Crown,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Cart = ({ isCartOpen, setIsCartOpen, handleNavigate }) => {
  const navigate = useNavigate();
  const {
    cartItems = [],
    getCartTotal,
    getCartItemsCount,
    updateCartItemQuantity,
    removeFromCart,
    setCartItems,
    addToCart,
    user,
    openAuthModal,
    loadCart,
  } = useAppContext();

  const [localCartItems, setLocalCartItems] = useState([]);

  useEffect(() => {
    console.log("🔄 Syncing local cart with context cart:", cartItems.length, "items");
    setLocalCartItems(cartItems);
  }, [cartItems]);

  console.log("🛒 Cart component rendered with items:", localCartItems.length);

  const cartTotal = getCartTotal ? getCartTotal() : 0;
  const cartCount = getCartItemsCount ? getCartItemsCount() : localCartItems.length;

  const getItemId = (item) => {
    const id = item.productId || item._id || item.id;
    console.log("🔍 Getting item ID for:", item.name, "ID:", id, "Available fields:", {
      productId: item.productId,
      _id: item._id,
      id: item.id,
    });
    return id;
  };

  const calculateCartSavings = () => {
    console.log("💰 Calculating cart savings...");

    let savings = 0;
    let totalQuantity = 0;
    let subtotal = 0;

    localCartItems.forEach((item) => {
      const itemQuantity = item.quantity || 0;
      const itemPrice = item.price || 0;
      const originalPrice = item.originalPrice || itemPrice;

      totalQuantity += itemQuantity;
      subtotal += itemPrice * itemQuantity;

      if (originalPrice > itemPrice) {
        savings += (originalPrice - itemPrice) * itemQuantity;
      }
    });

    let bulkDiscountPerPiece = 0;
    if (totalQuantity >= 30) {
      bulkDiscountPerPiece = 20;
    } else if (totalQuantity >= 20) {
      bulkDiscountPerPiece = 15;
    } else if (totalQuantity >= 10) {
      bulkDiscountPerPiece = 10;
    }

    let bulkDiscount = 0;
    if (bulkDiscountPerPiece > 0) {
      bulkDiscount = bulkDiscountPerPiece * totalQuantity;
      savings += bulkDiscount;
    }

    return {
      savings,
      bulkDiscountPerPiece,
      totalQuantity,
      subtotal,
      bulkDiscount,
    };
  };

  const {
    savings: cartSavings,
    bulkDiscountPerPiece,
    totalQuantity,
  } = calculateCartSavings();

  const finalTotal = Math.max(0, cartTotal - cartSavings);

  const handleIncrement = (item) => {
    const itemId = getItemId(item);
    console.log("➕ Incrementing item:", item.name, "ID:", itemId, "Current quantity:", item.quantity);

    if (!itemId) {
      console.error("❌ Cannot increment: item ID is missing");
      return;
    }

    if (updateCartItemQuantity && typeof updateCartItemQuantity === "function") {
      console.log("➕ Using updateCartItemQuantity to increment");
      updateCartItemQuantity(itemId, (item.quantity || 1) + 1);
    } else if (setCartItems && typeof setCartItems === "function") {
      console.log("➕ Using setCartItems fallback to increment");
      setCartItems((prevItems) => {
        const updatedItems = prevItems.map((cartItem) => {
          const cartItemId = getItemId(cartItem);
          if (cartItemId === itemId) {
            console.log("➕ Found item to update:", cartItem.name, "New quantity:", cartItem.quantity + 1);
            return { ...cartItem, quantity: cartItem.quantity + 1 };
          }
          return cartItem;
        });

        try {
          localStorage.setItem("cart", JSON.stringify(updatedItems));
          console.log("➕ Cart saved to localStorage");
        } catch (e) {
          console.error("❌ Failed to update localStorage:", e);
        }

        return updatedItems;
      });
    } else if (addToCart && typeof addToCart === "function") {
      console.log("➕ Using addToCart fallback");
      addToCart(item);
    } else {
      console.error("❌ No increment function available!");
    }
  };

  const handleDecrement = async (item) => {
    const itemId = getItemId(item);
    const currentQuantity = item.quantity || 1;
    const newQuantity = currentQuantity - 1;

    console.log("➖ DECREMENT START:", {
      itemName: item.name,
      itemId: itemId,
      currentQuantity: currentQuantity,
      newQuantity: newQuantity,
    });

    if (!itemId) {
      console.error("❌ Cannot decrement: item ID is missing");
      return;
    }

    try {
      if (newQuantity <= 0) {
        console.log("➖ Quantity will be <= 0, removing item");
        await handleRemove(item);
      } else {
        console.log("➖ Decrementing quantity to:", newQuantity);

        setLocalCartItems((prev) =>
          prev.map((cartItem) =>
            getItemId(cartItem) === itemId
              ? { ...cartItem, quantity: newQuantity }
              : cartItem
          )
        );

        if (updateCartItemQuantity && typeof updateCartItemQuantity === "function") {
          console.log("➖ Calling updateCartItemQuantity");
          await updateCartItemQuantity(itemId, newQuantity);
        } else {
          console.error("❌ updateCartItemQuantity function not available");
        }
      }
    } catch (error) {
      console.error("❌ Error in handleDecrement:", error);
    }
  };

  const handleRemove = async (item) => {
    const itemId = getItemId(item);
    console.log("🗑️ REMOVE START:", item.name, "ID:", itemId);

    try {
      setLocalCartItems((prev) => {
        const filtered = prev.filter(
          (cartItem) => getItemId(cartItem) !== itemId
        );
        console.log("🗑️ Local state updated after removal, items remaining:", filtered.length);
        return filtered;
      });

      try {
        const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const updatedCart = currentCart.filter(
          (cartItem) => cartItem._id !== itemId && cartItem.id !== itemId
        );
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        console.log("🗑️ localStorage updated after removal");
      } catch (e) {
        console.error("❌ localStorage update failed:", e);
      }

      if (removeFromCart && typeof removeFromCart === "function") {
        console.log("🗑️ Calling removeFromCart for server sync");
        await removeFromCart(itemId);
      }

      console.log("🗑️ REMOVE COMPLETE");
    } catch (error) {
      console.error("❌ Error in handleRemove:", error);
    }
  };

  // 🔥 FIXED: Navigate to Address Page First
  const handleCheckout = () => {
    console.log("💳 Checkout button clicked");

    if (!user) {
      console.log("💳 User not logged in, opening auth modal");
      openAuthModal();
      return;
    }

    console.log("💳 User logged in, proceeding to address page");
    
    const itemsForCheckout = cartItems.length > 0 ? cartItems : localCartItems;

    if (itemsForCheckout.length === 0) {
      console.warn("💳 No items in cart for checkout");
      return;
    }

    setIsCartOpen(false);

    // Prepare cart data for address page
    const cartData = {
      items: itemsForCheckout.map((item) => ({
        id: getItemId(item),
        name: item.name,
        price: item.discountPrice || item.price,
        quantity: item.quantity,
        image: item.image || (item.images ? item.images[0] : null),
      })),
      total: finalTotal,
      savings: cartSavings,
      subtotal: cartTotal,
      itemCount: localCartItems.length,
    };

    console.log("💳 Cart data for address page:", cartData);

    // 🔥 Navigate to ADDRESS page first, not checkout
    navigate("/address", { 
      state: { 
        cart: cartData 
      },
      replace: false
    });
  };

  console.log("🛒 Cart render data:", {
    cartItemsCount: cartItems.length,
    cartTotal,
    cartSavings,
    finalTotal,
    isOpen: isCartOpen,
  });

  return (
    <>
      {/* Backdrop Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md sm:w-96 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-out shadow-2xl ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Cart Header */}
        <div className="flex-shrink-0 bg-[#FF6B35] text-gray-50 px-6 py-2 border-b border-gray-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <ShoppingCart size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Shopping Cart</h2>
                <p className="text-sm text-orange-100">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Cart Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {localCartItems.length === 0 ? (
            // Empty Cart State
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart size={48} className="text-divine-orange" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Looks like you haven't added any products to your cart yet.
              </p>
              <button
                onClick={() => {
                  console.log("🛒 Navigate to products clicked");
                  setIsCartOpen(false);
                  if (handleNavigate && typeof handleNavigate === "function") {
                    handleNavigate("/products");
                  } else {
                    navigate("/products");
                  }
                }}
                className="bg-[#FF6B35] text-gray-50 px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all shadow-lg"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Scrollable Items Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  {/* Cart Items */}
                  {localCartItems.map((item) => {
                    const itemId = getItemId(item);

                    return (
                      <div
                        key={itemId}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={
                                item.images && item.images.length > 0
                                  ? item.images[0]
                                  : item.image || "/LionBidi.jpg"
                              }
                              alt={item.name || "Product"}
                              className="w-20 h-20 rounded-md object-cover shadow-lg border-2 border-gray-100"
                              onError={(e) => {
                                e.currentTarget.src = "/LionBidi.jpg";
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">
                              {item.name || "Unknown Product"}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {item.size && `Size: ${item.size}`}
                            </p>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex flex-col">
                                <span className="text-orange-600 font-bold text-sm">
                                  ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-xs text-gray-400 line-through">
                                    ₹{((item.originalPrice || 0) * (item.quantity || 1)).toFixed(2)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleDecrement(item)}
                                  className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {item.quantity || 1}
                                </span>
                                <button
                                  onClick={() => handleIncrement(item)}
                                  className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                                <button
                                  onClick={() => handleRemove(item)}
                                  className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded ml-2 transition-colors"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Bulk Discount Banner */}
                  {bulkDiscountPerPiece > 0 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-5 h-5 mr-2 text-orange-600" />
                          <div>
                            <div className="font-semibold text-orange-700">
                              Bulk Discount Applied: ₹{bulkDiscountPerPiece} per piece!
                            </div>
                            <div className="text-orange-600 mt-2 font-medium text-sm">
                              Total quantity: {totalQuantity} items • You saved ₹{Math.round(cartSavings)}
                            </div>
                          </div>
                        </div>
                        <div className="text-orange-600 font-bold text-lg">
                          -₹{Math.round(cartSavings)}
                        </div>
                      </div>

                      {totalQuantity < 30 && (
                        <div className="mt-3 ml-2 text-orange-600 text-sm">
                          {totalQuantity < 10 && (
                            <span>• Add {10 - totalQuantity} more items to save ₹10 per piece!</span>
                          )}
                          {totalQuantity >= 10 && totalQuantity < 20 && (
                            <span>• Add {20 - totalQuantity} more items to save ₹15 per piece!</span>
                          )}
                          {totalQuantity >= 20 && (
                            <span>• Add {30 - totalQuantity} more items to save ₹20 per piece!</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Cart Summary and Checkout Footer */}
        {localCartItems.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
            <div className="p-4 space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({totalQuantity} items)</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              {cartSavings > 0 && (
                <>
                  {localCartItems.some((item) => item.originalPrice > item.price) && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Product Discounts</span>
                      <span>-₹{(cartSavings - bulkDiscountPerPiece * totalQuantity).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-medium text-green-600 pt-2 border-t border-gray-200">
                    <span>Total Savings</span>
                    <span>-₹{cartSavings.toFixed(2)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total</span>
                <span className="text-orange-600">₹{finalTotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield size={12} />
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck size={12} />
                  <span>Free shipping ₹999+</span>
                </div>
              </div>

              {/* 🔥 Updated Button Text */}
              <button
                onClick={handleCheckout}
                className="w-full bg-[#FF6B35] hover:bg-orange-600 text-gray-50 font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Truck size={18} />
                Proceed to Address
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;