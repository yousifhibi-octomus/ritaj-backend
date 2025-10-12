'use client';

import { useState, useEffect, use } from 'react';
import axios from '@/lib/axios';

import styles from './SubscriptionPopup.module.css';



export default function SubscriptionPopup({handleClosePopup}) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

   

  
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
    <section className={styles.section}>
      <div className={styles.popupOverlay} onClick={handleClosePopup}>
          <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
            {!submitted ? (
              <>
                <h3>✉️ أدخل بريدك الإلكتروني</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                  />
                  <button type="submit" className={styles.submitButton} onClick={handleSubmit} disabled={loading}>
                    تأكيد
                  </button>
                </form>
                <button onClick={handleClosePopup} className={styles.closeButton}>
                  إلغاء
                </button>
              </>
            ) : (
              <>
                <h3>🎉 تم الاشتراك بنجاح</h3>
                <p>شكراً لانضمامك إلى نشرتنا البريدية!</p>
                <button onClick={handleClosePopup} className={styles.closeButton}>
                  إغلاق
                </button>
              </>
            )}
          </div>
        </div>
    </section>
  );
}