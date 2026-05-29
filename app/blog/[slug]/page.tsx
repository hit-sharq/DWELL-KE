import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Blog Post - Dwell KE',
  description: 'Read the latest blog post from Dwell KE.',
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

   const post = await prisma.sitePage.findUnique({
     where: { slug: `blog/${slug}` },
   });

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-5xl font-bold text-white mb-4">Post Not Found</h1>
              <p className="text-gray-400">The blog post you are looking for does not exist.</p>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300"
              >
                Back to Blog
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
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
            {post.imageUrl && (
              <div className="h-[400px] overflow-hidden rounded-2xl">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex items-center mb-6">
              <p className="text-xs text-cyan-400/80 font-semibold uppercase tracking-wider">
                {new Date(post.createdAt).toLocaleDateString('en-KE', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <h1 className="text-4xl font-bold text-white">{post.title}</h1>
            <div className="prose prose-lg text-gray-300 max-w-none">
              {!!post.content &&
                post.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                ))}
            </div>
          </article>
          <div className="mt-12 flex items-center gap-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold text-sm transition-all duration-300"
            >
              ← Back to Blog
              <ChevronRight
                size={16}
                className="rotate-180 transition-transform group-hover:-translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

