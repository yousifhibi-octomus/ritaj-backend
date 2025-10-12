'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// import djangoAPI from '@/lib/axios'; // This line is commented out as the file doesn't exist.
import Header from '@/components/Header';
import HeadArticle from '@/components/HeadArticale';
import FirstSection from '../components/FirstSection';
import SecoundSection from '../components/SecoundSection';
import Footer from '../components/Footer';
import Newsletter from '../components/NewsLatter';
import ThirdSection from '../components/ThirdSection';
import ForthSection from '../components/FourthSection';
import LoginAdmin from '../components/LoginAdmin/LoginAdmin';
import AmbientMusic from "../components/AmbientMusic";
import ScrollToTop from "@/components/ScrollToTop";


async function getArticles() {
  try {
    //const response = await djangoAPI.get('/articles/');
    //return response.data;
  } catch (error) {
    //console.error('Failed to fetch articles:', error);
    //return [];
  }
}

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      loadArticles();
    }
  }, []);

  const loadArticles = async () => {
    const articlesData = await getArticles();
    setArticles(articlesData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple authentication - in a real app, this would call an API
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
      localStorage.setItem('adminLoggedIn', 'true');
      setError('');
      loadArticles();
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    setUsername('');
    setPassword('');
  };

  // Show login popup if not logged in
  if (!isLoggedIn) {
    // This is the line that was corrected.
    return <LoginAdmin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Show main content if logged in
  return (
    
    <main className="min-h-screen bg-gray-50">
      
      {/* Header with logout button */}
      <Header />
      <AmbientMusic />
      <HeadArticle />
      <FirstSection />
      
      <SecoundSection />
      <ForthSection/>
      
      <Newsletter />
      <ThirdSection />
       <ScrollToTop /> 
      <Footer />
    </main>
  );
}
