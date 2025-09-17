// components/ReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle, Camera } from 'lucide-react';
import ReviewForm from './ReviewForm'; // ✅ FIXED: Removed extra slash

const ReviewsSection = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]); // ✅ Already initialized as array
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingDistribution, setRatingDistribution] = useState([]); // ✅ Already initialized as array
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState(null); // ✅ ADDED: Error state

  useEffect(() => {
    if (productId) { // ✅ ADDED: Check if productId exists
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    if (!productId) { // ✅ ADDED: Early return if no productId
      setLoading(false);
      return;
    }

    try {
      setError(null); // ✅ ADDED: Clear previous errors
      const response = await fetch(`/api/reviews/product/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // ✅ ADDED: Validate response data structure
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setRatingDistribution(Array.isArray(data.ratingDistribution) ? data.ratingDistribution : []);
      setTotalReviews(typeof data.totalReviews === 'number' ? data.totalReviews : 0);
      
      // Calculate average rating with proper validation
      if (Array.isArray(data.ratingDistribution) && data.ratingDistribution.length > 0 && data.totalReviews > 0) {
        const totalRating = data.ratingDistribution.reduce(
          (sum, item) => {
            // ✅ ADDED: Validate item structure
            if (item && typeof item._id === 'number' && typeof item.count === 'number') {
              return sum + (item._id * item.count);
            }
            return sum;
          }, 0
        );
        setAverageRating(Math.round((totalRating / data.totalReviews) * 10) / 10);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError(error.message); // ✅ ADDED: Set error state
      // ✅ ADDED: Set fallback values on error
      setReviews([]);
      setRatingDistribution([]);
      setTotalReviews(0);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    if (!currentUser) {
      alert('You must be logged in to submit a review');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to submit a review');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...reviewData,
          productId // ✅ ADDED: Ensure productId is included
        })
      });

      if (response.ok) {
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
        alert('Review submitted successfully!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review');
    }
  };

  const handleHelpfulClick = async (reviewId) => {
    if (!currentUser) {
      alert('You must be logged in to vote');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to vote');
        return;
      }

      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews(); // Refresh to get updated helpful counts
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update vote');
      }
    } catch (error) {
      console.error('Error updating helpful vote:', error);
      alert('Error updating vote');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading reviews...</p>
      </div>
    );
  }

  // ✅ ADDED: Error state display
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading reviews: {error}</p>
        <button 
          onClick={fetchReviews}
          className="mt-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white p-8 rounded-2xl border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          {currentUser && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full font-medium transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">
              {averageRating > 0 ? averageRating : 'N/A'}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(averageRating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-gray-600">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          <div className="md:col-span-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              // ✅ FIXED: Added proper validation for find operation
              const ratingData = Array.isArray(ratingDistribution) 
                ? ratingDistribution.find(r => r && r._id === stars)
                : null;
              const count = ratingData ? ratingData.count : 0;
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              
              return (
                <div key={stars} className="flex items-center space-x-3 mb-2">
                  <span className="text-sm font-medium w-8">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onSubmit={handleSubmitReview}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Individual Reviews */}
      <div className="space-y-4">
        {!Array.isArray(reviews) || reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          reviews.map((review) => {
            // ✅ ADDED: Validate review object structure
            if (!review || !review._id) {
              return null;
            }

            return (
              <div key={review._id} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                      {/* ✅ FIXED: Added validation for nested user object */}
                      {review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 flex items-center">
                        {review.userId?.name || 'Anonymous User'}
                        {review.isVerifiedPurchase && (
                          <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (review.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">
                          {review.createdAt 
                            ? new Date(review.createdAt).toLocaleDateString()
                            : 'Date not available'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ✅ ADDED: Validation for title */}
                {review.title && (
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                )}
                
                <p className="text-gray-700 mb-4">{review.comment || 'No comment provided'}</p>

                {/* Review Images */}
                {Array.isArray(review.images) && review.images.length > 0 && (
                  <div className="flex space-x-2 mb-4">
                    {review.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                        onClick={() => {/* Open image modal */}}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleHelpfulClick(review._id)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors disabled:opacity-50"
                    disabled={!currentUser}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">
                      Helpful ({review.helpfulVotes || 0})
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
