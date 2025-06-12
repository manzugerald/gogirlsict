import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

// GET /api/projects/[slug]
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { slug: params.slug },
      include: {
        createdBy: { select: { username: true } },
        approvedBy: { select: { username: true } },
        updatedBy: { select: { username: true } },
        reports: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (err) {
    console.error("Error fetching project:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}