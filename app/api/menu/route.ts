import { NextResponse } from 'next/server';
import { prisma } from '@/db/prisma';

export async function GET() {
  const [projectCount, videoCount, reportCount] = await Promise.all([
    prisma.project.count(),
    prisma.video.count(),
    prisma.report.count(),
  ]);

  return NextResponse.json({
    counts: {
      projects: projectCount,
      videos: videoCount,
      reports: reportCount,
    },
  });
}
