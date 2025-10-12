'use client';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import ArticleCard from '@/components/ArticleCard';
import styles from './SavedArticles.module.css';

// Unified component: if savedArticles prop provided => presentational, else it fetches by username prop.
export default function SavedArticles({ username, savedArticles: providedSaved }) {
  const [savedArticles, setSavedArticles] = useState(providedSaved || []);
  const [loading, setLoading] = useState(!providedSaved);
  const [error, setError] = useState('');

  useEffect(() => {
    if (providedSaved || !username) return; // Already have data or no username
    let ignore = false;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await axios.get(`/users/${encodeURIComponent(username)}/saved/`);
        if (!ignore) setSavedArticles(res.data || []);
      } catch (e) {
        if (!ignore) setError('تعذر تحميل المحفوظات');
      } finally { if (!ignore) setLoading(false); }
    };
    load();
    return () => { ignore = true; };
  }, [username, providedSaved]);

  if (loading) return <div className={styles.state}>جاري التحميل...</div>;
  if (error) return <div className={styles.state}>{error}</div>;

  return (
  <div className={styles.tabContent}>
      {savedArticles.length > 0 ? (
        <div className={styles.articlesGrid}>
          {savedArticles.map((article) => (
            <ArticleCard key={article.id} article={article}  variant='standard'/>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>لا توجد مقالات محفوظة حتى الآن</div>
      )}
    </div>
  );
}
