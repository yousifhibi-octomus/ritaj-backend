'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import styles from './AuthorRequests.module.css';

export default function AuthorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/author-requests/admin/');
        setRequests(res.data);
      } catch (e) {
        setError('تعذر تحميل طلبات التأليف');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

const handleApprove = async (username) => {
  try {
    await axios.post(`/author-requests/${username}/moderate/`, { action: 'approve' });
    setRequests((prev) => prev.filter((req) => req.username !== username));
    alert('تمت الموافقة على الطلب');
  } catch (e) {
    alert('تعذر الموافقة على الطلب');
  }
};

const handleReject = async (username) => {
  try {
    await axios.post(`/author-requests/${username}/moderate/`, { action: 'reject' });
    setRequests((prev) => prev.filter((req) => req.username !== username));
    alert('تم رفض الطلب');
  } catch (e) {
    alert('تعذر رفض الطلب');
  }
};

 
  if (loading) return <div>جارٍ التحميل...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>طلبات التأليف</h1>
      {requests.length === 0 ? (
        <p className={styles.noRequests}>لا توجد طلبات تأليف حالياً.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الدافع</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {requests
              .filter((req) => req.status === 'pending')
              .map((req) => (
                <tr key={req.id}>
                  <td>{req.username}</td>
                  <td>{req.email}</td>
                  <td>{req.motivation || '—'}</td>
                  <td>{req.status === 'pending' ? 'قيد المراجعة' : req.status}</td>
                  <td>
                     <div className={styles.actionButtons}>
                        <button
                          className={styles.approveButton}
                          onClick={() => handleApprove(req.username)}
                        >
                          موافقة
                        </button>
                        <button
                          className={styles.rejectButton}
                          onClick={() => handleReject(req.username)}
                        >
                          رفض
                        </button>
                      </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}