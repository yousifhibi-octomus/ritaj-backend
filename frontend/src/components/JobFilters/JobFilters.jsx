"use client";

import styles from './JobFilters.module.css';

function JobFilters({ 
  filters, 
  setFilters,
  employmentTypes = [],
  requirementsList = []
}) {
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleMultiSelectFilter = (filterType, value) => {
    setFilters(prev => {
      const currentValues = prev[filterType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterType]: newValues
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      employmentType: [],
      salaryRange: '',
      requirements: [],
      timeOfPost: '',
      deadline: ''
    });
  };

  return (
    <div className={styles.container}>
      {/* Filters Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>تصفية النتائج</h3>
        <button 
          className={styles.clearButton}
          onClick={clearFilters}
        >
          مسح الكل
        </button>
      </div>

      {/* Employment Type Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>نوع التوظيف</h4>
        <div className={styles.checkboxGroup}>
          {employmentTypes.map(type => (
            <label key={type} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.employmentType?.includes(type) || false}
                onChange={() => handleMultiSelectFilter('employmentType', type)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>نطاق الراتب</h4>
        <select
          value={filters.salaryRange || ''}
          onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
          className={styles.select}
        >
          <option value="">جميع الرواتب</option>
          <option value="0-5000">حتى 5,000 ريال</option>
          <option value="5000-10000">5,000 - 10,000 ريال</option>
          <option value="10000-15000">10,000 - 15,000 ريال</option>
          <option value="15000-20000">15,000 - 20,000 ريال</option>
          <option value="20000+">أكثر من 20,000 ريال</option>
        </select>
      </div>

      {/* Requirements Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>المتطلبات</h4>
        <div className={styles.checkboxGroup}>
          {requirementsList.map(req => (
            <label key={req} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filters.requirements?.includes(req) || false}
                onChange={() => handleMultiSelectFilter('requirements', req)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>{req}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Time of Post Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>وقت النشر</h4>
        <select
          value={filters.timeOfPost || ''}
          onChange={(e) => handleFilterChange('timeOfPost', e.target.value)}
          className={styles.select}
        >
          <option value="">أي وقت</option>
          <option value="1">آخر 24 ساعة</option>
          <option value="3">آخر 3 أيام</option>
          <option value="7">آخر أسبوع</option>
          <option value="30">آخر شهر</option>
        </select>
      </div>

      {/* Deadline Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>الموعد النهائي</h4>
        <select
          value={filters.deadline || ''}
          onChange={(e) => handleFilterChange('deadline', e.target.value)}
          className={styles.select}
        >
          <option value="">جميع المواعيد</option>
          <option value="3">ينتهي خلال 3 أيام</option>
          <option value="7">ينتهي خلال أسبوع</option>
          <option value="30">ينتهي خلال شهر</option>
          <option value="future">مواعيد مستقبلية</option>
        </select>
      </div>

      {/* Apply Filters Button */}
      <button className={styles.applyButton}>
        تطبيق التصفيات
      </button>
    </div>
  );
}

export default JobFilters;