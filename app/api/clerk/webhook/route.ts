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
        const adminClerkIds = process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS?.split(',') || [];
        const role = adminClerkIds.includes(clerkId) ? 'admin' : 'tenant';

        await prisma.user.create({
          data: {
            clerkId,
            email,
            firstName,
            lastName,
            profileImage: imageUrl,
            role,
            isVerified: false,
          },
        });

        console.log(`[Webhook] User created: ${clerkId} as ${role}`);
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
        // Determine if user should be an admin based on clerk ID list
        const adminClerkIds = process.env.NEXT_PUBLIC_ADMIN_CLERK_IDS?.split(',') || [];
        const isAdmin = adminClerkIds.includes(clerkId);
        
        await prisma.user.update({
          where: { clerkId },
          data: {
            firstName,
            lastName,
            profileImage: imageUrl,
            role: isAdmin ? 'admin' : existingUser.role, // Only change to admin if in list, otherwise keep existing role
          },
        });

        console.log(`[Webhook] User updated: ${clerkId} (admin: ${isAdmin})`);
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
