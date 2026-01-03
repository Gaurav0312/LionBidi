import React, { useState } from 'react';
import { Award, Sparkles, X, Gift, Zap } from 'lucide-react';

const PromoBar = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className="relative bg-[#FF6B35] text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/5 rounded-full blur-lg animate-bounce delay-500"></div>
        </div>
      </div>

      <div className="relative flex items-center justify-center py-2.5 px-4 min-h-[44px]">
        {/* Mobile Layout */}
        <div className="flex lg:hidden items-center justify-center gap-2 text-sm font-bold text-center">
          <Gift size={16} className="text-yellow-200 animate-bounce" />
          <span className="bg-white text-[#FF6B35] px-2.5 py-1 rounded-full text-xs font-extrabold shadow-lg">
            FREE SHIPPING
          </span>
          <span className="font-semibold">on ₹1499+</span>
          <Sparkles size={16} className="text-yellow-200 animate-pulse" />
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-yellow-200" />
            <span className="text-sm font-medium">🎉 Premium Launch Offer:</span>
          </div>
          
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
            <Zap size={16} className="text-yellow-200" />
            <span className="font-bold text-base tracking-wide">FREE SHIPPING</span>
            <span className="text-sm font-medium">on orders ₹1499+</span>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Limited time only!</span>
            <Sparkles size={16} className="text-yellow-200 animate-pulse" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 sm:right-4 p-1.5 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 group"
          aria-label="Close promotion banner"
        >
          <X size={14} className="sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>

      {/* Progress bar animation */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-yellow-200/30 w-full">
        <div className="h-full bg-yellow-200 animate-pulse shadow-sm"></div>
      </div>

      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
    </div>
  );
};

export default PromoBar;
