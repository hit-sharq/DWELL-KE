import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { isAdminUser } from '@/lib/admin';
import { NextRequest, NextResponse } from 'next/server';

/* ── In-memory settings store (stub – replace with Prisma Setting model) ── */
const SETTINGS_KEY = 'platform_settings';
let settingsStore: Record<string, unknown> | null = null;

function getSettings() {
  if (!settingsStore) {
    settingsStore = {
      maintenanceMode:    false,
      emailNotifications: true,
      allowNewSignups:    true,
      fraudSensitivity:   'medium',
      commissionRate:     10,
      updatedAt:          new Date().toISOString(),
    };
  }
  return settingsStore;
}

/** GET /api/admin/settings  — admin-only; returns current settings */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)               return NextResponse.json({ error: 'Unauthorized' },    { status: 401 });
    if (!isAdminUser(userId))  return NextResponse.json({ error: 'Forbidden' },      { status: 403 });

    return NextResponse.json({ settings: getSettings() });
  } catch (error) {
    console.error('[Admin Settings GET]', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

/** POST /api/admin/settings  — admin-only; validates and persists setting changes */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)               return NextResponse.json({ error: 'Unauthorized' },    { status: 401 });
    if (!isAdminUser(userId))  return NextResponse.json({ error: 'Forbidden' },      { status: 403 });

    const body: Record<string, unknown> = await req.json();

    // ── Validate individual fields ──
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

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    // ── Merge validated fields into store ──
    const current = getSettings();
    const updated: Record<string, unknown> = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    settingsStore = updated;

    // ── Persist activity log (best-effort) ──
    try {
      const dbUser = await prisma.user.findUnique({ where: { clerkId: userId! } });
      if (dbUser) {
        await prisma.activityLog.create({
          data: {
            userId:      dbUser.id,
            action:      'updated_settings',
            description: `Platform settings updated by ${dbUser.firstName ?? dbUser.email}`,
            metadata:    JSON.stringify(Object.keys(body)),
          },
        });
      }
    } catch {
      // Non-blocking — log best-effort
    }

    return NextResponse.json({ settings: updated });
  } catch (error) {
    console.error('[Admin Settings POST]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
