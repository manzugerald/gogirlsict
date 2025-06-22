import path from 'path';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';

// Helper to save uploaded files and return their URLs/paths
export async function saveUploadedFiles(
  formData: FormData,
  field: string, // e.g. "files", "bannerFile", "eventFileUpload"
  type: 'image' | 'pdf', // decides path and url
  eventSlug: string // to organize per event
): Promise<string[]> {
  const files = formData.getAll(field) as File[];
  const savedFiles: string[] = [];
  // Set destination directory and public path accordingly
  let destDir = '';
  let publicBase = '';
  if (type === 'image') {
    destDir = path.join(process.cwd(), 'public', 'assets', 'images', 'events', eventSlug);
    publicBase = `/assets/images/events/${eventSlug}`;
  } else {
    destDir = path.join(process.cwd(), 'public', 'assets', 'pdfs', 'events', eventSlug);
    publicBase = `/assets/pdfs/events/${eventSlug}`;
  }
  if (files && files.length > 0) {
    await fs.mkdir(destDir, { recursive: true });
    for (const file of files) {
      if (!file || typeof file === 'string') continue;
      const ext = file.name.split('.').pop();
      const filename = `${randomUUID()}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(destDir, filename);
      await fs.writeFile(filePath, buffer);
      savedFiles.push(`${publicBase}/${filename}`);
    }
  }
  return savedFiles;
}

// Helper for single file (banner or single PDF)
export async function saveUploadedFile(
  formData: FormData,
  field: string,
  type: 'image' | 'pdf',
  eventSlug: string
): Promise<string | null> {
  const file = formData.get(field) as File | null;
  if (!file || typeof file === 'string') return null;
  let destDir = '';
  let publicBase = '';
  if (type === 'image') {
    destDir = path.join(process.cwd(), 'public', 'assets', 'images', 'events', eventSlug);
    publicBase = `/assets/images/events/${eventSlug}`;
  } else {
    destDir = path.join(process.cwd(), 'public', 'assets', 'pdfs', 'events', eventSlug);
    publicBase = `/assets/pdfs/events/${eventSlug}`;
  }
  await fs.mkdir(destDir, { recursive: true });
  const ext = file.name.split('.').pop();
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(destDir, filename);
  await fs.writeFile(filePath, buffer);
  return `${publicBase}/${filename}`;
}
