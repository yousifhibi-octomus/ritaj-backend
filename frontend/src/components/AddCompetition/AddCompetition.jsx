'use client';
import { useState, useRef } from 'react';
import axios from '@/lib/axios';
import styles from './AddCompetition.module.css';

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export default function AddCompetition() {
  // Scalar fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [description, setDescription] = useState('');
  const [bio, setBio] = useState('');
  const [registrationStart, setRegistrationStart] = useState('');
  const [registrationEnd, setRegistrationEnd] = useState('');
  const [submissionEnd, setSubmissionEnd] = useState('');
  const [resultsDate, setResultsDate] = useState('');
  const [status, setStatus] = useState('upcoming');
  const [featured, setFeatured] = useState(false);

  // JSON arrays
  const [prizes, setPrizes] = useState([{ position: '1st', prize: '' }]);
  const [requirements, setRequirements] = useState([{ requirement: '' }]);
  const [jury, setJury] = useState([{ name: '', title: '' }]);

  const [headerImage, setHeaderImage] = useState(null);
  const [preview, setPreview] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const imgRef = useRef(null);

  // Helpers
  const setFeedback = (type, text) => setMsg({ type, text });

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback('error', 'الملف ليس صورة');
      e.target.value = '';
      return;
    }
    setHeaderImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const reset = () => {
    setTitle('');
    setCategory('');
    setTargetAudience('');
    setDescription('');
    setBio('');
    setRegistrationStart('');
    setRegistrationEnd('');
    setSubmissionEnd('');
    setResultsDate('');
    setStatus('upcoming');
    setFeatured(false);
    setPrizes([{ position: '1st', prize: '' }]);
    setRequirements([{ requirement: '' }]);
    setJury([{ name: '', title: '' }]);
    setHeaderImage(null);
    setPreview('');
    imgRef.current && (imgRef.current.value = '');
    setMsg({ type: '', text: '' });
  };

  // Dynamic list ops
  const addPrize = () => setPrizes([...prizes, { position: '', prize: '' }]);
  const updatePrize = (i, f, v) => {
    const arr = [...prizes];
    arr[i][f] = v;
    setPrizes(arr);
  };
  const removePrize = (i) => setPrizes(prizes.filter((_, idx) => idx !== i));

  const addRequirement = () => setRequirements([...requirements, { requirement: '' }]);
  const updateRequirement = (i, v) => {
    const arr = [...requirements];
    arr[i].requirement = v;
    setRequirements(arr);
  };
  const removeRequirement = (i) => setRequirements(requirements.filter((_, idx) => idx !== i));

  const addJury = () => setJury([...jury, { name: '', title: '' }]);
  const updateJury = (i, f, v) => {
    const arr = [...jury];
    arr[i][f] = v;
    setJury(arr);
  };
  const removeJury = (i) => setJury(jury.filter((_, idx) => idx !== i));

  // Minimal validation
  const validateDates = () => {
    if (registrationStart && registrationEnd && registrationStart > registrationEnd)
      return 'تاريخ انتهاء التسجيل يجب أن يكون بعد البدء';
    if (registrationEnd && submissionEnd && registrationEnd > submissionEnd)
      return 'انتهاء التقديم يجب أن يكون بعد انتهاء التسجيل';
    if (submissionEnd && resultsDate && submissionEnd > resultsDate)
      return 'تاريخ النتائج يجب أن يكون بعد انتهاء التقديم';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback('', '');

    // Required checks
    if (!title.trim()) return setFeedback('error', 'العنوان مطلوب');
    if (!category.trim()) return setFeedback('error', 'الفئة مطلوبة');
    if (!targetAudience.trim()) return setFeedback('error', 'الفئة المستهدفة مطلوبة');
    if (!description.trim()) return setFeedback('error', 'الوصف مطلوب');
    if (!bio.trim()) return setFeedback('error', 'السيرة التعريفية مطلوبة');
    if (!registrationStart) return setFeedback('error', 'تاريخ بدء التسجيل مطلوب');
    if (!registrationEnd) return setFeedback('error', 'تاريخ انتهاء التسجيل مطلوب');
    if (!submissionEnd) return setFeedback('error', 'تاريخ انتهاء التقديم مطلوب');
    if (!headerImage) return setFeedback('error', 'أرفق صورة الغلاف');

    const dateError = validateDates();
    if (dateError) return setFeedback('error', dateError);

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('target_audience', targetAudience);
    formData.append('description', description.trim());
    formData.append('bio', bio.trim());
    formData.append('registration_start', registrationStart);
    formData.append('registration_end', registrationEnd);
    formData.append('submission_end', submissionEnd);
    formData.append('results_date', resultsDate);
    formData.append('status', status);
    formData.append('featured', featured ? 'true' : 'false');
    formData.append('prizes', JSON.stringify(prizes.filter(p => p.prize || p.position)));
    formData.append('requirements', JSON.stringify(requirements.filter(r => r.requirement)));
    formData.append('jury', JSON.stringify(jury.filter(j => j.name || j.title)));
    formData.append('cover_image', headerImage);

    try {
      const csrf = getCookie('csrftoken');
      await axios.post('/competitions/', formData, {
        headers: {
          ...(csrf ? { 'X-CSRFToken': csrf } : {}),
        },
        transformRequest: d => d
      });
      setFeedback('success', 'تم إنشاء المسابقة بنجاح');
      reset();
    } catch (err) {
      console.error('Create competition failed', err?.response?.data || err);
      setFeedback('error', 'فشل الحفظ (Post request failed)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.heading}>إضافة مسابقة جديدة</h1>
      <p className={styles.subheading}>أدخِل جميع الحقول المطلوبة ثم اضغط حفظ</p>

      {msg.text && (
        <div className={`${styles.alert} ${msg.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
          {msg.text}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} dir="rtl">
        {/* Basic Info */}
        <fieldset className={styles.fs}>
          <legend>المعلومات الأساسية</legend>
          <div className={styles.row2}>
            <div className={styles.formGroup}>
              <label htmlFor="title">العنوان *</label>
              <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} maxLength={500} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">الفئة *</label>
              <select className={styles.select} value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">اختر</option>
                <option value="architectural_design">تصميم معماري</option>
                <option value="urban_planning">تخطيط عمراني</option>
                <option value="housing">الإسكان</option>
                <option value="restoration">الترميم</option>
                <option value="ideas">مسابقة أفكار</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="targetAudience">الفئة المستهدفة *</label>
              <select className={styles.select} value={targetAudience} onChange={e => setTargetAudience(e.target.value)} required>
                <option value="">اختر</option>
                <option value="professionals">محترفون</option>
                <option value="students">طلاب</option>
                <option value="open">مفتوحة للجميع</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="status">الحالة</label>
              <select className={styles.select}  value={status} onChange={e => setStatus(e.target.value)}>
                <option value="upcoming">قادمة</option>
                <option value="active">نشطة</option>
                <option value="completed">مكتملة</option>
                <option value="cancelled">ملغاة</option>
              </select>
            </div>
            <div className={styles.formGroupInline}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                مميزة
              </label>
            </div>
          </div>
        </fieldset>

        {/* Descriptions */}
        <fieldset className={styles.fs}>
          <legend>الوصف والتعريف</legend>
            <div className={styles.formGroup}>
              <label htmlFor="description">الوصف العام *</label>
              <textarea className={styles.textarea} rows={5} value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="bio">وصف مختصر (Bio) *</label>
              <textarea className={styles.textarea} id="bio" rows={3} maxLength={250} value={bio} onChange={e => setBio(e.target.value)} required />
              <div className={styles.hint}>{bio.length}/250</div>
            </div>
        </fieldset>

        {/* Dates */}
        <fieldset className={styles.fs}>
          <legend>التواريخ</legend>
          <div className={styles.row4}>
            <div className={styles.formGroup}>
              <label htmlFor="registrationStart">بداية التسجيل *</label>
              <input className={styles.input} type="datetime-local" id="registrationStart" value={registrationStart} onChange={e => setRegistrationStart(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="registrationEnd">نهاية التسجيل *</label>
              <input className={styles.input} type="datetime-local" id="registrationEnd" value={registrationEnd} onChange={e => setRegistrationEnd(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="submissionEnd">نهاية التقديم *</label>
              <input className={styles.input} type="datetime-local" id="submissionEnd" value={submissionEnd} onChange={e => setSubmissionEnd(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="resultsDate">تاريخ إعلان النتائج</label>
              <input className={styles.input} type="datetime-local" id="resultsDate" value={resultsDate} onChange={e => setResultsDate(e.target.value)} />
            </div>
          </div>
        </fieldset>

        {/* Cover Image */}
        <fieldset className={styles.fs}>
          <legend>صورة الغلاف</legend>
          <div className={styles.formGroup}>
            <input  className={styles.input} ref={imgRef} type="file" accept="image/*" onChange={handleImage} required />
            {preview && (
              <div className={styles.imagePreview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" />
              </div>
            )}
          </div>
        </fieldset>

        {/* Prizes */}
        <fieldset className={styles.fs}>
          <legend>الجوائز</legend>
          {prizes.map((p, i) => (
            <div key={i} className={styles.dynamicRow}>
                <input className={styles.input}
                placeholder="الجائزة (مثال: 5000 USD)"
                value={p.prize}
                onChange={e => updatePrize(i, 'prize', e.target.value)}
              />
            
              <input className={styles.input}
                placeholder="المركز (مثال: 1st / 2nd)"
                value={p.position}
                onChange={e => updatePrize(i, 'position', e.target.value)}
              />
              
              <button type="button" className={styles.removeBtn} onClick={() => removePrize(i)} disabled={prizes.length === 1}>
                حذف
              </button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={addPrize}>إضافة جائزة</button>
        </fieldset>

        {/* Requirements */}
        <fieldset className={styles.fs}>
          <legend>المتطلبات</legend>
          {requirements.map((r, i) => (
            <div key={i} className={styles.dynamicRow}>
              <input className={styles.input}
                placeholder="أدخل متطلباً"
                value={r.requirement}
                onChange={e => updateRequirement(i, e.target.value)}
              />
              <button type="button" className={styles.removeBtn} onClick={() => removeRequirement(i)} disabled={requirements.length === 1}>
                حذف
              </button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={addRequirement}>إضافة متطلب</button>
        </fieldset>

        {/* Jury */}
        <fieldset className={styles.fs}>
          <legend>لجنة التحكيم</legend>
          {jury.map((j, i) => (
            <div key={i} className={styles.dynamicRow}>
              <input className={styles.input}
                placeholder="اسم المحكم"
                value={j.name}
                onChange={e => updateJury(i, 'name', e.target.value)}
              />
              <input className={styles.input}
                placeholder="الصفة / المسمى"
                value={j.title}
                onChange={e => updateJury(i, 'title', e.target.value)}
              />
              <button type="button" className={styles.removeBtn} onClick={() => removeJury(i)} disabled={jury.length === 1}>
                حذف
              </button>
            </div>
          ))}
          <button type="button" className={styles.addBtn} onClick={addJury}>إضافة محكم</button>
        </fieldset>

        {/* Actions */}
        <div className={styles.actions}>
          <button type="submit" disabled={loading} className={styles.primaryBtn}>
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
          <button type="button" disabled={loading} className={styles.secondaryBtn} onClick={reset}>
            مسح
          </button>
        </div>
      </form>
    </div>
  );
}