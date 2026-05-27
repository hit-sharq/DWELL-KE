import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/site-pages?slug=news OR ?slug=blog - public endpoint for fetching published pages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const slug = searchParams.get('slug');

    if (slug === 'news' || slug === 'blog') {
      // Return all pages starting with 'news/' or 'blog/'
      const pages = await prisma.sitePage.findMany({
        where: {
          slug: { startsWith: `${slug}/` },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(pages);
    }

    if (slug) {
      // Return single page
      const page = await prisma.sitePage.findUnique({
        where: { slug, isPublished: true },
      });
      return NextResponse.json(page);
    }

    // Return all published pages
    const pages = await prisma.sitePage.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('[Site Pages GET]', error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}