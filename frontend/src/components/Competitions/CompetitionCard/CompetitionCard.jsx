"use client";
import React from 'react';
import styles from './CompetitionCard.module.css';
import Link from 'next/link';
const statusMap = {
  upcoming: { label: 'قادمة', cls: styles.status_upcoming },
  active: { label: 'نشطة', cls: styles.status_active },
  completed: { label: 'مكتملة', cls: styles.status_completed },
  cancelled: { label: 'ملغاة', cls: styles.status_cancelled },
};

export default function CompetitionCard({ comp }) {
  const s = statusMap[comp.status] || { label: comp.status, cls: '' };
  const badgesEl = (
    <div className={styles.badgesOverlay}>
      <span className={`${styles.status} ${s.cls}`}>{s.label}</span>
      {comp.featured && <span className={styles.featured}>مميزة</span>}
    </div>
  );
 
  return (
    <div className={styles.card}>
      {comp.cover_image ? (
        <div className={styles.cover}>
          <img src={comp.cover_image} alt={comp.title} />
          {badgesEl}
        </div>
      ) : (
        <div className={styles.noCoverBadges}>{badgesEl}</div>
      )}
      <div className={styles.body}>
        {/* badges removed from here */}
        <h3 className={styles.title}>{comp.title}</h3>
        <p className={styles.desc}>{comp.description}</p>
        <div className={styles.tags}>
          <span className={styles.tag}>{arabicCategory(comp.category)}</span>
          <span className={styles.tag}>{arabicAudience(comp.target_audience)}</span>
        </div>
        <div className={styles.meta}>
          <span>المشاركين: {comp.participant_count}</span>
          <span>{formatDate(comp.registration_start)} – {formatDate(comp.registration_end)}</span>
        </div>
      </div>
      <div className={styles.actions}>
  <Link href={`/competition/${comp.id}`} className={styles.btn}>
    التفاصيل
  </Link>

      </div>
    </div>
  );
}

function arabicCategory(c){
  const map = { architectural_design: 'تصميم معماري', urban_planning: 'تخطيط عمراني', housing: 'الإسكان', restoration:'الترميم', ideas:'مسابقة أفكار' };
  return map[c] || c;
}
function arabicAudience(a){
  const map = { professionals: 'محترفون', students: 'طلاب', open: 'مفتوحة للجميع' };
  return map[a] || a;
}
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  // Return dd/mm/yyyy
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
