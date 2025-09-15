import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, Eye, EyeOff, Upload } from 'lucide-react';

const UPITransactionInput = ({ 
  transactionId, 
  setTransactionId, 
  onConfirm, 
  isConfirming,
  screenshot,
  setScreenshot,
  order 
}) => {
  const [showId, setShowId] = useState(false);
  const [validationState, setValidationState] = useState({ valid: null, message: '' });
  const [showHelp, setShowHelp] = useState(false);

  const validateTransactionId = (value) => {
    if (!value || !value.trim()) {
      return { valid: false, message: 'Transaction ID is required' };
    }

    const cleanId = value.trim().toUpperCase();
    
    // Check length
    if (cleanId.length < 10 || cleanId.length > 16) {
      return { 
        valid: false, 
        message: 'UPI transaction ID should be 10-16 characters long' 
      };
    }

    // Check for valid format
    const validPatterns = [
      /^\d{12}$/,                    // Standard 12 digits
      /^[A-Z0-9]{12}$/,             // 12 alphanumeric
      /^\d{10,16}$/,                // 10-16 digits
      /^[A-Z0-9]{10,16}$/,          // 10-16 alphanumeric
      /^[A-Z]{2}\d{10,14}$/,        // Bank prefix patterns
    ];

    const isValidFormat = validPatterns.some(pattern => pattern.test(cleanId));
    
    if (!isValidFormat) {
      return { 
        valid: false, 
        message: 'Invalid format. Please enter a valid UPI transaction ID' 
      };
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^(.)\1+$/,                   // All same character
      /^123456789012$/,             // Sequential
      /^987654321098$/,             // Reverse sequential
      /^000000000000$/,             // All zeros
      /^111111111111$/,             // All ones
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(cleanId));
    
    if (isSuspicious) {
      return { 
        valid: false, 
        message: 'Please enter your actual UPI transaction ID' 
      };
    }

    return { valid: true, message: 'Valid transaction ID format' };
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTransactionId(value);
    
    if (value.trim()) {
      const validation = validateTransactionId(value);
      setValidationState(validation);
    } else {
      setValidationState({ valid: null, message: '' });
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const validation = validateTransactionId(transactionId);
    if (validation.valid) {
      onConfirm();
    } else {
      setValidationState(validation);
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      {order && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Payment Details</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Order:</strong> {order.orderNumber}</p>
            <p><strong>Amount:</strong> ₹{order.total?.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Transaction ID Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          UPI Transaction ID *
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <Info className="w-4 h-4 inline" />
          </button>
        </label>
        
        {showHelp && (
          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-medium text-blue-900 mb-2">Where to find your UPI Transaction ID:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Check your UPI app (PhonePe, GPay, Paytm, etc.)</li>
              <li>• Look in transaction history</li>
              <li>• Usually 12 digits like: 123456789012</li>
              <li>• Found in payment confirmation SMS</li>
            </ul>
          </div>
        )}
        
        <div className="relative">
          <input
            type={showId ? "text" : "password"}
            value={transactionId}
            onChange={handleInputChange}
            placeholder="Enter 12-digit UPI transaction ID"
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:border-transparent ${
              validationState.valid === true ? 'border-green-300 focus:ring-green-200' :
              validationState.valid === false ? 'border-red-300 focus:ring-red-200' :
              'border-gray-300 focus:ring-blue-200'
            }`}
            maxLength={16}
          />
          
          <button
            type="button"
            onClick={() => setShowId(!showId)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Validation feedback */}
        {validationState.valid !== null && (
          <div className={`flex items-center mt-2 text-sm ${
            validationState.valid ? 'text-green-600' : 'text-red-600'
          }`}>
            {validationState.valid ? (
              <CheckCircle className="w-4 h-4 mr-1" />
            ) : (
              <AlertCircle className="w-4 h-4 mr-1" />
            )}
            {validationState.message}
          </div>
        )}

        {/* Character count */}
        <div className="text-xs text-gray-500 mt-1">
          {transactionId.length}/16 characters
        </div>
      </div>

      {/* Screenshot Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Screenshot (Optional but recommended)
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="screenshot-upload"
          />
          <label
            htmlFor="screenshot-upload"
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            {screenshot ? 'Change Screenshot' : 'Upload Screenshot'}
          </label>
          {screenshot && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm">Screenshot uploaded</span>
            </div>
          )}
        </div>
        
        {screenshot && (
          <div className="mt-3">
            <img 
              src={screenshot} 
              alt="Payment screenshot" 
              className="max-w-xs h-auto border rounded-lg"
            />
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          Max file size: 5MB. Supported formats: JPG, PNG, GIF
        </p>
      </div>

      {/* Examples */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Transaction ID Examples:</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>✓ 123456789012</div>
          <div>✓ AB1234567890</div>
          <div>✓ 1234567890123</div>
          <div>✓ PH123456789012</div>
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <div className="flex items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong>Security Note:</strong> Each transaction ID can only be used once. 
            We'll verify your payment within 1 hours before confirming your order.
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isConfirming || !transactionId.trim() || validationState.valid === false}
        className="w-full px-4 py-3 bg-[#FF6B35] text-white rounded-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {isConfirming ? "Submitting..." : "Confirm Payment"}
      </button>
    </div>
  );
};

export default UPITransactionInput;