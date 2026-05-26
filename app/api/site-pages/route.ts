import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/site-pages?slug=news - public endpoint for fetching published pages
// Returns single page if slug provided, or list of published pages
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const slug = searchParams.get('slug');

    if (slug) {
      const page = await prisma.sitePage.findUnique({
        where: { slug, isPublished: true },
      });

      if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

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