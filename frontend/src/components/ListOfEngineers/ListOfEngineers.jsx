

'use client';

import React from 'react';
import styles from './ListOfEngineers.module.css';
import EngineerGrid from '../EngineerGrid';
import EngineerFilter from '../EngineerFilter';
import EngineerSearch from '../EngineerSearch';
import JoinList from '../JoinList';
const ListOfEngineers = () => {
    const [query, setQuery] = React.useState({
        search: '',
        specialization: [],
        country: '',
        city: '',
        is_verified: '',
        is_freelancer: '',
        account_type: '',
        availability: '',
    featured_min: '',
    featured: '',
        min_years: '',
        max_years: '',
        page: 1,
    });
    const [count, setCount] = React.useState(null);
    const [pageInfo, setPageInfo] = React.useState({ page: 1, next: null, previous: null });
    const [viewMode, setViewMode] = React.useState('list'); // or 'map'

    const handleSearchChange = (term) => {
        setQuery((prev) => ({ ...prev, search: term, page: 1 }));
    };

    const handleFiltersChange = (partial) => {
        setQuery((prev) => ({ ...prev, ...partial, page: 1 }));
    };

    return (
        <div className={styles.container}>
            <EngineerSearch
                value={query.search}
                onChange={handleSearchChange}
                onSearch={handleSearchChange}
                discipline={Array.isArray(query.specialization) ? (query.specialization[0] || '') : (query.specialization || '')}
                onDisciplineChange={(val) => handleFiltersChange({ specialization: val ? [val] : [] })}
            />

            <div className={styles.topbar}>
                <div className={styles.viewToggle}>
                    <span className={styles.viewLabel}>عرض النتائج:</span>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                        onClick={() => setViewMode('list')}
                    >قائمة</button>
                    <button
                        className={`${styles.toggleBtn} ${viewMode === 'map' ? styles.active : ''}`}
                        onClick={() => setViewMode('map')}
                    >خريطة</button>
                </div>
                {typeof count === 'number' && (
                    <div className={styles.resultCount}>تم العثور على {count} معماري</div>
                )}
            </div>

            <div className={styles.content}>
                <div className={styles.leftCol}>
                    <EngineerFilter value={query} onChange={handleFiltersChange} />
                    <JoinList className={styles.joinList} />
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <EngineerGrid query={query} onCount={setCount} onPageInfo={setPageInfo} />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                            disabled={!pageInfo.previous}
                            onClick={() => setQuery((p) => ({ ...p, page: Math.max(1, (p.page || 1) - 1) }))}
                            className={styles.toggleBtn}
                        >السابق</button>
                        <span style={{ alignSelf: 'center' }}>صفحة {query.page || 1}</span>
                        <button
                            disabled={!pageInfo.next}
                            onClick={() => setQuery((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                            className={styles.toggleBtn}
                        >التالي</button>
                    </div>
                </div>
            </div>
             
        </div>
       
    );
};

export default ListOfEngineers;
   
