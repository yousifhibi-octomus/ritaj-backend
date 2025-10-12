'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import styles from './Settings.module.css';
import AuthorRequestPopup from '@/components/AuthorRequestPopup/AuthorRequestPopup';

export default function Settings({ username }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthorRequestPending, setIsAuthorRequestPending] = useState(false); // New state for author request status

  // Socials popup
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentSocial, setCurrentSocial] = useState({ name: '', link: '' });
  const [editingIndex, setEditingIndex] = useState(null);

  // Avatar
  const [avatarFile, setAvatarFile] = useState(null);

  // Author request popup
  const [authorPopupOpen, setAuthorPopupOpen] = useState(false);

  // Load user and check author request status
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const decoded = decodeURIComponent(username);
        const res = await axios.get(`/users/${decoded}/`);
        setUser(res.data);

        // Check if the user has an author request in the database
        // Check if the user has an author request in the database
        // Check if the user has an author request in the database
try {
  const authorRes = await axios.get(`/author-request/${decoded}/`);
  if (authorRes.status === 200) {
    setIsAuthorRequestPending(authorRes.data.status === 'pending');
  }
} catch (error) {
  console.warn('Failed to fetch author request status:', error.response?.data || error.message);
  // If the author request check fails, continue loading the user
  setIsAuthorRequestPending(false);
}
      } catch (e) {
        setError('تعذر تحميل بيانات المستخدم');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return null;

  // Handlers
  const handleProfileChange = (field, value) =>
    setUser(prev => ({ ...prev, [field]: value }));

  const handleEmailChange = e =>
    setUser(prev => ({ ...prev, email: e.target.value }));

  const handleSocialChange = (field, value) =>
    setCurrentSocial(prev => ({ ...prev, [field]: value }));

  const handleAddSocial = () => {
    setCurrentSocial({ name: '', link: '' });
    setEditingIndex(null);
    setIsPopupOpen(true);
  };

  const handleEditSocial = index => {
    setCurrentSocial(user.socials[index]);
    setEditingIndex(index);
    setIsPopupOpen(true);
  };

  const handleSaveSocial = () => {
    if (!currentSocial.name || !currentSocial.link) {
      alert('يرجى إدخال المنصة والرابط');
      return;
    }
    if (editingIndex !== null) {
      const updated = [...user.socials];
      updated[editingIndex] = currentSocial;
      setUser(prev => ({ ...prev, socials: updated }));
    } else {
      setUser(prev => ({ ...prev, socials: [...prev.socials, currentSocial] }));
    }
    setIsPopupOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('username', user.username);
      formData.append('email', user.email);
      formData.append('name', user.name);
      formData.append('bio', user.bio || '');
      formData.append('password', user.password || '');

      // Send socials as JSON (simpler to parse server-side)
      formData.append('socials', JSON.stringify(user.socials.map(s => ({
        name: s.name,
        link: s.link,
        icon: s.icon || null
      }))));

      if (avatarFile) formData.append('avatar', avatarFile);

      await axios.put(`/users/${user.username}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('تم حفظ الإعدادات بنجاح!');
      // Optionally refetch user
    } catch (e) {
      console.error('Update error:', e.response?.data || e.message);
      alert('حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  return (
    <div className={styles.settingsTab}>
      <h2>الإعدادات</h2>

      <div className={styles.settingItem}>
        <label>الاسم:</label>
        <input
          type="text"
          value={user.name}
          className={styles.ItemValue}
          onChange={e => handleProfileChange('name', e.target.value)}
        />
      </div>

      <div className={styles.settingItem}>
        <label>السيرة الذاتية:</label>
        <textarea
          className={styles.ItemValue}
          value={user.bio}
          onChange={e => handleProfileChange('bio', e.target.value)}
        />
      </div>

      <div className={styles.settingItem}>
        <label>البريد الإلكتروني:</label>
        <input
          type="email"
          className={styles.ItemValue}
          value={user.email}
          onChange={handleEmailChange}
        />
      </div>

      <div className={styles.settingItem}>
        <label>حسابات التواصل الاجتماعي:</label>
        <div className={styles.socialsGrid}>
          {user.socials.map((social, i) => (
            <div key={i} className={styles.socialInput}>
              <span className={styles.socialName}>{social.name}  : {" "}
                <a href={social.link} target="_blank" rel="noopener noreferrer">{social.link}</a>
                </span>

              <button
                className={styles.editButton}
                onClick={() => handleEditSocial(i)}
              >
                تعديل
              </button>
            </div>
          ))}
          <button className={styles.addSocialButton} onClick={handleAddSocial}>
            + إضافة حساب جديد
          </button>
        </div>
      </div>

      <div className={styles.settingItem}>
        <span>الإشعارات</span>
        <label className={styles.switch}>
          <input type="checkbox" defaultChecked />
          <span className={styles.slider}></span>
        </label>
      </div>

      <div className={styles.settingItem}>
        <label>الصورة الشخصية:</label>
        <input
          type="file"
          accept="image/*"
          className={styles.ItemValue}
          onChange={e => setAvatarFile(e.target.files[0])}
        />
      </div>

      {/* Check if the user has an author request */}
      {user.role === 'user' && !isAuthorRequestPending && (
        <div
          className={`${styles.settingItem} ${styles.becomeAuthorRow}`}
          role="button"
          tabIndex={0}
          onClick={() => setAuthorPopupOpen(true)}
        >
          <span className={styles.submitButton}>طلب أن تصبح كاتباً</span>
          <span>{isAuthorRequestPending ? 'تم إرسال الطلب' : 'لم يتم إرسال الطلب'}</span>
        </div>
      )}

      <div className={styles.submitButtonWrapper}>
        <button className={styles.submitButton} onClick={handleSubmit}>
          حفظ الإعدادات
        </button>
      </div>

     <AuthorRequestPopup
          open={authorPopupOpen} // Ensure this is true when you want the popup to show
          onClose={() => setAuthorPopupOpen(false)}
          onSubmitted={(status) => setIsAuthorRequestPending(status === 'pending')}
        />

      {/* Social add/edit popup */}
      {isPopupOpen && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3 className={styles.popupHeading}>
              {editingIndex !== null ? 'تعديل الحساب' : 'إضافة حساب جديد'}
            </h3>
            <label>المنصة:</label>
            <select
              className={styles.dropdown}
              value={currentSocial.name}
              onChange={e => handleSocialChange('name', e.target.value)}
            >
              <option value="">اختر المنصة</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
            </select>
            <label>الرابط:</label>
            <input
              type="text"
              className={styles.ItemValue}
              value={currentSocial.link}
              onChange={e => handleSocialChange('link', e.target.value)}
            />
            <div className={styles.popupActions}>
              <button onClick={handleSaveSocial}>حفظ</button>
              <button onClick={() => setIsPopupOpen(false)}>إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}