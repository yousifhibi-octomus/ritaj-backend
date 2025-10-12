'use client';

import React from 'react';
import styles from './ArticleCard.module.css';
import Link from 'next/link';

const ArticleCard = ({ article, variant = "standard" }) => {
  const authorName = article.author?.name || article.author_name || "مجهول";
  const authorAvatar =
    article.author?.avatar ||
    article.author?.photo ||
    article.author?.image ||
    article.author_avatar ||
    article.author_photo ||
    article.author_image ||
    null;
 
  const rawDate =
    article.published_at ||
    article.publish_date ||
    article.date ||
    article.created_at ||
    article.updated_at ||
    null;

const formattedDate = rawDate
  ? (() => {
      const d = new Date(rawDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() +1); // 01..12
      const day = String(d.getDate()).padStart(2, '0'); // 01..31
      return `${day} ${month} ${year}`; // "05 10 2025"
    })()
  : '';

  return (
    <div className={`${styles.card} ${styles[variant]}`} dir="rtl">
   

      

      <div className={styles.cardContent}>
        {/* Meta row: avatar right, name/date left */}
        <div className={styles.metaRow}>
          <div className={styles.metaLeft}>
            <span className={styles.authorName}>{authorName}</span>
            {formattedDate && (
              <time className={styles.publishDate} dateTime={rawDate}>
                {formattedDate}
              </time>
            )}
          </div>
          <div className={styles.metaRight}>
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className={styles.authorAvatar}
              />
            ) : (
              <div className={styles.authorAvatarPlaceholder} aria-hidden="true">
                {(authorName || '').charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{article.title}</h3>
             {article.headerImage && (
        <img
          src={article.headerImage}
          alt={article.title}
          className={styles.cardImage}
        />
      )}
          <p className={styles.cardDescription}>
            {(article.text || article.description || "").slice(0, 150) + "..."}
          </p>
        </div>
        <div className={styles.buttonWrapper}>
          <div className={styles.tagsContainer}>
            <div className={styles.articleTag}>{article.tags?.[0]}</div>
            <div className={styles.articleTag}>{article.tags?.[1]}</div>
            <div className={styles.articleTag}>{article.tags?.[2]}</div>
          </div>
          <Link href={`/articles/${article.slug}`} className={styles.linkWrapper}>
            <button className={styles.readMoreBtn}>اقرأ المزيد</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;