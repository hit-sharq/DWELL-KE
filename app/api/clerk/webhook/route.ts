import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const svixId = headers().get('svix-id') || '';
    const svixTimestamp = headers().get('svix-timestamp') || '';
    const svixSignature = headers().get('svix-signature') || '';

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

      // Derive role from Clerk publicMetadata.role (set during signup role selection)
      // Falls back to 'tenant' if no role was set
      const role = (evt.data.public_metadata as Record<string, unknown>)?.role as string | undefined;
      const finalRole = role === 'landlord' || role === 'admin' ? role : 'tenant';

      // Check if user already exists
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
            role: finalRole,
            isVerified: false,
          },
        });

        console.log(`[Webhook] User created: ${clerkId} as ${finalRole}`);
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

      // Sync role from publicMetadata if it changed
      const role = (evt.data.public_metadata as Record<string, unknown>)?.role as string | undefined;

      await prisma.user.update({
        where: { clerkId },
        data: {
          firstName,
          lastName,
          profileImage: imageUrl,
          ...(role ? { role } : {}),
        },
      });

      console.log(`[Webhook] User updated: ${clerkId}`);
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
