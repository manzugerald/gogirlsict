import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const EVENTS_CACHE_KEY = 'events:all';
const EVENTS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// Handle GET (fetch all events, no auth required)
export async function GET() {
  try {
    // 1. Try Redis cache first
    const cached = await redis.get(EVENTS_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    // 2. Not cached: fetch from DB
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        eventTitle: true,
        eventStartDate: true,
        eventEndDate: true,
        eventStatus: true,
        eventLocation: true,
        eventImages: true,
        eventBanner: true,
        eventFile: true,
        eventTags: true,
        maxAttendees: true,
        eventDetails: true,
        eventDescription: true,
        publishStatus: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        createdBy: { select: { firstName: true, lastName: true, username: true } },
        updatedBy: { select: { username: true } },
        project: { select: { title: true, id: true } },
        report: { select: { title: true, id: true } },
      },
    });

    // 3. Cache the result
    await redis.set(EVENTS_CACHE_KEY, JSON.stringify(events), 'EX', EVENTS_CACHE_TTL);

    return NextResponse.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST (create new event, auth required)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    const {
      slug,
      eventTitle,
      eventDescription,
      eventDetails,
      eventLocation,
      eventBanner,
      eventImages,
      eventFile,
      eventStartDate,
      eventEndDate,
      eventTags,
      eventStatus,
      publishStatus,
      eventAttendance,
      maxAttendees,
      projectId,
      reportId,
    } = data;

    // Required fields validation
    if (
      !slug ||
      !eventTitle ||
      !eventDescription ||
      !eventBanner ||
      !eventStartDate ||
      !eventEndDate
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = session.user.id;

    const event = await prisma.event.create({
      data: {
        slug,
        eventTitle,
        eventDescription,
        eventDetails,
        eventLocation,
        eventBanner,
        eventImages,
        eventFile,
        eventStartDate: new Date(eventStartDate),
        eventEndDate: new Date(eventEndDate),
        eventTags,
        eventStatus,
        publishStatus,
        eventAttendance,
        maxAttendees: maxAttendees ? Number(maxAttendees) : null,
        createdById: userId,
        updatedById: userId,
        projectId: projectId ?? null,
        reportId: reportId ?? null,
      },
    });

    // Invalidate cache after write
    await redis.del(EVENTS_CACHE_KEY);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
