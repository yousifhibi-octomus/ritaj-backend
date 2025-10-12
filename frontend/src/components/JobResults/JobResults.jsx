"use client";

import { useState, useEffect } from 'react';
import JobCard from '../JobCard';
import styles from './JobResults.module.css';

// Your jobs data directly in the component
const jobsData = {
  "jobs": [
    {
      "id": 1,
      "title": "مطور واجهات أمامية",
      "user": "admin",
      "company": "الشركة التقنية المتقدمة",
      "location": "الرياض",
      "employmentType": "دوام كامل",
      "salary": "10000 - 15000 ريال",
      "description": "نبحث عن مطور واجهات أمامية مبدع للانضمام إلى فريقنا. سيكون المسؤول عن تطوير وتنفيذ واجهات مستخدم تفاعلية وجذابة باستخدام أحدث التقنيات.",
      "requirements": ["Vue.js", "JavaScript", "React", "CSS3", "HTML5", "3+ سنوات خبرة"],
      "timeOfPost": "2024-01-15T10:30:00Z",
      "deadline": "2024-02-15T23:59:59Z",
      "applyLink": "/apply/1",
      "tags": ["تطوير", "ويب", "واجهات", "Vue", "React"]
    },
    {
      "id": 2,
      "title": "مطور تطبيقات الجوال",
      "user": "hr_tech",
      "company": "مؤسسة البنكار التقني",
      "location": "جدة",
      "employmentType": "دوام كامل",
      "salary": "12000 - 18000 ريال",
      "description": "نحتاج لمطور تطبيقات جوال لتصميم وتطوير تطبيقات مبتكرة لمنصتي iOS و Android. المرشح المثالي يجب أن يكون لديه خبرة في تطوير التطبيقات الهجينة والأصلية.",
      "requirements": ["Flutter", "Dart", "Firebase", "REST APIs", "Git", "4+ سنوات خبرة"],
      "timeOfPost": "2024-01-16T14:20:00Z",
      "deadline": "2024-02-20T23:59:59Z",
      "applyLink": "/apply/2",
      "tags": ["جوال", "Flutter", "تطبيقات", "iOS", "Android"]
    },
    {
      "id": 3,
      "title": "محلل بيانات",
      "user": "data_admin",
      "company": "شركة البيانات الذكية",
      "location": "الدمام",
      "employmentType": "دوام كامل",
      "salary": "9000 - 14000 ريال",
      "description": "نبحث عن محلل بيانات خبير لتحليل البيانات الضخمة وتقديم رؤى استراتيجية. سيعمل على تطوير نماذج تنبؤية وإنشاء تقارير تفاعلية لدعم اتخاذ القرارات.",
      "requirements": ["Python", "SQL", "Tableau", "Machine Learning", "Excel", "3+ سنوات خبرة"],
      "timeOfPost": "2024-01-17T09:15:00Z",
      "deadline": "2024-02-25T23:59:59Z",
      "applyLink": "/apply/3",
      "tags": ["بيانات", "تحليل", "Python", "SQL", "Tableau"]
    },
    {
      "id": 4,
      "title": "مصمم جرافيك",
      "user": "creative_director",
      "company": "استوديو الإبداع الرقمي",
      "location": "عن بُعد",
      "employmentType": "دوام جزئي",
      "salary": "6000 - 9000 ريال",
      "description": "نحتاج لمصمم جرافيك موهوب لإنشاء تصاميم إبداعية للعلامات التجارية والعملاء. سيعمل على تطوير هويات بصرية ومحتوى لوسائل التواصل الاجتماعي ومواد تسويقية.",
      "requirements": ["Adobe Photoshop", "Illustrator", "Figma", "التصميم الإبداعي", "2+ سنوات خبرة"],
      "timeOfPost": "2024-01-18T11:45:00Z",
      "deadline": "2024-02-28T23:59:59Z",
      "applyLink": "/apply/4",
      "tags": ["تصميم", "جرافيك", "إبداع", "فوتوشوب", "Illustrator"]
    },
    {
      "id": 5,
      "title": "مدير مشاريع تقنية",
      "user": "ceo_tech",
      "company": "مجموعة الحلول المتكاملة",
      "location": "الرياض",
      "employmentType": "دوام كامل",
      "salary": "18000 - 25000 ريال",
      "description": "نبحث عن مدير مشاريع تقنية خبير لقيادة فرق التطوير وإدارة المشاريع التقنية من البداية إلى النهاية. يجب أن يكون لديه خبرة في منهجيات Agile وإدارة الموارد.",
      "requirements": ["إدارة المشاريع", "Agile", "Scrum", "JIRA", "قيادة الفرق", "6+ سنوات خبرة"],
      "timeOfPost": "2024-01-19T16:00:00Z",
      "deadline": "2024-03-01T23:59:59Z",
      "applyLink": "/apply/5",
      "tags": ["إدارة", "مشاريع", "تقنية", "Agile", "قيادة"]
    },
    {
      "id": 6,
      "title": "أخصائي أمن سيبراني",
      "user": "security_head",
      "company": "شركة الأمن الإلكتروني",
      "location": "الرياض",
      "employmentType": "دوام كامل",
      "salary": "15000 - 22000 ريال",
      "description": "مطلوب أخصائي أمن سيبراني لحماية البنية التحتية التقنية للشركة ومراقبة التهديدات الأمنية وتنفيذ سياسات الأمن السيبراني.",
      "requirements": ["أمن المعلومات", "شبكات", "SIEM", "اختبار الاختراق", "ISO 27001", "5+ سنوات خبرة"],
      "timeOfPost": "2024-01-20T13:30:00Z",
      "deadline": "2024-03-05T23:59:59Z",
      "applyLink": "/apply/6",
      "tags": ["أمن", "سيبراني", "شبكات", "حماية", "معلومات"]
    }
  ]
};

function JobResults({ searchQuery }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load jobs from your JSON data
  useEffect(() => {
    setLoading(true);
    const loadJobs = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Use the jobs data directly
        setJobs(jobsData.jobs);
        setFilteredJobs(jobsData.jobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJobs();
  }, []);

  // Filter jobs based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.loading}>جاري تحميل الوظائف...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Results Header */}
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>
            نتائج البحث
          </h2>
          <div className={styles.resultsCount}>
            {filteredJobs.length} وظيفة متاحة
          </div>
        </div>

        {/* Jobs List */}
        <div className={styles.jobsList}>
          {filteredJobs.length === 0 ? (
            <div className={styles.noResults}>
              {searchQuery ? 'لا توجد نتائج تطابق بحثك' : 'لا توجد وظائف متاحة حالياً'}
            </div>
          ) : (
            filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default JobResults;