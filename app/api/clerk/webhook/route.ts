import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const hdrs = await headers();
    const svixId = hdrs.get('svix-id') || '';
    const svixTimestamp = hdrs.get('svix-timestamp') || '';
    const svixSignature = hdrs.get('svix-signature') || '';

    // Verify webhook signature
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    const evt = wh.verify(JSON.stringify(payload), {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as any;

    if (evt.type === 'user.created') {
      const clerkId = evt.data.id;
      const email = evt.data.email_addresses[0]?.email_address;
      const firstName = evt.data.first_name || '';
      const lastName = evt.data.last_name || '';
      const imageUrl = evt.data.image_url || '';

      const existingUser = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName,
            lastName,
            profileImage: imageUrl,
            role: evt.data.public_metadata?.role || evt.data.private_metadata?.role || 'tenant',
            isVerified: false,
          },
        });

        console.log(`[Webhook] User created: ${clerkId} as tenant`);
      }
    }

    if (evt.type === 'user.deleted') {
      const clerkId = evt.data.id;

      // Delete user and cascade delete related data
      await prisma.user.delete({
        where: { clerkId },
      });

      console.log(`[Webhook] User deleted: ${clerkId}`);
    }

    if (evt.type === 'user.updated') {
      const clerkId = evt.data.id;
      const firstName = evt.data.first_name || '';
      const lastName = evt.data.last_name || '';
      const imageUrl = evt.data.image_url || '';

      const existingUser = await prisma.user.findUnique({
        where: { clerkId },
      });

      if (existingUser) {
        await prisma.user.update({
          where: { clerkId },
          data: {
            firstName,
            lastName,
            profileImage: imageUrl,
          },
        });

        console.log(`[Webhook] User updated: ${clerkId}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Clerk Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
