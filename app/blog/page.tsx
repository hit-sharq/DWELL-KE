import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { GlassmorphicCard } from '@/components/GlassmorphicCard';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Blog - Dwell KE',
  description: 'Latest news and insights about property rental in Kenya.',
};

async function getPosts() {
  try {
    const posts = await prisma.sitePage.findMany({
      where: { slug: { startsWith: 'blog' }, isPublished: true },
      orderBy: { createdAt: 'desc' },
    });
    return posts;
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-4">Blog</h1>
            <p className="text-gray-400 text-lg">Coming soon — property insights and market trends</p>
          </div>

          {posts.length === 0 ? (
            <GlassmorphicCard className="text-center py-16">
              <p className="text-gray-400">Stay tuned for our upcoming blog articles on Kenyan real estate.</p>
            </GlassmorphicCard>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <GlassmorphicCard key={post.id}>
                  <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-gray-300">{post.content}</p>
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