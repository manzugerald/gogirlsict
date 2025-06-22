import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    // Await params to comply with Next.js dynamic API route requirements
    const { id } = context.params;
    const reportId = parseInt(id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid Report ID" }, { status: 400 });
    }
    const report = await prisma.report.update({
      where: { id: reportId },
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