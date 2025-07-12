import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const LOCATIONS_ALL_CACHE_KEY = 'locations:all';
const SINGLE_LOCATION_CACHE_PREFIX = 'locations:'; // locations:[id]
const LOCATIONS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET = fetch location details (with Redis cache)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const singleCacheKey = SINGLE_LOCATION_CACHE_PREFIX + params.id;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const location = await prisma.location.findUnique({
      where: { id: params.id },
      include: {
        institution: {
          select: { id: true, name: true },
        },
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Cache this location
    await redis.set(singleCacheKey, JSON.stringify(location), 'EX', LOCATIONS_CACHE_TTL);

    return NextResponse.json(location);
  } catch (error) {
    console.error('Failed to fetch location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH = update location (invalidate caches)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { locationName, latitude, longitude, institutionId } = body;

    if (!institutionId) {
      return NextResponse.json({ error: 'Missing required field: institutionId' }, { status: 400 });
    }

    const updated = await prisma.location.update({
      where: { id: params.id },
      data: {
        locationName,
        latitude,
        longitude,
        institutionId,
      },
      include: {
        institution: {
          select: { id: true, name: true },
        },
      },
    });

    // Invalidate both single and all locations cache
    await Promise.all([
      redis.del(SINGLE_LOCATION_CACHE_PREFIX + params.id),
      redis.del(LOCATIONS_ALL_CACHE_KEY),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE = delete location (invalidate caches)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.location.delete({
      where: { id: params.id },
    });

    // Invalidate both single and all locations cache
    await Promise.all([
      redis.del(SINGLE_LOCATION_CACHE_PREFIX + params.id),
      redis.del(LOCATIONS_ALL_CACHE_KEY),
    ]);

    return NextResponse.json({ message: 'Location deleted', location: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    console.error('Failed to delete location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
