import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/db/prisma';
import { redis } from '@/utils/redis';

const FILE_STATS_CACHE_KEY = 'file-stats:all';
const FILE_STATS_CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

// Strict match: only check if exact filename exists in the target folder
function getExactFileSize(dir: string, filename: string): number {
  if (!fs.existsSync(dir)) return 0;
  const fullPath = path.join(dir, filename);
  if (!fs.existsSync(fullPath)) return 0;

  const stat = fs.statSync(fullPath);
  return stat.size;
}

function getFilenameFromPath(filepath: string): string {
  return filepath?.split('/').pop() ?? '';
}

export async function GET() {
  // Try Redis cache first
  const cached = await redis.get(FILE_STATS_CACHE_KEY);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }

  const projects = await prisma.project.findMany();
  const reports = await prisma.report.findMany();
  const events = await prisma.event.findMany();
  const institutions = await prisma.institution.findMany();

  // --- PROJECTS ---
  let projectImageCount = 0;
  let projectImageSize = 0;

  for (const project of projects) {
    if (Array.isArray(project.images)) {
      projectImageCount += project.images.length;
      for (const img of project.images) {
        const filename = getFilenameFromPath(img);
        const size = getExactFileSize(
          path.join(process.cwd(), 'public/assets/images/projects'),
          filename
        );
        projectImageSize += size;
      }
    }
  }

  // --- EVENTS ---
  let eventImageCount = 0;
  let eventImageSize = 0;
  let eventPDFCount = 0;
  let eventPDFSize = 0;

  for (const event of events) {
    if (event.eventBanner && typeof event.eventBanner === 'string') {
      eventImageCount += 1;
      const filename = getFilenameFromPath(event.eventBanner);
      eventImageSize += getExactFileSize(
        path.join(process.cwd(), 'public/assets/images/events/first-event'),
        filename
      );
    }

    if (Array.isArray(event.eventImages)) {
      eventImageCount += event.eventImages.length;
      for (const img of event.eventImages) {
        const filename = getFilenameFromPath(img);
        eventImageSize += getExactFileSize(
          path.join(process.cwd(), 'public/assets/images/events/first-event'),
          filename
        );
      }
    }

    if (event.eventFile && typeof event.eventFile === 'string') {
      eventPDFCount += 1;
      const filename = getFilenameFromPath(event.eventFile);
      eventPDFSize += getExactFileSize(
        path.join(process.cwd(), 'public/assets/pdfs/events/first-event'),
        filename
      );
    }
  }

  // --- REPORTS ---
  let reportImageCount = 0;
  let reportImageSize = 0;
  let reportPDFCount = 0;
  let reportPDFSize = 0;

  for (const report of reports) {
    if (Array.isArray(report.images)) {
      reportImageCount += report.images.length;
      for (const img of report.images) {
        const filename = getFilenameFromPath(img);
        reportImageSize += getExactFileSize(
          path.join(process.cwd(), 'public/assets/images/reports'),
          filename
        );
      }
    }

    if (Array.isArray(report.files)) {
      reportPDFCount += report.files.length;
      for (const pdf of report.files) {
        const filename = getFilenameFromPath(pdf);
        reportPDFSize += getExactFileSize(
          path.join(process.cwd(), 'public/assets/pdfs/reports'),
          filename
        );
      }
    }
  }

  // --- INSTITUTIONS ---
  let institutionImageCount = 0;
  let institutionImageSize = 0;

  for (const institution of institutions) {
    // institutionImages is an array of image paths (e.g. "/uploads/institutions/filename.jpg")
    if (Array.isArray(institution.institutionImages)) {
      institutionImageCount += institution.institutionImages.length;
      for (const img of institution.institutionImages) {
        const filename = getFilenameFromPath(img);
        const size = getExactFileSize(
          path.join(process.cwd(), 'public/uploads/institutions'),
          filename
        );
        institutionImageSize += size;
      }
    }
    // institution.logo is a single image path (optional)
    if (institution.logo && typeof institution.logo === 'string') {
      const filename = getFilenameFromPath(institution.logo);
      const size = getExactFileSize(
        path.join(process.cwd(), 'public/uploads/institutions'),
        filename
      );
      if (size > 0) {
        institutionImageCount += 1;
        institutionImageSize += size;
      }
    }
    // If you ever add institution PDFs, add similar logic here
  }

  const result = {
    counts: {
      'Project Images': projectImageCount,
      'Project PDFs': 0, // Modify if you add project PDFs
      'Event Images': eventImageCount,
      'Event PDFs': eventPDFCount,
      'Report Images': reportImageCount,
      'Report PDFs': reportPDFCount,
      'Institution Images': institutionImageCount,
    },
    sizes: {
      'Project Images': projectImageSize,
      'Project PDFs': 0,
      'Event Images': eventImageSize,
      'Event PDFs': eventPDFSize,
      'Report Images': reportImageSize,
      'Report PDFs': reportPDFSize,
      'Institution Images': institutionImageSize,
    },
  };

  // Cache result in Redis
  await redis.set(FILE_STATS_CACHE_KEY, JSON.stringify(result), 'EX', FILE_STATS_CACHE_TTL);

  return NextResponse.json(result);
}
