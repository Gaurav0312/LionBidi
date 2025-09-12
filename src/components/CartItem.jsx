// src/components/CartItem.jsx
import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAppContext } from "../context/AppContext";

// Premium-white CartItem (discount-aware)
const CartItem = ({ item }) => {
  const { updateCartQuantity, removeFromCart } = useAppContext();

  /* -------------------------------------------------------------------- */
  /*  Derived values                                                      */
  /* -------------------------------------------------------------------- */
  const price = item.finalPrice ?? item.price;                     // payable
  const hasDiscount = (item.discountAmount ?? 0) > 0;
  const originalPrice =
    hasDiscount && item.originalPrice
      ? item.originalPrice
      : price + (item.discountAmount ?? 0);
  const lineTotal = price * item.quantity;

  return (
    <div className="group relative bg-white/90 border border-orange-200 rounded-xl shadow-sm hover:shadow-lg transition">
      {/* subtle hover ring */}
      <div className="absolute inset-0 rounded-xl ring-0 group-hover:ring-2 ring-orange-300/60 transition" />

      <div className="relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
        {/* Product image */}
        <div className="relative flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border border-orange-200"
          />

          {/* small badge */}
          {/* <span className="absolute -top-1 -right-1 p-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow">
            <Flame className="w-3 h-3 text-white" />
          </span> */}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <h4 className="text-sm sm:text-base font-medium text-gray-800 leading-tight">
            {item.name.length > 30 ? `${item.name.slice(0, 30)}…` : item.name}
          </h4>

          {/* price block */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              ₹{price}
            </span>

            {hasDiscount && (
              <>
                <span className="text-sm text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  You save ₹{item.discountAmount}
                </span>
              </>
            )}

            <p className="text-xs sm:text-sm text-gray-600">
              ₹{price} × {item.quantity} ={" "}
              <span className="text-orange-600 font-semibold">₹{lineTotal}</span>
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
              className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition"
            >
              <Minus size={12} />
            </button>

            <span className="px-3 py-1 rounded-md bg-gray-100 border border-gray-300 text-sm font-semibold text-gray-700">
              {item.quantity}
            </span>

            <button
              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
              className="p-2 rounded-md border border-gray-300 bg-gray-100 text-gray-600 hover:text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition"
            >
              <Plus size={12} />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.id)}
            className="p-2 text-red-500 hover:text-red-600 transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
