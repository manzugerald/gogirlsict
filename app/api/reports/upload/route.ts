import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Only allow image (png, jpg, jpeg) or pdf
  const allowedImageExts = [".png", ".jpg", ".jpeg"];
  const allowedPdfExts = [".pdf"];
  const ext = path.extname(file.name).toLowerCase();

  let uploadDir = "";
  if (allowedImageExts.includes(ext)) {
    uploadDir = "public/assets/images/reports";
  } else if (allowedPdfExts.includes(ext)) {
    uploadDir = "public/assets/pdfs/report";
  } else {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  // Ensure the upload directory exists
  const uploadPath = path.join(process.cwd(), uploadDir);
  await fs.mkdir(uploadPath, { recursive: true });

  // Save the file
  const filename = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadPath, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Public URL (without "public")
  const publicUrl =
    "/" + path.posix.join(uploadDir.replace(/^public\//, ""), filename);

  return NextResponse.json({ path: publicUrl });
};