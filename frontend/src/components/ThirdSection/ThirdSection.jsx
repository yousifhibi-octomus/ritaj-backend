'use client';

import React from 'react';
import ArticleCard from '../ArticleCard/ArticleCard';
import styles from './ThirdSection.module.css';
import { useState ,useEffect } from 'react';
import axios from '@/lib/axios';


const ThirdSection = () => {
  // Use the imported data instead of the hardcoded array.
  // This example gets the last 6 articles, assuming they are the latest.
    const [articles, setArticles] = useState([]);
   const [isCompact, setIsCompact] = useState(false);
   useEffect(() => {
    // Fetch articles from Django backend API using axios
    axios
      .get('/articles/') // Adjust the endpoint if necessary
      .then((response) => {
        setArticles(response.data.slice(6)); // Get the latest 6 articles
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  }, []);
useEffect(() => {
    const handle = () => setIsCompact(window.innerWidth >= 1100);
    handle();
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  return (
    <section className={styles.section}>
      {articles.length > 0 && (
        <h2 className={styles.sectionTitle}>آخر الأخبار</h2>
      )}
      <div className={`${styles.grid} ${isCompact ? styles.compactMode : ''}`}>
        {articles.map((article, index) => (
          <div
            key={article.slug || index}
            className={`${styles.cardWrapper} ${index % 3 === 1 ? styles.raised : ''} ${isCompact ? styles.compactCard : ''}`}
          >
            <ArticleCard article={article} variant={isCompact ? 'small' : 'regular'} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ThirdSection;