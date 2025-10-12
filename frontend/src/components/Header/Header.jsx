'use client';

import { useState, useEffect } from 'react';
import { useHeaderState } from './useHeaderState/useHeaderState';
import DesktopHeader from './DesktopHeader/DesktopHeader';
import MobileHeader from './MobileHeader/MobileHeader';
import Login from '../Login';
import Register from '../Register';
import styles from './Header.module.css';
import SubscriptionPopup from '../SubscriptionPopup';

export default function Header() {
  const [isMobile, setIsMobile] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const state = useHeaderState();
const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => {
    setShowPopup(false);
    setEmail('');
    setSubmitted(false);
  };
  // Detect screen size to toggle between Desktop and Mobile headers
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 960);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <header className={styles.header}>
      <div className={`${styles.container} ${isMobile && state.isMenuOpen ? styles.menuOpen : ''}`}>
        {isMobile ? (
          <MobileHeader
            {...state}
            isMenuOpen={state.isMenuOpen}
            setIsMenuOpen={state.setIsMenuOpen}
            openSubscribe={() => setShowPopup(false)}
          />
        ) : (
          <DesktopHeader 
            {...state}
            openSubscribe={() => setShowPopup(true)}
          />
        )}
      </div>

      {/* Login Modal */}
      <Login
        isOpen={state.isLoginOpen}
        onClose={state.closeModals}
        openRegister={state.openRegister}
        onLoginSuccess={state.handleLoginSuccess}
      />

      {/* Register Modal */}
      <Register
        isOpen={state.isRegisterOpen}
        onClose={state.closeModals}
        openLogin={state.openLogin}
      />
     {showPopup && (<SubscriptionPopup handleClosePopup={handleClosePopup} /> )}

    </header>
  );
}