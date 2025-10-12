'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SavedArticles from '@/components/SavedArticles/SavedArticles';
import ArticleCard from '../ArticleCard';
import styles from './Profile.module.css';
import Settings from '../Settings';
import axios from '@/lib/axios';
import AuthorArticles from '../AuthorArticles';
import AuthorRequests from '@/components/AuthorRequests';
import ArticleRequests from '@/components/ArticleRequests';
import WriteArticle from '@/components/WriteArticle';
import ProfileTabs from '../ProfileTabs/ProfileTabs';
import AddPodcast from '@/components/AddPodcast';
import ContactMessages from '@/components/ContactMessages';
import AddCompetition from '@/components/AddCompetition/AddCompetition';
import CompetitionRegistration from '@/components/CompetitionRegistration';
export default function Profile({ username }) {
  const decodedUsername = decodeURIComponent(username);
  username = decodedUsername;
  

  const [activeTab, setActiveTab] = useState('articles');
  const [message, setMessage] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [authorArticles, setAuthorArticles] = useState([]);
  const [savedArticles, setSavedArticles] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);

  // Fetch user info, authored articles, and saved articles from backend
  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setArticlesLoading(true);
      try {
  // 1. User core data
  const userRes = await axios.get(`/users/${encodeURIComponent(username)}/`);
        if (ignore) return;
        const userData = userRes.data;
        setUser({
          username: userData.username,
            name: userData.name || userData.username,
            avatar: userData.avatar || '/images/avatar.jpg',
            bio: userData.bio || '',
            socials: userData.socials || [],
            role: userData.role || 'user',
        });

        // 2. Authored articles list
        const authoredRes = await axios.get(`/users/${encodeURIComponent(username)}/articles/`);
        if (!ignore) setAuthorArticles(authoredRes.data || []);

        // 3. Saved articles list (public for now)
        const savedRes = await axios.get(`/users/${encodeURIComponent(username)}/saved/`);
        if (!ignore) setSavedArticles(savedRes.data || []);
      } catch (e) {
        if (!ignore) {
          console.error('Failed to load profile data', e);
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setArticlesLoading(false);
        }
      }
    };
    load();
    return () => { ignore = true; };
  }, [username]);
  // Check if the logged-in user is the profile owner
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setLoggedInUser(parsed);
        setIsOwner(parsed?.name === username);
      }
    }
  }, [username]);
  
  // (Removed mock data processing effect)

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading || articlesLoading) {
    return (
      <div className={styles.authorProfile}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.authorProfile}>
        <div className={styles.error}>المستخدم غير موجود</div>
      </div>
    );
  }

  return (
    <div className={`${styles.authorProfile} ${darkMode ? styles.dark : ''}`}>
      {message && <div className={`${styles.messageBox} ${styles.visible}`}>{message}</div>}

      <div className={styles.profileContainer}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <img src={user.avatar} alt={user.name} className={styles.profileAvatar} />
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{user.name}</h1>
            <p className={styles.profileBio}>{user.bio}</p>

            {/* Socials */}
      <div className={styles.profileSocials}>
        {user.socials.map((social, index) => (
          <a
            key={index}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialButton}
            title={social.name}
          >
            <img
              src={`/icons/${social.name.toLowerCase()}.PNG`}
              alt={social.name}
              className={styles.socialIcon}
            />
          </a>
        ))}
      </div>

          </div>
        </div>

        {/* Tabs */}
        <ProfileTabs
  user={user}
  isOwner={isOwner}
  activeTab={activeTab}
  onChange={setActiveTab}
/>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'articles' && <AuthorArticles authorArticles={authorArticles} />}
          {activeTab === 'saved' && (
            <SavedArticles savedArticles={savedArticles} />
          )}

          {isOwner && activeTab === 'settings' && <Settings username={username} />}
           {isOwner && user.role === 'admin' && activeTab === 'AuthorRequests' && (<AuthorRequests />)}
            {isOwner && (user.role === 'admin' || user.role === 'editor') && activeTab === 'ArticleRequests' && (<ArticleRequests />)}
             {isOwner && (user.role === 'admin' || user.role === 'editor') && activeTab === 'addPodcast' && (<AddPodcast />)}
            {isOwner && (user.role === 'admin' || user.role === 'editor') && activeTab === 'contactMessages' && (<ContactMessages />)}
               {isOwner && (user.role === 'admin' || user.role === 'editor') && activeTab === 'addCompetition' && (<AddCompetition />)}
                {isOwner && (user.role === 'admin' || user.role === 'editor') && activeTab === 'CompetitionRegistration' && (<CompetitionRegistration />)}
            {isOwner && (user.role != 'user') && activeTab === 'writeArticle' && (<WriteArticle />)}
        </div>
      </div>
    </div>
  );
}