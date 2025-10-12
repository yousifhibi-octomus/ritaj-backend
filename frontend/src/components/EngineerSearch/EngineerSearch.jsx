'use client';
import React from 'react';
import styles from './EngineerSearch.module.css';

const EngineerSearch = ({
    value = '',
    onChange,
    onSearch,
    discipline = '',
    onDisciplineChange,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.(value);
    };

        return (
            <section className={styles.hero} dir="rtl">
                <h2 className={styles.title}>اعثر على معماريين خبراء</h2>
                <p className={styles.subtitle}>تواصل مع محترفين مؤهلين في جميع مجالات العمارة</p>

            <form className={styles.bar} onSubmit={handleSubmit} role="search">
                <div className={styles.fieldWithIcon}>
                    <span className={styles.icon} aria-hidden="true">
                        {/* search icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </span>
                                <input
                        className={styles.input}
                        type="text"
                                    placeholder="ابحث بالاسم أو المكتب أو مجال العمارة..."
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                    />
                </div>

                <select
                    className={styles.select}
                    value={discipline}
                    onChange={(e) => onDisciplineChange?.(e.target.value)}
                                            aria-label="كل المجالات المعمارية"
                >
                                            <option value="">كل المجالات</option>
                                            <option value="architecture">العمارة</option>
                                            <option value="interior">التصميم الداخلي</option>
                                            <option value="urban">التخطيط الحضري</option>
                                            <option value="landscape">تصميم المناظر الطبيعية</option>
                                            <option value="conservation">الترميم والحفاظ</option>
                                            <option value="facade">تصميم الواجهات</option>
                </select>

                            <button type="submit" className={styles.button} aria-label="بحث">
                    <span className={styles.buttonIcon} aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 15.5L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                    </span>
                                بحث
                </button>
            </form>
        </section>
    );
};
export default EngineerSearch;

