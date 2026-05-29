import { prisma } from './lib/db';

async function test() {
  try {
    const posts = await prisma.sitePage.findMany({
      where: { slug: { startsWith: 'blog' }, isPublished: true },
      select: { slug: true, title: true }
    });
    console.log('Found posts:', JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();