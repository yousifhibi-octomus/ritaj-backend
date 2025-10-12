'use client';

import { useState } from 'react';
import { login } from '@/lib/auth';
import styles from './Login.module.css';

export default function Login({ isOpen, onClose, openRegister, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login({ email, username: email, password });
      // data.user shape: {id, username, name, role}
      const userObj = {
        id: data.user.id,
        username: data.user.username,
        name: data.user.name || data.user.username,
        role: data.user.role,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userObj));
        window.dispatchEvent(new Event('auth:login'));
      }
      onLoginSuccess && onLoginSuccess(userObj);
      window.location.reload();
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'خطأ في تسجيل الدخول');
    }
  };
const getApiBase = () => {
  const url = process.env.NEXT_PUBLIC_DJANGO_API_URL;
  if (!url) return 'http://localhost:8000/api';
  return url.replace(/\/$/, '');
};

const handleGoogleLogin = () => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '<YOUR_GOOGLE_CLIENT_ID>';
  const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT || (window.location.origin + '/auth/google/callback');
  const scope = encodeURIComponent('openid email profile');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent',
  });
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  window.location.href = url;
};
const handleAppleLogin = () => {
  window.location.href = getApiBase() + '/auth/login/apple/';
};
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>✖</button>
        <h2>تسجيل الدخول</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            className={styles.input}
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className={styles.input}
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={styles.submitBtn} >دخول</button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

        <p className={styles.signUpLabel}>
          ليس لديك حساب؟{' '}
          <span className={styles.signUpLink} onClick={openRegister}>إنشاء حساب</span>
        </p>

        <div className={styles.buttonsContainer}>
       

          {/* Google Login Button */}
          {/* Google Login Button */}
          <div className={styles.googleLoginButton}  onClick={handleGoogleLogin}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 48 48" className="google-icon" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span>الدخول عبر Google</span>
          </div>
        </div>
      </div>
    </div>
  );
}
