import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  Search,
  Heart,
  Menu,
  X,
  Sparkles,
  Zap,
  UserPlus,
  ChevronDown,
  Gift,
  Bell,
  Award,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import MobileMenu from "../components/Header/MobileMenu";
import Cart from "./Cart";
import api from "../utils/api"; 

const Header = () => {
  const navigate = useNavigate();

  // Get all context values and force re-render when user changes
  const {
    cartItems = [],
    wishlist = [],
    user,
    logout,
    getCartItemsCount,
    openAuthModal,
  } = useAppContext();

  // Force component to re-render when user changes
  const [userRenderKey, setUserRenderKey] = useState(0);

  const cartCount = getCartItemsCount ? getCartItemsCount() : cartItems.length;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showPromo, setShowPromo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // CRITICAL: Force re-render when user changes
  useEffect(() => {
    console.log("Header - User state changed:", user);
    setUserRenderKey(prev => prev + 1);
    
    // Close any open menus when user changes
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  }, [user]);

  // Fixed useEffect for handling clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Fixed scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 20);
      // Close user menu on scroll
      if (isUserMenuOpen) {
        setIsUserMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isUserMenuOpen]);

  // Fetch user address when dropdown opens
  useEffect(() => {
    const fetchUserAddress = async () => {
      if (!user || !isUserMenuOpen) return;
      
      try {
        const response = await api.get("/api/address");
        if (response.data.success && response.data.address) {
          setUserAddress(response.data.address);
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    };

    if (isUserMenuOpen && user) {
      fetchUserAddress();
    }
  }, [isUserMenuOpen, user]);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsLoading(true);
      await handleNavigate("/products");
      setIsMobileSearchOpen(false);
    }
  };

  const handleLogout = () => {
    if (logout && typeof logout === "function") logout();
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
    handleNavigate("/");
  };

  // Debug: Log current user state
  console.log("Header render - User:", user, "Key:", userRenderKey);

  return (
    <>
      {/* PROMO BAR */}
      {showPromo && (
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
                <span className="text-sm font-medium">
                  🎉 Premium Launch Offer:
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20 shadow-lg">
                <Zap size={16} className="text-yellow-200" />
                <span className="font-bold text-base tracking-wide">
                  FREE SHIPPING
                </span>
                <span className="text-sm font-medium">on orders ₹1499+</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">Limited time only!</span>
                <Sparkles size={16} className="text-yellow-200 animate-pulse" />
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowPromo(false)}
              className="absolute right-3 sm:right-4 p-1.5 hover:bg-white/20 rounded-full transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 group"
              aria-label="Close promotion banner"
            >
              <X
                size={14}
                className="sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-200"
              />
            </button>
          </div>

          {/* Progress bar animation */}
          <div className="absolute bottom-0 left-0 h-0.5 bg-yellow-200/30 w-full">
            <div className="h-full bg-yellow-200 animate-pulse shadow-sm"></div>
          </div>

          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] animate-[shimmer_3s_ease-in-out_infinite]"></div>
        </div>
      )}

      {/* MAIN HEADER */}
      <header
        key={`header-${userRenderKey}`} // Force re-render with key
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-orange-100"
            : "bg-white/98 backdrop-blur-md shadow border-b border-orange-200"
        }`}
      >
        <div className="h-1 bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />

        {/* CONTENT WRAPPER */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          {/* Top row */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* LOGO */}
            <div
              onClick={() => handleNavigate("/")}
              className="flex items-center cursor-pointer group flex-shrink-0 mr-2 lg:mr-4"
            >
              <div className="relative">
                <img
                  src="https://res.cloudinary.com/dxqerqng1/image/upload/v1754660338/campaign_covers/brixv4aazfsuzq27kfbc.png"
                  alt="Lion Bidi"
                  className="h-10 w-auto sm:h-12 lg:h-14 transition-all duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <div className="ml-2 lg:ml-3">
                <h1 className="text-3xl sm:text-xl lg:text-2xl font-extrabold bg-[#FF6B35] bg-clip-text text-transparent">
                  LION BIDI
                </h1>
              </div>
            </div>

            {/* DESKTOP SEARCH */}
            <div className="hidden lg:flex flex-1 mx-4 xl:mx-6 max-w-md">
              <form
                onSubmit={handleSearch}
                className="relative flex w-full group"
                ref={searchRef}
              >
                <div className="flex w-full rounded-xl bg-gradient-to-r from-gray-50 to-orange-50 ring-2 ring-orange-200 focus-within:ring-4 focus-within:ring-orange-400/20 transition-all shadow-md">
                  <div className="flex items-center pl-4 text-gray-400">
                    <Search size={18} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 px-3 py-3 outline-none text-sm font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-[#FF6B35] text-white font-bold px-4 xl:px-6 py-3 rounded-xl shadow hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-[1.02] disabled:opacity-50"
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
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2 flex-shrink-0">
              {/* Navigation Links */}
              {[
                { path: "/", label: "Home" },
                { path: "/about", label: "About" },
                { path: "/contact", label: "Contact" },
              ].map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className="relative group flex items-center gap-1 font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 px-2 xl:px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 whitespace-nowrap"
                >
                  <span className="text-sm">{item.label}</span>
                  <span className="absolute -bottom-1 left-2 right-2 h-0.5 bg-[#FF6B35] scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
              ))}

              {/* User Section - FIXED */}
              {user ? (
                <div className="flex items-center space-x-1 xl:space-x-2 ml-2 xl:ml-4 border-l border-orange-200 pl-2 xl:pl-4">
                  {/* User Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsUserMenuOpen(!isUserMenuOpen);
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 hover:from-orange-200 hover:to-red-200 px-2 xl:px-3 py-2 rounded-lg text-gray-800 transition-all duration-300 ring-2 ring-orange-200 hover:ring-orange-300 shadow-lg whitespace-nowrap"
                    >
                      <div className="w-6 h-6 xl:w-7 xl:h-7 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden xl:inline font-semibold text-sm">
                        {user.name?.split(" ")[0]}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${
                          isUserMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* User Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-orange-200 py-2 z-[100] animate-in slide-in-from-top-2 duration-300">

                       {/* User Info Section with Address */}
                      <div className="px-4 py-3 border-b border-orange-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">
                              {user.name}
                            </p>
                            <p className="text-sm text-[#FF6B35]">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        {/* Address Display */}
                        {userAddress ? (
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-xs font-medium text-orange-800 mb-1">
                                  Default Delivery Address
                                </div>
                                <div className="text-xs text-gray-700">
                                  <div className="font-medium">{userAddress.name}</div>
                                  <div className="text-gray-600">
                                    {userAddress.street}
                                  </div>
                                  <div className="text-gray-600">
                                    {userAddress.city}, {userAddress.state} - {userAddress.zipCode}
                                  </div>
                                  <div className="text-gray-500 mt-1">
                                    📞 {userAddress.phone}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsUserMenuOpen(false);
                                    handleNavigate('/address');
                                  }}
                                  className="text-xs text-orange-600 hover:text-orange-700 mt-1 font-medium"
                                >
                                  Edit Address
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  No delivery address saved
                                </div>
                                <button
                                  onClick={() => {
                                    setIsUserMenuOpen(false);
                                    handleNavigate('/address');
                                  }}
                                  className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                >
                                  Add Address
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                        {[
                          { path: "/profile", label: "My Profile", icon: User },
                          {
                            path: "/orders",
                            label: "Orders",
                            icon: ShoppingCart,
                          },
                          {
                            path: "/wishlist",
                            label: "Wishlist",
                            icon: Heart,
                            badge: wishlist.length,
                          },
                          { path: "/settings", label: "Settings", icon: Bell },
                        ].map((item) => (
                          <button
                            key={item.path}
                            onClick={() => {
                              handleNavigate(item.path);
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon size={18} />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {item.badge}
                              </span>
                            )}
                          </button>
                        ))}

                        <div className="border-t border-orange-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                          >
                            <X size={18} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={() => handleNavigate("/wishlist")}
                    className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Heart size={18} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                        {wishlist.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart size={18} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-1 xl:space-x-2 ml-2 xl:ml-4 border-l border-orange-200 pl-2 xl:pl-4">
                  <button
                    onClick={() => handleNavigate("/products")}
                    className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 xl:px-3 py-2 rounded-lg shadow-lg transition-all duration-300 font-semibold whitespace-nowrap"
                  >
                    <ShoppingCart size={16} />
                    <span className="hidden xl:inline text-sm">Shop</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("/login")}
                    className="flex items-center gap-1 bg-[#FF6B35] text-white px-3 py-2 rounded-lg shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-[1.02] font-bold whitespace-nowrap"
                  >
                    <User size={16} />
                    <span className="text-sm">Login</span>
                  </button>
                  <button
                    onClick={() => handleNavigate("/register")}
                    className="flex items-center gap-1 border-2 border-orange-400 text-orange-600 px-2 xl:px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 font-semibold whitespace-nowrap"
                  >
                    <UserPlus size={16} />
                    <span className="hidden xl:inline text-sm">Register</span>
                  </button>
                </div>
              )}
            </nav>

            {/* MOBILE ACTIONS */}
            <div className="flex items-center lg:hidden space-x-1">
              {/* Mobile Search */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={`p-2.5 rounded-xl transition-all ${
                  isMobileSearchOpen
                    ? "text-orange-600 bg-orange-50"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                } shadow`}
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              {user && (
                <button
                  onClick={() => handleNavigate("/wishlist")}
                  className="relative p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow"
                >
                  <Heart size={18} />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {wishlist.length}
                    </span>
                  )}
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all shadow"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2.5 rounded-xl transition-all ${
                  isMenuOpen
                    ? "text-red-600 bg-red-50"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                } shadow`}
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* MOBILE SEARCH BAR */}
          {isMobileSearchOpen && (
            <div className="lg:hidden pb-4 animate-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex rounded-2xl bg-gradient-to-r from-gray-50 to-orange-50 ring-2 ring-orange-200 focus-within:ring-4 focus-within:ring-orange-400/20 transition-all shadow">
                  <div className="flex items-center pl-4 text-gray-400">
                    <Search size={20} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search premium products..."
                    className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 px-4 py-4 outline-none text-base font-medium"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 py-4 rounded-2xl shadow hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Sparkles size={16} />
                    )}
                    <span className="hidden sm:inline">Search</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* MOBILE MENU COMPONENT */}
      <MobileMenu
        key={`mobile-menu-${userRenderKey}`} // Force re-render
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={user}
        userAddress={userAddress}
        handleNavigate={handleNavigate}
        handleLogout={handleLogout}
        openAuthModal={openAuthModal}
        wishlist={wishlist}
        cartCount={cartCount}
        setIsCartOpen={setIsCartOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <Cart
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        handleNavigate={handleNavigate}
      />
    </>
  );
};

export default Header;