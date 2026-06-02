import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { v2 as cloudinary } from 'cloudinary';
import { withRateLimit } from '@/lib/rate-limit';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FILE_SIGNATURES: Record<string, { bytes: number[]; mime: string }> = {
  pdf:  { bytes: [0x25, 0x50, 0x44, 0x48, 0x2d], mime: 'application/pdf' },
  jpeg: { bytes: [0xff, 0xd8, 0xff],                    mime: 'image/jpeg' },
  png:  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], mime: 'image/png' },
  zip:  { bytes: [0x50, 0x4b, 0x03, 0x04],             mime: 'application/zip' },
};

function detectFileType(buffer: Buffer): { detected: string; mime: string } | null {
  const header = Array.from(buffer.slice(0, 8));
  for (const [type, sig] of Object.entries(FILE_SIGNATURES)) {
    if (header.slice(0, sig.bytes.length).every((b, i) => b === sig.bytes[i])) {
      return { detected: type, mime: sig.mime };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  return withRateLimit(req, async () => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const type = formData.get('type') as string | null;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const detection = detectFileType(buffer);

      if (!detection) {
        return NextResponse.json(
          { error: 'Unsupported file type. Only PDF, JPG, PNG, and DOCX files are allowed.' },
          { status: 400 }
        );
      }

      const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/zip',
      ];

      if (!allowedMimes.includes(detection.mime)) {
        return NextResponse.json(
          { error: 'Unsupported file type.' },
          { status: 400 }
        );
      }

      const base64 = buffer.toString('base64');
      const dataUri = `data:${detection.mime};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: 'auto',
        folder: `landlord_applications/${userId}`,
        public_id: type ? `${type}_${Date.now()}` : undefined,
      });

      return NextResponse.json({ url: result.secure_url }, { status: 200 });
    } catch (error: any) {
      console.error('[Upload]', error);
      return NextResponse.json(
        { error: error.message || 'Upload failed' },
        { status: 500 }
      );
    }
  });
}
