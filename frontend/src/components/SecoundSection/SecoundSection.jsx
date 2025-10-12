'use client';

import React, { useState ,useEffect } from 'react';
import styles from './SecoundSection.module.css';
import ArticleCard from '../ArticleCard';
import axios from '@/lib/axios';
import SubscriptionPopup from '../SubscriptionPopup';

const SecoundSection = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [articles, setArticles] = useState([]);
   const [isAd , setIsAd] = useState(false);
 
useEffect(() => {
  axios
    .get('/articles/')
    .then((response) => {
      const data = Array.isArray(response.data) ? response.data : [];
      // Pick 3 random distinct articles
      const randomThree = [...data]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setArticles(randomThree);
    })
    .catch((error) => {
      console.error('Error fetching articles:', error);
    });
}, []);

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => {
    setShowPopup(false);
    setEmail('');
    setSubmitted(false);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

   const latestArticles = articles.slice(-3);
  
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>أبرز الأحداث</h2>
      <div className={styles.layout}>
        
        {/* Newsletter Ad Area */}
        <aside  className={styles.aside}>
          <div className={styles.newsletter}>
          <h3 className={styles.newsletterTitle}>📩 اشترك في النشرة البريدية</h3>
          <p className={styles.newsletterText}>
            انضم للحصول على أحدث المقالات والأخبار مباشرة إلى بريدك الإلكتروني.
          </p>
          <button onClick={handleOpenPopup} className={styles.subscribeBtn}>
            اشترك الآن
          </button>
          </div>
          <div className={styles.ads}>
            {isAd && <div className={styles.adBox}>مساحة إعلانية</div>}
          </div>
        </aside>

        {/* Articles */}
        <div className={styles.articles}>
          { latestArticles.map((article) => (
            <ArticleCard
              key={article.slug}
              article={article}
              variant="standard"
            />
          ))}
        </div>
      </div>
      {/* Subscription Popup */}
      {/* Popup */}
      {showPopup && (
        <SubscriptionPopup handleClosePopup={handleClosePopup} />
      )}
    </section>
  );
};

export default SecoundSection;
