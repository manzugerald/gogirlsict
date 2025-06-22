import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { slugify } from "@/lib/utils";

// Handle PUT (update report) -- AUTH REQUIRED
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const reportId = Number(params.id);
    if (!reportId || isNaN(reportId)) {
      return NextResponse.json({ error: "Invalid Report ID" }, { status: 400 });
    }

    const data = await req.json();
    const {
      title,
      images = [],
      files = [],
      publishStatus,
      projectId,
      accessCount = 0,
      downloadCount = 0,
    } = data;

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = slugify(title.trim());

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        title,
        slug,
        images: Array.isArray(images) ? images : [],
        files: Array.isArray(files) ? files : [],
        publishStatus,
        updatedById: userId,
        accessCount,
        downloadCount,
        projectId: projectId ?? null,
      },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Failed to update report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handle DELETE
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session ?.user?.id) {
            return NextResponse.json({ error: "Unauthorized Action" }, { status: 401 })
        }

        const reportId = Number(params.id);
        if (!reportId || isNaN(reportId)) {
            return NextResponse.json({ error: "Invalid Report Id" }, { status: 400 });
        }

        // ownership can be checked here
        await prisma.report.delete({
            where: { id: reportId },
        });
        return NextResponse.json({ succes: true });
    } catch (error) {
        console.error("Failed to delete report:", error);
        return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
    }
}