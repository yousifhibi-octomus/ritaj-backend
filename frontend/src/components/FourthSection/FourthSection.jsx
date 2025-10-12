'use client';

import React, { useEffect, useRef } from 'react';
import styles from './FourthSection.module.css';
import PodcastCard from "../PodcastCard";
import axios from '@/lib/axios';

const ForthSection = () => {
  const sliderRef = useRef(null);
  const [podcastsData, setPodcastsData] = React.useState([]);

  useEffect(() => {
    axios
      .get('/podcasts/') // Adjust the endpoint if necessary
      .then((response) => {
        setPodcastsData(response.data); // Set the fetched podcasts
      })
      .catch((error) => {
        console.error('Error fetching podcasts:', error);
      });     
  }, []);
  // Select the first five podcasts in their original order
  const podcastsToDisplay = podcastsData.slice(0, 5);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let currentIndex = 0;

    const applyClasses = () => {
      Array.from(slider.children).forEach((card, index) => {
        if (index === currentIndex) {
          card.classList.add(styles.highlighted);
          card.classList.remove(styles.grayed);
        } else {
          card.classList.remove(styles.highlighted);
          card.classList.add(styles.grayed);
        }
      });
    };

    const centerCard = (index) => {
      const card = slider.children[index];
      if (!card) return;
      const offset = card.offsetLeft - (slider.offsetWidth / 2) + (card.offsetWidth / 2);
      slider.scrollTo({ left: offset, behavior: 'smooth' });
    };

    // Initial state
    applyClasses();
    centerCard(currentIndex);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % podcastsToDisplay.length;
      applyClasses();
      centerCard(currentIndex);
    }, 4000); // advance every 4s

    return () => clearInterval(interval);
  }, [podcastsToDisplay.length]);

  return (
    <>
      {podcastsToDisplay.length > 0 &&(<>
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>بودكاست</h2>

      <div className={styles.grid} ref={sliderRef}>
        {podcastsToDisplay.map((podcast) => (
          <PodcastCard
            key={podcast.id}
            podcast={podcast}
            variant="featured"
          />
        ))}
      </div>
    </section>
    </>)}
    </>
  );
};

export default ForthSection;