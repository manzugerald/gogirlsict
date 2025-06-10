import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;
    const report = await prisma.report.update({
      where: { slug },
      data: { accessCount: { increment: 1 } },
      select: { accessCount: true },
    });
    return NextResponse.json({ accessCount: report.accessCount });
  } catch (error: any) {
    // Prisma throws an error with code 'P2025' if no record found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to increment access count" }, { status: 500 });
  }
}