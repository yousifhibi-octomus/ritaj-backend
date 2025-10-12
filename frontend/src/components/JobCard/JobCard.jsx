"use client";

import { useState } from 'react';
import styles from './JobCard.module.css';

function JobCard({ job }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-SA');
  };

  const getTimeSincePost = () => {
    const postDate = new Date(job.timeOfPost);
    const now = new Date();
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffDays / 30)} أشهر`;
  };

  const isUrgent = () => {
    const deadline = new Date(job.deadline);
    const today = new Date();
    const timeDiff = deadline.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 7;
  };

  const getLocationIcon = (location) => {
    return location === 'عن بُعد' ? '🏠' : '📍';
  };

  return (
    <div className={styles.jobCard}>
      {/* Job Header */}
      <div className={styles.jobHeader}>
        <div className={styles.jobMainInfo}>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <div className={styles.jobCompany}>{job.company}</div>
        </div>
        <div className={styles.salary}>{job.salary}</div>
      </div>

      {/* Job Meta Info */}
      <div className={styles.jobMeta}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>👤</span>
          <span>{job.user}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>{getLocationIcon(job.location)}</span>
          <span>{job.location}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>🕒</span>
          <span>{getTimeSincePost()}</span>
        </div>
      </div>

      {/* Deadline */}
      <div className={`${styles.deadline} ${isUrgent() ? styles.urgent : ''}`}>
        <span className={styles.clockIcon}>⏰</span>
        <span>ينتهي في {formatDate(job.deadline)}</span>
        {isUrgent() && <span className={styles.urgentBadge}>عاجل</span>}
      </div>
    </div>
  );
}

export default JobCard;