import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '@/utils/redis'; // Import Redis client

const ALL_BENEFICIARIES_CACHE_KEY = 'beneficiaries:all';
const SINGLE_BENEFICIARY_CACHE_PREFIX = 'beneficiaries:'; // Use as beneficiaries:[id]

// Helper to save uploaded images (profile/message)
async function saveBeneficiaryFiles(
  formData: FormData,
  field: string,
  destDir: string
): Promise<string[]> {
  const files = formData.getAll(field) as File[];
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
      saved.push(`/assets/images/beneficiaries/${filename}`);
    }
  }
  return saved;
}

// GET: Fetch single beneficiary details
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Try Redis cache first
    const singleCacheKey = SINGLE_BENEFICIARY_CACHE_PREFIX + params.id;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { username: true } },
        approvedBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        institution: { select: { id: true, name: true } },
      },
    });

    if (!beneficiary) {
      return NextResponse.json({ error: 'Beneficiary not found' }, { status: 404 });
    }

    // Cache result for this beneficiary for 7 days
    await redis.set(singleCacheKey, JSON.stringify(beneficiary), 'EX', 60 * 60 * 24 * 7);

    return NextResponse.json(beneficiary);
  } catch (error) {
    console.error('Failed to fetch beneficiary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update beneficiary (support new images upload)
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

    // Required fields
    let firstName = (formData.get('firstName') as string) || '';
    let lastName = (formData.get('lastName') as string) || '';
    let gender = formData.get('gender') as string as 'male' | 'female';
    let dateOfBirth = (formData.get('dateOfBirth') as string) || '';
    let beneficiaryMessageTitleRaw = formData.get('beneficiaryMessageTitle') as string;

    // Optional fields
    let email = (formData.get('email') as string) || undefined;
    let phone = (formData.get('phone') as string) || undefined;
    let institutionId = (formData.get('institutionId') as string) || undefined;
    let beneficiaryMessageStatus = (formData.get('beneficiaryMessageStatus') as string) || 'draft';

    // For preview/merge, support existing images
    let existingImages: string[] = [];
    let existingMessageImages: string[] = [];
    let imagesToRemove: string[] = [];
    let messageImagesToRemove: string[] = [];

    // Profile images (existing kept)
    const imagesRaw = formData.get('images');
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
    // Message images (existing kept)
    const messageImagesRaw = formData.get('beneficiaryMessageImages');
    if (messageImagesRaw && typeof messageImagesRaw === 'string') {
      try {
        existingMessageImages = JSON.parse(messageImagesRaw) || [];
      } catch {}
    }
    const messageImagesToRemoveRaw = formData.get('messageImagesToRemove');
    if (messageImagesToRemoveRaw) {
      try {
        messageImagesToRemove = JSON.parse(messageImagesToRemoveRaw as string) || [];
      } catch {}
    }

    // Upload new images
    const newImageUrls = await saveBeneficiaryFiles(
      formData,
      'newImages',
      path.join(process.cwd(), 'public', 'assets', 'images', 'beneficiaries')
    );
    // Upload new message images
    const newMessageImageUrls = await saveBeneficiaryFiles(
      formData,
      'newBeneficiaryMessageImages',
      path.join(process.cwd(), 'public', 'assets', 'images', 'beneficiaries')
    );

    // Merge, filter out any marked for deletion
    const images = [...(existingImages || []), ...newImageUrls].filter(
      (img) => !imagesToRemove.includes(img)
    );
    const beneficiaryMessageImages = [
      ...(existingMessageImages || []),
      ...newMessageImageUrls,
    ].filter((img) => !messageImagesToRemove.includes(img));
    // Use first image as profile image, if any
    const image = images.length > 0 ? images[0] : null;

    // Parse beneficiaryMessageTitle (JSON)
    let beneficiaryMessageTitle: any = {};
    try {
      beneficiaryMessageTitle = beneficiaryMessageTitleRaw
        ? JSON.parse(beneficiaryMessageTitleRaw)
        : {};
    } catch (e) {
      beneficiaryMessageTitle = beneficiaryMessageTitleRaw || {};
    }

    if (!firstName || !lastName || !gender || !dateOfBirth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updated = await prisma.beneficiary.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        images,
        image,
        email,
        phone,
        beneficiaryMessageTitle,
        beneficiaryMessageImages,
        beneficiaryMessageStatus,
        institutionId: institutionId || null,
        updatedById: userId,
      },
      include: {
        institution: { select: { id: true, name: true } },
      },
    });

    // Invalidate single cache and all list cache
    await Promise.all([
      redis.del(SINGLE_BENEFICIARY_CACHE_PREFIX + params.id),
      redis.del(ALL_BENEFICIARIES_CACHE_KEY),
    ]);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update beneficiary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete beneficiary
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = await prisma.beneficiary.delete({
      where: { id: params.id },
    });

    // Invalidate single cache and all list cache
    await Promise.all([
      redis.del(SINGLE_BENEFICIARY_CACHE_PREFIX + params.id),
      redis.del(ALL_BENEFICIARIES_CACHE_KEY),
    ]);

    return NextResponse.json({ message: 'Beneficiary deleted', beneficiary: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Beneficiary not found' }, { status: 404 });
    }
    console.error('Failed to delete beneficiary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
