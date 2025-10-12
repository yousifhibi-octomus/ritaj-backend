'use client';

import React from 'react';
import styles from './PodcastCard.module.css';
import Link from 'next/link';


const podcastCard = ({ podcast, variant = "standard" }) => {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
  
  <img src={podcast.header_image} alt={podcast.title} className={styles.cardImage} />

  <div className={styles.cardContent}>
    <h3 className={styles.cardTitle}>{podcast.title}</h3>
    <p className={styles.cardDescription}>
      {(podcast.text || podcast.description || "").slice(0, 150) + "..."}
    </p>

    <div className={styles.buttonWrapper}>
      <Link href={podcast.link} className={styles.linkWrapper}>
        <button className={styles.readMoreBtn}>شاهد</button>
      </Link>
    </div>
  </div>
</div>

  );
};

export default podcastCard;
