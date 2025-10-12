"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function GoogleCallbackPage() {
  const [message, setMessage] = useState('Processing...');
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setMessage('Google returned an error: ' + error);
      return;
    }

    if (!code) {
      setMessage('No code found in the redirect.');
      return;
    }

    const sendCode = async () => {
      try {
        // Build backend root (from env). This should point to the backend root (may include /api).
        const apiRoot = (process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api/').replace(/\/$/, '');
        const redirect_uri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT || (window.location.origin + '/auth/google/callback');
        const payload = {
          code,
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '<YOUR_GOOGLE_CLIENT_ID>',
          redirect_uri,
        };

        const url = `${apiRoot}/dj-rest-auth/google/`; // matches backend routing (e.g. http://localhost:8000/api/dj-rest-auth/google/)

        // Use axios with credentials so session/cookies are included
        const res = await axios.post(url, payload, { withCredentials: true });
      
        setMessage('Logged in successfully');

        // If the backend returned user info include it in localStorage and
        // dispatch an 'auth:login' event so header components update.
        try {
          const user = res.data?.user ?? null;
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            try { window.dispatchEvent(new Event('auth:login')); } catch (e) { /* ignore */ }
          } else {
            // If backend didn't include user, try fetching auth status endpoint
            try {
              const statusUrl = `${apiRoot}/auth/status/`;
              const statusRes = await axios.get(statusUrl, { withCredentials: true });
              const fetchedUser = statusRes.data?.user ?? null;
              if (fetchedUser) {
                localStorage.setItem('user', JSON.stringify(fetchedUser));
                try { window.dispatchEvent(new Event('auth:login')); } catch (e) { /* ignore */ }
              }
            } catch (fetchErr) {
              // ignore, still proceed to redirect
            }
          }
        } catch (e) {
          // ignore storage errors
        }

        // Redirect the user to the application root on success
        // use replace so the callback URL isn't left in history
        try {
          router.replace('/');
        } catch (e) {
          // Fallback if router is unavailable for any reason
          window.location.replace('/');
        }
      } catch (err) {
        console.error('Google login error', err.response?.status, err.response?.data, err.message);
        const serverData = err.response?.data;
        setMessage('Login failed: ' + (serverData?.detail || JSON.stringify(serverData) || err.message));
      }
    };

    sendCode();
  }, []);

  return (
    <div style={{padding:20}}>
      <h1>Google Callback</h1>
      <p>{message}</p>
    </div>
  );
}
