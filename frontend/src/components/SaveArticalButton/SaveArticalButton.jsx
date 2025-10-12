'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import styles from './SaveArticalButton.module.css';

const SaveArticalButton = ({ articleId, initialSaved = false, initialCount = 0 }) => {
  const [saved, setSaved] = useState(initialSaved);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Sync internal state if parent passes new values (e.g. navigation between articles)
  useEffect(() => {
    setSaved(initialSaved);
  }, [initialSaved]);
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);
  // Check auth status (session-based)
  const refreshAuth = async () => {
    try {
      const res = await axios.get('/auth/status/');
      if (res.status === 200 && res.data.is_authenticated) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    refreshAuth();
    const handler = () => refreshAuth();
    window.addEventListener('auth:login', handler);
    window.addEventListener('auth:logout', handler);
    return () => {
      window.removeEventListener('auth:login', handler);
      window.removeEventListener('auth:logout', handler);
    };
  }, []);

  // Fetch initial state
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const res = await axios.get(`/articles/${articleId}/save/`);
        if (!ignore) {
          setSaved(res.data.is_saved);
          setCount(res.data.total_saves);
        }
      } catch (e) {
        console.error('Failed to load save state', e);
      }
    };
    load();
    return () => { ignore = true; };
  }, [articleId]);

  const handleClick = async () => {
    if (!isLoggedIn) {
      alert('يجب تسجيل الدخول لحفظ المقال');
      return;
    }

    if (loading) return;
    setLoading(true);
    try {
      if (!saved) {
        const res = await axios.post(`/articles/${articleId}/save/`);
        if (res.status === 201 || res.status === 200) {
            setSaved(true);
            setCount((c) => c + 1);
        }
      } else {
        const res = await axios.delete(`/articles/${articleId}/save/`);
        if (res.status === 200 || res.status === 204) {
            setSaved(false);
            setCount((c) => Math.max(0, c - 1));
        }
      }
    } catch (error) {
      if (error.response) {
        console.error('Save toggle failed:', error.response.status, error.response.data);
        if (error.response.status === 403) {
          alert('فشل الحفظ بسبب CSRF أو الجلسة. أعد تحميل الصفحة أو سجّل الدخول مجددًا.');
        }
      } else {
        console.error('Network / client error while toggling save:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={styles.Btnss} onClick={handleClick} disabled={loading}>
      {loading ? '...' : (saved ? 'مُسجل' : 'حفظ المقال')}
      {saved && (
        <svg
          viewBox="0 0 384 512"
          fill="white"
          height="0.9em"
          className={styles.icon}
        >
          <path d="M0 48V487.7C0 501.1 10.9 512 24.3 512c5 0 9.9-1.5 14-4.4L192 400 345.7 507.6c4.1 2.9 9 4.4 14 4.4c13.4 0 24.3-10.9 24.3-24.3V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48z"></path>
        </svg>
      )}
      {count > 0 && <span className={styles.count}>{count}</span>}
    </button>
  );
};

export default SaveArticalButton;