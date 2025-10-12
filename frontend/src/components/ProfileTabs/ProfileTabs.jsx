
'use client';
import React, { useEffect } from 'react';
import styles from './ProfileTabs.module.css';

export default function ProfileTabs({ user, isOwner, activeTab, onChange }) {
  const canAuthor = user.role !== 'user';
  const isAdmin = user.role === 'admin';
  const isEditor = user.role === 'editor';

  // First visible tab
  const firstTab = canAuthor ? 'articles' : 'saved';

  // If activeTab is not one of the visible tabs, point to the first visible one
  useEffect(() => {
    const visible = new Set([
      ...(canAuthor ? ['articles'] : []),
      'saved',
      ...(isOwner ? ['settings'] : []),
      ...(isOwner && isAdmin ? ['AuthorRequests'] : []),
      ...(isOwner && (isAdmin || isEditor) ? ['ArticleRequests', 'addPodcast', 'contactMessages'] : []),
      ...(isOwner && canAuthor ? ['writeArticle'] : []),
    ]);
    if (!visible.has(activeTab)) onChange?.(firstTab);
  }, [activeTab, canAuthor, isOwner, isAdmin, isEditor, firstTab, onChange]);

  return (
    <div className={styles.tabs} dir="rtl">
      {canAuthor && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'articles' ? styles.active : ''}`}
          onClick={() => onChange('articles')}
        >المقالات</button>
      )}
      <button
        type="button"
        className={`${styles.tabButton} ${activeTab === 'saved' ? styles.active : ''}`}
        onClick={() => onChange('saved')}
      >المحفوظات</button>
      {isOwner && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => onChange('settings')}
        >الإعدادات</button>
      )}
      {isOwner && isAdmin && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'AuthorRequests' ? styles.active : ''}`}
          onClick={() => onChange('AuthorRequests')}
        >طلبات التأليف</button>
      )}
      {isOwner && (isAdmin || isEditor) && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'ArticleRequests' ? styles.active : ''}`}
          onClick={() => onChange('ArticleRequests')}
        >مراجعة المقالات</button>
      )}
      {isOwner && (isAdmin || isEditor) && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'addPodcast' ? styles.active : ''}`}
          onClick={() => onChange('addPodcast')}
        >اضافة بودكاست</button>
      )}
      {isOwner && (isAdmin || isEditor) && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'contactMessages' ? styles.active : ''}`}
          onClick={() => onChange('contactMessages')}
        >رسائل التواصل</button>
      )}
      {isOwner && canAuthor && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'writeArticle' ? styles.active : ''}`}
          onClick={() => onChange('writeArticle')}
        >كتابة مقال</button>
      )}
      
{/* {isOwner && (isAdmin || isEditor) && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'addCompetition' ? styles.active : ''}`}
          onClick={() => onChange('addCompetition')}
        >اضافة مسابقة</button>
      )}
      {isOwner && (isAdmin || isEditor) && (
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'CompetitionRegistration' ? styles.active : ''}`}
          onClick={() => onChange('CompetitionRegistration')}
        >مسجلين في المسابقات</button>
      )} */}
    </div>
  );
}




