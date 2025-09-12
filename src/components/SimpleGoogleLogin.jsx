import React, { useState } from 'react';
import { BASE_URL } from '../utils/api'; // Fixed import

const SimpleGoogleLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('oauth_state', state);

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setError('Google OAuth not configured');
      setLoading(false);
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    
    const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=email profile&` +
      `state=${state}`;

    window.location.href = googleAuthUrl;
  };

  return (
    <button 
      onClick={handleGoogleLogin} 
      disabled={loading}
      className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
    >
      {loading ? 'Redirecting...' : 'Continue with Google'}
    </button>
  );
};

export default SimpleGoogleLogin;
