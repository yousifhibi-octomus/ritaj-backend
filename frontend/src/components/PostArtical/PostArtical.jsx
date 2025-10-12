'use client';

import React, { useState , useEffect } from 'react';
import styles from './PostArtical.module.css';
import ArticleCard from '../ArticleCard';
import axios from '@/lib/axios';

const PostArtical = ({ currentTags, currentSlug }) => {
    const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    // Fetch articles from Django backend API using axios
    axios
      .get('/articles/') // Adjust the endpoint if necessary
      .then((response) => {
        setArticles(response.data.slice(-6)); // Get the latest 6 articles
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  }, []);

  const relatedArticles = articles
    .filter(article =>
      article.slug !== currentSlug &&
      article.tags?.some(tag => currentTags.includes(tag))
    )
    .slice(0, 6); 

  if (relatedArticles.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>أقرا أيضا</h2>
      <div className={styles.layout}>
        <div className={styles.articles}>
          {relatedArticles.map(article => (
            <ArticleCard
              key={article.slug}
              article={article}
              variant="small"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PostArtical;
