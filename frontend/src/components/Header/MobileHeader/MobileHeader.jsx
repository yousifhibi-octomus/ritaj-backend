'use client';
import Link from 'next/link';
import sharedStyles from '../Header.module.css';
import localStyles from './MobileHeader.module.css';
import ArticleSearch from '@/components/ArticleSearch';

export default function MobileHeader({ user, handleLogout, openLogin, searchRef, searchOpen, setSearchOpen, isMenuOpen, setIsMenuOpen }) {
  return (
    <>
      <div className={localStyles.mobileBar}>
        <Link href="/" className={sharedStyles.logo}>
          <img className={sharedStyles.logoImg} src="/images/Ritaj.png" alt="Ritaj" />
        </Link>

        <div className={localStyles.rightControls}>
           <div className={localStyles.menuPlacer}>
          
            <ArticleSearch searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
          </div>

          <button className={localStyles.menuToggle} onClick={() => setIsMenuOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

<aside className={`${localStyles.mobileMenu} ${isMenuOpen ? localStyles.mobileMenuOpen : ''}`}>
        <ul className={localStyles.mobileLinks}>
          {/* مشاريع (dropdown on desktop → direct link here) */}
          <li>
            <Link
              href={`/projects/${encodeURIComponent('مشاريع')}`}
              onClick={() => setIsMenuOpen(false)}
            >
              مشاريع
            </Link>
          </li>

          <li>
            <Link href="/news" onClick={() => setIsMenuOpen(false)}>
              أخبار واحداث
            </Link>
          </li>

            <li>
              {/* <Link href="/competitions" onClick={() => setIsMenuOpen(false)}> */}
              <Link href="/__not-found__" onClick={() => setIsMenuOpen(false)}> 
                مسابقات
              </Link>
            </li>

          <li>
            {/* <Link href="/jobs" onClick={() => setIsMenuOpen(false)}> */}
            <Link href="/__not-found__" onClick={() => setIsMenuOpen(false)}>
              وظائف
            </Link>
          </li>

          <li>
            <Link href="/podcast" onClick={() => setIsMenuOpen(false)}>
            
              بودكاست
            </Link>
          </li>

          <li>
            <Link href="/about" onClick={() => setIsMenuOpen(false)}>
              تواصل معنا
            </Link>
          </li>
          <li className={sharedStyles.navListComponent}>
            {/* <Link href="/engineers" className={sharedStyles.navLink}> */}
            <Link href="/__not-found__" className={sharedStyles.navLink}>
              المهندسون
            </Link>
          </li>

        </ul>
        <nav className={sharedStyles.searchAndJoinNav}>
          <ul className={sharedStyles.searchAndJoinList}>
            {user ? (
              <>
                <li className={sharedStyles.navLink}>
                  <Link href={`/profile/${user.name}`} onClick={() => setIsMenuOpen(false)}>
                    مرحبًا، {user.name}
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className={sharedStyles.joinButton}
                  >
                    تسجيل الخروج
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    type="button"
                    className={sharedStyles.navLink}
                    onClick={() => { openLogin(); setIsMenuOpen(false); }}
                  >
                    تسجيل الدخول
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className={sharedStyles.joinButton}
                    onClick={() => { openRegister(); setIsMenuOpen(false); }}
                  >
                    اشترك
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}