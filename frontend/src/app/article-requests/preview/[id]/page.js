'use client';

import { use, useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Article from '@/components/Articale';
import RequestModerationPanel from '@/components/RequestModerationPanel';
export default function ArticleRequestPreview({ params: paramsPromise }) {
  // Unwrap params (Next.js warning you saw)
  const params = typeof paramsPromise?.then === 'function' ? use(paramsPromise) : paramsPromise;
  const { id } = params || {};

  const [reqData, setReqData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr('');
        const res = await axios.get(`/article-requests/${id}/`);
        if (!cancelled) setReqData(res.data);
      } catch (e) {
        if (!cancelled) setErr('فشل تحميل المعاينة');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="p-8 text-center">جارٍ التحميل...</div>
        <Footer />
      </main>
    );
  }

  if (err || !reqData) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="p-8 text-center text-red-600">{err || 'غير موجود'}</div>
        <Footer />
      </main>
    );
  }

  // Config
  const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://127.0.0.1:8000';
  const PUBLIC_GALLERY_DIR = '/images'; // legacy fallback

  const normHeader = (p) => {
    if (!p) return null;
    if (p.startsWith('http')) return p;
    if (p.startsWith('/media')) return `${API_BASE}${p}`;
    return `${API_BASE}/media/article_requests/${p}`;
  };

  const toAbsolute = (p) => {
    if (!p) return null;
    if (typeof p !== 'string') return null;
    if (p.startsWith('http')) return p;
    if (p.startsWith('/media')) return `${API_BASE}${p}`;
    if (p.startsWith('/')) return p;
    return `${PUBLIC_GALLERY_DIR}/${p}`; // legacy
  };

  const gallery = Array.isArray(reqData.images)
    ? reqData.images.map((img) => {
        if (typeof img === 'string') return toAbsolute(img);
        if (img && typeof img === 'object') return toAbsolute(img.url || img.image);
        return null;
      }).filter(Boolean)
    : [];

  const articleShape = {
    title: reqData.title,
    slug: reqData.slug || `req-${reqData.id}`,
    text: reqData.content || reqData.text || '',
  headerImage: normHeader(reqData.headerImage),
    tags: reqData.tags || [],
    images: gallery,
    date: reqData.created_at,
    author: reqData.author_name
  };



  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Article article={articleShape} isRequest={true} />
      {/* Remove this debug gallery once Article shows images */}
      {articleShape.images.length > 0 && (
        <div style={{
          margin: '2rem auto',
          maxWidth: '1000px',
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))'
        }}>
         
        </div>
      )}

         <RequestModerationPanel
        request={reqData}
        onDone={(r)=>console.log('Moderated:', r)}
      />
        


















      <Footer />
    </main>
  );
}