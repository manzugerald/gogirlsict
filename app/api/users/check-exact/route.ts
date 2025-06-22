import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const username = searchParams.get("username");
  if (!userId || !username) return NextResponse.json({ valid: false });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ valid: !!user && user.username === username });
}