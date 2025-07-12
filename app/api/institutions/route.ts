import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { redis } from '@/utils/redis';

const INSTITUTIONS_CACHE_KEY = 'institutions:all';
const INSTITUTIONS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// Helper to save uploaded institution images
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

// GET: Fetch all institutions (no auth required)
export async function GET() {
  try {
    // Try Redis cache first
    const cached = await redis.get(INSTITUTIONS_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const institutions = await prisma.institution.findMany({
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
        locations: true,
        beneficiaries: true,
      },
    });

    // Cache the result
    await redis.set(
      INSTITUTIONS_CACHE_KEY,
      JSON.stringify(institutions),
      'EX',
      INSTITUTIONS_CACHE_TTL
    );

    return NextResponse.json(institutions);
  } catch (err) {
    console.error('Error fetching institutions:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create new institution (auth required, including logo)
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

    const name = (formData.get('name') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const headName = (formData.get('headName') as string) || '';
    const institutionType = (formData.get('institutionType') as string) || '';
    const locationsRaw = formData.get('locations') as string;

    if (!name || !institutionType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save logo
    const logoFile = formData.get('logoFile') as File;
    let logoUrl: string | null = null;
    if (logoFile) {
      logoUrl = await saveLogoFile(
        logoFile,
        path.join(process.cwd(), 'public', 'uploads', 'institutions')
      );
    } else {
      return NextResponse.json({ error: 'Logo file required' }, { status: 400 });
    }

    // Save other images
    const institutionImages = await saveInstitutionFiles(
      formData,
      path.join(process.cwd(), 'public', 'uploads', 'institutions')
    );

    // Parse locations
    let locations: any[] = [];
    if (locationsRaw) {
      try {
        locations = JSON.parse(locationsRaw);
      } catch (e) {
        locations = [];
      }
    }

    const userId = session.user.id;

    const institution = await prisma.institution.create({
      data: {
        name,
        email,
        phone,
        logo: logoUrl,
        institutionImages: institutionImages || [],
        headName,
        institutionType,
        createdById: userId,
        approvedById: userId,
        updatedById: userId,
        locations:
          locations && Array.isArray(locations)
            ? {
                create: locations.map((loc: any) => ({
                  locationName: loc.locationName,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                })),
              }
            : undefined,
      },
      include: {
        locations: true,
      },
    });

    // Invalidate institutions cache after write
    await redis.del(INSTITUTIONS_CACHE_KEY);

    return NextResponse.json(institution);
  } catch (error) {
    console.error('Failed to create institution:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
