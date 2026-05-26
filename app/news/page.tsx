import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
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
            <GlassmorphicCard className="text-center py-16">
              <p className="text-gray-400 mb-4">No news articles yet.</p>
              <p className="text-gray-500">Follow us on social media for updates.</p>
            </GlassmorphicCard>
          ) : (
            <div className="space-y-6">
              {news.map((item) => (
                <GlassmorphicCard key={item.id}>
                  <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    {new Date(item.createdAt).toLocaleDateString('en-KE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-300">{item.content}</p>
                </GlassmorphicCard>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}