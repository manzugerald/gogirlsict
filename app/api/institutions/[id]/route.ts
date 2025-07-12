import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '@/utils/redis';

const INSTITUTIONS_ALL_CACHE_KEY = 'institutions:all';
const SINGLE_INSTITUTION_CACHE_PREFIX = 'institutions:'; // institutions:[id]
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// Helper to save uploaded images
async function saveInstitutionFiles(formData: FormData, destDir: string): Promise<string[]> {
  const files = formData.getAll('files') as File[];
  const saved: string[] = [];
  if (files && files.length > 0) {
    await fs.mkdir(destDir, { recursive: true });
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(destDir, filename);
      await fs.writeFile(filePath, buffer);
      saved.push(`/uploads/institutions/${filename}`);
    }
  }
  return saved;
}

// Helper to save uploaded logo
async function saveLogoFile(logoFile: File, destDir: string): Promise<string | null> {
  if (!logoFile || typeof logoFile === 'string') return null;
  await fs.mkdir(destDir, { recursive: true });
  const ext = logoFile.name.split('.').pop();
  const filename = `logo_${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await logoFile.arrayBuffer());
  const filePath = path.join(destDir, filename);
  await fs.writeFile(filePath, buffer);
  return `/uploads/institutions/${filename}`;
}

// GET = fetch institution details (with Redis cache)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const singleCacheKey = SINGLE_INSTITUTION_CACHE_PREFIX + params.id;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const institution = await prisma.institution.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { username: true } },
        approvedBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        locations: true,
        beneficiaries: true,
      },
    });

    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // Cache this institution for 7 days
    await redis.set(singleCacheKey, JSON.stringify(institution), 'EX', CACHE_TTL);

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Failed to fetch institution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH = update institution (support new logo upload, invalidate caches)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const contentType = req.headers.get('content-type') ?? '';
    let formData: FormData | null = null;
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData();
    }

    if (!formData) {
      return NextResponse.json({ error: 'FormData required' }, { status: 400 });
    }

    let name = (formData.get('name') as string) || '';
    let email = (formData.get('email') as string) || '';
    let phone = (formData.get('phone') as string) || '';
    let headName = (formData.get('headName') as string) || '';
    let institutionType = (formData.get('institutionType') as string) || '';
    let existingImages: string[] = [];
    let imagesToRemove: string[] = [];
    let institutionImages: string[] = [];
    let newImageUrls: string[] = [];
    let logoUrl: string | null = null;

    // For preview/merge, support existing images
    const imagesRaw = formData.get('institutionImages');
    if (imagesRaw) {
      try {
        existingImages = JSON.parse(imagesRaw as string) || [];
      } catch {}
    }
    const imagesToRemoveRaw = formData.get('imagesToRemove');
    if (imagesToRemoveRaw) {
      try {
        imagesToRemove = JSON.parse(imagesToRemoveRaw as string) || [];
      } catch {}
    }
    newImageUrls = await saveInstitutionFiles(
      formData,
      path.join(process.cwd(), 'public', 'uploads', 'institutions')
    );

    // Logo update
    const logoFile = formData.get('logoFile') as File;
    if (logoFile) {
      logoUrl = await saveLogoFile(
        logoFile,
        path.join(process.cwd(), 'public', 'uploads', 'institutions')
      );
    }

    institutionImages = [...existingImages, ...newImageUrls].filter(
      (img) => !imagesToRemove.includes(img)
    );

    if (!name || !institutionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updated = await prisma.institution.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        logo: logoUrl ? logoUrl : undefined,
        institutionType,
        headName,
        institutionImages,
        updatedById: userId,
      },
      include: {
        locations: true,
        beneficiaries: true,
      },
    });

    // Invalidate both single and all-institutions cache
    await Promise.all([
      redis.del(SINGLE_INSTITUTION_CACHE_PREFIX + params.id),
      redis.del(INSTITUTIONS_ALL_CACHE_KEY),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update institution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE = delete institution (invalidate caches)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.institution.delete({
      where: { id: params.id },
    });

    // Invalidate both single and all-institutions cache
    await Promise.all([
      redis.del(SINGLE_INSTITUTION_CACHE_PREFIX + params.id),
      redis.del(INSTITUTIONS_ALL_CACHE_KEY),
    ]);

    return NextResponse.json({ message: 'Institution deleted', institution: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }
    console.error('Failed to delete institution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
