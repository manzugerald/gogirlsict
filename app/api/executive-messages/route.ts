import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const EXEC_MESSAGES_CACHE_KEY = 'executive-messages:all';
const EXEC_MESSAGES_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET: Fetch all published executive messages (Redis cache)
export async function GET() {
  try {
    const cached = await redis.get(EXEC_MESSAGES_CACHE_KEY);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });

    await redis.set(
      EXEC_MESSAGES_CACHE_KEY,
      JSON.stringify(messages),
      'EX',
      EXEC_MESSAGES_CACHE_TTL
    );

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching executive messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new executive message (auth required)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      affiliated,
      name,
      message,
      nameImageUrl,
      messageImageUrl,
      messageStatus = 'draft',
    } = body;

    if (!title || !affiliated || !name || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        title,
        affiliated,
        name,
        message,
        nameImageUrl,
        messageImageUrl,
        messageStatus,
        createdById: session.user.id,
      },
    });

    // Invalidate cache after write
    await redis.del(EXEC_MESSAGES_CACHE_KEY);

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Failed to create executive message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
