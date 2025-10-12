// app/projects/[tag]/page.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SubSection from '@/components/SubSection';
import NewsLatterArtical from '@/components/NewsLatterArtical';
import styles from './project.module.css';
import AmbientMusic from "@/components/AmbientMusic";

export async function generateStaticParams() {
  const tags = [
    "مشاريع",
    "تصميم داخلي",
    "تجديد",
    "مزرعة",
    "ريف",
    "تاريخي",
    "مواد تقليدية",
    "جوب بيرنز",
    "جنوب غرب إنجلترا",
    "فرنسا",
    "فيب",
    "دور ضيافة",
    "المنازل البرتغالية",
    "فيلا كاسا تيجو",
    "شركة برناردس أركيتيتورا",
    "الفيلات",
    "الهندسة المعمارية",
    "نيري آند هو",
    "جورجيا",
    "إعادة استخدام تكيفي",
    "تبليسي",
    "فنادق",
    "تجديدات",
    "تصميمات داخلية",
    "أبرز",
    "تايوان",
    "حيوانات",
    "أكواخ",
    "عمارة عائمة",
    "طيور",
    "إم في آر دي في",
    "مراكز الزوار",
    "عامة وترفيهية",
    "صخور",
    "إيزلين ستوديو",
    "نيويورك",
    "الولايات المتحدة",
    "مدينة نيويورك",
    "تصميم مومباي",
    "فعاليات الهندسة المعمارية والتصميم",
    "تصميم",
    "ترويجات",
    "بورتو",
    "منازل برتغالية",
    "فالا أتلييه",
    "جسور",
    "إنجلترا",
    "غريمشو أركيتكتس",
    "هاي سبيد 2",
    "بنية تحتية",
    "المملكة المتحدة",
    "نورويتش",
    "ترميمات",
    "قلاع",
    "نورفولك",
    "ناطحات سحاب",
    "كازينوهات",
    "CetraRuddy",
    "Silverstein Properties",
    "أخبار",
    "عمارة سكنية",
    "عمارة عامة",
    "تخطيط مدن",
    "عمارة مستدامة",
    "تطوير عقاري",
    "مباني تجارية",
    "تصميم حضري",
    "متاحف",
    "مباني ثقافية",
    "مراكز تسوق",
    "مطاعم ومقاهي",
    "مساحات عمل مشتركة",
    "مكاتب",
    "مدارس",
    "مساجد",
    "حدائق",
    "مشاريع مستقبلية",
    "تصميم داخلي حديث",
    "أثاث"
  ];

 return tags.map(tag => ({ tag: tag.replace(/\s+/g, "-") })); 
}

// ✅ make this async
export default async function TagPage({ params }) {
  const { tag } = await params; // await here
  const decodedTag = decodeURIComponent(tag); // decode Arabic

  return (
    <main className="min-h-screen bg-gray-50">
   
      <Header />
      <AmbientMusic />


      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{decodedTag}</h2>
        <SubSection tag={decodedTag} />
        <NewsLatterArtical />
      </section>
      <Footer />
    </main>
  );
}
