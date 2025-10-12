'use client';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import styles from './ContactMessages.module.css';

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get('/contact/'); // now supports GET
      setMessages(data);
    } catch {
      setError('فشل تحميل الرسائل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteMessage = async (id) => {
    if (!confirm('حذف هذه الرسالة؟')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/contact/${id}/`); // consistent delete endpoint
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('تعذر الحذف');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className={styles.loading}>جارٍ التحميل...</div>;
  if (error)   return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>رسائل التواصل</h1>
        <button className={styles.reloadBtn} onClick={load}>تحديث</button>
      </div>
      {messages.length === 0 && <div className={styles.empty}>لا توجد رسائل</div>}
      <ul className={styles.list}>
        {messages.map(msg => (
          <li key={msg.id} className={styles.item}>
            <div className={styles.topLine}>
              <strong className={styles.name}>{msg.name}</strong>
              <span className={styles.email}>{msg.email}</span>
              <span className={styles.date}>{new Date(msg.created_at).toLocaleString('en-US')}</span>
            </div>
            <p className={styles.messageBody}>{msg.message}</p>
            <div className={styles.actions}>
              <button
                className={styles.deleteBtn}
                onClick={() => deleteMessage(msg.id)}
                disabled={deletingId === msg.id}
              >
                {deletingId === msg.id ? 'جارٍ الحذف...' : 'حذف'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}