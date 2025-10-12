"use client";

import styles from './JobSearch.module.css';

function JobSearch({ searchQuery, setSearchQuery }) {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Main Title */}
        <h1 className={styles.title}>
          ابحث عن وظيفتك المثالية
        </h1>
        
        {/* Search Box */}
        <div className={styles.searchBox}>
          {/* Main Search Input */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <span className={styles.labelText}>بحث</span>
            </div>
            <input
              type="text"
              placeholder="ابحث عن وظيفة، شركة أو كلمة مفتاحية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.input}
              dir="rtl"
            />
          </div>
          
          {/* Location Input */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <span className={styles.labelText}>الموقع</span>
            </div>
            <input
              type="text"
              placeholder="أين تريد العمل؟"
              className={styles.input}
              dir="rtl"
            />
          </div>
          
          {/* Search Button */}
          <button className={styles.searchButton}>
            بحث
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobSearch;