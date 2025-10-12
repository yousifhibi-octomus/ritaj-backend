'use client';

import { useState } from 'react';
import styles from './NewsLatter.module.css';
import axios from '@/lib/axios';
const NewsLatter = () => {
  const [email, setEmail] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [successMsg,  setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // Adjust URL if your API prefix differs (e.g. '/api/newsletter/subscribe/')
      const { data } = await axios.post('/newsletter/subscribe/', { email });
      setSubmitted(true);
      setSuccessMsg(data?.email ? `تم الاشتراك: ${data.email}` : 'تم الاشتراك بنجاح');
    } catch (err) {
      if (err.response) {
        // Known API error
        setErrMsg(err.response.data?.detail || 'تعذر إكمال الاشتراك');
      } else {
        setErrMsg('مشكلة في الاتصال بالخادم');
      }
    } finally {
      setLoading(false);
    }
  };  


  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h2 className={styles.title}>اشترك في النشرة البريدية</h2>
        <p className={styles.subtitle}>
          انضم للحصول على أحدث المقالات والأخبار مباشرة إلى بريدك الإلكتروني.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            required
            placeholder="أدخل بريدك الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            اشترك
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewsLatter;