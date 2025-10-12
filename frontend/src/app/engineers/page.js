// app/about/page.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsLatterArtical from '@/components/NewsLatterArtical';
import ListOfEngineers from '@/components/ListOfEngineers';

import { notFound } from 'next/navigation';


export default async function NewsPage({ params }) {


  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
       <div className="flex-1">
      <Header />
        <ListOfEngineers />
      <NewsLatterArtical />
      <Footer />
      </div>
    </main>
  );
}