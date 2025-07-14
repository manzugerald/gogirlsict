import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redis } from '@/utils/redis';

const EXEC_MESSAGES_CACHE_KEY = 'executive-messages:all';
const SINGLE_EXEC_MESSAGE_CACHE_PREFIX = 'executive-message:';
const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

// GET: Fetch single executive message by id (Redis cache)
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const singleCacheKey = SINGLE_EXEC_MESSAGE_CACHE_PREFIX + params.id;
    const cached = await redis.get(singleCacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const execMessage = await prisma.message.findUnique({
      where: { id: Number(params.id) },
    });

    if (!execMessage) {
      return NextResponse.json({ error: 'Executive Message not found' }, { status: 404 });
    }

    await redis.set(singleCacheKey, JSON.stringify(execMessage), 'EX', CACHE_TTL);

    return NextResponse.json(execMessage);
  } catch (error) {
    console.error('Failed to fetch executive message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Update executive message (auth required)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, affiliated, name, message, nameImageUrl, messageImageUrl, messageStatus } = body;

    if (!title || !affiliated || !name || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updated = await prisma.message.update({
      where: { id: Number(params.id) },
      data: {
        title,
        affiliated,
        name,
        message,
        nameImageUrl,
        messageImageUrl,
        messageStatus,
        updatedById: session.user.id,
      },
    });

    // Invalidate both single and all-messages cache
    await Promise.all([
      redis.del(SINGLE_EXEC_MESSAGE_CACHE_PREFIX + params.id),
      redis.del(EXEC_MESSAGES_CACHE_KEY),
    ]);

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Executive Message not found' }, { status: 404 });
    }
    console.error('Failed to update executive message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Delete executive message (auth required)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await prisma.message.delete({
      where: { id: Number(params.id) },
    });

    // Invalidate both single and all-messages cache
    await Promise.all([
      redis.del(SINGLE_EXEC_MESSAGE_CACHE_PREFIX + params.id),
      redis.del(EXEC_MESSAGES_CACHE_KEY),
    ]);

    return NextResponse.json({ message: 'Executive Message deleted', executiveMessage: deleted });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Executive Message not found' }, { status: 404 });
    }
    console.error('Failed to delete executive message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
