import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EventStatus, PublishStatus, AttendanceType } from '@/lib/generated/prisma';
import { slugify } from '@/lib/utils';
import { saveUploadedFile, saveUploadedFiles } from '@/lib/uploadHelpers';
import { redis } from '@/utils/redis';

const EVENTS_CACHE_KEY = 'events:all';
const SINGLE_EVENT_CACHE_PREFIX = 'events:'; // e.g. events:123
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

// Helper function, place near the top of the file:
function toEnum<T>(enumObject: T, value: string): T[keyof T] | undefined {
  return (enumObject as any)[value];
}

// GET /api/events/[id] - Get single event by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    // Try Redis cache for this event
    const singleEventCacheKey = SINGLE_EVENT_CACHE_PREFIX + id;
    const cached = await redis.get(singleEventCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        eventTitle: true,
        eventStartDate: true,
        eventEndDate: true,
        eventStatus: true,
        eventDescription: true,
        eventDetails: true,
        eventLocation: true,
        eventBanner: true,
        eventImages: true,
        eventFile: true,
        eventTags: true,
        eventAttendance: true,
        maxAttendees: true,
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
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    // Cache the event for 7 days
    await redis.set(singleEventCacheKey, JSON.stringify(event), 'EX', CACHE_TTL);

    return NextResponse.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/events/[id] - Replace/update an event (all fields required)
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;
    const trimmedId = params.id.trim();
    const eventId = Number(trimmedId);

    if (isNaN(eventId)) {
      return NextResponse.json({ error: 'Invalid Event ID' }, { status: 400 });
    }

    // Get form data
    const formData = await req.formData();

    // Extract fields, converting where needed
    const eventTitle = formData.get('eventTitle')?.toString() || '';
    const eventDescriptionRaw = formData.get('eventDescription')?.toString() || '{}';
    const eventDetailsRaw = formData.get('eventDetails')?.toString() || '{}';
    const eventLocation = formData.get('eventLocation')?.toString() || '';

    const eventStartDateRaw = formData.get('eventStartDate')?.toString() || '';
    const eventEndDateRaw = formData.get('eventEndDate')?.toString() || '';
    const eventTagsRaw = formData.get('eventTags')?.toString() || '[]';
    const eventStatusRaw = formData.get('eventStatus')?.toString() || '';
    const publishStatusRaw = formData.get('publishStatus')?.toString() || '';
    const eventAttendanceRaw = formData.get('eventAttendance')?.toString() || '';
    const maxAttendeesRaw = formData.get('maxAttendees')?.toString() || '';

    const projectIdRaw = formData.get('projectId');
    const reportIdRaw = formData.get('reportId');

    // Parse JSON fields
    let eventDescription;
    let eventDetails;
    let eventTags: string[];
    let eventImages: string[] = [];
    try {
      eventDescription = JSON.parse(eventDescriptionRaw);
    } catch {
      eventDescription = {};
    }
    try {
      eventDetails = JSON.parse(eventDetailsRaw);
    } catch {
      eventDetails = {};
    }
    try {
      eventTags = JSON.parse(eventTagsRaw);
      if (!Array.isArray(eventTags)) eventTags = [];
    } catch {
      eventTags = [];
    }

    // For eventImages, handle existing + new uploads
    // Get existing event for previous images/files
    const existingEvent = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const slug = slugify(eventTitle.trim());

    // Handle banner replacement/removal
    let eventBanner = existingEvent.eventBanner || '';
    // Check for a new banner upload
    const newBannerUrl = await saveUploadedFile(formData, 'bannerFile', 'image', slug);
    if (newBannerUrl) {
      eventBanner = newBannerUrl;
    } else if (
      formData.get('eventBanner') !== undefined &&
      formData.get('eventBanner')?.toString() === ''
    ) {
      // If explicitly set to empty string, remove banner
      eventBanner = '';
    }

    // Handle event images (existing kept, plus new uploads, minus removed)
    // Parse current eventImages from form (these are the images to keep)
    const eventImagesRaw = formData.get('eventImages')?.toString() || '[]';
    try {
      eventImages = JSON.parse(eventImagesRaw);
      if (!Array.isArray(eventImages)) eventImages = [];
    } catch {
      eventImages = [];
    }

    // Add new uploaded images (if any)
    const newImageUrls = await saveUploadedFiles(formData, 'files', 'image', slug);
    if (newImageUrls.length > 0) {
      eventImages = [...eventImages, ...newImageUrls];
    }

    // Handle event file (pdf/doc)
    let eventFile = existingEvent.eventFile || '';
    const newFileUrl = await saveUploadedFile(formData, 'eventFileUpload', 'pdf', slug);
    if (newFileUrl) {
      eventFile = newFileUrl;
    } else if (
      formData.get('eventFile') !== undefined &&
      formData.get('eventFile')?.toString() === ''
    ) {
      // If explicitly set to empty string, remove event file
      eventFile = '';
    }

    // Validate required fields (allow empty banner/file if user removed)
    if (!eventTitle || !eventDescription || !eventStartDateRaw || !eventEndDateRaw) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert dates
    const eventStartDate = new Date(eventStartDateRaw);
    const eventEndDate = new Date(eventEndDateRaw);
    if (isNaN(eventStartDate.getTime()) || isNaN(eventEndDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Convert enums using toEnum helper
    const eventStatus = toEnum(EventStatus, eventStatusRaw) || EventStatus.pending;
    const publishStatus = toEnum(PublishStatus, publishStatusRaw) || PublishStatus.draft;
    const eventAttendance = toEnum(AttendanceType, eventAttendanceRaw) || AttendanceType.public;
    const maxAttendees = maxAttendeesRaw ? Number(maxAttendeesRaw) : null;
    const projectId = projectIdRaw ? Number(projectIdRaw) : null;
    const reportId = reportIdRaw ? Number(reportIdRaw) : null;

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        eventTitle,
        slug,
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
        updatedById: userId,
        projectId,
        reportId,
      },
    });

    // Invalidate single and all-events cache
    await Promise.all([
      redis.del(SINGLE_EVENT_CACHE_PREFIX + eventId),
      redis.del(EVENTS_CACHE_KEY),
    ]);

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { params } = context;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    await prisma.event.delete({ where: { id } });

    // Invalidate single and all-events cache
    await Promise.all([redis.del(SINGLE_EVENT_CACHE_PREFIX + id), redis.del(EVENTS_CACHE_KEY)]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
