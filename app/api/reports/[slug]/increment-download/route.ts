import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const report = await prisma.report.update({
      where: { slug },
      data: { downloadCount: { increment: 1 } },
      select: { downloadCount: true },
    });
    return NextResponse.json({ downloadCount: report.downloadCount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to increment download count" }, { status: 500 });
  }
}