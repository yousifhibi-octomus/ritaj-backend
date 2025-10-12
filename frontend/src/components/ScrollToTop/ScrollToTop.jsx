"use client";

import React from "react";
import styles from "./ScrollToTop.module.css";

const ScrollToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button className={styles.button} onClick={scrollToTop} aria-label="Scroll to top">
      <img
        src="/icons/arrow.png"  // 👈 put your arrow icon here
        alt="Go to top"
        className={styles.icon}
      />
    </button>
  );
};

export default ScrollToTop;
