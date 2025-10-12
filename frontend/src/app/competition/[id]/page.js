//// filepath: c:\Users\OCTOMUS II\Desktop\ritaje\frontend\src\app\competition\[id]\page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from '@/lib/axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { notFound } from 'next/navigation';
import Compatition from '@/components/Compatition';



export default function CompetitionPage() {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    axios
      .get(`/competitions/${id}/`)
      .then((res) => {
        if (!cancelled) {
          setCompetition(res.data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCompetition(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!competition) return notFound();

  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <Compatition competition={competition} />
      <Footer />
    </main>
  );
}