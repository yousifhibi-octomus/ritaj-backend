// app/jobs/page.js
"use client";

import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AmbientMusic from '@/components/AmbientMusic';
import ScrollToTop from '@/components/ScrollToTop';
import JobSearch from '@/components/JobSearch';
import JobResults from '@/components/JobResults';
import JobFilters from '@/components/JobFilters';
import styles from './JobsPage.module.css';

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    employmentType: [],
    salaryRange: '',
    requirements: [],
    timeOfPost: '',
    deadline: ''
  });

  // Extract unique employment types and requirements from your jobs data
  const filterOptions = useMemo(() => {
    const employmentTypes = ['دوام كامل', 'دوام جزئي', 'عن بُعد', 'عقد', 'تدريب'];
    const requirementsList = [
      'Vue.js', 'JavaScript', 'React', 'CSS3', 'HTML5', 'Flutter', 'Dart',
      'Firebase', 'REST APIs', 'Git', 'Python', 'SQL', 'Tableau', 'Machine Learning',
      'Excel', 'Adobe Photoshop', 'Illustrator', 'Figma', 'إدارة المشاريع',
      'Agile', 'Scrum', 'JIRA', 'قيادة الفرق', 'أمن المعلومات', 'شبكات',
      'SIEM', 'اختبار الاختراق', 'ISO 27001'
    ];

    return { employmentTypes, requirementsList };
  }, []);

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'white' }} dir="rtl">
      <Header />
      
      {/* Job Search Section */}
      <JobSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Filters Sidebar */}
        <div className={styles.filtersSidebar}>
          <JobFilters 
            filters={filters}
            setFilters={setFilters}
            employmentTypes={filterOptions.employmentTypes}
            requirementsList={filterOptions.requirementsList}
          />
        </div>
        
        {/* Job Results */}
        <div className={styles.resultsSection}>
          <JobResults 
            searchQuery={searchQuery} 
            filters={filters}
          />
        </div>
      </div>
      
      <AmbientMusic />
      <ScrollToTop />
      <Footer />
    </main>
  );
}