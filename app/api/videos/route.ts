import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/generated/prisma';
import { redis } from '@/utils/redis';

const prisma = new PrismaClient();

const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const REDIS_CACHE_KEY = 'videos:all';
const REDIS_CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export async function GET() {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

  if (!API_KEY || !CHANNEL_ID) {
    console.error('Missing API_KEY or CHANNEL_ID');
    return NextResponse.json({ error: 'API key or channel ID not configured' }, { status: 500 });
  }

  // Try Redis cache first
  const redisCached = await redis.get(REDIS_CACHE_KEY);
  if (redisCached) {
    return NextResponse.json(JSON.parse(redisCached), { status: 200 });
  }

  // Try to get last fetch timestamp from DB
  let cacheMeta = await prisma.youTubeCacheMeta.findUnique({ where: { id: 1 } });
  const now = new Date();

  // If cache is valid in DB, serve cached videos from DB and update Redis
  if (cacheMeta && now.getTime() - new Date(cacheMeta.lastFetched).getTime() < CACHE_DURATION_MS) {
    const videos = await prisma.video.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    await redis.set(REDIS_CACHE_KEY, JSON.stringify(videos), 'EX', REDIS_CACHE_TTL);
    return NextResponse.json(videos, { status: 200 });
  }

  // Fetch from YouTube API and update cache
  try {
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=50&type=video`
    );

    if (!searchResponse.ok) {
      throw new Error(`Search API error: ${searchResponse.statusText}`);
    }

    const searchData: any = await searchResponse.json();
    if (!searchData.items || searchData.items.length === 0) {
      throw new Error('No videos found');
    }

    const videoIds: string = searchData.items.map((item: any) => item.id.videoId).join(',');

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${API_KEY}&id=${videoIds}&part=snippet,contentDetails,statistics`
    );

    if (!videosResponse.ok) {
      throw new Error(`Videos API error: ${videosResponse.statusText}`);
    }

    const videosData: any = await videosResponse.json();
    if (!videosData.items || videosData.items.length === 0) {
      throw new Error('No video details found');
    }

    // Upsert videos in DB
    const videoData = await Promise.all(
      videosData.items.map(async (item: any) => {
        return prisma.video.upsert({
          where: { id: item.id },
          update: {
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: new Date(item.snippet.publishedAt),
            viewCount: item.statistics?.viewCount ? parseInt(item.statistics.viewCount) : null,
            likeCount: item.statistics?.likeCount ? parseInt(item.statistics.likeCount) : null,
            duration: item.contentDetails.duration,
            fetchedAt: now,
          },
          create: {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high.url,
            publishedAt: new Date(item.snippet.publishedAt),
            viewCount: item.statistics?.viewCount ? parseInt(item.statistics.viewCount) : null,
            likeCount: item.statistics?.likeCount ? parseInt(item.statistics.likeCount) : null,
            duration: item.contentDetails.duration,
            fetchedAt: now,
          },
        });
      })
    );

    // Update cache meta timestamp in DB
    await prisma.youTubeCacheMeta.upsert({
      where: { id: 1 },
      update: { lastFetched: now },
      create: { id: 1, lastFetched: now },
    });

    // Update Redis cache
    await redis.set(REDIS_CACHE_KEY, JSON.stringify(videoData), 'EX', REDIS_CACHE_TTL);

    return NextResponse.json(videoData, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching YouTube videos:', error);

    // Serve existing DB videos as fallback if available
    const fallbackVideos = await prisma.video.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });
    if (fallbackVideos.length > 0) {
      // Update Redis with fallback if not already cached
      await redis.set(REDIS_CACHE_KEY, JSON.stringify(fallbackVideos), 'EX', REDIS_CACHE_TTL);
      return NextResponse.json(fallbackVideos, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch videos: ' + (error?.message ?? String(error)) },
      { status: 500 }
    );
  }
}
