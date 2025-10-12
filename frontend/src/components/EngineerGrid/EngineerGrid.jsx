'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import styles from './EngineerGrid.module.css';
import EngineerCard from '../EngineerCard';

const EngineerGrid = ({ query = {}, onCount, onPageInfo, sizeMode = 'xs' }) => {
    const [engineers, setEngineers] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 1, next: null, previous: null, pageSize: null });
    
    // Column spans per size (12-column grid)
    const spanForSize = (size) => ({ XS: 2, SM: 3, MD: 4, LG: 6, XL: 12 })[String(size).toUpperCase()] || 4;

    useEffect(() => {
        const fetchEngineers = async () => {
            try {
                const params = new URLSearchParams();
                if (query.search) params.set('search', query.search);
                if (query.specialization && Array.isArray(query.specialization)) {
                    // Send multiple values as repeated params: specialization=a&specialization=b
                    query.specialization.forEach((s) => {
                        if (s) params.append('specialization', s);
                    });
                } else if (query.specialization) {
                    params.set('specialization', query.specialization);
                }
                if (query.country) params.set('country', query.country);
                if (query.city) params.set('city', query.city);
                if (query.is_verified) params.set('is_verified', query.is_verified);
                if (query.is_freelancer) params.set('is_freelancer', query.is_freelancer);
                if (query.account_type) params.set('account_type', query.account_type);
                if (query.featured === 'yes') {
                    params.set('featured_min', '1');
                } else if (query.featured === 'no') {
                    // Explicitly not featured: we can set featured_min=0 to include all,
                    // or just omit and rely on is_verified/other filters. We'll omit here.
                } else if (query.featured_min) {
                    params.set('featured_min', query.featured_min);
                }
                if (query.availability) params.set('availability', query.availability);
                if (query.min_years) params.set('min_years', query.min_years);
                if (query.max_years) params.set('max_years', query.max_years);
                if (query.page) params.set('page', String(query.page));

                        const url = 'engineers/' + (params.toString() ? `?${params.toString()}` : '');
                        const response = await axios.get(url);
                        const isArray = Array.isArray(response.data);
                        const data = isArray ? response.data : (response.data?.results || []);
                        const total = isArray ? data.length : (typeof response.data?.count === 'number' ? response.data.count : data.length);
                setEngineers(data);
                        if (!isArray) {
                            const pg = {
                                page: query.page || 1,
                                next: response.data?.next || null,
                                previous: response.data?.previous || null,
                                pageSize: response.data?.results ? response.data.results.length : null,
                            };
                            setPageInfo(pg);
                            if (typeof onPageInfo === 'function') onPageInfo(pg);
                        } else {
                            setPageInfo({ page: 1, next: null, previous: null, pageSize: data.length });
                            if (typeof onPageInfo === 'function') onPageInfo({ page: 1, next: null, previous: null, pageSize: data.length });
                        }
                        if (typeof onCount === 'function') onCount(total);
            } catch (error) {
                console.error('Error fetching engineers:', error);
            }
        };

        fetchEngineers();
    }, [query]);

    const sizeForEngineer = (e) => {
        if (sizeMode !== 'featured') return 'XS';
        if (e?.featured_id) return 'XL';
        const lvl = Number(e?.featured_level || 0);
        switch (lvl) {
            case 5: return 'XL';
            case 4: return 'LG';
            case 3: return 'MD';
            case 2: return 'SM';
            case 1: return 'XS';
            default: return 'XS';
        }
    };

    return (
        <div className={styles.grid}>
            {/* Live data cards */}
            {engineers.length === 0 && (
                <div style={{ gridColumn: 'span 12', color: 'var(--color-text-muted)', padding: '0.5rem 0' }}>
                    لا توجد نتائج حالياً.
                </div>
            )}
            {engineers.map((engineer) => {
                const size = sizeForEngineer(engineer);
                const span = spanForSize(size);
                return (
                    <div key={engineer.id} style={{ gridColumn: `span ${span}` }}>
                        <EngineerCard engineer={engineer} size={size} variant="linkedin" />
                    </div>
                );
            })}
        </div>
    );
};



export default EngineerGrid;


