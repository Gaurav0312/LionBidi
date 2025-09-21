//components/ReviewForm.jsx
import React, { useState, useEffect } from 'react';
import { Star, Upload, X, Camera, Shield } from 'lucide-react';

const ReviewForm = ({ productId, onSubmit, onCancel, editingReview = null }) => {
  const [formData, setFormData] = useState({
    rating: editingReview?.rating || 0,
    title: editingReview?.title || '',
    comment: editingReview?.comment || '',
    images: editingReview?.images || [],
    productVariant: {
      color: editingReview?.productVariant?.color || '',
      size: editingReview?.productVariant?.size || ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(!!editingReview);

  // Initialize preview URLs for existing images when editing
  useEffect(() => {
    if (editingReview && editingReview.images) {
      // For existing images, use them directly as they're already base64 or URLs
      setImagePreviewUrls(editingReview.images);
    }
  }, [editingReview]);

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    setErrors(prev => ({ ...prev, rating: '' }));
  };

  const handleImageUpload = async (files) => {
    const maxImages = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB per image
    
    // Filter and validate files
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`Image ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a valid image file.`);
        return false;
      }
      return true;
    });

    if (formData.images.length + validFiles.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    try {
      // Convert files to base64 for storage/submission
      const base64Images = await Promise.all(
        validFiles.map(file => convertFileToBase64(file))
      );

      // Create preview URLs for display
      const previewUrls = validFiles.map(file => URL.createObjectURL(file));

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }));

      setImagePreviewUrls(prev => [...prev, ...previewUrls]);

    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images. Please try again.');
    }
  };

  // Helper function to convert file to base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = (index) => {
    // Only revoke URL if it's a blob URL (newly uploaded), not existing images
    const imageUrl = imagePreviewUrls[index];
    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));

    setImagePreviewUrls(prev => 
      prev.filter((_, i) => i !== index)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating) newErrors.rating = 'Please select a rating';
    if (!formData.title.trim()) newErrors.title = 'Please enter a title';
    if (!formData.comment.trim()) newErrors.comment = 'Please enter a comment';
    if (formData.comment.length < 15) newErrors.comment = 'Comment must be at least 15 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Submit form data with base64 images
      await onSubmit({ 
        ...formData, 
        productId,
        images: formData.images, // These are now base64 strings
        isVerifiedPurchase: true,
        isEditing: isEditing,
        reviewId: editingReview?._id
      });
      
      // Clean up preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Reset form
      setFormData({
        rating: 0,
        title: '',
        comment: '',
        images: [],
        productVariant: { color: '', size: '' }
      });
      setImagePreviewUrls([]);
      
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clean up preview URLs on component unmount
  React.useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        <Shield className="w-5 h-5 text-green-600" />
        <span className="text-sm text-green-600 font-medium">Verified Purchase</span>
        {isEditing && (
          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            Editing
          </span>
        )}
      </div>
      
      <div className="space-y-6">
        {/* Product Variant Information */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color/Style
            </label>
            <input
              type="text"
              value={formData.productVariant.color}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                productVariant: { ...prev.productVariant, color: e.target.value }
              }))}
              placeholder="e.g., Black, Red, Blue"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size/Variant
            </label>
            <input
              type="text"
              value={formData.productVariant.size}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                productVariant: { ...prev.productVariant, size: e.target.value }
              }))}
              placeholder="e.g., Medium, 6KG(3KG*2)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
              maxLength={50}
            />
          </div>
        </div> */}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
            {formData.rating > 0 && (
              <span className="ml-3 text-sm text-gray-600 font-medium">
                {formData.rating === 1 && "Poor"}
                {formData.rating === 2 && "Fair"}
                {formData.rating === 3 && "Average"}
                {formData.rating === 4 && "Good"}
                {formData.rating === 5 && "Excellent"}
              </span>
            )}
          </div>
          {errors.rating && <p className="text-red-500 text-sm mt-2">{errors.rating}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Headline *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What's most important to know?"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            maxLength={120}
          />
          <div className="flex justify-between mt-1">
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            <p className="text-gray-500 text-sm">{formData.title.length}/120</p>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Written Review *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="What did you like or dislike? What did you use this product for?"
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            maxLength={5000}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && <p className="text-red-500 text-sm">{errors.comment}</p>}
            <p className="text-gray-500 text-sm">{formData.comment.length}/5000</p>
          </div>
        </div>

        {/* Enhanced Image Upload with Screenshots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos or Screenshots
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Show your product in use, unboxing, screenshots, or any issues. Max 5 images, 10MB each
          </p>
          
          {/* Drag & Drop Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver 
                ? 'border-orange-400 bg-orange-50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="flex space-x-2">
                <Camera className="w-8 h-8 text-gray-400" />
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <label className="cursor-pointer inline-block">
                  <span className="text-divine-orange hover:text-divine-orange font-medium underline">
                    Choose files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleImageUpload(e.target.files);
                      }
                      // Reset the input value to allow selecting the same file again
                      e.target.value = '';
                    }}
                    className="hidden"
                    disabled={formData.images.length >= 5}
                  />
                </label>
                <span className="text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB each ({formData.images.length}/5 uploaded)
              </p>
              {formData.images.length >= 5 && (
                <p className="text-sm text-red-500 font-medium">
                  Maximum 5 images reached. Remove some to add new ones.
                </p>
              )}
            </div>
          </div>
          
          {/* Alternative Browse Button (More Visible) */}
          <div className="flex items-center justify-center mt-3">
            <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
              <Upload className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 font-medium">Browse Files</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleImageUpload(e.target.files);
                  }
                  e.target.value = '';
                }}
                className="hidden"
                disabled={formData.images.length >= 5}
              />
            </label>
          </div>
          
          {/* Image Preview Grid */}
          {imagePreviewUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {imagePreviewUrls.map((previewUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={previewUrl}
                    alt={`Review ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 group-hover:border-orange-300 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {/* Image number indicator */}
                  <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded text-center">
                    Image {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-[#FF6B35] hover:bg-[#FF6B35] text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isEditing ? 'Updating...' : 'Submitting...'}</span>
              </>
            ) : (
              <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;