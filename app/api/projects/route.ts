import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Handle GET (fetch all projects, no auth required)
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { username: true } },
        approvedBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        reports: true, // include related reports if you want full data
      },
    });

    return NextResponse.json(projects);
  } catch (err) {
    console.error("Error fetching projects:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Handle POST (create new project, auth required)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { title, slug, content, images, projectStatus, publishStatus } = data;

    if (!title || !slug || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userId = session.user.id;

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        content,
        images,
        projectStatus,
        publishStatus,
        createdById: userId,
        approvedById: userId, // Optional: change this logic for approval workflows
        updatedById: userId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}