import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const LOCATIONS_CACHE_KEY = 'locations:all';
const LOCATIONS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET: Fetch all locations (no auth required)
export async function GET() {
  try {
    // Try Redis cache first
    const cached = await redis.get(LOCATIONS_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const locations = await prisma.location.findMany({
      orderBy: { id: 'desc' },
      include: {
        institution: {
          select: { name: true, id: true },
        },
      },
    });

    // Cache the result
    await redis.set(LOCATIONS_CACHE_KEY, JSON.stringify(locations), 'EX', LOCATIONS_CACHE_TTL);

    return NextResponse.json(locations);
  } catch (err) {
    console.error('Error fetching locations:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create new location (auth required)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { locationName, latitude, longitude, institutionId } = data;

    if (!institutionId) {
      return NextResponse.json({ error: 'Missing required field: institutionId' }, { status: 400 });
    }

    const location = await prisma.location.create({
      data: {
        locationName,
        latitude,
        longitude,
        institutionId,
      },
    });

    // Invalidate locations cache after write
    await redis.del(LOCATIONS_CACHE_KEY);

    return NextResponse.json(location);
  } catch (error) {
    console.error('Failed to create location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
