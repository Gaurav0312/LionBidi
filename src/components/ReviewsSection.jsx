//components/ReviewsSection.jsx
import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import ReviewForm from "./ReviewForm";

const ReviewsSection = ({ productId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [error, setError] = useState(null);
  const [votingStates, setVotingStates] = useState({});

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
      setLoading(true);
      setError(null);
      console.log("Fetching reviews for product:", productId);

      // Get token from localStorage for authentication
      const token = localStorage.getItem("token");
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://lion-bidi-backend.onrender.com/api/reviews/product/${productId}`, {
        method: 'GET',
        headers: headers,
      });

      const data = await response.json();
      console.log("Reviews API response:", data);

      if (data.success) {
        setReviews(data.reviews || []);
        setTotalReviews(data.totalReviews || 0);
        setRatingDistribution(data.ratingDistribution || []);
        
        // Calculate average rating
        if (data.ratingDistribution && data.ratingDistribution.length > 0) {
          const totalVotes = data.ratingDistribution.reduce((sum, item) => sum + item.count, 0);
          const weightedSum = data.ratingDistribution.reduce((sum, item) => sum + (item._id * item.count), 0);
          const avgRating = totalVotes > 0 ? weightedSum / totalVotes : 0;
          setAverageRating(Math.round(avgRating * 10) / 10);
        } else {
          setAverageRating(0);
        }
      } else {
        console.error("Failed to fetch reviews:", data.message);
        setError(data.message || "Failed to fetch reviews");
        setReviews([]);
        setTotalReviews(0);
        setRatingDistribution([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Error loading reviews. Please try again.");
      setReviews([]);
      setTotalReviews(0);
      setRatingDistribution([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      console.log("Submitting review:", reviewData);
      
      // Get user data from localStorage or props
      const savedUser = localStorage.getItem("user");
      const userFromStorage = savedUser ? JSON.parse(savedUser) : null;
      const currentUserData = currentUser || userFromStorage;

      // Prepare the request body with user data
      const requestBody = {
        ...reviewData,
        productId: productId,
        // Send currentUser in the body for compatibility with backend
        currentUser: currentUserData ? {
          _id: currentUserData.id || currentUserData._id,
          name: currentUserData.name,
          email: currentUserData.email,
          profileImage: currentUserData.avatar || currentUserData.profileImage
        } : null
      };

      console.log("Request body:", requestBody);

      // Get token from localStorage
      const token = localStorage.getItem("token");
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://lion-bidi-backend.onrender.com/api/reviews`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Review submission response:", data);

      if (data.success) {
        // Add new review to the list
        setReviews(prev => [data.review, ...prev]);
        setTotalReviews(prev => prev + 1);
        setShowReviewForm(false);
        
        // Refresh reviews to get updated stats
        await fetchReviews();
      } else {
        throw new Error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error; // Let ReviewForm handle the error display
    }
  };

  const handleVoteToggle = async (reviewId) => {
    if (votingStates[reviewId]) return; // Prevent multiple clicks

    try {
      setVotingStates(prev => ({ ...prev, [reviewId]: true }));

      // Get user data
      const savedUser = localStorage.getItem("user");
      const userFromStorage = savedUser ? JSON.parse(savedUser) : null;
      const currentUserData = currentUser || userFromStorage;

      // Get token from localStorage
      const token = localStorage.getItem("token");
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`https://lion-bidi-backend.onrender.com/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          // Send currentUser in the body for compatibility with backend
          currentUser: currentUserData ? {
            _id: currentUserData.id || currentUserData._id,
            name: currentUserData.name,
            email: currentUserData.email
          } : null
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update the review in the list
        setReviews(prev => prev.map(review => 
          review._id === reviewId 
            ? { ...review, helpfulVotes: data.helpfulVotes, hasUserVoted: data.hasVoted }
            : review
        ));
      } else {
        console.error("Failed to toggle vote:", data.message);
      }
    } catch (error) {
      console.error("Error toggling vote:", error);
    } finally {
      setVotingStates(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-2 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <MessageCircle className="w-16 h-16 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">Error loading reviews</p>
            <p className="text-sm text-gray-500 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchReviews}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get current user data
  const savedUser = localStorage.getItem("user");
  const userFromStorage = savedUser ? JSON.parse(savedUser) : null;
  const currentUserData = currentUser || userFromStorage;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Reviews Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          {currentUserData && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Summary */}
        {totalReviews > 0 ? (
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{averageRating}</div>
              <div className="flex items-center justify-center mt-1">
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
              <div className="text-sm text-gray-500 mt-1">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 max-w-md">
              {[5, 4, 3, 2, 1].map((rating) => {
                const ratingData = ratingDistribution.find(r => r._id === rating);
                const count = ratingData ? ratingData.count : 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium w-3">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this product!</p>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="border-b border-gray-100">
          <ReviewForm
            productId={productId}
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="p-6">
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <img
                    src={review.userId?.profileImage || review.userProfileImage || review.userAvatar}
                    alt={review.userId?.name || review.userName}
                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.name || review.userName || 'User')}&background=ff6b35&color=fff&size=100`;
                    }}
                  />

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.userId?.name || review.userName}
                      </h4>
                      {review.isVerifiedPurchase && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Verified Purchase
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Review Title */}
                    <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>

                    {/* Review Comment */}
                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mb-3">
                        {review.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              console.log("View full image:", image);
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Helpful Vote Button */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleVoteToggle(review._id)}
                        disabled={votingStates[review._id]}
                        className={`flex items-center space-x-2 text-sm transition-colors ${
                          review.hasUserVoted
                            ? "text-orange-600"
                            : "text-gray-500 hover:text-orange-600"
                        } ${votingStates[review._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>
                          Helpful ({review.helpfulVotes || 0})
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
