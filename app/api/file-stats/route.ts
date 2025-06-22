import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to get file size by filename (search by file end, case-insensitive)
function getFileSizeByName(dir: string, filename: string): number {
  if (!fs.existsSync(dir)) return 0;
  const files = fs.readdirSync(dir);
  const found = files.find((f) => f.toLowerCase().endsWith(filename.toLowerCase()));
  if (!found) return 0;
  const stat = fs.statSync(path.join(dir, found));
  return stat.size;
}

export async function GET() {
  // TODO: Replace these with real DB fetches!
  const projects = [{ images: ['proj1.jpg', 'proj2.png'] }];
  const reports = [{ images: ['repimg1.png'], files: ['report1.pdf', 'report2.pdf'] }];
  const events = [
    { eventBanner: 'eventbanner.jpg', eventImages: ['ev1.jpg'], eventFile: 'evdoc.pdf' },
  ];

  // --- Projects ---
  let projectImageCount = 0,
    projectImageSize = 0;
  for (const p of projects) {
    if (Array.isArray(p.images)) {
      projectImageCount += p.images.length;
      for (const img of p.images) {
        const filename = img.split('/').pop() ?? img;
        const size = getFileSizeByName(
          path.join(process.cwd(), 'public/assets/images/projects'),
          filename
        );
        projectImageSize += size;
      }
    }
  }

  // --- Events ---
  let eventImageCount = 0,
    eventImageSize = 0,
    eventPDFCount = 0,
    eventPDFSize = 0;
  for (const e of events) {
    if (e.eventBanner && typeof e.eventBanner === 'string' && e.eventBanner.trim().length > 0) {
      eventImageCount += 1;
      const filename = e.eventBanner.split('/').pop() ?? e.eventBanner;
      eventImageSize += getFileSizeByName(
        path.join(process.cwd(), 'public/assets/images/events'),
        filename
      );
    }
    if (Array.isArray(e.eventImages)) {
      eventImageCount += e.eventImages.length;
      for (const img of e.eventImages) {
        const filename = img.split('/').pop() ?? img;
        eventImageSize += getFileSizeByName(
          path.join(process.cwd(), 'public/assets/images/events'),
          filename
        );
      }
    }
    if (e.eventFile && typeof e.eventFile === 'string' && e.eventFile.trim().length > 0) {
      eventPDFCount += 1;
      const filename = e.eventFile.split('/').pop() ?? e.eventFile;
      eventPDFSize += getFileSizeByName(
        path.join(process.cwd(), 'public/assets/pdfs/events'),
        filename
      );
    }
  }

  // --- Reports ---
  let reportImageCount = 0,
    reportImageSize = 0,
    reportPDFCount = 0,
    reportPDFSize = 0;
  for (const r of reports) {
    if (Array.isArray(r.images)) {
      reportImageCount += r.images.length;
      for (const img of r.images) {
        const filename = img.split('/').pop() ?? img;
        reportImageSize += getFileSizeByName(
          path.join(process.cwd(), 'public/assets/images/reports'),
          filename
        );
      }
    }
    if (Array.isArray(r.files)) {
      reportPDFCount += r.files.length;
      for (const pdf of r.files) {
        const filename = pdf.split('/').pop() ?? pdf;
        reportPDFSize += getFileSizeByName(
          path.join(process.cwd(), 'public/assets/pdfs/reports'),
          filename
        );
      }
    }
  }

  // Compose response
  return NextResponse.json({
    counts: {
      'Project Images': projectImageCount,
      'Project PDFs': 0,
      'Event Images': eventImageCount,
      'Event PDFs': eventPDFCount,
      'Report Images': reportImageCount,
      'Report PDFs': reportPDFCount,
    },
    sizes: {
      'Project Images': projectImageSize,
      'Project PDFs': 0,
      'Event Images': eventImageSize,
      'Event PDFs': eventPDFSize,
      'Report Images': reportImageSize,
      'Report PDFs': reportPDFSize,
    },
  });
}
