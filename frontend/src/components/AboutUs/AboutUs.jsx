'use client';

import React, { useState } from 'react';
import styles from './AboutUs.module.css';
import axios from '@/lib/axios';

const AboutUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (!form.name || !form.email || !form.message) {
      return setStatus({ type: 'error', text: 'املأ جميع الحقول' });
    }

    setLoading(true);
    try {
      await axios.post('/contact/', form);
      setStatus({ type: 'success', text: 'تم الإرسال بنجاح' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      const msg = err.response?.data
        ? Object.entries(err.response.data).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join('، '):v}`).join(' | ')
        : 'خطأ في الإرسال';
      setStatus({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>تواصل معنا</h2>
      <p className={styles.text}>
        لديك سؤال أو مشروع ترغب في عرضه؟ تواصل معنا الآن وسنكون سعداء بمساعدتك!
      </p>

      <div id="contact-section" className={styles.contactForm}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.label}>
            الاسم:
            <input
              type="text"
              name="name"
              className={styles.input}
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
          <label className={styles.label}>
            البريد الإلكتروني:
            <input
              type="email"
              name="email"
              className={styles.input}
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
            <label className={styles.label}>
              الرسالة:
              <textarea
                name="message"
                className={styles.textarea}
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}
          </button>
          {status.text && (
            <div
              className={
                status.type === 'success'
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {status.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AboutUs;