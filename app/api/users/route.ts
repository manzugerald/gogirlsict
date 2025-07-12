import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import bcrypt from 'bcrypt';
import path from 'path';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { redis } from '@/utils/redis';

const USERS_CACHE_KEY = 'users:all';
const USERS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

//Get users
export async function GET() {
  try {
    // Try Redis cache first
    const cached = await redis.get(USERS_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    // Cache the result
    await redis.set(USERS_CACHE_KEY, JSON.stringify(users), 'EX', USERS_CACHE_TTL);

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Internal Server Error - Please contact the Admin' },
      { status: 500 }
    );
  }
}

//Insert Users
export async function POST(req: Request) {
  const formData = await req.formData();
  const firstName = formData.get('firstName') as string | null;
  const lastName = formData.get('lastName') as string | null;
  const email = formData.get('email') as string | null;
  const username = formData.get('username') as string | null;
  const password = formData.get('password') as string | null;
  const imageFile = formData.get('image') as File | null;

  if (!firstName || !lastName || !username || !email || !password || !imageFile) {
    return NextResponse.json({ error: 'All fields and image are required' }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existingUser) {
    return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
  }

  const ext = imageFile.name.split('.').pop() || 'jpg';
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const uploadDir = path.join(process.cwd(), 'public/assets/images/users');
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const imageUrl = `/assets/images/users/${filename}`;

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      image: imageUrl,
    },
  });

  // Invalidate cache after user creation
  await redis.del(USERS_CACHE_KEY);

  return NextResponse.json({ message: 'User created', user });
}
