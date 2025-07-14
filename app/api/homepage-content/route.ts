import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const HOMEPAGE_CACHE_KEY = 'homepage:latest';
const HOMEPAGE_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET: Fetch latest homepage content (cache with Redis)
export async function GET() {
  try {
    // Try Redis cache first
    const cached = await redis.get(HOMEPAGE_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const homePage = await prisma.homePage.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!homePage) {
      return NextResponse.json({ error: 'No HomePage found' }, { status: 404 });
    }

    // Cache the result
    await redis.set(HOMEPAGE_CACHE_KEY, JSON.stringify(homePage), 'EX', HOMEPAGE_CACHE_TTL);

    return NextResponse.json(homePage);
  } catch (err) {
    console.error('Error fetching homepage:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new homepage content row (auth required, no file upload)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { heroVideo, vision, mission, focus, coreValues } = body;

    if (!heroVideo || !vision || !mission || !focus || !coreValues) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const homePage = await prisma.homePage.create({
      data: {
        heroVideo,
        vision,
        mission,
        focus,
        coreValues,
      },
    });

    // Invalidate homepage cache after write
    await redis.del(HOMEPAGE_CACHE_KEY);

    return NextResponse.json(homePage);
  } catch (error) {
    console.error('Failed to create homepage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
