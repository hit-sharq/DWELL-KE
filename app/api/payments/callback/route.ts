import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.warn(
    '[Deprecated] /api/payments/callback is deprecated. Use /api/pesapal/callback instead.'
  );
  return NextResponse.json(
    { error: 'Deprecated', use: '/api/pesapal/callback' },
    { status: 410 }
  );
}

export async function POST(req: NextRequest) {
  console.warn(
    '[Deprecated] /api/payments/callback is deprecated. Use /api/pesapal/callback instead.'
  );
  return NextResponse.json(
    { error: 'Deprecated', use: '/api/pesapal/callback' },
    { status: 410 }
  );
}
