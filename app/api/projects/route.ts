import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const PROJECTS_CACHE_KEY = 'projects:all';
const PROJECTS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// Handle GET (fetch all projects, no auth required)
export async function GET() {
  try {
    // Try Redis cache first
    const cached = await redis.get(PROJECTS_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { username: true } },
        approvedBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        reports: true,
      },
    });
    console.log(
      'Projects:',
      projects.map((p) => p.id)
    );

    // Cache the result
    await redis.set(PROJECTS_CACHE_KEY, JSON.stringify(projects), 'EX', PROJECTS_CACHE_TTL);

    return NextResponse.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Handle POST (create new project, auth required)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const { title, slug, content, images, projectStatus, publishStatus } = data;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userId = session.user.id;

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        content,
        images,
        projectStatus,
        publishStatus,
        createdById: userId,
        approvedById: userId,
        updatedById: userId,
      },
    });

    // Invalidate cache after write
    await redis.del(PROJECTS_CACHE_KEY);

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
