import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { searchParams } = req.nextUrl;
    const filter = searchParams.get('filter');

    const where: any = {};
    if (filter === 'news') {
      where.slug = { startsWith: 'news' };
    } else if (filter === 'blog') {
      where.slug = { startsWith: 'blog' };
    }

    const pages = await prisma.sitePage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error('[Site Pages GET]', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await req.json();
    const { slug, title, content } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug and title required' }, { status: 400 });
    }

    const page = await prisma.sitePage.create({
      data: { slug, title, content: content || '' },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('[Site Pages POST]', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const body = await req.json();
    const { id, slug, title, content, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
    }

    const page = await prisma.sitePage.update({
      where: { id },
      data: { slug, title, content, isPublished },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('[Site Pages PUT]', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const check = await requireAdmin();
    if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
    }

    await prisma.sitePage.delete({ where: { id } });

    return NextResponse.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('[Site Pages DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}