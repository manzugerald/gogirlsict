import { NextRequest } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const PAGE_ID = process.env.FB_PAGE_ID!;
  const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;

  let meta = await prisma.facebookCacheMeta.findUnique({ where: { id: 1 } });
  let needsFetch = true;
  if (meta && meta.lastFetched && dayjs().diff(dayjs(meta.lastFetched), 'hour') < 24)
    needsFetch = false;

  if (!needsFetch) {
    const posts = await prisma.facebookPost.findMany({ orderBy: { createdTime: 'desc' } });
    return Response.json({ data: posts, lastFetched: meta?.lastFetched });
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
  console.log('Posts in DB after insert:', postsInDb.length, postsInDb);

  return Response.json({ data: postsInDb, lastFetched: new Date() });
}
