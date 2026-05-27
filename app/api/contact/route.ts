import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, email, message } = body;

    // Validation
    if (!subject || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Save contact message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        userId: userId || undefined,
        subject: subject.trim(),
        email: email.trim(),
        message: message.trim(),
        status: 'pending',
      },
    }).catch(() => null);

    // Send email to support team
    try {
      const supportEmail = process.env.SUPPORT_EMAIL || 'support@dwell-ke.com';
      const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'A User';
      
      await sendEmail({
        to: supportEmail,
        subject: `New Contact: ${subject.trim()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">New Contact Message</h2>
            <p><strong>From:</strong> ${userName}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject.trim()}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; color: #374151;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><small style="color: #9ca3af;">Message ID: ${contactMessage?.id || 'unknown'}</small></p>
          </div>
        `,
      });

      // Send confirmation email to user
      await sendEmail({
        to: email.trim(),
        subject: `We received your message - ${subject.trim()}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Thank You for Contacting Dwell KE</h2>
            <p>Hi ${user.firstName || 'there'},</p>
            <p>We have received your message with the subject "<strong>${subject.trim()}</strong>".</p>
            <p>Our support team will review your message and get back to you within 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>Your Message:</strong></p>
            <p style="white-space: pre-wrap; color: #374151;">${message.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p>Best regards,<br><strong>Dwell KE Support Team</strong></p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('[Email Send Error]', emailError);
      // Don't fail - message is saved
    }

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
