'use client';
import { useState, useEffect, useRef } from 'react';

export function useHeaderState() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // Listen for global auth events so header updates when login/logout occur
  useEffect(() => {
    const onLogin = () => {
      try {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
      } catch (e) {
        // ignore
      }
    };
    const onLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:login', onLogin);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:login', onLogin);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  useEffect(() => {
    const outside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const handleLoginSuccess = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  const openLogin = () => { setIsLoginOpen(true); setIsRegisterOpen(false); };
  const openRegister = () => { setIsRegisterOpen(true); setIsLoginOpen(false); };
  const closeModals = () => { setIsLoginOpen(false); setIsRegisterOpen(false); };

  return {
    isMenuOpen, setIsMenuOpen,
    isLoginOpen, isRegisterOpen,
    user, searchOpen, setSearchOpen,
    searchRef,
    handleLoginSuccess, handleLogout,
    openLogin, openRegister, closeModals
  };
}
