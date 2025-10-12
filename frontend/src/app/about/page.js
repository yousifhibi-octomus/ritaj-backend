// app/about/page.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsLatterArtical from '@/components/NewsLatterArtical';
import AboutUs from '@/components/AboutUs';
import { notFound } from 'next/navigation';
import AmbientMusic from "@/components/AmbientMusic";


export default async function NewsPage({ params }) {


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
       <div className="flex-1">
      <Header />
      <AmbientMusic /> 
      <AboutUs />
      <NewsLatterArtical />
      <Footer />
      </div>
    </main>
  );
}