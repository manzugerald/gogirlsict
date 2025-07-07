import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET = fetch location details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
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

    return NextResponse.json(location);
  } catch (error) {
    console.error('Failed to fetch location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH = update location
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE = delete location
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.location.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Location deleted', location: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    console.error('Failed to delete location:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
