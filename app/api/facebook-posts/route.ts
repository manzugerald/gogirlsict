import { NextRequest } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import dayjs from 'dayjs';
import { redis } from '@/utils/redis';

const prisma = new PrismaClient();

const REDIS_CACHE_KEY = 'facebook-posts:all';
const REDIS_CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

export async function GET(req: NextRequest) {
  const PAGE_ID = process.env.FB_PAGE_ID!;
  const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;

  // Try Redis cache first
  const redisCached = await redis.get(REDIS_CACHE_KEY);
  if (redisCached) {
    const cachedData = JSON.parse(redisCached);
    return Response.json(cachedData);
  }

  let meta = await prisma.facebookCacheMeta.findUnique({ where: { id: 1 } });
  let needsFetch = true;
  if (meta && meta.lastFetched && dayjs().diff(dayjs(meta.lastFetched), 'hour') < 24)
    needsFetch = false;

  if (!needsFetch) {
    const posts = await prisma.facebookPost.findMany({ orderBy: { createdTime: 'desc' } });
    const result = { data: posts, lastFetched: meta?.lastFetched };
    // cache in Redis
    await redis.set(REDIS_CACHE_KEY, JSON.stringify(result), 'EX', REDIS_CACHE_TTL);
    return Response.json(result);
  }

  const fbRes = await fetch(
    `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=id,message,created_time,permalink_url,full_picture&access_token=${ACCESS_TOKEN}`
  );
  const fbData = await fbRes.json();
  console.log('FB API response:', JSON.stringify(fbData, null, 2));

  if (fbData.error) {
    console.error('Facebook API error:', fbData.error);
    return Response.json({ error: fbData.error.message }, { status: 500 });
  }

  await prisma.facebookPost.deleteMany({});
  const toSave = (fbData.data || [])
    // Test: temporarily remove this filter if you get zero results
    .filter((p: any) => p.full_picture)
    .map((p: any) => ({
      id: p.id,
      message: p.message ?? null,
      createdTime: new Date(p.created_time),
      permalinkUrl: p.permalink_url,
      fullPicture: p.full_picture,
      fetchedAt: new Date(),
    }));

  console.log('To be inserted:', JSON.stringify(toSave, null, 2));

  if (toSave.length > 0) {
    try {
      const result = await prisma.facebookPost.createMany({ data: toSave });
      console.log('Inserted:', result);
    } catch (err) {
      console.error('Insertion error:', err);
    }
  } else {
    console.log('No posts to insert.');
  }

  await prisma.facebookCacheMeta.upsert({
    where: { id: 1 },
    update: { lastFetched: new Date() },
    create: { id: 1, lastFetched: new Date() },
  });

  const postsInDb = await prisma.facebookPost.findMany({ orderBy: { createdTime: 'desc' } });
  const result = { data: postsInDb, lastFetched: new Date() };
  console.log('Posts in DB after insert:', postsInDb.length, postsInDb);

  // Update Redis cache
  await redis.set(REDIS_CACHE_KEY, JSON.stringify(result), 'EX', REDIS_CACHE_TTL);

  return Response.json(result);
}
