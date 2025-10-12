'use client';
import { useState } from 'react';
import styles from './AuthorRequestPopup.module.css';
import axios from '@/lib/axios';

/**
 * Props:
 *  - open (bool)
 *  - onClose() => void
 *  - onSubmitted(status) => void // called with returned status (pending/approved)
 */
export default function AuthorRequestPopup({ open, onClose, onSubmitted }) {
  const [checklist, setChecklist] = useState({
    writesWell: false,
    originalContent: false,
    consistent: false,
    noUseOfOffensiveLanguageOrHateSpeech: false,
  });
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!open) return null;

 const toggle = (key) => {
  
  setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
};
  const allDone = Object.values(checklist).every(Boolean);

  const submit = async () => {
    if (!allDone) return;
    setSubmitting(true);
    try {
      const res = await axios.post('/author-request/', { motivation: motivation.trim() });
      onSubmitted && onSubmitted(res.data.status);
      onClose();
    } catch (e) {
      alert(e.response?.data?.detail || 'تعذر إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    { key: 'writesWell', text: 'أكتب بلغة عربية سليمة' },
    { key: 'originalContent', text: 'أتعهد بالأصالة وعدم النسخ' },
    { key: 'consistent', text: 'ألتزم بالنشر المنتظم' },
   {key:"noUseOfOffensiveLanguageOrHateSpeech" , text:"ألتزم بعدم استخدام لغة مسيئة أو خطاب كراهية" },
  ];

  return (
    <div className={styles.overlay} onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="authorTitle">
        <button className={styles.close} onClick={onClose} aria-label="إغلاق">×</button>
        <h3 id="authorTitle" className={styles.heading}>طلب أن تصبح كاتباً</h3>
        <p className={styles.note}>أكمل البنود الأربعة ثم أرسل طلبك.</p>
        <div className={styles.progressWrap}>
          <div className={styles.progressFill} style={{ width: `${(Object.values(checklist).filter(Boolean).length / 4) * 100}%` }} />
        </div>
        <ul className={styles.list}>
          {items.map(it => {
            const checked = checklist[it.key];
            return (
              <li key={it.key} className={`${styles.item} ${checked ? styles.checked : ''}`} onClick={() => toggle(it.key)}>
                <span className={styles.box}>{checked && <span className={styles.tick} />}</span>
                <span className={styles.text}>{it.text}</span>
              </li>
            );
          })}
        </ul>
        <label className={styles.label}>الدافع (اختياري)</label>
        <textarea className={styles.textarea} value={motivation} onChange={e => setMotivation(e.target.value)} placeholder="لماذا ترغب بالانضمام؟" />
        <div className={styles.actions}>
          <button disabled={!allDone || submitting} onClick={submit} className={styles.primary}>
            {submitting ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
          </button>
          <button type="button" onClick={onClose} className={styles.secondary}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
