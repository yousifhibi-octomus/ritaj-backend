import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Profile from '@/components/Profile';


// Pre-generate static params
export async function generateStaticParams() {
  return [
    { username: 'admin' },
    { username: 'writer' },
    
    { username: 'Admin' }
  ];
}


export default async  function ProfilePage({ params }) {
  const { username } = await params; 

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Profile username={username} />
      <Footer />
    </main>
  );
}