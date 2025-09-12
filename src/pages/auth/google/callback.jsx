import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function GoogleAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const code = query.get('code');
    const returnedState = query.get('state');

    const expectedState = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state'); 

    if (returnedState !== expectedState) {
      console.error('State mismatch - possible CSRF attack');
      alert('Security error during login');
      router.push('/login');
      return;
    }

    axios.post('http://localhost:5000/api/auth/google-signin', { credential: code })
      .then(response => {
        console.log('Google login successful:', response.data);
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard');  // Change this as needed
      })
      .catch(err => {
        console.error('Google login failed:', err.response?.data || err.message);
        router.push('/login?error=auth_failed');
      });
  }, []);

  return <p>Processing your Google login...</p>;
}
