'use client';
import React from 'react';
import styles from './EngineerCard.module.css';

const EngineerCard = ({ engineer, size = 'MD', variant = 'default' }) => {
    const name = engineer.full_name || `${engineer.first_name || ''} ${engineer.last_name || ''}`.trim();
    const title = engineer.job_title || '';
    const city = engineer.city || '';
    const country = engineer.country?.name || '';
    const location = [city, country].filter(Boolean).join(variant === 'linkedin' ? '، ' : ', ');
    const specs = engineer.specializations;
    const years = engineer.years_experience;
    const availability = engineer.availability;
    const isVerified = !!engineer.is_verified;

    const normalizedSize = (String(size).toUpperCase() === 'XXL') ? 'XL' : String(size).toUpperCase();
    const sizeClass = {
        XS: styles.sizeXS,
        SM: styles.sizeSM,
        MD: styles.sizeMD,
        LG: styles.sizeLG,
        XL: styles.sizeXL,
    }[normalizedSize] || styles.sizeMD;

    const showLocation = ['SM','MD','LG','XL'].includes(normalizedSize);
    const canShowTagsBySize = ['MD','LG','XL'].includes(normalizedSize);
    const showTags = variant !== 'linkedin' && canShowTagsBySize;
    const maxTags = { MD: 3, LG: 6, XL: 8 }[normalizedSize] || 0;
    const featuredBadge = (engineer.featured_id || engineer.featured_level >= 4);

    const isLinkedInXS = variant === 'linkedin' && String(size).toUpperCase() === 'XS';
    const isLinkedInSM = variant === 'linkedin' && String(size).toUpperCase() === 'SM';
    const isLinkedInMD = variant === 'linkedin' && String(size).toUpperCase() === 'MD';
    const isLinkedInLG = variant === 'linkedin' && String(size).toUpperCase() === 'LG';
    const isLinkedInXL = variant === 'linkedin' && String(size).toUpperCase() === 'XL';
    const isLinkedInMDNew = variant === 'linkedin2' && String(size).toUpperCase() === 'MD';
    const rating = typeof engineer.avg_rating === 'number' ? engineer.avg_rating : (typeof engineer.rating === 'number' ? engineer.rating : null);
    const reviewsCount = typeof engineer.reviews_count === 'number' ? engineer.reviews_count : (Array.isArray(engineer.reviews) ? engineer.reviews.length : null);
    const isXS = String(size).toUpperCase() === 'XS';
    const projectsCount = typeof engineer.projects_count === 'number' ? engineer.projects_count : (Array.isArray(engineer.projects) ? engineer.projects.length : null);
    return (
    <div className={`${styles.card} ${sizeClass} ${(variant === 'linkedin' || variant === 'linkedin2') ? styles.linkedin : ''} ${isLinkedInXS ? styles.linkedinXS : ''} ${isLinkedInSM ? styles.linkedinSM : ''} ${isLinkedInMD ? styles.linkedinMD : ''} ${isLinkedInMDNew ? styles.linkedinMDNew : ''}`}>
            <div className={styles.body}>
                <div className={styles.headerRow}>
                    <div className={styles.avatar} aria-hidden="true" />
                    <div className={styles.headerStack}>
                    <h3 className={styles.name}>
                        {name || 'مهندس'}
                        {/* no in-badge for SM in this design */}
                        {featuredBadge && (
                            <span className={styles.badge} title={`Featured ${engineer.featured_level || ''}`}>
                                مميز{engineer.featured_level ? ` ${engineer.featured_level}/5` : ''}
                            </span>
                        )}
                    </h3>
                        <p className={styles.title}>{title}</p>
                        {showLocation && location && <p className={styles.location}>{location}</p>}
                    </div>
                </div>
                {(rating != null || reviewsCount != null) && (
                    isXS ? (
                        <div className={styles.ratingRow}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5c518" stroke="#f5c518" xmlns="http://www.w3.org/2000/svg" style={{ marginInlineStart: 2 }} aria-hidden="true">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
                            </svg>
                            <span className={styles.rating}>{reviewsCount != null ? reviewsCount : 0}</span>
                        </div>
                    ) : (
                        <div className={styles.ratingRow}>
                            {reviewsCount != null && <span className={styles.reviews}>(تقييم {reviewsCount})</span>}
                            {rating != null && <span className={styles.rating}>{Number(rating).toFixed(1)}</span>}
                            <span className={styles.stars} aria-hidden="true">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < Math.round((rating || 5)) ? '#f5c518' : 'none'} stroke="#f5c518" xmlns="http://www.w3.org/2000/svg" style={{ marginInlineStart: 2 }}>
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
                                    </svg>
                                ))}
                            </span>
                        </div>
                    )
                )}
                {(isLinkedInSM || isLinkedInMD || isLinkedInMDNew || isLinkedInLG || isLinkedInXL) && (
                    <div className={styles.statsRow}>
                        {(isLinkedInMD || isLinkedInMDNew) ? (
                            <>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{projectsCount != null ? projectsCount : '-'}</div>
                                    <div className={styles.statLabel}>مشروع</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{typeof years === 'number' ? years : '-'}</div>
                                    <div className={styles.statLabel}>سنة خبرة</div>
                                </div>
                            </>
                        ) : isLinkedInSM ? (
                            <>
                                <div>{typeof years === 'number' ? `${years} سنة خبرة` : ''}</div>
                                <div>{projectsCount != null ? `${projectsCount} مشروع` : ''}</div>
                            </>
                        ) : (
                            <>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{projectsCount != null ? projectsCount : '-'}</div>
                                    <div className={styles.statLabel}>مشروع</div>
                                </div>
                                <div className={styles.statBox}>
                                    <div className={styles.statNumber}>{typeof years === 'number' ? years : '-'}</div>
                                    <div className={styles.statLabel}>سنة خبرة</div>
                                </div>
                                {engineer.company && (
                                    <div className={styles.statBox}>
                                        <div className={styles.statNumber}>{engineer.company}</div>
                                        <div className={styles.statLabel}>المكتب</div>
                                    </div>
                                )}
                                {availability && (
                                    <div className={styles.statBox}>
                                        <div className={styles.statNumber}>{availability === 'available' ? 'متاح' : availability === 'limited' ? 'محدود' : 'غير متاح'}</div>
                                        <div className={styles.statLabel}>الحالة</div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
                {variant === 'linkedin' && (() => {
                    // hide meta chips for XS, SM and MD variants in this design
                    if (isLinkedInXS || isLinkedInSM || isLinkedInMD || isLinkedInMDNew || isLinkedInLG || isLinkedInXL) return null;
                    const chips = [];
                    if (engineer.company) chips.push(<span key="c" className={styles.metaChip}>{engineer.company}</span>);
                    if (typeof years === 'number') chips.push(<span key="y" className={styles.metaChip}>خبرة: {years} سنة</span>);
                    if (!isLinkedInXS && availability) chips.push(
                        <span key="a" className={styles.metaChip}>الحالة: {availability === 'available' ? 'متاح' : availability === 'limited' ? 'محدود' : 'غير متاح'}</span>
                    );
                    // removed verified chip
                    return (
                        <div className={styles.metaRow}>
                            {chips}
                        </div>
                    );
                })()}
                {/* hide specialization tags in XS by default (handled by showTags), SM/MD design also prefers no tags */}
                {showTags && !isLinkedInSM && !isLinkedInMD && !isLinkedInMDNew && Array.isArray(specs) && specs.length > 0 && (
                    <div className={styles.tags}>
                        {specs.slice(0, maxTags).map((s, i) => (
                            <span key={i} className={styles.tag}>
                                {typeof s === 'string' ? s : s?.name || ''}
                            </span>
                        ))}
                    </div>
                )}
                
                    <div className={styles.actions}>
                        <button type="button" className={styles.actionPrimary} aria-label="اتصال">تواصل</button>
                    </div>
                
            </div>
        </div>
    );
};

export default EngineerCard;

