import React, { useEffect, useState } from 'react';
import styles from './Highlight.module.css';
import axios from '@/lib/axios';
import Link from 'next/link';

const Highlight = ({ article }) => {
  const [similar, setSimilar] = useState(null);
  const tags = article.tags || [];

  useEffect(() => {
    if (!tags.length) return;
    axios
      .get('/articles/')
      .then((response) => {
        const articles = response.data.filter(
          (a) =>
            a.slug !== article.slug &&
            a.tags?.some((tag) => tags.includes(tag))
        );
        setSimilar(articles[0] || null);
      })
      .catch((err) => setSimilar(null));
  }, [article.slug, tags]);

  return (
    <div className={styles.highlight}>
      {similar ? (
        <Link href={`/articles/${similar.slug}`} className={styles.similarLink}>
          {similar.headerImage && (
            <img
              src={similar.headerImage}
              alt={similar.title}
              className={styles.similarImage}
            />
          )}
          <p className={styles.similarTitle}>{similar.title}</p>
        </Link>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default Highlight;
