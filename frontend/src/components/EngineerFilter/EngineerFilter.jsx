'use client';
import React from 'react';
import axios from '@/lib/axios';
import styles from './EngineerFilter.module.css';

const EngineerFilter = ({ value = {}, onChange }) => {
    const [countries, setCountries] = React.useState([]);

    // Arabic localized country names via Intl API (fallback to backend name)
    const regionNamesAr = React.useMemo(() => {
        try {
            if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
                return new Intl.DisplayNames(['ar'], { type: 'region' });
            }
        } catch {}
        return null;
    }, []);

    // Arabic collator for sorting by Arabic alphabetical order
    const collatorAr = React.useMemo(() => {
        try {
            if (typeof Intl !== 'undefined' && Intl.Collator) {
                return new Intl.Collator('ar', { usage: 'sort', sensitivity: 'base', numeric: false });
            }
        } catch {}
        return null;
    }, []);

    // Sorted countries by Arabic display name (fallback to backend name)
    const sortedCountries = React.useMemo(() => {
        const display = (c) => (regionNamesAr?.of(String(c.iso_code || '').toUpperCase()) || c.name || '').trim();
        const arr = Array.isArray(countries) ? [...countries] : [];
        if (collatorAr) {
            arr.sort((a, b) => collatorAr.compare(display(a), display(b)));
        } else {
            arr.sort((a, b) => display(a).localeCompare(display(b)));
        }
        return arr;
    }, [countries, regionNamesAr, collatorAr]);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await axios.get('countries/');
                if (mounted) setCountries(Array.isArray(res.data) ? res.data : (res.data.results || []));
            } catch (e) {
                console.warn('Failed to load countries', e);
            }
        })();
        return () => { mounted = false; };
    }, []);
    const handle = (key) => (e) => {
        onChange?.({ [key]: e.target.value });
    };

    const archOptions = [
        // Architecture domain
        { value: 'architecture', label: 'العمارة' },
        { value: 'interior', label: 'التصميم الداخلي' },
        { value: 'civil', label: 'الهندسة المدنية' },
        { value: 'urban', label: 'التخطيط الحضري' },
        { value: 'conservation', label: 'الهندسة المعمارية المستدامة' },
    ];

    const toggleMulti = (key, option) => (e) => {
        const current = Array.isArray(value[key])
            ? value[key]
            : (value[key] ? [value[key]] : []);
        const exists = current.includes(option);
        const next = exists ? current.filter((v) => v !== option) : [...current, option];
        onChange?.({ [key]: next });
    };

    const isChecked = (key, option) => {
        const current = Array.isArray(value[key])
            ? value[key]
            : (value[key] ? [value[key]] : []);
        return current.includes(option);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.group}>
                <label className={styles.label}>المجالات</label>
                <div className={styles.checkboxList}>
                    {archOptions.map((opt) => (
                        <label key={opt.value} className={styles.checkboxItem}>
                            <input
                                type="checkbox"
                                checked={isChecked('specialization', opt.value)}
                                onChange={toggleMulti('specialization', opt.value)}
                            />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>الدولة</label>
                <select className={styles.select} value={value.country || ''} onChange={handle('country')}>
                    <option value="">الكل</option>
                    {sortedCountries.map((c) => (
                        <option key={c.id} value={c.id}>
                            {regionNamesAr?.of(String(c.iso_code || '').toUpperCase()) || c.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>المدينة</label>
                <input className={styles.input} type="text" placeholder="مثال: الجزائر" value={value.city || ''} onChange={handle('city')} />
            </div>

            <div className={styles.groupRow}>
                <div className={styles.group}>
                    <label className={styles.label}>سنوات الخبرة (من)</label>
                    <input
                        className={styles.input}
                        type="number"
                        min="0"
                        placeholder="0"
                        value={value.min_years || ''}
                        onChange={handle('min_years')}
                    />
                </div>
                <div className={styles.group}>
                    <label className={styles.label}>سنوات الخبرة (إلى)</label>
                    <input
                        className={styles.input}
                        type="number"
                        min="0"
                        placeholder="10"
                        value={value.max_years || ''}
                        onChange={handle('max_years')}
                    />
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>نوع الحساب</label>
                <div className={styles.radioList}>
                    <label className={styles.radioItem}>
                        <input
                            type="radio"
                            name="account_type"
                            value=""
                            checked={!value.account_type}
                            onChange={() => onChange?.({ account_type: '' })}
                        />
                        <span>الكل</span>
                    </label>
                    <label className={styles.radioItem}>
                        <input
                            type="radio"
                            name="account_type"
                            value="company"
                            checked={value.account_type === 'company'}
                            onChange={() => onChange?.({ account_type: 'company' })}
                        />
                        <span>شركة</span>
                    </label>
                    <label className={styles.radioItem}>
                        <input
                            type="radio"
                            name="account_type"
                            value="individual"
                            checked={value.account_type === 'individual'}
                            onChange={() => onChange?.({ account_type: 'individual' })}
                        />
                        <span>فرد</span>
                    </label>
                </div>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>التوفر</label>
                <select className={styles.select} value={value.availability || ''} onChange={handle('availability')}>
                    <option value="">الكل</option>
                    <option value="available">متاح</option>
                    <option value="limited">محدود</option>
                    <option value="unavailable">غير متاح</option>
                </select>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>موثق فقط</label>
                <label className={styles.checkboxItem}>
                    <input
                        type="checkbox"
                        checked={value.is_verified === 'true' || value.is_verified === true}
                        onChange={(e) => onChange?.({ is_verified: e.target.checked ? 'true' : '' })}
                    />
                    <span>عرض الموثقين فقط</span>
                </label>
            </div>

            <div className={styles.group}>
                <label className={styles.label}>مميز؟</label>
                <div className={styles.radioList}>
                    <label className={styles.radioItem}>
                        <input
                            type="radio"
                            name="featured"
                            value=""
                            checked={!value.featured}
                            onChange={() => onChange?.({ featured: '' })}
                        />
                        <span>الكل</span>
                    </label>
                    <label className={styles.radioItem}>
                        <input
                            type="radio"
                            name="featured"
                            value="yes"
                            checked={value.featured === 'yes'}
                            onChange={() => onChange?.({ featured: 'yes' })}
                        />
                        <span>نعم</span>
                    </label>
                    <label className={styles.radioItem}>
                        <input
                            type="radio"
                            name="featured"
                            value="no"
                            checked={value.featured === 'no'}
                            onChange={() => onChange?.({ featured: 'no' })}
                        />
                        <span>لا</span>
                    </label>
                </div>
            </div>
        </aside>
    );
};

export default EngineerFilter;
