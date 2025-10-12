'use client';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import styles from './ArticleRequests.module.css';
import { ActionModal } from '../ActionModal';

export default function ArticleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'view' | 'approve' | 'needs_editing' | 'reject'
  
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('/article-requests/admin/');
        setRequests(res.data);
      } catch (e) {
        setError('تعذر تحميل طلبات المقالات');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const openView = (req) => {
    setSelectedRequest(req);
    setModalAction('view');
  };

  const openModerate = (req, action) => {
    setSelectedRequest(req);
    setModalAction(action); // approve | needs_editing | reject
    // Actual API call is handled inside ActionModal using /article-requests/{id}/moderate/
  };

  const closeModal = (refresh = false) => {
    if (refresh && selectedRequest) {
      // remove request (approved / rejected / returned for edits)
      setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
    }
    setSelectedRequest(null);
    setModalAction(null);
  };

  if (loading) return <div className={styles.loading}>جارٍ التحميل...</div>;
  if (error)   return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>طلبات المقالات</h1>

      {requests.length === 0 && (
        <div className={styles.empty}>لا توجد طلبات حالياً</div>
      )}

      <div className={styles.grid}>
        {requests.map(req => (
          <div key={req.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.title}>{req.title}</h2>
              <span className={styles.status}>{req.status}</span>
            </div>
            <div className={styles.cardBody}>
              <p className={styles.author}>الكاتب: {req.author_name}</p>
              <p className={styles.date}>
                {req.created_at ? new Date(req.created_at).toLocaleDateString('ar-EG') : ''}
              </p>
              <div className={styles.excerpt}>
                {req.excerpt || (req.content || '').slice(0,150)}
              </div>
              {!!req.tags?.length && (
                <div className={styles.tags}>
                  {req.tags.map((t,i)=> <span key={i} className={styles.tag}>{t}</span>)}
                </div>
              )}
            </div>
            <div className={styles.actions}>
              <button className={styles.btnView}     onClick={() => window.open(`/article-requests/preview/${req.id}`, '_blank', 'noopener,noreferrer')}>عرض</button>
              <button className={styles.btnApprove} onClick={()=>openModerate(req,'approve')}>اعتماد</button>
              <button className={styles.btnEdit}    onClick={()=>openModerate(req,'needs_editing')}>ملاحظات</button>
              <button className={styles.btnReject}  onClick={()=>openModerate(req,'reject')}>رفض</button>
            </div>
          </div>
        ))}
      </div>

      <ActionModal
        show={!!modalAction}
        mode={modalAction}
        request={selectedRequest}
        onClose={()=>closeModal(false)}
        onSuccess={()=>closeModal(true)}
      />
    </div>
  );
}