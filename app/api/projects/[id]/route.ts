import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { slugify } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '@/utils/redis';

const ALL_PROJECTS_CACHE_KEY = 'projects:all';
const SINGLE_PROJECT_CACHE_PREFIX = 'projects:'; // projects:[id]
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET = fetch project details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (!projectId || isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
    }

    // Try Redis cache first
    const singleCacheKey = SINGLE_PROJECT_CACHE_PREFIX + projectId;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Cache result for this project for 7 days
    await redis.set(singleCacheKey, JSON.stringify(project), 'EX', CACHE_TTL);

    return NextResponse.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to save uploaded files and return their URLs/paths
async function saveUploadedFiles(formData: FormData, destDir: string): Promise<string[]> {
  const files = formData.getAll('files') as File[];
  const savedFiles: string[] = [];
  if (files && files.length > 0) {
    await fs.mkdir(destDir, { recursive: true });
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(destDir, filename);
      await fs.writeFile(filePath, buffer);
      savedFiles.push(`/uploads/projects/${filename}`);
    }
  }
  return savedFiles;
}

// PATCH = update project
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const projectId = Number(params.id);
    if (!projectId || isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
    }

    // Parse FormData (for file uploads)
    const contentType = req.headers.get('content-type') ?? '';
    let formData: FormData | null = null;
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData();
    }

    let title = '';
    let content = {};
    let projectStatus = 'active';
    let publishStatus = 'draft';
    let existingImages: string[] = [];
    let imagesToRemove: string[] = [];
    let newImageUrls: string[] = [];

    if (formData) {
      title = (formData.get('title') as string) || '';
      content = JSON.parse((formData.get('content') as string) || '{}');
      projectStatus = (formData.get('projectStatus') as string) || 'active';
      publishStatus = (formData.get('publishStatus') as string) || 'draft';

      // images: JSON string array of current images (after removals)
      const imagesRaw = formData.get('images');
      if (imagesRaw) {
        try {
          existingImages = JSON.parse(imagesRaw as string) || [];
        } catch {}
      }
      // imagesToRemove: JSON string array of images to remove
      const imagesToRemoveRaw = formData.get('imagesToRemove');
      if (imagesToRemoveRaw) {
        try {
          imagesToRemove = JSON.parse(imagesToRemoveRaw as string) || [];
        } catch {}
      }

      // Save new files (if any)
      newImageUrls = await saveUploadedFiles(
        formData,
        path.join(process.cwd(), 'public', 'uploads', 'projects')
      );
    } else {
      // fallback for non-multipart
      const body = await req.json();
      title = body.title;
      content = body.content;
      projectStatus = body.projectStatus;
      publishStatus = body.publishStatus;
      existingImages = body.images || [];
      imagesToRemove = body.imagesToRemove || [];
      // No file support in non-multipart
      newImageUrls = [];
    }

    // Merge existing images (minus removed) and new images
    const updatedImages = [...existingImages, ...newImageUrls].filter(
      (img) => !imagesToRemove.includes(img)
    );

    if (!title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(title.trim());

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title,
        slug,
        content,
        projectStatus,
        publishStatus,
        images: updatedImages, // update images array
        updatedById: userId,
      },
    });

    // Invalidate both single and all-projects cache
    await Promise.all([
      redis.del(SINGLE_PROJECT_CACHE_PREFIX + projectId),
      redis.del(ALL_PROJECTS_CACHE_KEY),
    ]);

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE = delete project
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const projectId = Number(params.id);
    if (!projectId || isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid Project ID' }, { status: 400 });
    }

    const deleted = await prisma.project.delete({
      where: { id: projectId },
    });

    // Invalidate both single and all-projects cache
    await Promise.all([
      redis.del(SINGLE_PROJECT_CACHE_PREFIX + projectId),
      redis.del(ALL_PROJECTS_CACHE_KEY),
    ]);

    return NextResponse.json({ message: 'Project deleted', project: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Prisma: Record not found
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
