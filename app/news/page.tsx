import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './news.module.css';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'News - Dwell KE',
  description: 'Latest company news and updates from Dwell KE.',
};

async function getNews() {
  try {
    const news = await prisma.sitePage.findMany({
      where: { slug: { startsWith: 'news' }, isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    return news;
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">News & Updates</h1>
            <p className="text-gray-400 text-lg">Stay informed with our latest announcements</p>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No news articles yet.</p>
              <p className="text-gray-500">Follow us on social media for updates.</p>
            </div>
          ) : (
            <div className={styles.newsGrid}>
              {news.map((item) => {
                const slugPart = item.slug.split('/')[1] || item.slug;
                const placeholderImg = '/images/news-placeholder.jpg';
                return (
                  <div key={item.id}>
                    <article className={styles.newsCard}>
                      {/* Image Area */}
                      <div className={styles.newsImageWrapper}>
                        <img 
                          src={item.imageUrl || placeholderImg} 
                          alt={item.title} 
                          className={styles.newsImage}
                        />
                      </div>
                      
                      {/* Category Badge */}
                      <span className={styles.newsCategory}>Company Update</span>
                      
                      {/* Content Area */}
                      <div className={styles.newsContent}>
                        <h2 className={styles.newsTitle}>
                          {item.title}
                        </h2>
                        <p className={styles.newsExcerpt}>
                          {item.content?.substring(0, 200)}{item.content && item.content.length > 200 ? '...' : ''}
                        </p>
                        <Link 
                          href={`/news/${slugPart}`} 
                          className={styles.newsReadMore}
                        >
                          Read More
                        </Link>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}