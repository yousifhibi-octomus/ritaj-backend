'use client';
import Link from 'next/link';
import sharedStyles from '../Header.module.css';
import localStyles from './DesktopHeader.module.css';
import ArticleSearch from '@/components/ArticleSearch';
export default function DesktopHeader({ user, handleLogout, openLogin, openSubscribe, setIsMenuOpen, searchRef, searchOpen, setSearchOpen }) {
  return (
    <div className={localStyles.desktopBar}>
      <div className={sharedStyles.logoRow}>
      <Link href="/" className={sharedStyles.logo}>
        <img className={sharedStyles.logoImg} src="/images/Ritaj.png" alt="Ritaj" />
      </Link></div>

      <nav className={sharedStyles.nav}>
        <ul className={sharedStyles.navList}>
          <li className={`${sharedStyles.dropdown} ${sharedStyles.navListComponent}`}>
            <span className={sharedStyles.navListComponent}>
              <Link href={`/projects/${encodeURIComponent('مشاريع')}`} className={sharedStyles.navLink}>مشاريع</Link>
            </span>
            <ul className={sharedStyles.dropdownMenu}>
              {['عمارة', 'تصميم داخلي', 'تصميم صناعي', 'تصميم مدينة', 'تصميم رقمي'].map((c) => (
                <li key={c}>
                  <Link href={`/projects/${encodeURIComponent(c)}`} className={sharedStyles.dropdownLink}>{c}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li className={sharedStyles.navListComponent}><Link href="/news" className={sharedStyles.navLink}>أخبار واحداث</Link></li>
          <li className={sharedStyles.navListComponent}>
          {/* <Link href="/competitions" className={sharedStyles.navLink}> */}
            <Link href="/__not-found__" className={sharedStyles.navLink}>
              مسابقات
            </Link>
          </li>
          <li className={sharedStyles.navListComponent}>
            {/* <Link href="/jobs" className={sharedStyles.navLink}> */}
            <Link href="/__not-found__" className={sharedStyles.navLink}>
              وظائف
            </Link>
          </li>
          <li className={sharedStyles.navListComponent}>
            <Link href="/podcast" className={sharedStyles.navLink}>
              بودكاست
            </Link>
          </li>
          <li className={sharedStyles.navListComponent}>
            <Link href="/about" className={sharedStyles.navLink}>
              تواصل معنا
            </Link>
          </li>
          <li className={sharedStyles.navListComponent}>
            {/* <Link href="/engineers" className={sharedStyles.navLink}> */}
            <Link href="/__not-found__" className={sharedStyles.navLink}>
              المهندسون
            </Link>
          </li>
          <li ref={searchRef} className={searchOpen ? sharedStyles.searchOpen : undefined}>
            <ArticleSearch searchOpen={searchOpen} setSearchOpen={setSearchOpen} />
          </li>
        </ul>
      </nav>

      <nav className={sharedStyles.searchAndJoinNav}>
        <ul className={sharedStyles.searchAndJoinList}>
          {user ? (
            <>
              <li className={sharedStyles.navLink}><Link href={`/profile/${user.name}`}>مرحبًا، {user.name}</Link></li>
              <li><button onClick={() => { handleLogout(); window.location.reload(); }} className={sharedStyles.joinButton}>تسجيل الخروج</button></li>
            </>
          ) : (
            <>
              <li>
                <a href="#" className={sharedStyles.navLink} onClick={(e) => { e.preventDefault(); openLogin(); }}>تسجيل الدخول</a>
              </li>
              <li> <button
  type="button"
  className={sharedStyles.joinButton}
  onClick={() => { openSubscribe(); setIsMenuOpen(false); }}
>
  اشترك
</button></li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}