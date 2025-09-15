// components/SocialLogin.jsx
import React, { useState } from "react";

export default function SocialLogin() {
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setLoading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Generate a random state parameter for security (CSRF protection)
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem("oauth_state", state);

      // Your Google OAuth configuration
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

      if (!clientId) {
        throw new Error("Google Client ID not configured");
      }

      // ✅ CORRECT: Use current domain dynamically
      const currentOrigin = window.location.origin; // Gets https://lionbidi.vercel.app or http://localhost:3000
      const redirectUri = encodeURIComponent(`${currentOrigin}/auth/google/callback`);

      console.log('🔄 Starting Google OAuth...');
      console.log('📍 Current Origin:', currentOrigin);
      console.log('📍 Redirect URI:', decodeURIComponent(redirectUri));

      // Google OAuth URL with all required parameters
      const googleAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=email profile&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=select_account`;

      console.log("🔗 Google OAuth URL:", googleAuthUrl);

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error("Google login setup error:", err);
      setError(err.message || "Failed to initialize Google login");
      setLoading(false);
      setIsGoogleLoading(false); // ✅ Also reset Google loading state
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex text-red-400 hover:text-red-600"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGoogleLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>
    </div>
  );
}
