import React, { useEffect, useCallback, useMemo } from 'react';
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
  Bell
} from 'lucide-react';

const MobileMenu = ({ 
  isOpen = false, 
  onClose, 
  user, 
  handleNavigate, 
  handleLogout, 
  openAuthModal,
  wishlist = [],
  cartCount = 0,
  cartSavings = 0,
  bulkDiscountPercent = 0,
  totalQuantity = 0,
  setIsCartOpen,
  setIsMenuOpen
}) => {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const navigationItems = useMemo(() => [
    { path: "/", label: "Home", icon: Home, desc: "Back to homepage" },
    { path: "/products", label: "Products", icon: Package, desc: "Browse our catalog" },
    { path: "/about", label: "About", icon: Info, desc: "Learn our story" },
    { path: "/contact", label: "Contact", icon: Phone, desc: "Get in touch" },
  ], []);

  const userActions = useMemo(() => [
    { path: "/profile", label: "Profile", icon: User },
    { path: "/orders", label: "Orders", icon: ShoppingCart },
    { path: "/settings", label: "Settings", icon: Settings },
  ], []);

  const bulkDiscountTiers = useMemo(() => [
    { min: 5, discount: 5 },
    { min: 10, discount: 10 },
    { min: 20, discount: 15 },
    { min: 50, discount: 20 },
  ], []);

  const handleNavigateAndClose = useCallback((path) => {
    handleNavigate(path);
    onClose();
  }, [handleNavigate, onClose]);

  // Fixed authentication handlers - Direct navigation like desktop
  const handleSignIn = useCallback(() => {
    handleNavigate('/login');
    onClose();
  }, [handleNavigate, onClose]);

  const handleRegister = useCallback(() => {
    handleNavigate('/register');
    onClose();
  }, [handleNavigate, onClose]);

  const handleCartOpen = useCallback(() => {
    setIsCartOpen(true);
    onClose();
  }, [setIsCartOpen, onClose]);

  const handleLogoutAndClose = useCallback(() => {
    handleLogout();
    onClose();
  }, [handleLogout, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Menu Panel */}
      <div 
        className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 bg-divine-orange">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Crown size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Lion Bidi</h2>
                  <p className="text-xs text-white/80">Premium Experience</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors duration-200"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-4 space-y-6">
              
              {/* Quality Assurance Badge */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-divine-orange rounded-lg flex items-center justify-center">
                    <Shield size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Quality Assured</p>
                    <p className="text-xs text-divine-orange">100% Authentic Products</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { icon: Truck, label: "Fast Delivery" },
                    { icon: Award, label: "Premium" },
                    { icon: Star, label: "Rated 4.9" }
                  ].map(({ icon: Icon, label }, idx) => (
                    <div key={idx} className="flex flex-col items-center space-y-1">
                      <Icon size={14} className="text-divine-orange" />
                      <span className="text-xs text-gray-700 font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk Discount Info */}
              {totalQuantity > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Gift size={18} className="text-green-600" />
                    <p className="font-semibold text-gray-800 text-sm">Bulk Savings Active</p>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {bulkDiscountTiers.map(({ min, discount }, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">{min}+ items:</span>
                        <span className={`font-semibold px-2 py-1 rounded-md ${
                          totalQuantity >= min 
                            ? 'bg-green-500 text-white' 
                            : 'text-green-600'
                        }`}>
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
              )}

              {/* Navigation Links */}
              <nav className="space-y-1">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Navigation
                </h3>
                {navigationItems.map(({ path, label, icon: Icon, desc }) => (
                  <button
                    key={path}
                    onClick={() => handleNavigateAndClose(path)}
                    className="w-full flex items-center justify-between p-4 text-left rounded-xl hover:bg-orange-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors duration-200">
                        <Icon size={16} className="text-divine-orange" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </nav>

              {/* User Section */}
              {user ? (
                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Account
                    </h3>
                    
                    {/* User Info Card */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-divine-orange rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">Welcome back!</p>
                          <p className="text-divine-orange font-medium text-sm">{user.name}</p>
                          {user.email && (
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions - Updated to match desktop functionality */}
                    <div className="space-y-2 mb-4">
                      {[
                        { path: "/profile", label: "My Profile", icon: User },
                        { path: "/orders", label: "Orders", icon: ShoppingCart },
                        { path: "/wishlist", label: "Wishlist", icon: Heart, badge: wishlist.length },
                        { path: "/settings", label: "Settings", icon: Settings },
                      ].map(({ path, label, icon: Icon, badge }) => (
                        <button
                          key={path}
                          onClick={() => handleNavigateAndClose(path)}
                          className="w-full flex items-center justify-between p-3 text-left text-gray-700 hover:text-divine-orange hover:bg-orange-50 transition-all duration-200 rounded-lg border border-gray-200 hover:border-orange-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Icon size={18} />
                            <span className="font-medium">{label}</span>
                          </div>
                          {badge && badge > 0 && (
                            <span className="bg-divine-orange text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-semibold">
                              {badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Cart Button */}
                    <button
                      onClick={handleCartOpen}
                      className="w-full flex items-center justify-between p-4 bg-divine-orange hover:bg-divine-orange/90 text-white rounded-xl transition-all duration-200 shadow-lg mb-4"
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
                          <div className="font-bold text-sm">₹{cartSavings.toLocaleString()}</div>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 rounded-xl transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-t border-gray-200 pt-4">
                    {/* Guest Welcome */}
                    <div className="text-center bg-orange-50 border border-orange-200 rounded-xl p-6 mb-4">
                      <div className="w-16 h-16 bg-divine-orange rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                        <Crown size={24} className="text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-1">Join Lion Bidi</h3>
                      <p className="text-sm text-divine-orange">Experience premium quality!</p>
                    </div>

                    {/* Auth Actions - Direct navigation */}
                    <div className="space-y-3">
                      <button
                        onClick={() => handleNavigate("/login")}
                        className="w-full flex items-center justify-center space-x-2 bg-divine-orange hover:bg-divine-orange/90 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-200"
                      >
                        <User size={18} />
                        <span>Sign In</span>
                      </button>

                      <button
                        onClick={() => handleNavigate("/register")}
                        className="w-full flex items-center justify-center space-x-2 border-2 border-orange-300 text-divine-orange hover:text-divine-orange hover:bg-orange-50 font-semibold py-3 rounded-xl transition-colors duration-200"
                      >
                        <UserPlus size={18} />
                        <span>Create Account</span>
                      </button>

                      <button
                        onClick={() => handleNavigateAndClose("/products")}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors duration-200"
                      >
                        <Package size={18} />
                        <span>Browse Products</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-center">
              {[
                { icon: Shield, label: "Secure" },
                { icon: Award, label: "Certified" },
                { icon: Zap, label: "Fast" }
              ].map(({ icon: Icon, label }, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <Icon size={16} className="text-divine-orange" />
                  <span className="text-xs text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;