import React from 'react';
import ArticleCard from '../ArticleCard';
import styles from './AuthorArticles.module.css';

const AuthorArticles = ({ authorArticles }) => {
  return (
    <div className={styles.articlesGrid}>
      {authorArticles.length > 0 ? (
        authorArticles.map((article) => (
          <ArticleCard key={article.id} article={article} variant="standard" />
        ))
      ) : (
        <div className={styles.noContent}>لا توجد مقالات حتى الآن</div>
      )}
    </div>
  );
};

export default AuthorArticles;