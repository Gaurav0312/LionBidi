// components/ReviewForm.jsx
import React, { useState } from 'react';
import { Star, Upload, X } from 'lucide-react';

const ReviewForm = ({ productId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    setErrors(prev => ({ ...prev, rating: '' }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // In real implementation, upload to Cloudinary and get URLs
    // For now, just store file objects
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 3) // Max 3 images
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.rating) newErrors.rating = 'Please select a rating';
    if (!formData.title.trim()) newErrors.title = 'Please enter a title';
    if (!formData.comment.trim()) newErrors.comment = 'Please enter a comment';
    if (formData.comment.length < 10) newErrors.comment = 'Comment must be at least 10 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, productId });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating *
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="focus:outline-none"
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
          </div>
          {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Give your review a title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            maxLength={100}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Tell us about your experience with this product"
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-500"
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && <p className="text-red-500 text-sm">{errors.comment}</p>}
            <p className="text-gray-500 text-sm">{formData.comment.length}/1000</p>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center space-x-2 transition-colors">
              <Upload className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Upload Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
          
          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="flex space-x-2 mt-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Review ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
