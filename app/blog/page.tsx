import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './blog.module.css';
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
            <div className="text-center py-16">
              <p className="text-gray-400">Stay tuned for our upcoming blog articles on Kenyan real estate.</p>
            </div>
          ) : (
            <div className={styles.blogGrid}>
              {posts.map((post) => (
                <div key={post.id}>
                  <article className={styles.blogCard}>
                    {/* Image Area */}
                    <div className={styles.blogImageWrapper}>
                      {/* Using a placeholder image since SitePage doesn't have image field */}
                      <img 
                        src="/images/blog-placeholder.jpg" 
                        alt={post.title} 
                        className={styles.blogImage}
                      />
                    </div>
                    
                    {/* Category Badge (using a default category since no category field) */}
                    <span className={styles.blogCategory}>Property Insights</span>
                    
                    {/* Content Area */}
                    <div className={styles.blogContent}>
                      <h2 className={styles.blogTitle}>
                        {post.title}
                      </h2>
                      <p className={styles.blogExcerpt}>
                        {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                      </p>
                      <Link 
                        href={`/blog?slug=${post.slug.split('/')[1]}`} 
                        className={styles.blogReadMore}
                      >
                        Read More
                      </Link>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}