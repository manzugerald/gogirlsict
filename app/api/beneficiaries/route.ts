import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '@/utils/redis'; // Import Redis client

const CACHE_KEY = 'beneficiaries:all';
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

// Helper to save uploaded image files and return resulting filenames
async function saveFiles(formData: FormData, field: string, destDir: string): Promise<string[]> {
  const files = formData.getAll(field) as File[];
  const savedNames: string[] = [];
  if (files && files.length > 0) {
    await fs.mkdir(destDir, { recursive: true });
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      const ext = file.name.split('.').pop();
      const filename = `${uuidv4()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(destDir, filename);
      await fs.writeFile(filePath, buffer);
      savedNames.push(filename); // Only filename, not path
    }
  }
  return savedNames;
}

// GET: Fetch all beneficiaries (no auth required)
export async function GET() {
  try {
    // 1. Try Redis cache first
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      // Optionally log: console.log("Returning beneficiaries from cache");
      return NextResponse.json(JSON.parse(cached));
    }

    // 2. Not cached: fetch from DB
    const beneficiaries = await prisma.beneficiary.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        approvedBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 3. Cache the result
    await redis.set(CACHE_KEY, JSON.stringify(beneficiaries), 'EX', CACHE_TTL);

    return NextResponse.json(beneficiaries);
  } catch (err) {
    console.error('Error fetching beneficiaries:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create new beneficiary (auth required, handles file uploads)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') ?? '';
    let formData: FormData | null = null;
    if (contentType.includes('multipart/form-data')) {
      formData = await req.formData();
    }

    if (!formData) {
      return NextResponse.json({ error: 'FormData required' }, { status: 400 });
    }

    // Required fields
    const firstName = (formData.get('firstName') as string) || '';
    const lastName = (formData.get('lastName') as string) || '';
    const gender = formData.get('gender') as string as 'male' | 'female';
    const dateOfBirth = (formData.get('dateOfBirth') as string) || '';
    const beneficiaryMessageTitleRaw = formData.get('beneficiaryMessageTitle') as string;

    // Optional fields
    const email = (formData.get('email') as string) || undefined;
    const phone = (formData.get('phone') as string) || undefined;
    const institutionId = (formData.get('institutionId') as string) || undefined;
    const beneficiaryMessageStatus =
      (formData.get('beneficiaryMessageStatus') as string) || 'draft';

    if (!firstName || !lastName || !gender || !dateOfBirth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Parse beneficiaryMessageTitle (JSON)
    let beneficiaryMessageTitle: any = {};
    try {
      beneficiaryMessageTitle = beneficiaryMessageTitleRaw
        ? JSON.parse(beneficiaryMessageTitleRaw)
        : {};
    } catch (e) {
      beneficiaryMessageTitle = beneficiaryMessageTitleRaw || {};
    }

    // Save profile images and message images to /public/assets/images/beneficiaries
    const destDir = path.join(process.cwd(), 'public', 'assets', 'images', 'beneficiaries');
    const imageFileNames = await saveFiles(formData, 'images', destDir);
    const messageImageFileNames = await saveFiles(formData, 'beneficiaryMessageImages', destDir);

    // Prepend the static path to each file name for DB
    const images = imageFileNames.map((file) => `/assets/images/beneficiaries/${file}`);
    const beneficiaryMessageImages = messageImageFileNames.map(
      (file) => `/assets/images/beneficiaries/${file}`
    );

    // Use the first image as "image"
    const image = images.length > 0 ? images[0] : undefined;

    const userId = session.user.id;

    const beneficiary = await prisma.beneficiary.create({
      data: {
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        images,
        image: image || null,
        email,
        phone,
        beneficiaryMessageTitle,
        beneficiaryMessageImages,
        beneficiaryMessageStatus,
        institutionId: institutionId || null,
        createdById: userId,
        updatedById: userId,
        approvedById: userId,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Invalidate cache after write
    await redis.del(CACHE_KEY);

    return NextResponse.json(beneficiary);
  } catch (error) {
    console.error('Failed to create beneficiary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
