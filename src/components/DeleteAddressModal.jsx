// components/DeleteAddressModal.jsx
import React from "react";
import { AlertTriangle, X, Trash2 } from "lucide-react";

const DeleteAddressModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  address, 
  isLoading = false 
}) => {
  if (!isOpen || !address) return null;

  const handleConfirm = () => {
    onConfirm(address);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-red-50 border-b border-red-100 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-800">
                Delete Address
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            
            {/* Address Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="font-medium text-gray-800">{address.name}</div>
                <div className="text-sm text-gray-600">
                  {address.street}
                  {address.locality && `, ${address.locality}`}
                  {address.landmark && `, ${address.landmark}`}
                </div>
                <div className="text-sm text-gray-600">
                  {address.city}, {address.state} - {address.pincode}
                </div>
                <div className="text-sm text-gray-500">
                  Phone: {address.phone}
                </div>
              </div>
            </div>
            
            {address.isPrimary && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Cannot delete primary address</p>
                    <p className="mt-1">
                      Please set another address as primary before deleting this one.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || address.isPrimary}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Delete Address</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAddressModal;