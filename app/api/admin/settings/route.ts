import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';
import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_SETTINGS: Record<string, string> = {
  maintenanceMode: 'false',
  emailNotifications: 'true',
  allowNewSignups: 'true',
  fraudSensitivity: 'medium',
  commissionRate: '10',
  applicationFee: '10',
};

async function getSetting(key: string): Promise<string> {
  const record = await prisma.siteSetting.findUnique({ where: { key } });
  return record?.value ?? DEFAULT_SETTINGS[key] ?? '';
}

async function setSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/** GET /api/admin/settings */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const entries = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const entry of entries) {
      settings[entry.key] = entry.value;
    }

    return NextResponse.json({
      settings: {
        maintenanceMode:    settings.maintenanceMode ?? DEFAULT_SETTINGS.maintenanceMode,
        emailNotifications: settings.emailNotifications ?? DEFAULT_SETTINGS.emailNotifications,
        allowNewSignups:    settings.allowNewSignups ?? DEFAULT_SETTINGS.allowNewSignups,
        fraudSensitivity:   settings.fraudSensitivity ?? DEFAULT_SETTINGS.fraudSensitivity,
        commissionRate:     settings.commissionRate ?? DEFAULT_SETTINGS.commissionRate,
        applicationFee:     Number(settings.applicationFee ?? DEFAULT_SETTINGS.applicationFee),
      },
    });
  } catch (error: any) {
    console.error('[Admin Settings GET]', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

/** POST /api/admin/settings */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdminUser(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body: Record<string, unknown> = await req.json();
    const errors: Record<string, string> = {};

    if (body.maintenanceMode !== undefined && typeof body.maintenanceMode !== 'boolean') {
      errors.maintenanceMode = 'Must be a boolean';
    }
    if (body.emailNotifications !== undefined && typeof body.emailNotifications !== 'boolean') {
      errors.emailNotifications = 'Must be a boolean';
    }
    if (body.allowNewSignups !== undefined && typeof body.allowNewSignups !== 'boolean') {
      errors.allowNewSignups = 'Must be a boolean';
    }
    if (body.fraudSensitivity !== undefined) {
      const allowed = ['low', 'medium', 'high'];
      if (!allowed.includes(body.fraudSensitivity as string)) {
        errors.fraudSensitivity = `Must be one of: ${allowed.join(', ')}`;
      }
    }
    if (body.commissionRate !== undefined) {
      const rate = Number(body.commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        errors.commissionRate = 'Must be a number between 0 and 100';
      }
    }
    if (body.applicationFee !== undefined) {
      const fee = Number(body.applicationFee);
      if (isNaN(fee) || fee < 0 || fee > 100000) {
        errors.applicationFee = 'Must be a number between 0 and 100,000';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const updates: Promise<void>[] = [];

    if (body.maintenanceMode !== undefined) updates.push(setSetting('maintenanceMode', String(body.maintenanceMode)));
    if (body.emailNotifications !== undefined) updates.push(setSetting('emailNotifications', String(body.emailNotifications)));
    if (body.allowNewSignups !== undefined) updates.push(setSetting('allowNewSignups', String(body.allowNewSignups)));
    if (body.fraudSensitivity !== undefined) updates.push(setSetting('fraudSensitivity', String(body.fraudSensitivity)));
    if (body.commissionRate !== undefined) updates.push(setSetting('commissionRate', String(body.commissionRate)));
    if (body.applicationFee !== undefined) updates.push(setSetting('applicationFee', String(body.applicationFee)));

    await Promise.all(updates);

    const settings: Record<string, string> = {};
    for (const key of Object.keys({ ...DEFAULT_SETTINGS, ...Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined)) })) {
      settings[key] = await getSetting(key);
    }

    let dbUser: { id: string; firstName: string | null; email: string } | null = null;
    try {
      dbUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, firstName: true, email: true } });
    } catch { /* non-blocking */ }

    if (dbUser) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: dbUser.id,
            action: 'updated_settings',
            description: `Platform settings updated by ${dbUser.firstName ?? dbUser.email}`,
            metadata: JSON.stringify({ fields: Object.keys(body) }),
          },
        });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({
      settings: {
        maintenanceMode:    settings.maintenanceMode === 'true',
        emailNotifications: settings.emailNotifications === 'true',
        allowNewSignups:    settings.allowNewSignups === 'true',
        fraudSensitivity:   settings.fraudSensitivity ?? 'medium',
        commissionRate:     Number(settings.commissionRate) ?? 0,
        applicationFee:     Number(settings.applicationFee ?? DEFAULT_SETTINGS.applicationFee),
      },
    });
  } catch (error: any) {
    console.error('[Admin Settings POST]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
