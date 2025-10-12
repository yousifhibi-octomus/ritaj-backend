'use client';
import { useState, useRef } from 'react';
import axios from '@/lib/axios';
import styles from './AddPodcast.module.css';

// If you still need CSRF (Django session auth)
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function AddPodcast() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [headerImage, setHeaderImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const imgRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMsg({ type: 'error', text: 'الملف ليس صورة' });
      e.target.value = '';
      return;
    }
    setHeaderImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setHeaderImage(null);
    setPreview('');
    imgRef.current && (imgRef.current.value = '');
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg({ type: '', text: '' });

  if (!title.trim()) return setMsg({ type: 'error', text: 'العنوان مطلوب' });
  if (!description.trim()) return setMsg({ type: 'error', text: 'الوصف مطلوب' });
  if (!link.trim()) return setMsg({ type: 'error', text: 'الرابط مطلوب' });
  if (!headerImage) return setMsg({ type: 'error', text: 'أرفق صورة الغلاف' });

  try { new URL(link.trim()); } catch { return setMsg({ type: 'error', text: 'الرابط غير صالح' }); }

  setLoading(true);
  const formData = new FormData();
  formData.append('title', title.trim());
  formData.append('description', description.trim());
  formData.append('link', link.trim());
  formData.append('header_image', headerImage);

  
  try {
    // TRY axios first
    const csrf = getCookie('csrftoken');
    await axios.post('/podcasts/', formData, {
      headers: {
        ...(csrf ? { 'X-CSRFToken': csrf } : {})
        // DO NOT set Content-Type manually
      },
      transformRequest: (d) => d // ensure axios does not serialize
    });
    setMsg({ type: 'success', text: 'تم الإضافة بنجاح' });
    reset();
  } catch (err) {
    console.warn('Axios upload failed, retrying with fetch...', err?.response?.data);
    // Fallback with fetch (bypasses any axios interceptors adding JSON headers)
    try {
      const csrf = getCookie('csrftoken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ORIGIN || 'http://localhost:8000'}/api/podcasts/`, {
        method: 'POST',
        credentials: 'include',
        headers: csrf ? { 'X-CSRFToken': csrf } : undefined,
        body: formData
      });
      if (!res.ok) {
        const data = await res.json().catch(()=>null);
       
        return setMsg({ type: 'error', text: formatErrors(data) || 'فشل الحفظ (fetch)' });
      }
      setMsg({ type: 'success', text: 'تم الإضافة بنجاح (fetch)' });
      reset();
    } catch (e2) {
      setMsg({ type: 'error', text: 'فشل الحفظ النهائي' });
    }
  } finally {
    setLoading(false);
  }
};
  function formatErrors(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join('، ') : v}`)
      .join(' | ');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>إضافة بودكاست</h1>
        <p>أدخل البيانات ثم أرسل</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="title">العنوان</label>
          <input id="title" value={title} onChange={e=>setTitle(e.target.value)} required maxLength={255} />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">الوصف</label>
          <textarea id="description" value={description} onChange={e=>setDescription(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="link">رابط البودكاست</label>
          <input id="link" type="url" value={link} onChange={e=>setLink(e.target.value)} required placeholder="https://..." />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="header_image">صورة الغلاف</label>
          <input
            ref={imgRef}
            id="header_image"
            type="file"
            accept="image/*"
            onChange={handleImage}
            required
          />
          {preview && (
            <div className={styles.imagePreview}>
              <img src={preview} alt="preview" />
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !title || !description || !link || !headerImage}
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={reset}
            disabled={loading}
          >
            مسح
          </button>
        </div>
        {msg.text && (
          <p className={msg.type === 'success' ? styles.successMessage : styles.errorMessage}>
            {msg.text}
          </p>
        )}
      </form>
    </div>
  );
}