// callback.jsx - COMPLETE CORRECTED VERSION
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function GoogleAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get URL parameters
        const query = new URLSearchParams(window.location.search);
        const code = query.get('code');
        const returnedState = query.get('state');
        const error = query.get('error');

        console.log('Google callback received:', {
          code: !!code,
          state: returnedState,
          error
        });

        // Handle OAuth errors (user cancelled, etc.)
        if (error) {
          console.error('Google OAuth error:', error);
          router.push('/login?error=oauth_cancelled');
          return;
        }

        // Check if we have the authorization code
        if (!code) {
          console.error('No authorization code received');
          router.push('/login?error=no_authorization_code');
          return;
        }

        // ✅ SECURITY: Verify state parameter to prevent CSRF attacks
        const expectedState = sessionStorage.getItem('oauth_state');
        sessionStorage.removeItem('oauth_state');

        if (returnedState !== expectedState) {
          console.error('State mismatch - possible CSRF attack');
          alert('Security error during login');
          router.push('/login');
          return;
        }

        // ✅ CORRECT: Use environment variable for backend URL
        const API_URL = process.env.REACT_APP_API_URL || 'https://lion-bidi-backend.onrender.com';
        
        console.log('🔗 Using API URL:', API_URL);
        console.log('📝 Calling endpoint:', `${API_URL}/api/auth/google/callback`);

        // ✅ CORRECT: Call the right endpoint with the right data
        const response = await axios.post(`${API_URL}/api/auth/google/callback`, {
          code: code,        // Send the authorization code
          state: returnedState, // Send the state for verification
        });

        console.log('✅ Google login successful:', response.data);

        // Store the JWT token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Token stored successfully');
        }

        // Store user data if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          console.log('User data stored successfully');
        }

        // Redirect to dashboard or home page
        router.push('/dashboard'); // Change this to your desired redirect

      } catch (err) {
        console.error('❌ Google login failed:', err.response?.data || err.message);
        
        // Handle different types of errors
        if (err.response?.status === 400) {
          router.push('/login?error=invalid_request');
        } else if (err.response?.status === 401) {
          router.push('/login?error=unauthorized');
        } else {
          router.push('/login?error=auth_failed');
        }
      }
    };

    // Call the handler
    handleGoogleCallback();
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #ff6b35',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <h2 style={{ color: '#333', marginBottom: '0.5rem' }}>
          Processing your Google login...
        </h2>
        <p style={{ color: '#666', margin: 0 }}>
          Please wait while we authenticate your account.
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
