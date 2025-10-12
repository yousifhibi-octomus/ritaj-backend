'use client';
import { useState } from 'react';
import axios from '@/lib/axios';
import styles from './RequestModerationPanel.module.css';

export default function RequestModerationPanel({ request, onDone }) {
  const [mode, setMode] = useState(null); // 'approve' | 'needs_editing' | 'reject'
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!request) return null;

  const reset = () => {
    setMode(null);
    setComments('');
  };

  const submit = async () => {
    if (!mode) return;
    if (mode === 'needs_editing' && !comments.trim()) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await axios.post(`/article-requests/${request.id}/moderate/`, {
        action: mode,
        comments: (mode === 'needs_editing' || mode === 'reject') ? comments : ''
      });
      const msg =
        mode === 'approve'
          ? 'تم اعتماد المقال'
          : mode === 'needs_editing'
            ? 'تم إرسال الملاحظات'
            : 'تم رفض المقال';
      setSuccessMsg(msg);
      if (onDone) onDone({ id: request.id, action: mode, comments });
      reset();
    } catch {
      setSuccessMsg('حدث خطأ أثناء التنفيذ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>مراجعة المقال</h2>

      {!successMsg && (
        <>
          <div className={styles.actionsRow}>
            <button
              onClick={() => { setMode('approve'); setComments(''); }}
              className={`${styles.actionBtn} ${styles.approve} ${mode === 'approve' ? styles.active : ''}`}
              disabled={submitting}
            >اعتماد</button>
            <button
              onClick={() => { setMode('needs_editing'); setComments(''); }}
              className={`${styles.actionBtn} ${styles.edit} ${mode === 'needs_editing' ? styles.active : ''}`}
              disabled={submitting}
            >ملاحظات</button>
            <button
              onClick={() => { setMode('reject'); setComments(''); }}
              className={`${styles.actionBtn} ${styles.reject} ${mode === 'reject' ? styles.active : ''}`}
              disabled={submitting}
            >رفض</button>
            {mode && (
              <button
                onClick={reset}
                className={`${styles.actionBtn} ${styles.neutral}`}
                disabled={submitting}
              >إلغاء</button>
            )}
          </div>

          {mode && (
            <div className={styles.modeNote}>
              {mode === 'approve' && 'سيتم نشر المقال فوراً بعد الاعتماد.'}
              {mode === 'needs_editing' && 'أدخل ملاحظات واضحة لإعادته للكاتب.'}
              {mode === 'reject' && 'يمكنك إدخال سبب (اختياري).'}
            </div>
          )}

          {(mode === 'needs_editing' || mode === 'reject') && (
            <div className={styles.commentsBlock}>
              <label className={styles.label}>
                {mode === 'needs_editing' ? 'ملاحظات مطلوبة' : 'سبب الرفض (اختياري)'}
              </label>
              <textarea
                className={styles.textarea}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder={mode === 'needs_editing' ? 'اكتب التعديلات المطلوبة...' : 'اكتب السبب (اختياري)...'}
                disabled={submitting}
              />
              {mode === 'needs_editing' && !comments.trim() && (
                <p className={styles.validation}>الملاحظات مطلوبة.</p>
              )}
            </div>
          )}

          {mode && (
            <div className={styles.submitRow}>
              <button
                className={styles.confirm}
                onClick={submit}
                disabled={submitting || (mode === 'needs_editing' && !comments.trim())}
              >
                {submitting ? 'جارٍ التنفيذ...' : 'تأكيد'}
              </button>
              <button
                className={styles.cancel}
                onClick={reset}
                disabled={submitting}
              >تراجع</button>
            </div>
          )}
        </>
      )}

      {successMsg && (
        <div className={styles.successBox}>{successMsg}</div>
      )}
    </section>
  );
}