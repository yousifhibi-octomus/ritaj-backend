'use client';

import React ,{useState} from 'react';
import styles from './Compatition.module.css';
import axios from '@/lib/axios';




const statusMap = {
  upcoming: { label: 'قادمة', cls: styles.status_upcoming },
  active: { label: 'نشطة', cls: styles.status_active },
  completed: { label: 'مكتملة', cls: styles.status_completed },
  cancelled: { label: 'ملغاة', cls: styles.status_cancelled },
};





const Competition = ({ competition }) => {
 const today = new Date();
  const registrationEndDate = new Date(competition.registration_end);

  const isRegistrationOpen = registrationEndDate > today;
 const [isTeam, setIsTeam] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
 const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    participant_type: '',
    occupation: '',
    organization: '',
    team_name: '',
    competition: competition.id, // Pass the competition ID
  });

const [message, setMessage] = useState('');

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleRegister = async () => {
    try {
      await axios.post('/participants/', formData);
      setMessage('تم التسجيل بنجاح!');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        participant_type: '',
        occupation: '',
        organization: '',
        team_name: '',
        competition: competition.id,
      });
    } catch (error) {
      setMessage('حدث خطأ أثناء التسجيل. حاول مرة أخرى.');
      console.error(error);
    }
  };



  return (
   <section className={styles.competitionSection}>
        <div className={styles.header}>
          <h1 className={styles.title}>{competition.title}</h1>
          <div className={styles.meta}>
            <span className={styles.category}>{arabicCategory(competition.category)}</span>
            <span className={styles.targetAudience}>{arabicAudience(competition.target_audience)}</span>
            {competition.status && (
              <span className={styles.status}>{statusMap[competition.status]?.label}</span>
            )}
            {competition.featured && <span className={styles.featured}>مميزة</span>}
          </div>
        </div>

        {competition.cover_image && (
          <div className={styles.imageContainer}>
            <img
              src={competition.cover_image}
              alt={competition.title}
              className={styles.coverImage}
            />
          </div>
        )}

        {competition.description && (
          <>
            <h1 className={styles.sectionHeading}>الوصف</h1>
            <article
              className={styles.description}
              dangerouslySetInnerHTML={{ __html: competition.description }}
            />
          </>
        )}
        <h1 className={styles.sectionHeading}>المتطلبات</h1>
        <ul className={styles.requirementsList}>
          {Array.isArray(competition.requirements) &&
            competition.requirements.map((req, index) => {
              const text = typeof req === 'string' ? req : req?.requirement;
              return text ? (
                <li key={index} className={styles.requirementItem}>{text}</li>
              ) : null;
            })}
        </ul>
       
        {competition.prizes && competition.prizes.length > 0 && (
          <>
            <h1 className={styles.sectionHeading}>الجوائز</h1>
            <ul className={styles.requirementsList}>
              {Array.isArray(competition.prizes) &&
                competition.prizes.map((p, index) => {
                  const text = typeof p === 'string'
                    ? p
                    : [p?.position, p?.prize].filter(Boolean).join(' - ');
                  return text ? (
                    <li key={index} className={styles.requirementItem}>{text}</li>
                  ) : null;
                })}
            </ul>
          </>
        )}

        {competition.jury && competition.jury.length > 0 && (
          <>
            <h1 className={styles.sectionHeading}>لجنة التحكيم</h1>
            <ul className={styles.requirementsList}>
              {Array.isArray(competition.jury) &&
                competition.jury.map((j, index) => {
                  const text = typeof j === 'string'
                    ? j
                    : [j?.name, j?.title].filter(Boolean).join(' — ');
                  return text ? (
                    <li key={index} className={styles.requirementItem}>{text}</li>
                  ) : null;
                })}
            </ul>
          </>
        )}

        <div className={styles.dates}>
          <div>بداية التسجيل: {new Date(competition.registration_start).toLocaleString()}</div>
          <div>نهاية التسجيل: {new Date(competition.registration_end).toLocaleString()}</div>
          <div>نهاية التقديم: {new Date(competition.submission_end).toLocaleString()}</div>
          {competition.results_date && (
            <div>إعلان النتائج: {new Date(competition.results_date).toLocaleString()}</div>
          )}
        </div>

         <div className={styles.registrationSection}>
        {isRegistrationOpen ? (
          <button
            className={styles.registerButton}
            onClick={() => setIsModalOpen(true)}
          >
            سجل الآن
          </button>
        ) : (
          <p className={styles.deadlineMessage}>انتهى موعد التسجيل</p>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>التسجيل في المسابقة</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRegister();
              }}
            >
              <div className={styles.formGroup}>
                <label>الاسم الكامل</label>
                <input
                  type="text"
                  name="full_name"
                  className={styles.input}
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>رقم الهاتف</label>
                <input
                  type="text"
                  name="phone"
                    className={styles.input}
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>نوع المشارك</label>
                <select
                  name="participant_type"
                  className={styles.input}
                  value={formData.participant_type}
                  onChange={handleInputChange}
                  
                  required
                >
                  <option value="">اختر</option>
                  <option value="professional">محترف</option>
                  <option value="student">طالب</option>
                  <option value="enthusiast">هاوٍ</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>الوظيفة</label>
                <input
                  type="text"
                  name="occupation"
                  className={styles.input}
                  value={formData.occupation}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label>المنظمة</label>
                <input
                  type="text"
                  name="organization"
                  className={styles.input}
                  value={formData.organization}
                  onChange={handleInputChange}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isTeam}
                    className={styles.checkbox}
                    onChange={(e) => setIsTeam(e.target.checked)}
                  />
                 <span className={styles.checkboxText}>هل تسجل كفريق؟</span>
                </label>
              </div>
              {isTeam && (
                <div className={styles.formGroup}>
                  <label>اسم الفريق</label>
                  <input
                    type="text"
                    name="team_name"
                    className={styles.input}
                    value={formData.team_name}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              <div className={styles.modalActions}>
                <button type="submit" className={styles.submitButton}>
                  تسجيل
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
            {message && <p className={styles.message}>{message}</p>}
          </div>
        </div>
      )}
    </section>
  );
};
function arabicCategory(c){
  const map = { architectural_design: 'تصميم معماري', urban_planning: 'تخطيط عمراني', housing: 'الإسكان', restoration:'الترميم', ideas:'مسابقة أفكار' };
  return map[c] || c;
}
function arabicAudience(a){
  const map = { professionals: 'محترفون', students: 'طلاب', open: 'مفتوحة للجميع' };
  return map[a] || a;
}
function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  // Return dd/mm/yyyy
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default Competition;