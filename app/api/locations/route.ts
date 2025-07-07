import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Fetch all locations (no auth required)
export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { id: 'desc' },
      include: {
        institution: {
          select: { name: true, id: true },
        },
      },
    });
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

    return NextResponse.json(location);
  } catch (error) {
    console.error('Failed to create location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
