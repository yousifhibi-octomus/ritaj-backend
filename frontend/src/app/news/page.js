// app/articles/[slug]/page.js

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsLatterArtical from '@/components/NewsLatterArtical';
import styles from './news.module.css';
import SubSection from '@/components/SubSection';
import AmbientMusic from "@/components/AmbientMusic";

export default async function NewsPage({ params }) {


  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <AmbientMusic /> 
     
     


      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>آخر الأخبار</h2>
     </div>

      <SubSection  />

      <NewsLatterArtical />
       
      <Footer />
    </main>
  );
}