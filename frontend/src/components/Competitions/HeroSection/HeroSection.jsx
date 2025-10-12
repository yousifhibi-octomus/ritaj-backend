"use client";
import React from 'react';
import styles from './HeroSection.module.css';

export default function HeroSection(){
  return (
    <section className={styles.heroWrapper}>
      {/* Background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/alhamra.jpg" alt="Architecture" className={styles.bgImage} />
      <div className={styles.overlay} />
      <div className={styles.inner}>
        <h1 className={styles.title}>مسابقات العمارة</h1>
        <p className={styles.desc}>
          اكتشف فرص التحدي المعماري وانضم إلى أفضل المعماريين والمبدعين للفوز بالجوائز، إبراز أعمالك، وبناء شبكتك المهنية.
        </p>
        <div className={styles.actions}>
          <a href="#grid" className={styles.primaryBtn}>استكشاف المسابقات</a>
          
        </div>
      </div>
    </section>
  );
}
