// components/AuthModal.jsx
import { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  User,
  X,
  ShoppingCart,
  UserPlus,
  Shield,
  Star,
  Gift,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const getOrCreateModalRoot = () => {
  let root = document.getElementById("modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }
  return root;
};

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal } = useAppContext();
  const navigate = useNavigate();
  const portalTarget = useMemo(getOrCreateModalRoot, []);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "unset");
  }, [isAuthModalOpen]);

  const handleClose = () => closeAuthModal();

  const handleLogin = () => {
    closeAuthModal();
    navigate("/login");
  };

  const handleRegister = () => {
    closeAuthModal();
    navigate("/register");
  };

  if (!isAuthModalOpen) return null;

  const modalMarkup = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="bg-[#FF6B35] text-white p-6 rounded-t-2xl relative">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-white/20 p-2 rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Join Lion Bidi</h2>
                <p className="text-white/90 text-sm">
                  Premium Experience Awaits
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Main Message */}
            <div className="text-center mb-6">
              <div className="bg-orange-50 p-4 rounded-xl mb-4">
                <ShoppingCart className="w-12 h-12 text-divine-orange mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Please login to add items to your cart
                </h3>
                <p className="text-gray-600 text-sm">
                  Create an account or sign in to continue shopping and enjoy
                  exclusive benefits.
                </p>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <ShoppingCart className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xs text-blue-800 font-medium">Save Cart</p>
                <p className="text-xs text-blue-600">Never lose items</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <Shield className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-green-800 font-medium">
                  Track Orders
                </p>
                <p className="text-xs text-green-600">Real-time updates</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <Gift className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-purple-800 font-medium">
                  Exclusive Deals
                </p>
                <p className="text-xs text-purple-600">Member perks</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleLogin}
                className="w-full bg-[#FF6B35] hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg"
              >
                <User className="w-5 h-5" />
                <span>Sign In to Your Account</span>
              </button>

              <button
                onClick={handleRegister}
                className="w-full bg-white hover:bg-gray-50  hover:text-divine-orange font-medium py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create New Account</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center space-x-4 mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Shield className="w-3 h-3 text-green-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>Premium Quality</span>
              </div>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              By continuing, you agree to our{" "}
              <button
                type="button"
                className="text-divine-orange hover:underline cursor-pointer font-semibold"
                onClick={() => navigate("/terms")}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                className="text-divine-orange hover:underline cursor-pointer font-semibold"
                onClick={() => navigate("/privacy-policy")}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modalMarkup, portalTarget);
};

export default AuthModal;
