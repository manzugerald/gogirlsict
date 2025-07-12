import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { slugify } from '@/lib/utils';
import { redis } from '@/utils/redis';

const ALL_REPORTS_CACHE_KEY = 'reports:all';
const SINGLE_REPORT_CACHE_PREFIX = 'reports:'; // e.g., reports:123
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET single report (with cache)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const reportId = Number(params.id);
    if (!reportId || isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid Report ID' }, { status: 400 });
    }

    // Try Redis cache first
    const singleCacheKey = SINGLE_REPORT_CACHE_PREFIX + reportId;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Cache result for this report for 7 days
    await redis.set(singleCacheKey, JSON.stringify(report), 'EX', CACHE_TTL);

    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to fetch report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle PUT (update report) -- AUTH REQUIRED
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const reportId = Number(params.id);
    if (!reportId || isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid Report ID' }, { status: 400 });
    }

    const data = await req.json();
    const {
      title,
      images = [],
      files = [],
      publishStatus,
      projectId,
      accessCount = 0,
      downloadCount = 0,
    } = data;

    if (!title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(title.trim());

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        title,
        slug,
        images: Array.isArray(images) ? images : [],
        files: Array.isArray(files) ? files : [],
        publishStatus,
        updatedById: userId,
        accessCount,
        downloadCount,
        projectId: projectId ?? null,
      },
    });

    // Invalidate single and all-reports cache
    await Promise.all([
      redis.del(SINGLE_REPORT_CACHE_PREFIX + reportId),
      redis.del(ALL_REPORTS_CACHE_KEY),
    ]);

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error('Failed to update report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle DELETE
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized Action' }, { status: 401 });
    }

    const reportId = Number(params.id);
    if (!reportId || isNaN(reportId)) {
      return NextResponse.json({ error: 'Invalid Report Id' }, { status: 400 });
    }

    await prisma.report.delete({
      where: { id: reportId },
    });

    // Invalidate single and all-reports cache
    await Promise.all([
      redis.del(SINGLE_REPORT_CACHE_PREFIX + reportId),
      redis.del(ALL_REPORTS_CACHE_KEY),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }
    console.error('Failed to delete report:', error);
    return NextResponse.json({ error: 'Failed to delete report' }, { status: 500 });
  }
}
