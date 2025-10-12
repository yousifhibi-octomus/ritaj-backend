
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from './not-found.module.css';

export default function NotFound() {
  const [showTitle, setShowTitle] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowTitle(true), 500),
      setTimeout(() => setShowSubtitle(true), 1200),
      setTimeout(() => setShowContent(true), 2000),
      setTimeout(() => setShowMessage(true), 3000),
      setTimeout(() => setShowButton(true), 4000)
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <h1 className={`${styles.title} ${showTitle ? styles.fadeInScale : styles.hidden}`}>
              404
            </h1>
            <span className={`${styles.subtitle} ${showSubtitle ? styles.slideInRight : styles.hidden}`}>
              (الصفحة غير موجودة)
            </span>
          </div>
        </div>

      

        {/* Main Message */}
        <div className={`${styles.mainMessage} ${showMessage ? styles.typewriterMessage : styles.hidden}`}>
          <p className={styles.primaryText}>
            نرجو المعذرة، الصفحة التي تبحث عنها هي عمل قيد التنفيذ. ربما تم نقلها، حذفها، أو لم يتم كتابتها بعد.
          </p>
          <p className={styles.secondaryText}>
            في هذه الأثناء، لا تتردد في العودة إلى{' '}
            <Link href="/" className={styles.inlineLink}>
              الصفحة الرئيسية
            </Link>
            {' '}أو تصفح أحدث منشوراتنا.
          </p>
        </div>

        {/* Action Button */}
        <div className={`${styles.buttonSection} ${showButton ? styles.slideInUp : styles.hidden}`}>
          <Link href="/" className={styles.homeButton}>
            <span className={styles.buttonIcon}>←</span>
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}