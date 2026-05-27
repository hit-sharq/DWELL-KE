import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'News Article - Dwell KE',
  description: 'Read the latest news article from Dwell KE.',
};

export default async function NewsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const news = await prisma.sitePage.findUnique({
    where: { slug: `news/${slug}` },
  });

  if (!news) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-5xl font-bold text-white mb-4">Article Not Found</h1>
              <p className="text-gray-400">The news article you are looking for does not exist.</p>
              <Link href="/news" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300">
                Back to News
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <article className="space-y-8">
            {news.imageUrl && (
              <div className="h-[400px] overflow-hidden rounded-2xl">
                <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center mb-6">
              <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider">
                {new Date(news.createdAt).toLocaleDateString('en-KE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <h1 className="text-4xl font-bold text-white">{news.title}</h1>
            <div className="prose prose-lg text-gray-300 max-w-none">
              {!!news.content && news.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-6">{paragraph}</p>
              ))}
            </div>
          </article>
          <div className="mt-12 flex items-center gap-4">
            <Link href="/news" className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300">
              ← Back to News
              <ChevronRight size={16} className="rotate-180 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}