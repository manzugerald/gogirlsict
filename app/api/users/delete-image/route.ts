import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: "No imageUrl" }, { status: 400 });
  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    await fs.unlink(filePath);
    return NextResponse.json({ message: "Image deleted" });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}