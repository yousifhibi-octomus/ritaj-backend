'use client';

import React, { useEffect, useState } from 'react';
import styles from './FirstSection.module.css';
import ArticleCard from "../ArticleCard";
import axios from '@/lib/axios';

const FirstSection = () => {
  const [articles, setArticles] = useState([]);
  const [isAd , setIsAd] = useState(false);
  useEffect(() => {
    axios
      .get('/articles/')
      .then((response) => {
        setArticles(response.data.slice(0, 6)); // Get the first 6 articles
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>أحدث المقالات</h2>
      <div className={styles.layout}>

        {/* Ads area */}
        <aside className={styles.ads}>
            <div className={styles.adBox}>
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fp%2F%25D8%25B1%25D8%25AA%25D8%25A7%25D8%25AC-Ritajdzcom-100063627969003%2F&tabs=timeline&width=300&height=400&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                  width="100%"
                  height="100%"
                  style={{ border: 'none', overflow: 'hidden', width: '100%', height: '100%' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                  title="Facebook Page Plugin"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
            </div>
            {isAd && <div className={styles.adBox}>إعلان</div>}
        </aside>

        {/* Articles grid */}
        <div className={styles.grid}>
          {articles.map((article, i) => {
            let variant = "standerd";
            if (i === 0 || i === 4) variant = "featured";
            if (i === 2 || i === 5) variant = "standerd";

            return (
              <ArticleCard
                key={article.slug} // use slug as unique key
                article={article}
                variant={variant}
              />
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FirstSection;