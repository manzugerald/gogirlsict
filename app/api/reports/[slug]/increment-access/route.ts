import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request, context: { params: { slug: string } }) {
  try {
    // Await params to comply with Next.js dynamic API route requirements
    const { slug } = await context.params;
    const report = await prisma.report.update({
      where: { slug },
      data: { accessCount: { increment: 1 } },
      select: { accessCount: true },
    });
    return NextResponse.json({ accessCount: report.accessCount });
  } catch (error: any) {
    // Use the PrismaClientKnownRequestError from @prisma/client/runtime/library if not available on Prisma namespace
    // Fallback: check error.code directly if unable to use the PrismaClientKnownRequestError type
    if (
      (error?.code === 'P2025')
    ) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to increment access count" }, { status: 500 });
  }
}