import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const HOMEPAGE_CACHE_KEY = 'homepage:latest';
const SINGLE_HOMEPAGE_CACHE_PREFIX = 'homepage:'; // homepage:[id]
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET: Fetch single homepage by id (with cache)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const singleCacheKey = SINGLE_HOMEPAGE_CACHE_PREFIX + params.id;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const homepage = await prisma.homePage.findUnique({
      where: { id: Number(params.id) },
    });

    if (!homepage) {
      return NextResponse.json({ error: 'HomePage not found' }, { status: 404 });
    }

    // Cache this homepage for 7 days
    await redis.set(singleCacheKey, JSON.stringify(homepage), 'EX', CACHE_TTL);

    return NextResponse.json(homepage);
  } catch (error) {
    console.error('Failed to fetch homepage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update homepage content (auth required)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

    const updated = await prisma.homePage.update({
      where: { id: Number(params.id) },
      data: {
        heroVideo,
        vision,
        mission,
        focus,
        coreValues,
      },
    });

    // Invalidate both single and latest homepage cache
    await Promise.all([
      redis.del(SINGLE_HOMEPAGE_CACHE_PREFIX + params.id),
      redis.del(HOMEPAGE_CACHE_KEY),
    ]);

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'HomePage not found' }, { status: 404 });
    }
    console.error('Failed to update homepage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete homepage content (auth required)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await prisma.homePage.delete({
      where: { id: Number(params.id) },
    });

    // Invalidate both single and latest homepage cache
    await Promise.all([
      redis.del(SINGLE_HOMEPAGE_CACHE_PREFIX + params.id),
      redis.del(HOMEPAGE_CACHE_KEY),
    ]);

    return NextResponse.json({ message: 'HomePage deleted', homepage: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'HomePage not found' }, { status: 404 });
    }
    console.error('Failed to delete homepage:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
