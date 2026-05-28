import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/admin';
import { auth } from '@clerk/nextjs/server';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

async function generateUniqueSlug(baseSlug: string, prefix: string = ''): Promise<string> {
  let slug = prefix ? `${prefix}/${baseSlug}` : baseSlug;
  let existing = await prisma.sitePage.findUnique({ where: { slug } });
  let counter = 1;
  while (existing) {
    slug = prefix ? `${prefix}/${baseSlug}-${counter}` : `${baseSlug}-${counter}`;
    existing = await prisma.sitePage.findUnique({ where: { slug } });
    counter++;
  }
  return slug;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, imageUrl, type } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 });
    }

    const baseSlug = generateSlug(title);
    const prefix = type === 'news' ? 'news' : 'blog';
    const slug = await generateUniqueSlug(baseSlug, prefix);

    const page = await prisma.sitePage.create({
      data: { slug, title, content: content || '', imageUrl: imageUrl || null },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('[Site Pages POST]', error);
    return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { id, slug, title, content, imageUrl, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: 'Page ID required' }, { status: 400 });
    }

    const data: any = { title, content, isPublished };
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (slug) data.slug = slug;

    const page = await prisma.sitePage.update({
      where: { id },
      data,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('[Site Pages PUT]', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !isAdminUser(userId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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