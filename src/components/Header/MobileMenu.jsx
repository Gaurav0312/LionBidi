//MobileMenu.jsx
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  X,
  Crown,
  Shield,
  Award,
  Truck,
  ChevronRight,
  User,
  ShoppingCart,
  Heart,
  UserPlus,
  Gift,
  Home,
  Package,
  Info,
  Phone,
  Settings,
  LogOut,
  Star,
  Zap,
  MapPin,
} from "lucide-react";

const MobileMenu = ({
  isOpen = false,
  onClose,
  user: propUser,
  userAddress,
  handleNavigate,
  handleLogout,
  openAuthModal,
  wishlist = [],
  cartCount = 0,
  cartSavings = 0,
  bulkDiscountPercent = 0,
  totalQuantity = 0,
  setIsCartOpen,
  setIsMenuOpen,
}) => {
  // Get user from context
  const { user: contextUser } = useAppContext();

  // Use context user first, fallback to prop
  const user = contextUser || propUser;

  const [isScrolled, setIsScrolled] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when user changes
  useEffect(() => {
    console.log("MobileMenu - user updated:", user);
    console.log("MobileMenu - user email:", user?.email);
    console.log("MobileMenu - user name:", user?.name);

    // Force a re-render by updating a state value
    setForceUpdate((prev) => prev + 1);
  }, [user, contextUser, propUser]);

  // Also watch for context user specifically
  useEffect(() => {
    if (contextUser) {
      console.log("MobileMenu - context user updated:", contextUser);
      setForceUpdate((prev) => prev + 1);
    }
  }, [contextUser]);

  // Configuration objects
  const navigationItems = useMemo(
    () => [
      { path: "/", label: "Home", icon: Home, desc: "Back to homepage" },
      {
        path: "/products",
        label: "Products",
        icon: Package,
        desc: "Browse our catalog",
      },
      { path: "/about", label: "About", icon: Info, desc: "Learn our story" },
      { path: "/contact", label: "Contact", icon: Phone, desc: "Get in touch" },
    ],
    []
  );

  const userActions = useMemo(
    () => [
      { path: "/profile", label: "My Profile", icon: User },
      { path: "/orders", label: "Orders", icon: ShoppingCart },
      {
        path: "/wishlist",
        label: "Wishlist",
        icon: Heart,
        badge: wishlist.length,
      },
      { path: "/settings", label: "Settings", icon: Settings },
    ],
    [wishlist.length]
  );

  const bulkDiscountTiers = useMemo(
    () => [
      { min: 5, discount: 5 },
      { min: 10, discount: 10 },
      { min: 20, discount: 15 },
      { min: 50, discount: 20 },
    ],
    []
  );

  const trustBadges = useMemo(
    () => [
      { icon: Shield, label: "Secure" },
      { icon: Award, label: "Certified" },
      { icon: Zap, label: "Fast" },
    ],
    []
  );

  // Event handlers
  const handleNavigateAndClose = useCallback(
    (path) => {
      console.log("handleNavigateAndClose called with path:", path);
      handleNavigate(path);
      onClose();
    },
    [handleNavigate, onClose]
  );

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
    onClose();
  }, [setIsCartOpen, onClose]);

  const handleLogoutAndClose = useCallback(() => {
    handleLogout();
    onClose();
  }, [handleLogout, onClose]);

  // Side effects
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [isOpen]);

  useEffect(() => {
    console.log("MobileMenu - user prop changed:", user);
    console.log("MobileMenu - user email:", user?.email);
    console.log("MobileMenu - user name:", user?.name);
  }, [user]);

  // Debug render check
  console.log(
    "MobileMenu render - user:",
    user,
    "isOpen:",
    isOpen,
    "forceUpdate:",
    forceUpdate
  );

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Component render guards
  if (!isOpen) return null;

  // Render helper components
  const Header = () => (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-orange-100"
          : "bg-white/98 backdrop-blur-md shadow border-b border-orange-200"
      }`}
    >
      <div className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/lion.png"
                alt="Lion Bidi"
                className="h-10 w-auto sm:h-12 lg:h-14 transition-all duration-300 group-hover:scale-105"
              />
            </div>
            <h2 className="text-3xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-[#FF6B35]">
              LION BIDI
            </h2>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-700 hover:text-divine-orange hover:bg-orange-50 rounded-lg transition-colors duration-200"
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
        </div>
      </div>
    </header>
  );

  const Navigation = () => (
    <nav className="space-y-1">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Navigation
      </h3>
      {navigationItems.map(({ path, label, icon: Icon, desc }) => (
        <button
          key={path}
          onClick={() => handleNavigateAndClose(path)}
          className="w-full flex items-center justify-between p-4 text-left rounded-xl hover:bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 border hover:border-orange-200 transition-colors duration-200 group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-200">
              <Icon size={16} className="text-divine-orange" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          </div>
          <ChevronRight
            size={16}
            className="text-gray-400 group-hover:text-gray-600"
          />
        </button>
      ))}
    </nav>
  );

  const BulkDiscountCard = () => {
    if (totalQuantity <= 0) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-3">
          <Gift size={18} className="text-green-600" />
          <p className="font-semibold text-gray-800 text-sm">
            Bulk Savings Active
          </p>
        </div>

        <div className="space-y-2 mb-3">
          {bulkDiscountTiers.map(({ min, discount }, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-xs"
            >
              <span className="text-gray-700">{min}+ items:</span>
              <span
                className={`font-semibold px-2 py-1 rounded-md ${
                  totalQuantity >= min
                    ? "bg-green-500 text-white"
                    : "text-green-600"
                }`}
              >
                {discount}% OFF
              </span>
            </div>
          ))}
        </div>

        {bulkDiscountPercent > 0 && (
          <div className="bg-green-500 text-white text-center py-2 px-3 rounded-xl">
            <p className="text-sm font-bold">
              🎉 {bulkDiscountPercent}% OFF on {totalQuantity} items!
            </p>
          </div>
        )}
      </div>
    );
  };

  const UserSection = () => {
    // Debug log in UserSection
    console.log("UserSection rendering - user:", user);

    if (!user) return <GuestSection />;

    return (
      <div className="space-y-4">
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Account
          </h3>

          {/* User Info Card */}
          <div className="bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 border border-orange-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <p className="font-bold text-orange-800">Welcome back!</p>
                <p className="font-semibold text-gray-800">
                  {user.name || "User"}
                </p>
                {user.email && (
                  <p className="text-sm text-orange-600">{user.email}</p>
                )}
              </div>
            </div>

            {/* Address Display Section */}
            {userAddress ? (
              <div className="bg-white rounded-lg p-3 border border-orange-200 shadow-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-orange-800 mb-1">
                      📍 Default Delivery Address
                    </div>
                    <div className="text-xs text-gray-700 space-y-1">
                      <div className="font-medium">{userAddress.name}</div>
                      <div className="text-gray-600">
                        {userAddress.street || userAddress.address}
                      </div>
                      <div className="text-gray-600">
                        {userAddress.city}, {userAddress.state} -{" "}
                        {userAddress.zipCode}
                      </div>
                      {userAddress.phone && (
                        <div className="text-gray-500">
                          📞 {userAddress.phone || userAddress.mobileNumber}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        handleNavigate("/address");
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 mt-2 font-medium underline"
                    >
                      Edit Address
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500 mb-1">
                      No delivery address saved
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        handleNavigate("/address");
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                    >
                      + Add Delivery Address
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Actions */}
          <div className="space-y-2 mb-4">
            {userActions.map(({ path, label, icon: Icon, badge }) => (
              <button
                key={path}
                onClick={() => handleNavigateAndClose(path)}
                className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:text-divine-orange hover:bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 transition-all duration-200 rounded-lg border border-gray-200 hover:border-orange-200"
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
                </div>
                {badge && badge > 0 && (
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-semibold">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Cart Button */}
          <CartButton />

          {/* Logout */}
          <button
            onClick={handleLogoutAndClose}
            className="w-full flex items-center justify-center space-x-2 p-3 text-divine-orange hover:bg-gradient-to-br from-orange-50 via-amber-25 to-yellow-50 border border-red-200 hover:border-orange-200 rounded-xl transition-colors duration-200 mt-4"
          >
            <LogOut size={16} />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  const GuestSection = () => (
    <div className="space-y-4">
      <div className="border-t border-gray-200 pt-4">
        {/* Guest Welcome */}
        <div className="text-center bg-orange-50 border border-orange-200 rounded-xl p-6 mb-4">
          <div className="relative mx-auto mb-3 flex justify-center">
            <img
              src="/lion.png"
              alt="Lion Bidi"
              className="h-18 w-auto sm:h-12 lg:h-14 transition-all duration-300 group-hover:scale-105"
            />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Join Lion Bidi</h3>
          <p className="text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        {/* Auth Actions */}
        <div className="space-y-3">
          <button
            onClick={() => handleNavigateAndClose("/login")}
            className="w-full flex items-center justify-center space-x-2 bg-[#FF6B35] hover:bg-divine-orange/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
          >
            <User size={18} />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => handleNavigateAndClose("/register")}
            className="w-full flex items-center justify-center space-x-2 border-2 border-orange-300 text-divine-orange  hover:bg-orange-50 font-semibold py-3 rounded-xl transition-colors duration-200"
          >
            <UserPlus size={18} />
            <span>Create Account</span>
          </button>
        </div>
      </div>
    </div>
  );

  const CartButton = () => (
    <button
      onClick={handleCartOpen}
      className="w-full flex items-center justify-between p-4 bg-[#FF6B35] text-white rounded-xl transition-all duration-200 shadow-lg mb-4"
    >
      <div className="flex items-center space-x-3">
        <ShoppingCart size={18} />
        <div className="text-left">
          <p className="font-semibold text-sm">Cart</p>
          <p className="text-xs opacity-90">{cartCount} items</p>
        </div>
      </div>
      {cartSavings > 0 && (
        <div className="text-right">
          <div className="text-xs opacity-80">Saved</div>
          <div className="font-bold text-sm">
            ₹{cartSavings.toLocaleString()}
          </div>
        </div>
      )}
    </button>
  );

  const Footer = () => (
    <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-center justify-center space-x-6 text-center">
        {trustBadges.map(({ icon: Icon, label }, idx) => (
          <div key={idx} className="flex flex-col items-center space-y-1">
            <Icon size={16} className="text-orange-600" />
            <span className="text-xs text-gray-600 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu Panel */}
      <div
        className="absolute inset-y-0 right-0 z-20 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          <Header />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-6">
              <BulkDiscountCard />
              <Navigation />
              <UserSection />
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
