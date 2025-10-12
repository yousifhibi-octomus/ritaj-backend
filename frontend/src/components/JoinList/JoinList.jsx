'use client';

import React from 'react';
import styles from './JoinList.module.css';
import EngineerGrid from '../EngineerGrid';
import EngineerFilter from '../EngineerFilter';

const JoinList = () => {
  const [query, setQuery] = React.useState({ page: 1, specialization: [] });
  const [count, setCount] = React.useState(0);
  const [pageInfo, setPageInfo] = React.useState({ next: null, previous: null });

  const handleFiltersChange = (patch) => {
    setQuery((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  return (
    <div className={styles.content}>
     

        <div className={styles.joinCard}>
          <div className={styles.joinTitle}>انضم إلى القائمة</div>
          <p className={styles.joinText}>
            هل أنت معماري أو مهندس مدني؟ أنشئ ملفك وابدأ باستقبال العملاء.
          </p>
          <a href="/engineers/register" className={styles.joinBtn}>انضم الآن</a>
        </div>
      </div>

      
   
  );
};

export default JoinList;