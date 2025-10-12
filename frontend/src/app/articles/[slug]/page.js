'use client'; // This must be the first line in the file

import { useEffect, useState } from 'react';
import axios from '@/lib/axios'; // Use your axios instance
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsLatterArtical from '@/components/NewsLatterArtical';
import Article from '@/components/Articale';
import { notFound } from 'next/navigation';
import Comments from '@/components/Comments';
import PostArtical from '@/components/PostArtical';

export default function ArticlePage({ params: paramsPromise }) {
  const [slug, setSlug] = useState(null); // State to store the slug
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Unwrap the params Promise
  useEffect(() => {
    paramsPromise.then((params) => {
      setSlug(params.slug); // Set the slug when it's resolved
    });
  }, [paramsPromise]);

  // Fetch the article when the slug is available
  useEffect(() => {
    if (!slug) return; // Wait for slug to be available
    
    axios
      .get(`/articles/${slug}/`) // Replace with your backend endpoint
      .then((response) => {
        setArticle(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching article:', error);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!article) {
    notFound();
  }
 const submitModeration = async () => {
    if (!mode) return;
    if (mode === 'needs_editing' && !comments.trim()) return;
    setSubmitting(true);
    setSuccessMsg('');
    try {
      await axios.post(`/article-requests/${reqData.id}/moderate/`, {
        action: mode,
        comments: (mode === 'needs_editing' || mode === 'reject') ? comments : ''
      });
      setSuccessMsg(
        mode === 'approve'
          ? 'تم اعتماد المقال'
          : mode === 'needs_editing'
            ? 'تم إرسال الملاحظات'
            : 'تم رفض المقال'
      );
      // Optionally disable further actions
      setMode(null);
      setComments('');
    } catch {
      setSuccessMsg('حدث خطأ، أعد المحاولة');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <Article article={article} isRequest={false} />
        <NewsLatterArtical />
        <PostArtical currentTags={article.tags} currentSlug={article.slug} />
        <Comments id={article.id} />
        <Footer />
      </main>
    </>
  );
}