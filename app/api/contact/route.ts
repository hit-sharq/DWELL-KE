import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sanitize } from '@/lib/sanitize';
import { withRateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      const { userId } = await auth();
      const user = await currentUser();

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const body = await req.json();
      const { subject, email, message } = body;

      if (!subject || !email || !message) {
        return NextResponse.json(
          { error: 'All fields are required' },
          { status: 400 }
        );
      }

      const sanitizedSubject = sanitize.plain(subject);
      const sanitizedEmail = email.trim().toLowerCase();
      const sanitizedMessage = sanitize.basic(message);

      if (sanitizedMessage.length < 10) {
        return NextResponse.json(
          { error: 'Message must be at least 10 characters' },
          { status: 400 }
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedEmail)) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }

      const contactMessage = await prisma.contactMessage.create({
        data: {
          userId: userId || undefined,
          subject: sanitizedSubject,
          email: sanitizedEmail,
          message: sanitizedMessage,
          status: 'pending',
        },
      }).catch(() => null);

      const supportEmail = process.env.SUPPORT_EMAIL || 'support@dwell-ke.com';
      const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'A User';
      
      await sendEmail({
        to: supportEmail,
        subject: `New Contact: ${sanitizedSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">New Contact Message</h2>
            <p><strong>From:</strong> ${userName}</p>
            <p><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; color: #374151;">${sanitizedMessage}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><small style="color: #9ca3af;">Message ID: ${contactMessage?.id || 'unknown'}</small></p>
          </div>
        `,
      });

      await sendEmail({
        to: sanitizedEmail,
        subject: `We received your message - ${sanitizedSubject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Thank You for Contacting Dwell KE</h2>
            <p>Hi ${user.firstName || 'there'},</p>
            <p>We have received your message with the subject "<strong>${sanitizedSubject}</strong>".</p>
            <p>Our support team will review your message and get back to you within 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap; color: #374151;">${sanitizedMessage}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p>Best regards,<br><strong>Dwell KE Support Team</strong></p>
          </div>
        `,
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'Your message has been received. We will get back to you within 24 hours.',
          id: contactMessage?.id 
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[Contact POST]', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    // Only admins can view all contact messages
    if (dbUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('[Contact GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
