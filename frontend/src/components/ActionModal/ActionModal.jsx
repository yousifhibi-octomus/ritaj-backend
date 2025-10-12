'use client';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import styles from './ActionModal.module.css';

export default function ActionModal({ show, mode, request, onClose, onSuccess }) {
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const isView    = mode === 'view';
  const isApprove = mode === 'approve';
  const isEdit    = mode === 'needs_editing';
  const isReject  = mode === 'reject';

  useEffect(()=> {
    if (show) setComments('');
  }, [show, mode]);

  if (!show || !request) return null;

  const submit = async () => {
    if (isEdit && !comments.trim()) return;
    setLoading(true);
    try {
      if (!isView) {
        await axios.post(`/article-requests/${request.id}/moderate/`, {
            action: mode,
            comments: (isEdit || isReject) ? comments : ''
        });
      }
      onSuccess();
    } catch {
      alert('فشل تنفيذ العملية');
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>
          {isView && request.title}
          {isApprove && 'تأكيد الموافقة'}
          {isEdit && 'إرسال للتعديل'}
          {isReject && 'تأكيد الرفض'}
        </h3>

        {isView && (
          <>
            <p className={styles.modalText}>{(request.content || '').trim()}</p>
            {!!request.tags?.length && (
              <div className={styles.tags}>
                {request.tags.map((t,i)=> <span key={i} className={styles.tag}>{t}</span>)}
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={onClose}>إغلاق</button>
            </div>
          </>
        )}

        {!isView && (
          <>
            <p className={styles.modalText}>
              المقال: <strong>{request.title}</strong>
            </p>

            <div className={styles.confirmBox}>
              {isApprove && 'سيتم نشر المقال فور الموافقة.'}
              {isEdit && 'أدخل ملاحظات واضحة للكاتب.'}
              {isReject && 'سيتم رفض المقال ولن يُنشر.'}
            </div>

            {(isEdit || isReject) && (
              <div className={styles.comments}>
                <label className={styles.label}>الملاحظات</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  value={comments}
                  onChange={e=>setComments(e.target.value)}
                  placeholder={isEdit ? 'اكتب التعديلات المطلوبة...' : 'سبب الرفض (اختياري)...'}
                />
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={submit}
                disabled={loading || (isEdit && !comments.trim())}
              >
                {loading ? 'جارٍ التنفيذ...' : 'تأكيد'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={onClose}
                disabled={loading}
              >
                إلغاء
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}