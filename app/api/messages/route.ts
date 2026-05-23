import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET messages for user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const otherUserId = searchParams.get('otherUserId');

    let where: any = {
      OR: [{ senderId: user.id }, { recipientId: user.id }],
    };

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (otherUserId) {
      where.OR = [
        { senderId: user.id, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: user.id },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('[Messages GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST send new message
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      recipientId,
      propertyId,
      content,
    }: { recipientId: string; propertyId?: string; content: string } = body;

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Recipient ID and content are required' },
        { status: 400 }
      );
    }

    const sender = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!sender) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    });
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: sender.id,
        recipientId,
        propertyId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('[Messages POST]', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH mark message as read
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.recipientId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[Messages PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}