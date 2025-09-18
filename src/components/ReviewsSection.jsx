// components/ReviewsSection.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageCircle } from 'lucide-react';
import ReviewForm from './ReviewForm';
import api, { BASE_URL } from '../utils/api'; // Import your API utility

const ReviewsSection = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState(null);
  const [votingStates, setVotingStates] = useState({}); // Track voting states per review

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      console.log(`🔍 Fetching reviews for product: ${productId}`);
      console.log(`🌐 API URL: ${BASE_URL}/api/reviews/product/${productId}`);

      // Use your API utility instead of direct fetch
      const response = await api.get(`/api/reviews/product/${productId}`);
      
      console.log('✅ Reviews API Response:', response.data);
      
      const data = response.data;
      
      // Validate and set data with proper fallbacks
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      setRatingDistribution(Array.isArray(data.ratingDistribution) ? data.ratingDistribution : []);
      setTotalReviews(typeof data.totalReviews === 'number' ? data.totalReviews : 0);
      
      // Calculate average rating
      if (Array.isArray(data.ratingDistribution) && data.ratingDistribution.length > 0 && data.totalReviews > 0) {
        const totalRating = data.ratingDistribution.reduce((sum, item) => {
          if (item && typeof item._id === 'number' && typeof item.count === 'number') {
            return sum + (item._id * item.count);
          }
          return sum;
        }, 0);
        setAverageRating(Math.round((totalRating / data.totalReviews) * 10) / 10);
      } else {
        setAverageRating(0);
      }

    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
      
      // Handle 404 as "no reviews yet" instead of an error
      if (error.response?.status === 404) {
        console.log('📝 No reviews found for this product - this is normal for new products');
        setError(null); // Don't show error for 404
        setReviews([]);
        setRatingDistribution([]);
        setTotalReviews(0);
        setAverageRating(0);
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
        setReviews([]);
        setRatingDistribution([]);
        setTotalReviews(0);
        setAverageRating(0);
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection.');
        setReviews([]);
        setRatingDistribution([]);
        setTotalReviews(0);
        setAverageRating(0);
      } else {
        setError(error.response?.data?.message || 'Failed to load reviews');
        setReviews([]);
        setRatingDistribution([]);
        setTotalReviews(0);
        setAverageRating(0);
      }
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
      console.log('📝 Submitting review:', reviewData);

      const response = await api.post('/api/reviews', {
        ...reviewData,
        productId
      });

      console.log('✅ Review submitted:', response.data);
      
      setShowReviewForm(false);
      await fetchReviews(); // Refresh reviews
      alert('Review submitted successfully!');

    } catch (error) {
      console.error('❌ Error submitting review:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      alert(errorMessage);
    }
  };

  const handleHelpfulClick = async (reviewId) => {
    if (!currentUser) {
      alert('You must be logged in to vote');
      return;
    }

    // Prevent multiple clicks while processing
    if (votingStates[reviewId]) {
      return;
    }

    try {
      setVotingStates(prev => ({ ...prev, [reviewId]: true }));
      console.log(`Toggling helpful vote for review ${reviewId}`);

      const response = await api.post(`/api/reviews/${reviewId}/helpful`);
      
      console.log('Helpful vote response:', response.data);
      
      // Update the local review data with the response
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review._id === reviewId 
            ? { 
                ...review, 
                helpfulVotes: response.data.helpfulVotes,
                hasUserVoted: response.data.hasVoted 
              }
            : review
        )
      );

    } catch (error) {
      console.error('Error updating helpful vote:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update vote';
      alert(errorMessage);
    } finally {
      setVotingStates(prev => ({ ...prev, [reviewId]: false }));
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error loading reviews: {error}</p>
        <button 
          onClick={fetchReviews}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
            if (!review || !review._id) {
              return null;
            }

            return (
              <div key={review._id} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-500">
                      {review.userId?.profileImage ? (
                        <img
                          src={review.userId.profileImage}
                          alt={review.userId?.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Hide broken image and show fallback
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">${review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : 'U'}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">
                          {review.userId?.name ? review.userId.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
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
                    disabled={!currentUser || votingStates[review._id]}
                    className={`flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                      review.hasUserVoted 
                        ? 'text-green-600' 
                        : 'text-gray-600 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp 
                      className={`w-4 h-4 ${review.hasUserVoted ? 'fill-current' : ''}`} 
                    />
                    <span className="text-sm">
                      {review.hasUserVoted ? 'Helpful' : 'Helpful'} ({review.helpfulVotes || 0})
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