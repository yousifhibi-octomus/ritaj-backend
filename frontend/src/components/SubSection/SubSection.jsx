'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from '@/lib/axios';
import ArticleCard from '../ArticleCard/ArticleCard';
import styles from './SubSection.module.css';

const SPAN_PATTERN = [4,8,4,4,4,8,4];
const PAGE_SIZE = 50;

export default function SubSection({ tag }) {
  const [articles, setArticles] = useState([]);
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1920);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    axios.get('/articles/')
      .then(res => setArticles(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error('Error fetching articles:', err));
  }, []);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setCurrentPage(0); }, [tag]);

  const below1000 = width < 1100;
  const below500  = width < 500;

  // Sort by date (desc). Adjust field name if your API uses created_at instead of date.
  const sorted = useMemo(() => {
    return [...articles].sort((a, b) => {
      const ad = new Date(a.date || a.created_at || 0).getTime();
      const bd = new Date(b.date || b.created_at || 0).getTime();
      return bd - ad; // newest first
    });
  }, [articles]);

  const filtered = tag ? sorted.filter(a => a.tags?.includes(tag)) : sorted;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);
  const start = safePage * PAGE_SIZE;
  const pageArticles = filtered.slice(start, start + PAGE_SIZE);

  return (
    <section className={styles.section}>
      <div className={`${styles.grid} ${below1000 ? styles.compact2 : ''} ${below500 ? styles.compact1 : ''}`}>
        {pageArticles.map((article, i) => {
          const globalIndex = start + i;
          const span = SPAN_PATTERN[globalIndex % SPAN_PATTERN.length];
          const variant = below1000 ? 'small' : (span === 8 ? 'featured' : 'small');
          return (
            <div
              key={article.id || globalIndex}
              className={`${styles.cardWrapper} ${span === 8 ? styles.colSpan8 : styles.colSpan4} ${below1000 ? styles.forceSpan : ''}`}
            >
              <ArticleCard article={article} variant={variant} />
            </div>
          );
        })}
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className={styles.pagination}>
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            السابق
          </button>
          <span className={styles.pageInfo}>
            الصفحة {safePage + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
          >
            التالي
          </button>
        </div>
      )}
    </section>
  );
}