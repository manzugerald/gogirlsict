import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { slugify } from "@/lib/utils";

// Handle GET (fetch all reports)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        createdBy: { select: { firstName: true } },
        approvedBy: { select: { firstName: true } },
        updatedBy: { select: { firstName: true } },
        project: { select: { title: true, id: true } }
      },
    });

    return NextResponse.json(reports);
  } catch (err) {
    console.error("Error fetching reports:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handle POST (create new report)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Check user existence
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "Authenticated user not found in database." }, { status: 400 });
    }

    const data = await req.json();
    const {
      title,
      images = [],
      files = [],
      publishStatus,
      projectId,
      accessCount = 0,
      downloadCount = 0
    } = data;

    if (!title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = slugify(title.trim());

    const report = await prisma.report.create({
      data: {
        title,
        slug,
        images: Array.isArray(images) ? images : [],
        files: Array.isArray(files) ? files : [],
        publishStatus,
        createdById: userId,
        approvedById: userId,
        updatedById: userId,
        accessCount,
        downloadCount,
        projectId: projectId ?? null,
      },
    });
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to create report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}