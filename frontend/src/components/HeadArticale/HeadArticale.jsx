'use client';

import React, { useState, useEffect } from 'react';
import styles from './HeadArticle.module.css';
import Link from 'next/link';
import axios from '@/lib/axios'; 

const HeadArticle = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showArrows, setShowArrows] = useState(false);
  const [slides, setSlides] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Fetch articles from Django backend API using axios
    axios
      .get('/articles/') // Adjust the endpoint if necessary
      .then((response) => {
        setArticles(response.data.slice(-6)); // Get the latest 6 articles
      })
      .catch((error) => {
        console.error("Error fetching articles:", error);
      });
  }, []);

  useEffect(() => {
    // Load the first 5 articles from the fetched data for the slider
    setSlides(articles.slice(0, 5));
  }, [articles]);

  const totalSlides = slides.length;

  const handlePrev = () => {
    setCurrentSlide(prev => prev === 1 ? totalSlides : prev - 1);
  };

  const handleNext = () => {
    setCurrentSlide(prev => prev === totalSlides ? 1 : prev + 1);
  };

  if (!slides.length) return null; // wait until slides are loaded

  return (
    <div className={styles['outer-wrapper']}>
      <div 
        className={styles['s-wrap']} 
        role="slider"
        onMouseEnter={() => setShowArrows(true)}
        onMouseLeave={() => setShowArrows(false)}
      >
        {/* Hidden radio inputs */}
        {slides.map((_, i) => (
          <input
            key={i}
            type="radio"
            id={`s-${i + 1}`}
            name="slider-control"
            checked={currentSlide === i + 1}
            onChange={() => setCurrentSlide(i + 1)}
            className={styles['radio-input']}
          />
        ))}

        {/* Slides */}
        <ul 
          className={styles['s-content']}
          style={{ transform: `translateX(-${(currentSlide - 1) * (100 / totalSlides)}%)` }}
        >
          {slides.map((slide, i) => (
            <li key={slide.slug || i} className={styles['s-item']}>
              <img src={slide.headerImage} alt={slide.title} className={styles['slide-img']} />
              <div className={styles.contantArea}>
                <div className={styles['text-overlay']}>
                  <h2 className={styles['slide-title']}>{slide.title}</h2>
                  <p className={styles['slide-subtitle']}>
                    {slide.text.substring(0, 150)}...
                  </p>
                </div>
                <div className={styles.buttonDiv}>
                  {slide.slug && (
                    <Link href={`/articles/${slide.slug}`} passHref>
                      <button className={styles['read-more-btn']}>
                        <span className={styles['read-more-icon']}>
                          <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 0h24v24H0z" fill="none"></path>
                            <path d="M7.828 13l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414L7.828 11H20v2z" fill="currentColor"></path>
                          </svg>
                        </span>
                        <p className={styles['read-more-text']}>اقرأ المزيد</p>
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Left Arrow */}
        <div 
          className={`${styles['nav-arrow']} ${styles.right} ${showArrows ? styles.visible : ''}`} 
          onClick={handlePrev}
        >
          <svg className={styles['arrow-icon']} viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </div>

        {/* Right Arrow */}
        <div 
          className={`${styles['nav-arrow']} ${styles.left} ${showArrows ? styles.visible : ''}`} 
          onClick={handleNext}
        >
          <svg className={styles['arrow-icon']} viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </div>

        {/* Dots */}
        <div className={styles['s-control']}>
          {slides.map((_, i) => (
            <label
              key={i}
              className={`${styles.dot} ${currentSlide === i + 1 ? styles.active : ''}`}
              htmlFor={`s-${i + 1}`}
              onClick={() => setCurrentSlide(i + 1)}
            ></label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeadArticle;
