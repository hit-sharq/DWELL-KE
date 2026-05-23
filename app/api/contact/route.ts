import { NextRequest, NextResponse } from 'next/server';

/** POST /api/contact — receive and log contact form submissions */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // In production, forward to email / store in DB / slack-notify
    console.log('[Contact Form]', {
      name,
      email,
      subject,
      message,
      receivedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Your message has been received.' });
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json({ error: 'Failed to submit message' }, { status: 500 });
  }
}
