// app/projects/new/route.ts (for POST)
import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function POST(req: Request) {
  const data = await req.json();

  const project = await prisma.project.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: data.status,
      images: data.images,
    },
  });

  return NextResponse.json(project);
}
