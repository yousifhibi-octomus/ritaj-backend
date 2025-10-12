import Header from '@/components/Header';
import { Suspense } from 'react';
import Footer from '@/components/Footer';
import NewsLatterArtical from '@/components/NewsLatterArtical';
import HeroSection from '@/components/Competitions/HeroSection';
import FiltersBar from '@/components/Competitions/FiltersBar';
import CompetitionsGrid from '@/components/Competitions/CompetitionsGrid';


export const metadata = {
  title: 'المسابقات المعمارية',
  description: 'استكشف المسابقات المعمارية العالمية وانضم للتحدي',
};

export default function CompetitionsPage(){
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col gap-10 pb-16">
      <Header />
      <div className="max-w-6xl mx-auto px-4 flex flex-col gap-10 w-full">
        <HeroSection />
        <Suspense fallback={<div className="text-gray-500">...جارٍ تحميل الفلاتر</div>}>
          <FiltersBar />
        </Suspense>
        <section className="flex flex-col gap-6">
          <div className="flex flex-col items-end gap-2 pr-1">
            <h2 className="text-2xl font-bold text-gray-800">المسابقات المتاحة</h2>
            <p className="text-gray-500 text-sm">اكتشف الفرص الجديدة أو القادمة وشارك في مسابقات عالمية</p>
          </div>
          <Suspense fallback={<div className="text-gray-500">...جارٍ تحميل المسابقات</div>}>
            <CompetitionsGrid />
          </Suspense>
        </section>
        <NewsLatterArtical />
      </div>
      <Footer />
    </main>
  );
}
