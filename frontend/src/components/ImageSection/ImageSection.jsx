'use client';

import { useState } from 'react';
import styles from './ImageSection.module.css';

export default function ImageSection({ images }) {
  const [expanded, setExpanded] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';
  const toAbsolute = (src) => {
    if (!src) return '';
    if (src.startsWith('http')) return src;
    if (src.startsWith('/media')) return `${API_BASE}${src}`;
    return src;
  };

  const normalized = Array.isArray(images) ? images.map((img) => {
    if (typeof img === 'string') return { url: toAbsolute(img), alt: '' };
    if (img && typeof img === 'object') {
      const url = toAbsolute(img.url || img.image || '');
      return { url, alt: img.alt || '' };
    }
    return { url: '', alt: '' };
  }).filter(x => x.url) : [];

  if (!normalized || normalized.length === 0) return null;

  const openSlider = (index) => {
    setCurrentIndex(index);
    setSliderOpen(true);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const visibleImages = expanded ? normalized : normalized.slice(0, 5);

  return (
    <div className={styles.imageSection}>
      <div className={styles.heading}>
        <h1>صور اخرى</h1>
  {normalized.length > 5 && (
          <button 
            className={styles.expandButton} 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "إخفاء الصور" : "عرض المزيد من الصور"}
          >
            <img 
              src="/icons/arrow.png" 
              alt="Arrow" 
              className={`${styles.arrow} ${expanded ? styles.rotated : ''}`}
            />
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {visibleImages.map((img, index) => (
          <div key={index} className={styles.imageWrapper}  onClick={() => openSlider(index)}>
            <img 
              src={img.url} 
              alt={img.alt || `Extra Image ${index + 1}`} 
              className={styles.image} 
            />
          </div>
        ))}
      </div>
    
       {/* Slider Modal */}
      {sliderOpen && (
        <div className={styles.modalOverlay} onClick={() => setSliderOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setSliderOpen(false)}>×</button>

            <button className={styles.navButton} onClick={prevImage}>‹</button>

            <div className={styles.sliderImageWrapper}>
              <img 
                src={normalized[currentIndex].url} 
                alt={normalized[currentIndex].alt || `Slide ${currentIndex + 1}`} 
                className={styles.sliderImage} 
              />
            </div>

            <button className={styles.navButton} onClick={nextImage}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}
