'use client';

import { React, useState, useEffect } from 'react';
import styles from './ArchitecturalPodcast.module.css';
import SocialIcons from '../SocialIcons';
import axios from '@/lib/axios';
import PodcastCard from '../PodcastCard';

export default function ArchitecturalPodcast() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWide, setIsWide] = useState(false); // >=1100 => long

  // Fetch podcasts
  useEffect(() => {
    axios.get('/podcasts/')
      .then(res => setPodcasts(res.data))
      .catch(err => console.error('Error fetching podcasts:', err))
      .finally(() => setLoading(false));
  }, []);

  // Track viewport width
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1100px)');
    const apply = () => setIsWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (loading) {
    return <div className={styles.loading}>جاري التحميل...</div>;
  }

  return (
    <div className={styles.main}>
      <div
        className={styles.podcastHero}
        style={{ backgroundImage: `url(/images/placeHolder.png)` }}
      >
        <div className={styles.overlay}>
          <h1 className={styles.podcastTitle}>بودكاست العمارة</h1>
          <h2 className={styles.podcastSubtitle}>حول:</h2>
            <p className={styles.podcastDescription}>
              بودكاست العمارة يقدم محادثات ملهمة حول التصميم المعماري، المدن، والهندسة المستدامة.
              يستضيف البرنامج مهندسين معماريين ومصممين بارزين لمشاركة رؤاهم وأفكارهم حول أحدث الاتجاهات والمشاريع العالمية.
            </p>
          <p className={styles.podcastCTA}>استمع واشترك</p>
          <SocialIcons />
        </div>
      </div>

      <section className={styles.section}>
        <div className={`${styles.grid} ${isWide ? styles.gridWide : styles.gridNarrow}`}>
          {podcasts.map(podcast => (
            <div
              key={podcast.id}
              className={`${styles.cardWrapper} ${isWide ? styles.longCard : styles.smallCard}`}
            >
              <PodcastCard
                podcast={podcast}
                variant={isWide ? 'long' : 'small'}  // only change needed for component logic
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}